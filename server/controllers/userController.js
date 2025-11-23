import { supabase } from '../supabaseClient.js'

export const getProfile = async (req, res) => {
  try {
    const userId = req.userId

    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, allergies, ingredients')
      .eq('id', userId)
      .single()

    if (error) return res.status(500).json({ error: error.message })
    res.json(data)
  } catch (err) {
    console.error('profile: fetch error', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId
    const { username, email, allergies, ingredients } = req.body

    // undefined 필드 자동 무시
    const updateData = {}
    if (username !== undefined) updateData.username = username
    if (email !== undefined) updateData.email = email
    if (allergies !== undefined) updateData.allergies = allergies
    if (ingredients !== undefined) updateData.ingredients = ingredients

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('*')

    if (error) return res.status(500).json({ error: error.message })
    res.json({ message: '저장되었습니다.', user: data[0] })
  } catch (err) {
    console.error('profile: update error', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}
