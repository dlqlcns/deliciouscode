import express from 'express'
import { supabase } from '../supabaseClient.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

// 인증 미들웨어
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: '로그인이 필요합니다.' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id
    next()
  } catch {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' })
  }
}

// (1) 유저의 즐겨찾기 레시피 ID 리스트 가져오기
router.get('/', auth, async (req, res) => {
  const userId = req.userId
  const { data, error } = await supabase
    .from('favorites')
    .select('recipe_id')
    .eq('user_id', userId)

  if (error) return res.status(500).json({ error: error.message })
  
  const recipeIds = data.map(item => item.recipe_id)
  res.json(recipeIds)
})

// (2) 즐겨찾기 추가
router.post('/', auth, async (req, res) => {
  const userId = req.userId
  const { recipe_id } = req.body

  const { data, error } = await supabase
    .from('favorites')
    .insert([{ user_id: userId, recipe_id }])

  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: '즐겨찾기 추가됨' })
})

// (3) 즐겨찾기 삭제
router.delete('/', auth, async (req, res) => {
  const userId = req.userId
  const { recipe_id } = req.body

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('recipe_id', recipe_id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: '즐겨찾기 삭제됨' })
})

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from('favorites')
    .select('recipe_id')
    .eq('user_id', userId);

  if (error) return res.status(500).json({ error: error.message });

  const recipeIds = data.map(fav => fav.recipe_id);
  res.json(recipeIds);
});

export default router
