import OpenAI from "openai";
import dotenv from "dotenv";
import { supabase } from "../supabaseClient.js";
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const cleanJSON = text => {
  if (!text) return "";
  return text.replace(/```json|```/g, "").trim();
};

const removeAllergens = (items = [], allergies = []) => {
  if (!Array.isArray(items)) return [];
  const normalizedAllergies = Array.isArray(allergies) ? allergies : [];
  if (normalizedAllergies.length === 0) return items;

  const allergySet = new Set(normalizedAllergies.map(a => a.toLowerCase()));
  return items.filter(item => {
    const lower = String(item).toLowerCase();
    for (const allergy of allergySet) {
      if (lower.includes(allergy)) return false;
    }
    return true;
  });
};

/**
 * AI 기반 레시피 목록 생성
 * - 입력 재료를 포함한 레시피만 반환
 * - 알레르기 재료 자동 제외
 */
export const generateRecipeList = async (req, res) => {
  const { ingredients = [], allergies = [] } = req.body;

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: "최소 한 가지 재료가 필요합니다." });
  }

  const allergyList = Array.isArray(allergies) ? allergies : [];

  const prompt = `
사용자가 입력한 재료: ${ingredients.join(", ")}
사용자의 알레르기 재료: ${allergyList.join(", ") || "없음"}

위 재료 중 최소 한 가지 이상을 포함하고, 알레르기 재료는 절대 포함하지 않는 5개의 한국어 레시피를 추천해줘.
다음 JSON 배열 형식으로만 응답해:
[
  {
    "name": "요리 이름",
    "description": "간단한 설명",
    "time": "예상 조리 시간(예: 20분)",
    "ingredients": ["재료1", "재료2"],
    "reason": "입력 재료가 어떻게 활용되는지에 대한 설명"
  }
]
기본 요리 용어 외에는 알레르기 재료와 유사한 단어도 피해서 작성해.
  `;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const cleaned = cleanJSON(completion.choices[0].message.content);
    const recipes = JSON.parse(cleaned);

    const filtered = (recipes || [])
      .map(recipe => ({
        ...recipe,
        ingredients: removeAllergens(recipe.ingredients, allergyList),
      }))
      .filter(recipe =>
        recipe.ingredients?.some(ing =>
          ingredients.some(userIng => String(ing).toLowerCase().includes(String(userIng).toLowerCase()))
        )
      );

    res.json(filtered);
  } catch (err) {
    console.error("AI 목록 생성 오류:", err);
    res.status(500).json({ error: "레시피 목록 생성 실패" });
  }
};

/** AI 상세 레시피 생성 + DB 저장 */
export const generateRecipeDetail = async (req, res) => {
  const { name, allergies = [] } = req.body;
  if (!name) return res.status(400).json({ error: "레시피 이름이 필요합니다." });

  const prompt = `
  요리 이름: ${name}
  사용자의 알레르기 재료: ${Array.isArray(allergies) && allergies.length ? allergies.join(", ") : "없음"}
  알레르기 재료 및 그와 유사한 재료는 절대 포함하지 말고, 필요하다면 안전한 대체 재료로 대체해줘.
  아래 JSON 형식으로 한국어로 작성해줘:
  {
    "name": "${name}",
    "description": "한 줄 요약",
    "ingredients": ["재료1", "재료2", ...],
    "steps": ["1단계 설명", "2단계 설명", ...],
    "time": "예상 조리 시간",
    "image_url": "https://이미지링크가 없으면 null"
  }`;

  try {
    // ✅ 1️⃣ AI에게 레시피 생성 요청
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const text = cleanJSON(completion.choices[0].message.content);
    const recipe = JSON.parse(text);

    recipe.ingredients = removeAllergens(recipe.ingredients, allergies);

    // ✅ 2️⃣ Supabase에 이미 존재하는지 확인
    const { data: existing } = await supabase
      .from("recipes")
      .select("id")
      .eq("name", recipe.name)
      .maybeSingle();

    // ✅ 3️⃣ 없으면 DB에 자동 저장
    if (!existing) {
      await supabase.from("recipes").insert([
        {
          name: recipe.name,
          description: recipe.description,
          category: "AI 생성",
          time: recipe.time || "약 30분",
          image_url: recipe.image_url || null,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
        },
      ]);
    }

    // ✅ 4️⃣ 클라이언트에 응답
    res.json(recipe);
  } catch (err) {
    console.error("AI 상세 생성 오류:", err);
    res.status(500).json({ error: "상세 레시피 생성 실패" });
  }
};
