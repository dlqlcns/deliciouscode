// ============================================
// recipe_results.js - AI 생성 레시피 결과 페이지
// ============================================
// ⚠️ recipe_res_block.js 먼저 로드되어 있어야 함
// ============================================

let currentRecipes = [];
const recipeList = document.getElementById("recipeList");
const headerSearchInput = document.getElementById("headerSearchInput");

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
// AI 서버에서 레시피 목록 불러오기
// ============================================
async function fetchAIRecipes() {
  const urlParams = new URLSearchParams(window.location.search);
  const ingredientsParam = urlParams.get("ingredients") || "";
  const ingredients = ingredientsParam.split(",").map(i => i.trim()).filter(Boolean);

  if (ingredients.length === 0) {
    showToastNotification("검색할 재료가 없습니다.");
    return [];
  }

  try {
    const res = await fetch("/api/ai/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients, allergies: getUserAllergies() }),
    });␊

    if (!res.ok) throw new Error("AI 레시피 목록을 불러오지 못했습니다.");
    const recipes = await res.json();

    return recipes.map((r, idx) => ({
      id: idx + 1,
      name: r.name,
      description: r.description,
      category: "AI 추천",
      bookmarked: false,
    }));
  } catch (err) {
    console.error("AI 목록 요청 오류:", err);
    showToastNotification("AI 추천 레시피를 불러올 수 없습니다.");
    return [];
  }
}

// ============================================
// AI 상세 레시피 불러오기
// ============================================
async function fetchAIDetail(name) {
  try {
    const res = await fetch("/api/ai/detail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, allergies: getUserAllergies() }),
    });␊

    if (!res.ok) throw new Error("AI 레시피 상세정보 불러오기 실패");
    return await res.json();
  } catch (err) {
    console.error("AI 상세 요청 오류:", err);
    showToastNotification("상세 정보를 불러올 수 없습니다.");
    return null;
  }
}

// ============================================
// 렌더링 함수
// ============================================
function renderRecipes(recipes) {
  recipeList.innerHTML = "";

  if (!recipes || recipes.length === 0) {
    recipeList.innerHTML =
      '<p style="text-align:center;color:#888;grid-column:1/-1;">검색 결과가 없습니다.</p>';
    return;
  }

  recipes.forEach(recipe => {
    const card = document.createElement("div");
    card.className = "ai-recipe-card";
