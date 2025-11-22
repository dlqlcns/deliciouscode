import express from 'express';
import { supabase } from '../server/supabaseClient.js';

const router = express.Router();

// 특정 사용자 즐겨찾기 조회
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from('favorites')
    .select('id, recipe_id, recipe(name, image_url)')
    .eq('user_id', userId);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 즐겨찾기 추가
router.post('/', async (req, res) => {
  const { user_id, recipe_id } = req.body;
  const { data, error } = await supabase
    .from('favorites')
    .insert([{ user_id, recipe_id }]);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 즐겨찾기 삭제
router.delete('/', async (req, res) => {
  const { user_id, recipe_id } = req.body;
  const { data, error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user_id)
    .eq('recipe_id', recipe_id);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
