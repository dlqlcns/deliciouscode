import { supabase } from '../supabaseClient.js'

// 로그인된 사용자의 즐겨찾기 레시피 ID 목록
export const getFavoriteRecipeIds = async (req, res) => {
  try {
    const userId = req.userId
    const { data, error } = await supabase
      .from('favorites')
      .select('recipe_id')
      .eq('user_id', userId)

    if (error) {
      console.error('favorites: failed to fetch ids', error)
      return res.status(500).json({ error: error.message })
    }

    const recipeIds = data.map(item => item.recipe_id)
    res.json(recipeIds)
  } catch (err) {
    console.error('favorites: unexpected error fetching ids', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}

// 즐겨찾기 추가
export const addFavorite = async (req, res) => {
  try {
    const userId = req.userId
    const { recipe_id } = req.body

    if (!recipe_id) {
      return res.status(400).json({ error: 'recipe_id가 필요합니다.' })
    }

    const { error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, recipe_id }])

    if (error) {
      console.error('favorites: failed to add', error)
      return res.status(500).json({ error: error.message })
    }

    res.json({ message: '즐겨찾기 추가됨' })
  } catch (err) {
    console.error('favorites: unexpected error adding', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}

// 즐겨찾기 삭제
export const removeFavorite = async (req, res) => {
  try {
    const userId = req.userId
    const { recipe_id } = req.body

    if (!recipe_id) {
      return res.status(400).json({ error: 'recipe_id가 필요합니다.' })
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipe_id)

    if (error) {
      console.error('favorites: failed to remove', error)
      return res.status(500).json({ error: error.message })
    }

    res.json({ message: '즐겨찾기 삭제됨' })
  } catch (err) {
    console.error('favorites: unexpected error removing', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}

// 특정 유저의 즐겨찾기 목록 (userId로 조회)
export const getUserFavorites = async (req, res) => {
  try {
    const { userId } = req.params

    const { data, error } = await supabase
      .from('favorites')
      .select('recipe_id')
      .eq('user_id', userId)

    if (error) {
      console.error('favorites: failed to fetch user favorites', error)
      return res.status(500).json({ error: error.message })
    }

    const recipeIds = data.map(fav => fav.recipe_id)
    res.json(recipeIds)
  } catch (err) {
    console.error('favorites: unexpected error fetching user favorites', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}
