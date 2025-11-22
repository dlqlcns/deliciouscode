import express from 'express'
import { supabase } from '../supabaseClient.js'

const router = express.Router()

// 모든 레시피 조회
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('recipes').select('*')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

export default router
