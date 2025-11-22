// server/controllers/recipesController.js
import { supabase } from '../supabaseClient.js'

// 📌 추천 레시피 가져오기
export const getRecommendedRecipes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('id, name, category, time, image_url, description')
      .order('id', { ascending: true })
      .limit(5)

    if (error) {
      console.error('❌ recipes: failed to fetch recommended', error)
      return res.status(500).json({ error: error.message })
    }

    res.json(data)
  } catch (err) {
    console.error('❌ recipes: unexpected error fetching recommended', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}

// 📌 전체 레시피 가져오기 (DB에서만 불러오기)
export const getAllRecipes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('id, name, category, time, image_url, description')
      .order('id', { ascending: false }) // 최신순

    if (error) {
      console.error('❌ recipes: failed to fetch all', error)
      return res.status(500).json({ error: error.message })
    }

    console.log('✅ DB에서 불러온 레시피:', data)
    res.json(data)
  } catch (err) {
    console.error('❌ recipes: unexpected error fetching all', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}

// 📌 레시피 상세 조회
export const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('recipes')
      .select('id, name, description, category, time, image_url, ingredients, steps')
      .eq('id', id)
      .single()

    if (error || !data) {
      console.error('❌ recipes: failed to fetch detail', error)
      return res.status(404).json({ error: '레시피를 찾을 수 없습니다.' })
    }

    res.json(data)
  } catch (err) {
    console.error('❌ recipes: unexpected error fetching detail', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}

// 📌 검색/필터/정렬
export const searchRecipes = async (req, res) => {
  try {
    const { query = '', ingredients = '', exclude = '', category = '', sort = '최신순' } = req.query

    let request = supabase
      .from('recipes')
      .select('id, name, description, category, time, image_url')

    // 🔍 검색어 필터
    if (query) {
      request = request.ilike('name', `%${query}%`)
    }

    // ✅ 포함 재료 필터
    if (ingredients) {
      const list = ingredients.split(',').map(i => i.trim())
      request = request.or(list.map(i => `description.ilike.%${i}%`).join(','))
    }

    // ❌ 제외 재료 필터
    if (exclude) {
      const excluded = exclude.split(',').map(e => e.trim())
      for (const term of excluded) {
        request = request.not('description', 'ilike', `%${term}%`)
      }
    }

    // 🍳 카테고리 필터
    if (category && category !== '전체') {
      request = request.eq('category', category)
    }

    // 🔢 정렬 옵션
    switch (sort) {
      case '이름순':
        request = request.order('name', { ascending: true })
        break
      case '조리 시간순':
        request = request.order('time', { ascending: true })
        break
      case '최신순':
      default:
        request = request.order('id', { ascending: false })
        break
    }

    const { data, error } = await request

    if (error) {
      console.error('❌ recipes: search failed', error)
      return res.status(500).json({ error: error.message })
    }

    res.json(data)
  } catch (err) {
    console.error('❌ recipes: search unexpected error', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}
