import { supabase } from '../supabaseClient.js'

/** 📌 추천 레시피 가져오기 */
export const getRecommendedRecipes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('id, name, category, time, image_url')
      .order('id', { ascending: true })
      .limit(5)

    if (error) return res.status(500).json({ error: error.message })
    res.json(data)
  } catch (err) {
    console.error('recipes: unexpected error fetching recommended', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}

/** 📌 전체 레시피 가져오기 */
export const getAllRecipes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('id, name, description, category, time, image_url')

    if (error) return res.status(500).json({ error: error.message })
    res.json(data)
  } catch (err) {
    console.error('recipes: unexpected error fetching all', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}

/** 📌 레시피 상세 조회 */
export const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ 기본 레시피 정보
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("id, name, description, category, time, image_url")
      .eq("id", id)
      .single();

    if (recipeError || !recipe)
      return res.status(404).json({ error: "레시피를 찾을 수 없습니다." });

    // 2️⃣ 재료 목록
    const { data: ingredients, error: ingredientsError } = await supabase
      .from("recipe_ingredients")
      .select("ingredient, amount, unit")
      .eq("recipe_id", id);

    if (ingredientsError)
      return res.status(500).json({ error: "재료 정보를 불러오지 못했습니다." });

    // 3️⃣ 조리 단계
    const { data: steps, error: stepsError } = await supabase
      .from("recipe_steps")
      .select("step_order, step_description")
      .eq("recipe_id", id)
      .order("step_order", { ascending: true });

    if (stepsError)
      return res.status(500).json({ error: "조리 단계를 불러오지 못했습니다." });

    // 4️⃣ 프론트에서 바로 사용할 수 있도록 통합
    const recipeDetail = {
      ...recipe,
      ingredients,
      steps
    };

    res.json(recipeDetail);
  } catch (err) {
    console.error("recipes: unexpected error fetching detail", err);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

/** 📌 검색/필터 기능 */
export const searchRecipes = async (req, res) => {
  try {
    const { query = '', ingredients = '', exclude = '', category = '', sort = '최신순' } = req.query

    let request = supabase
      .from('recipes')
      .select('id, name, description, category, time, image_url')

    if (query) request = request.ilike('name', `%${query}%`)

    if (ingredients) {
      const list = ingredients.split(',').map(i => i.trim())
      request = request.or(list.map(i => `description.ilike.%${i}%`).join(','))
    }

    if (exclude) {
      const excluded = exclude.split(',').map(e => e.trim())
      excluded.forEach(term => {
        request = request.not('description', 'ilike', `%${term}%`)
      })
    }

    if (category && category !== '전체') request = request.eq('category', category)

    switch (sort) {
      case '이름순':
        request = request.order('name', { ascending: true })
        break
      case '조리 시간순':
        request = request.order('time', { ascending: true })
        break
      default:
        request = request.order('id', { ascending: false })
        break
    }

    const { data, error } = await request
    if (error) return res.status(500).json({ error: error.message })
    res.json(data)
  } catch (err) {
    console.error('recipes: search unexpected error', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}
