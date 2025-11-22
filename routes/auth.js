import express from 'express'
import bcrypt from 'bcrypt'
import { supabase } from '../server/supabaseClient.js'

const router = express.Router()

// 회원가입
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body

  // 이메일 중복 확인
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existingUser) {
    return res.status(400).json({ error: '이미 존재하는 이메일입니다.' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const { data, error } = await supabase
    .from('users')
    .insert([{ username, email, password_hash: hashedPassword }])
    .select('*')

  if (error) return res.status(500).json({ error: error.message })

  const { password_hash, ...userWithoutPassword } = data[0]
  res.json({ message: '회원가입 완료', user: userWithoutPassword })
})

// 로그인
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error) return res.status(400).json({ error: '사용자 없음' })

  const match = await bcrypt.compare(password, data.password_hash)
  if (!match) return res.status(400).json({ error: '비밀번호 틀림' })

  const { password_hash, ...safeUser } = data
  res.json({ message: '로그인 성공', user: safeUser })
})

export default router
