import express from 'express'
import { supabase } from '../supabaseClient.js'

const router = express.Router()

// 📌 추천 레시피 (최신 5개)
router.get('/recommended', async (req, res) => {
  const { data, error } = await supabase
    .from('recipes')
    .select('id, name, category, time')
    .order('id', { ascending: true })
    .limit(5)

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// 📌 전체 레시피 목록 (추후 필터/검색 확장 가능)
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('recipes')
    .select('id, name, category, time, image_url')

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('recipes')
    .select('*');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router
