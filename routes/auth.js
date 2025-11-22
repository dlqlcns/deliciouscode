import express from 'express'
import bcrypt from 'bcrypt'
import { supabase } from '../server/supabaseClient.js'

const router = express.Router()

// 회원가입
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body
  const hashedPassword = await bcrypt.hash(password, 10)

  const { data, error } = await supabase
    .from('users')
    .insert([{ username, email, password: hashedPassword }])

  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: '회원가입 완료', user: data[0] })
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

  const match = await bcrypt.compare(password, data.password)
  if (!match) return res.status(400).json({ error: '비밀번호 틀림' })

  res.json({ message: '로그인 성공', user: data })
})

export default router
