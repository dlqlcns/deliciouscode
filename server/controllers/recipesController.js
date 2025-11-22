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
    const {
      query: searchTerm = '',
      ingredients = '',
      exclude = '',
      category = '전체',
      sort = '최신 등록순'
    } = req.query

    const { data, error } = await supabase
      .from('recipes')
      .select('id, name, category, time, image_url, ingredients, description, instructions')

    if (error) {
      console.error('recipes: failed to fetch all', error)
      return res.status(500).json({ error: error.message })
    }

    const searchTerms = searchTerm
      .split(',')
      .map(term => term.trim())
      .filter(Boolean)

    const includeIngredients = ingredients
      .split(',')
      .map(term => term.trim())
      .filter(Boolean)

    const excludeIngredients = exclude
      .split(',')
      .map(term => term.trim())
      .filter(Boolean)

    const filtered = (data || [])
      .filter(recipe => {
        if (!recipe || !recipe.id) return false

        const haystack = `${recipe.name} ${recipe.description || ''} ${recipe.ingredients || ''}`.toLowerCase()

        if (category && category !== '전체' && recipe.category !== category) return false

        if (searchTerms.length && !searchTerms.every(term => haystack.includes(term.toLowerCase()))) return false

        if (includeIngredients.length && !includeIngredients.every(term => haystack.includes(term.toLowerCase()))) return false

        if (excludeIngredients.length && excludeIngredients.some(term => haystack.includes(term.toLowerCase()))) return false

        return true
      })
      .map(recipe => ({
        ...recipe,
        image: recipe.image_url,
        description: recipe.description || recipe.instructions || ''
      }))

    filtered.sort((a, b) => {
      switch (sort) {
        case '이름순':
          return a.name.localeCompare(b.name)
        case '조리 시간순':
          return parseInt(a.time) - parseInt(b.time)
        case '최신순':
        case '최신 등록순':
        default:
          return b.id - a.id
      }
    })

    res.json(filtered)
  } catch (err) {
    console.error('recipes: unexpected error fetching all', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}
