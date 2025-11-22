import express from 'express'
import { supabase } from '../server/supabaseClient.js'

const router = express.Router()

// 추천 레시피 (최신 10개)
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .limit(10)

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// 특정 레시피 상세
router.get('/:id', async (req, res) => {
  const { id } = req.params
  const { data, error } = await supabase
    .from('recipes')
    .select('*, steps(*)')
    .eq('id', id)
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

export default router
