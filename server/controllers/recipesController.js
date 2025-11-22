import { supabase } from '../supabaseClient.js'

// 📌 추천 레시피 가져오기
export const getRecommendedRecipes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('id, name, category, time')
      .order('id', { ascending: true })
      .limit(5)

    if (error) {
      console.error('recipes: failed to fetch recommended', error)
      return res.status(500).json({ error: error.message })
    }

    res.json(data)
  } catch (err) {
    console.error('recipes: unexpected error fetching recommended', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}

// 📌 전체 레시피 가져오기
export const getAllRecipes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('id, name, category, time, image_url')

    if (error) {
      console.error('recipes: failed to fetch all', error)
      return res.status(500).json({ error: error.message })
    }

    res.json(data)
  } catch (err) {
    console.error('recipes: unexpected error fetching all', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}

// ✅ 레시피 상세 조회
export const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('recipes')
      .select('id, name, description, category, time, image_url, ingredients, steps')
      .eq('id', id)
      .single()

    if (error || !data) {
      console.error('recipes: failed to fetch detail', error)
      return res.status(404).json({ error: '레시피를 찾을 수 없습니다.' })
    }

    res.json(data)
  } catch (err) {
    console.error('recipes: unexpected error fetching detail', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}
