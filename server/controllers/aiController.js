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

  const prompt = `다음 재료를 기반으로 간단한 요리 하나를 추천해주시고, 필요한 추가 재료와 요리 방법을 설명해주세요: ${ingredients.join(", ")}`;
