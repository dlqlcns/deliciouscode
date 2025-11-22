// ============================================
// recipe_all.js - AI 추천 전체 레시피 페이지
// ============================================

let currentRecipes = [];
const recipeList = document.getElementById("recipeList");
const categorySelect = document.getElementById("categorySelect");
const sortSelect = document.getElementById("sortSelect");

const getUserAllergies = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return Array.isArray(user?.allergies) ? user.allergies : [];
  } catch (e) {
    console.warn("알레르기 정보를 불러오지 못했습니다:", e);
    return [];
  }
};

// ============================================
// AI 서버에서 레시피 가져오기
// ============================================
async function fetchAIRecipes() {
  try {
    const res = await fetch("/api/ai/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients: ["전체 추천"], allergies: getUserAllergies() }),
    });␊

    if (!res.ok) throw new Error("AI 레시피를 불러오지 못했습니다.");
    const recipes = await res.json();

    return recipes.map((r, idx) => ({
      id: idx + 1,
      name: r.name,
      description: r.description,
      category: "AI 추천",
      time: r.time || "30분",
      bookmarked: false,
    }));
  } catch (err) {
    console.error("AI 전체 레시피 로드 오류:", err);
    showToastNotification("AI 레시피를 불러올 수 없습니다.");
    return [];
  }
}

// ============================================
// 렌더링
// ============================================
function renderRecipes() {
  if (!recipeList) return;
  recipeList.innerHTML = "";
