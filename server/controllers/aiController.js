import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 🔹 레시피 목록 생성
export const generateRecipeList = async (req, res) => {
  try {
    const { ingredients } = req.body;
    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ error: "재료를 입력해주세요." });
    }

    const prompt = `
      사용자가 다음 재료를 가지고 있어요: ${ingredients.join(', ')}.
      이 재료들로 만들 수 있는 한식, 양식, 중식, 일식 등의 요리를 5개 추천해줘.
      각 레시피는 다음 형식으로 출력해줘:
      [
        { "id": 1, "name": "요리 이름", "description": "간단한 설명" }
      ]
      JSON 형식으로만 출력해.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content;
    const recipes = JSON.parse(text);
    res.json(recipes);
  } catch (err) {
    console.error("AI 목록 생성 오류:", err);
    res.status(500).json({ error: "레시피 추천 생성 실패" });
  }
};

// 🔹 레시피 상세정보 생성
export const generateRecipeDetail = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "레시피 이름이 필요합니다." });

    const prompt = `
      "${name}" 레시피의 재료 목록과 조리 단계를 자세히 설명해줘.
      JSON 형식으로:
      {
        "name": "요리 이름",
        "ingredients": ["재료1", "재료2", ...],
        "steps": ["단계1", "단계2", ...]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const detail = JSON.parse(completion.choices[0].message.content);
    res.json(detail);
  } catch (err) {
    console.error("AI 레시피 상세 생성 오류:", err);
    res.status(500).json({ error: "레시피 상세 생성 실패" });
  }
};
