import express from 'express'
import { supabase } from '../supabaseClient.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

// 🔐 JWT 인증 미들웨어
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: '로그인이 필요합니다.' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id
    next()
  } catch {
    return res.status(401).json({ error: '토큰이 만료되었거나 잘못되었습니다.' })
  }
}

// 📌 사용자 정보 조회
router.get('/me', auth, async (req, res) => {
  const userId = req.userId

  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, allergies, ingredients')
    .eq('id', userId)
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// 📌 사용자 정보 수정
router.put('/me', auth, async (req, res) => {
  const userId = req.userId
  const { username, email, allergies, ingredients } = req.body

  const { data, error } = await supabase
    .from('users')
    .update({ username, email, allergies, ingredients })
    .eq('id', userId)
    .select('*')

  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: '저장되었습니다.', user: data[0] })
})

export default router
