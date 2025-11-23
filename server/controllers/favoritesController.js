import { supabase } from '../supabaseClient.js'

/** 로그인된 사용자의 즐겨찾기 레시피 ID 목록 */
export const getFavoriteRecipeIds = async (req, res) => {
  try {
    const userId = req.userId
    if (!userId) return res.status(401).json({ error: '인증이 필요합니다.' })

    const { data, error } = await supabase
      .from('favorites')
      .select('recipe_id')
      .eq('user_id', userId)

    if (error) {
      console.error('favorites: fetch ids failed', error)
      return res.status(500).json({ error: '즐겨찾기 조회 중 오류 발생' })
    }

    res.json(data.map(row => row.recipe_id))
  } catch (err) {
    console.error('favorites: unexpected fetch error', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}

/** 즐겨찾기 추가 */
export const addFavorite = async (req, res) => {
  try {
    const userId = req.userId
    const { recipe_id } = req.body

    if (!userId) return res.status(401).json({ error: '인증이 필요합니다.' })
    if (!recipe_id) return res.status(400).json({ error: 'recipe_id가 필요합니다.' })

    // 🔥 중복 저장 방지
    const { data: exists } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('recipe_id', recipe_id)
      .maybeSingle()

    if (exists) {
      return res.json({ message: '이미 즐겨찾기에 등록되어 있습니다.' })
    }

    const { error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, recipe_id }])

    if (error) {
      console.error('favorites: add failed', error)
      return res.status(500).json({ error: '즐겨찾기 추가 실패' })
    }

    res.json({ message: '즐겨찾기 완료' })
  } catch (err) {
    console.error('favorites: unexpected add error', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}

/** 즐겨찾기 삭제 */
export const removeFavorite = async (req, res) => {
  try {
    const userId = req.userId
    const { recipe_id } = req.body

    if (!userId) return res.status(401).json({ error: '인증이 필요합니다.' })
    if (!recipe_id) return res.status(400).json({ error: 'recipe_id가 필요합니다.' })

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipe_id)

    if (error) {
      console.error('favorites: remove failed', error)
      return res.status(500).json({ error: '즐겨찾기 삭제 실패' })
    }

    res.json({ message: '즐겨찾기 삭제됨' })
  } catch (err) {
    console.error('favorites: unexpected remove error', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}

/** 특정 유저의 즐겨찾기 목록 조회 */
export const getUserFavorites = async (req, res) => {
  try {
    const { userId } = req.params

    if (!userId) return res.status(400).json({ error: 'userId가 필요합니다.' })

    const { data, error } = await supabase
      .from('favorites')
      .select('recipe_id')
      .eq('user_id', userId)

    if (error) {
      console.error('favorites: fetch by user failed', error)
      return res.status(500).json({ error: '즐겨찾기 조회 실패' })
    }

    res.json(data.map(row => row.recipe_id))
  } catch (err) {
    console.error('favorites: unexpected fetch by user error', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}
