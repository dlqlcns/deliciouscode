import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { supabase } from '../supabaseClient.js'

const router = express.Router()

// 회원가입
router.post('/signup', async (req, res) => {
  const { username, email, password, allergies = [], ingredients = [] } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ error: '모든 항목을 입력해주세요.' })
  }

  // 이메일 중복 체크
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
    .insert([
      { username, email, password_hash: hashedPassword, allergies, ingredients }
    ])
    .select('*')

  if (error) return res.status(500).json({ error: error.message })

  const { password_hash, ...user } = data[0]
  res.json({ message: '회원가입 완료', user })
})


// 로그인
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !data) {
    return res.status(400).json({ error: '이메일 또는 비밀번호가 잘못되었습니다.' })
  }

  const match = await bcrypt.compare(password, data.password_hash)
  if (!match) {
    return res.status(400).json({ error: '이메일 또는 비밀번호가 잘못되었습니다.' })
  }

  const token = jwt.sign({ id: data.id }, process.env.JWT_SECRET, { expiresIn: '2h' })
  const { password_hash, ...user } = data

  res.json({ message: '로그인 성공', token, user })
})

export default router
