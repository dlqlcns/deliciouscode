import { supabase } from "../supabaseClient.js";

// GET 현재 사용자 보유 재료 목록
export const getIngredients = async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from("user_ingredient")
    .select("ingredient")
    .eq("user_id", userId);

  if (error) return res.status(500).json({ error: error.message });

  // [{ingredient:"양파"}, {ingredient:"고추"}] → ["양파","고추"]
  const dict = {};
  data.forEach(({ ingredient }) => {
    const [name, category] = ingredient.split("||"); // 카테고리 저장 방식: 이름||카테고리
    if (!dict[category]) dict[category] = [];
    dict[category].push(name);
  });

  res.json(dict);
};

// POST 재료 1개 추가
export const addIngredient = async (req, res) => {
  const userId = req.user.id;
  const { ingredient, category } = req.body;

  if (!ingredient || !category) {
    return res.status(400).json({ error: "ingredient, category 필수" });
  }

  const nameFormatted = `${ingredient}||${category}`;

  const { error } = await supabase
    .from("user_ingredient")
    .insert({ user_id: userId, ingredient: nameFormatted });

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "저장 완료" });
};

// DELETE 모든 재료 삭제
export const deleteAllIngredients = async (req, res) => {
  const userId = req.user.id;

  const { error } = await supabase
    .from("user_ingredient")
    .delete()
    .eq("user_id", userId);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "전체 삭제 완료" });
};

// DELETE 특정 재료 1개
export const deleteOneIngredient = async (req, res) => {
  const userId = req.user.id;
  const { ingredient } = req.params;

  const { error } = await supabase
    .from("user_ingredient")
    .delete()
    .eq("user_id", userId)
    .like("ingredient", `${ingredient}||%`);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "삭제 완료" });
};
