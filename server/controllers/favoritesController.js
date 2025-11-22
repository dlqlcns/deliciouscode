import { supabase } from '../supabaseClient.js'

export const getFavoriteRecipeIds = async (req, res) => {
  const userId = req.userId
  const { data, error } = await supabase
    .from('favorites')
    .select('recipe_id')
    .eq('user_id', userId)

  if (error) return res.status(500).json({ error: error.message })

  const recipeIds = data.map(item => item.recipe_id)
  res.json(recipeIds)
}

export const addFavorite = async (req, res) => {
  const userId = req.userId
  const { recipe_id } = req.body

  const { error } = await supabase
    .from('favorites')
    .insert([{ user_id: userId, recipe_id }])

  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: '즐겨찾기 추가됨' })
}

export const removeFavorite = async (req, res) => {
  const userId = req.userId
  const { recipe_id } = req.body

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('recipe_id', recipe_id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: '즐겨찾기 삭제됨' })
}

export const getUserFavorites = async (req, res) => {
  const { userId } = req.params

  const { data, error } = await supabase
    .from('favorites')
    .select('recipe_id')
    .eq('user_id', userId)

  if (error) return res.status(500).json({ error: error.message })

  const recipeIds = data.map(fav => fav.recipe_id)
  res.json(recipeIds)
}
