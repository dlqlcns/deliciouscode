import OpenAI from "openai";
import dotenv from "dotenv";
import { supabase } from "../supabaseClient.js";
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/** AI 상세 레시피 생성 + DB 저장 */
export const generateRecipeDetail = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "레시피 이름이 필요합니다." });

  const prompt = `
  요리 이름: ${name}
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

    const text = completion.choices[0].message.content;
    const recipe = JSON.parse(text);

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
