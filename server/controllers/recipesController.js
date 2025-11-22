// server/controllers/recipesController.js
import { supabase } from '../supabaseClient.js'

const normalizeList = value => Array.isArray(value)
  ? value.filter(Boolean)
  : typeof value === 'string' && value.trim()
    ? value.split(',').map(v => v.trim()).filter(Boolean)
    : []

const removeAllergens = (items = [], allergies = []) => {
  if (!Array.isArray(items)) return []
  if (allergies.length === 0) return items

  const allergySet = new Set(allergies.map(a => a.toLowerCase()))
  return items.filter(item => {
    const lower = String(item).toLowerCase()
    for (const allergy of allergySet) {
      if (lower.includes(allergy)) return false
    }
    return true
  })
}

const containsAllergy = (items = [], allergies = []) => {
  if (!Array.isArray(items) || allergies.length === 0) return false
  const allergySet = new Set(allergies.map(a => a.toLowerCase()))
  return items.some(item => {
    const lower = String(item).toLowerCase()
    for (const allergy of allergySet) {
      if (lower.includes(allergy)) return true
    }
    return false
  })
}

// 📌 추천 레시피 가져오기
export const getRecommendedRecipes = async (req, res) => {
  const allergies = normalizeList(req.query?.allergies)

  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('id, name, category, time, image_url, description, ingredients')
      .order('id', { ascending: true })
      .limit(5)

    if (error) {
      console.error('❌ recipes: failed to fetch recommended', error)
      return res.status(500).json({ error: error.message })
    }

    const safe = (data || [])
      .map(recipe => ({
        ...recipe,
        ingredients: removeAllergens(recipe.ingredients, allergies),
      }))
      .filter(recipe => !containsAllergy(recipe.ingredients, allergies))

    res.json(safe.map(({ ingredients, ...rest }) => rest))
  } catch (err) {
    console.error('❌ recipes: unexpected error fetching recommended', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}

// 📌 전체 레시피 가져오기 (DB에서만 불러오기)
export const getAllRecipes = async (req, res) => {
  const allergies = normalizeList(req.query?.allergies)

  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('id, name, category, time, image_url, description, ingredients')
      .order('id', { ascending: false }) // 최신순

    if (error) {
      console.error('❌ recipes: failed to fetch all', error)
      return res.status(500).json({ error: error.message })
    }

    const safe = (data || [])
      .map(recipe => ({
        ...recipe,
        ingredients: removeAllergens(recipe.ingredients, allergies),
      }))
      .filter(recipe => !containsAllergy(recipe.ingredients, allergies))

    res.json(safe.map(({ ingredients, ...rest }) => rest))
  } catch (err) {
    console.error('❌ recipes: unexpected error fetching all', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}

// 📌 레시피 상세 조회
export const getRecipeById = async (req, res) => {
  const allergies = normalizeList(req.query?.allergies)

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

    const safeRecipe = {
      ...data,
      ingredients: removeAllergens(data.ingredients, allergies),
    }

    if (containsAllergy(safeRecipe.ingredients, allergies)) {
      return res.status(404).json({ error: '알레르기 성분이 포함된 레시피입니다.' })
    }

    res.json(safeRecipe)
  } catch (err) {
    console.error('❌ recipes: unexpected error fetching detail', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}

// 📌 검색/필터/정렬
export const searchRecipes = async (req, res) => {
  try {
    const {
      query = '',
      ingredients = '',
      exclude = '',
      category = '',
      sort = '최신순',
      allergies = '',
    } = req.query

    const ingredientList = normalizeList(ingredients)
    const allergyList = normalizeList(allergies)

    let request = supabase
      .from('recipes')
      .select('id, name, description, category, time, image_url, ingredients')

    // 🔍 검색어 필터
    if (query) {
      request = request.ilike('name', `%${query}%`)
    }

    // ✅ 포함 재료 필터 (ingredients 컬럼 기준)
    if (ingredientList.length > 0) {
      request = request.overlaps('ingredients', ingredientList)
    }

    // ❌ 제외 재료 필터 (description 기반 추가 필터)
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

    const safe = (data || [])
      .map(recipe => ({
        ...recipe,
        ingredients: removeAllergens(recipe.ingredients, allergyList),
      }))
      .filter(recipe => !containsAllergy(recipe.ingredients, allergyList))

    res.json(safe.map(({ ingredients, ...rest }) => rest))
  } catch (err) {
    console.error('❌ recipes: search unexpected error', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}
