import crypto from 'crypto'

const base64UrlEncode = (input) =>
  Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

const base64UrlDecode = (input) => {
  const padLength = 4 - (input.length % 4 || 4)
  const padded = `${input}${'='.repeat(padLength === 4 ? 0 : padLength)}`
  const normalized = padded.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(normalized, 'base64').toString('utf8')
}

const parseExpiresInSeconds = (expiresIn) => {
  if (!expiresIn) return null
  if (typeof expiresIn === 'number') return expiresIn

  const match = /^\s*(\d+)\s*([smhd])?\s*$/i.exec(expiresIn)
  if (!match) return null

  const value = Number(match[1])
  const unit = match[2]?.toLowerCase()

  switch (unit) {
    case 'm':
      return value * 60
    case 'h':
      return value * 60 * 60
    case 'd':
      return value * 24 * 60 * 60
    case 's':
    default:
      return value
  }
}

const sign = (payload, secret, options = {}) => {
  if (!secret) throw new Error('JWT secret is required')

  const header = { alg: 'HS256', typ: 'JWT' }
  const expSeconds = parseExpiresInSeconds(options.expiresIn)
  const payloadWithExp = expSeconds
    ? { ...payload, exp: Math.floor(Date.now() / 1000) + expSeconds }
    : { ...payload }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payloadWithExp))
  const data = `${encodedHeader}.${encodedPayload}`

  const signature = crypto.createHmac('sha256', secret).update(data).digest('base64')
  const encodedSignature = signature.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  return `${data}.${encodedSignature}`
}

const verify = (token, secret) => {
  if (!secret) throw new Error('JWT secret is required')
  const [encodedHeader, encodedPayload, signature] = token.split('.')
  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error('Invalid token format')
  }

  const data = `${encodedHeader}.${encodedPayload}`
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  if (expectedSignature !== signature) {
    throw new Error('Invalid token signature')
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload))
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
    throw new Error('Token expired')
  }

  return payload
}

export default { sign, verify }
