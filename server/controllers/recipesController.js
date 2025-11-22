import { supabase } from '../supabaseClient.js'

export const getRecommendedRecipes = async (req, res) => {
  const { data, error } = await supabase
    .from('recipes')
    .select('id, name, category, time')
    .order('id', { ascending: true })
    .limit(5)

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

export const getAllRecipes = async (req, res) => {
  const { data, error } = await supabase
    .from('recipes')
    .select('id, name, category, time, image_url')

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}
