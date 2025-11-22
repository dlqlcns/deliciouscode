import { supabase } from '../supabaseClient.js'

export const getProfile = async (req, res) => {
  const userId = req.userId

  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, allergies, ingredients')
    .eq('id', userId)
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

export const updateProfile = async (req, res) => {
  const userId = req.userId
  const { username, email, allergies, ingredients } = req.body

  const { data, error } = await supabase
    .from('users')
    .update({ username, email, allergies, ingredients })
    .eq('id', userId)
    .select('*')

  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: '저장되었습니다.', user: data[0] })
}
