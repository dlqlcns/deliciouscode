import { API_BASE } from "./config.js";
import { createRecipeBlock, attachBookmarkListeners } from "./recipe_res_block.js";

async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("API 요청 오류:", err);
    return [];
  }
}

/* 추천 레시피 (5개) */
async function renderRecommended() {
  const container = document.getElementById("recommended-container");
  if (!container) return;            // 🔥 index 페이지에서만 실행
  container.innerHTML = "";

  const recipes = await fetchJSON(`${API_BASE}/recipes/recommended`);
  recipes.slice(0,5).forEach(recipe => {
    container.appendChild(createRecipeBlock(recipe));
  });

  attachBookmarkListeners();
}

/* 전체 레시피는 index 페이지가 아닐 경우 실행하지 않음 */
async function renderRecipeCards() {
  const recipeGrid = document.getElementById("recipeGrid");
  if (!recipeGrid) return;           // 🔥 전체 레시피 페이지에서만 실행
  recipeGrid.innerHTML = "";

  const recipes = await fetchJSON(`${API_BASE}/recipes`);
  recipes.forEach(recipe => {
    const card = createRecipeBlock(recipe);
    recipeGrid.appendChild(card);
  });

  attachBookmarkListeners();
}

/* 검색 */
function setupSearchHandlers() {
  const input = document.getElementById("headerSearchInput");
  if (!input) return;

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const keyword = input.value.trim();
      if (keyword) {
        window.location.href =
          `recipe_results.html?ingredients=${encodeURIComponent(keyword)}`;
      }
    }
  });
}

/* 초기 실행 */
document.addEventListener("DOMContentLoaded", () => {
  renderRecommended();   // index 페이지서만 동작
  renderRecipeCards();   // 전체 레시피 페이지에서만 동작
  setupSearchHandlers();
});
