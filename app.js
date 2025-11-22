// server.js
import express from 'express'
import bodyParser from 'body-parser'
import { supabase } from './supabaseClient.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(bodyParser.json())

// 회원가입
app.post('/signup', async (req, res) => {
  const { username, email, password_hash, allergies, ingredients } = req.body
  const { data, error } = await supabase
    .from('users')
    .insert([{ username, email, password_hash, allergies, ingredients }])
  if (error) return res.status(400).json({ error })
  res.json({ data })
})

// 로그인 (간단 조회)
app.post('/login', async (req, res) => {
  const { username, password_hash } = req.body
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password_hash', password_hash)
    .single()
  if (error) return res.status(400).json({ error })
  res.json({ data })
})

// 레시피 전체 조회
app.get('/recipes', async (req, res) => {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
  if (error) return res.status(400).json({ error })
  res.json({ data })
})

// 레시피 상세 (조리순서 포함)
app.get('/recipes/:id', async (req, res) => {
  const recipeId = req.params.id

  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', recipeId)
    .single()
  if (recipeError) return res.status(400).json({ error: recipeError })

  const { data: steps, error: stepsError } = await supabase
    .from('recipe_steps')
    .select('*')
    .eq('recipe_id', recipeId)
    .order('step_number', { ascending: true })
  if (stepsError) return res.status(400).json({ error: stepsError })

  res.json({ recipe, steps })
})

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
