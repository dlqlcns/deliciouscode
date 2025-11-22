import { supabase } from '../supabaseClient.js'

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
