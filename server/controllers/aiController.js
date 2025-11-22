import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/** ✅ /api/ai/list - 재료 기반으로 레시피 목록 생성 */
export const generateRecipeList = async (req, res) => {
  const { ingredients } = req.body;
  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({ error: "ingredients가 필요합니다." });
  }

  const prompt = `
  사용자가 입력한 재료: ${ingredients.join(", ")}.
  위 재료를 활용한 요리 5가지를 JSON 배열 형태로 만들어줘.
  각 항목은 { "name": "요리 이름", "description": "간단한 설명", "time": "예상 조리 시간" } 형식으로.
  설명은 1문장으로 한국어로 작성해줘.
  `;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0].message.content;
    const recipes = JSON.parse(text);
    res.json(recipes);
  } catch (err) {
    console.error("AI 목록 생성 오류:", err);
    res.status(500).json({ error: "레시피 목록 생성 실패" });
  }
};

/** ✅ /api/ai/detail - 특정 요리의 상세 레시피 생성 */
export const generateRecipeDetail = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "레시피 이름이 필요합니다." });

  const prompt = `
  요리 이름: ${name}
  아래 JSON 형식으로 반환해줘:
  {
    "name": "${name}",
    "description": "한 줄 요약",
    "ingredients": ["재료1", "재료2", ...],
    "steps": ["1단계", "2단계", ...],
    "time": "예상 조리 시간",
    "image_url": "https://이미지.없으면 null"
  }
  모든 텍스트는 한국어로 작성해줘.
  `;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0].message.content;
    const detail = JSON.parse(text);
    res.json(detail);
  } catch (err) {
    console.error("AI 상세 생성 오류:", err);
    res.status(500).json({ error: "상세 레시피 생성 실패" });
  }
};
