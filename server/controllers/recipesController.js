import { supabase } from '../supabaseClient.js'

/** 📌 추천 레시피 가져오기 */
export const getRecommendedRecipes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('id, name, category, time, image_url, description')
      .order('id', { ascending: true })
      .limit(5);  // ⭐ 여기서 5개만 가져오도록 보장

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  } catch (err) {
    console.error("recipes: unexpected error fetching recommended", err);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

/** 📌 전체 레시피 */
export const getAllRecipes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('id, name, description, category, time, image_url');

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    console.error('recipes: fetch all error', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

/** 📌 레시피 상세 */
export const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: recipe, error } = await supabase
      .from("recipes")
      .select("id, name, description, category, time, image_url")
      .eq("id", id)
      .single();

    if (error || !recipe)
      return res.status(404).json({ error: "레시피를 찾을 수 없습니다." });

    const { data: ingredients } = await supabase
      .from("recipe_ingredients")
      .select("ingredient, amount, unit")
      .eq("recipe_id", id);

    const { data: steps } = await supabase
      .from("recipe_steps")
      .select("step_order, step_description")
      .eq("recipe_id", id)
      .order("step_order", { ascending: true });

    res.json({ ...recipe, ingredients, steps });
  } catch (err) {
    console.error("recipes: detail error", err);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

/** 📌 검색 & 필터 & 알레르기 제외 기능 */
export const searchRecipes = async (req, res) => {
  try {
    const {
      query = '',
      ingredients = '',
      exclude = '',
      category = '',
      sort = '최신순',
      allergies = ''   // 🔥 추가: 로그인 사용자 알레르기 자동 제외 대비
    } = req.query;

    let request = supabase
      .from('recipes')
      .select('id, name, description, category, time, image_url');

    if (query) request = request.ilike('name', `%${query}%`);

    if (category && category !== '전체') request = request.eq('category', category);

    /** 🔍 포함할 재료 검색 */
    if (ingredients) {
      const list = ingredients.split(',').map(i => i.trim());
      request = request.or(
        list.map(v => `name.ilike.%${v}%,description.ilike.%${v}%`).join(',')
      );
    }

    /** ❌ 제외할 재료 */
    const exclusionList = [
      ...exclude.split(','),
      ...allergies.split(',')
    ]
      .map(v => v.trim())
      .filter(v => v);

    exclusionList.forEach(term => {
      request = request.not('description', 'ilike', `%${term}%`);
    });

    /** 🔄 정렬 */
    switch (sort) {
      case '이름순':
        request = request.order('name', { ascending: true });
        break;
      case '조리 시간순':
        request = request.order('time', { ascending: true });
        break;
      default:
        request = request.order('id', { ascending: false });
    }

    const { data, error } = await request;
    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  } catch (err) {
    console.error('recipes: search error', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};
