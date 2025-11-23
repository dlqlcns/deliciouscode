import { API_BASE } from "./config.js";
import { createRecipeBlock, attachBookmarkListeners } from "./recipe_res_block.js";

/* 공용 fetch 함수 */
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
  if (!container) return;

  container.innerHTML = "";

  const recipes = await fetchJSON(`${API_BASE}/recipes/recommended`);
  if (!recipes.length) {
    container.innerHTML = `<p class="empty-msg">추천 레시피를 불러올 수 없습니다.</p>`;
    return;
  }

  recipes.forEach(recipe => {
    const card = createRecipeBlock(recipe);
    container.appendChild(card);
  });

  attachBookmarkListeners();
}

/* 전체 레시피 */
async function renderRecipeCards() {
  const recipeGrid = document.getElementById("recipeGrid");
  if (!recipeGrid) return;

  recipeGrid.innerHTML = "";

  const recipes = await fetchJSON(`${API_BASE}/recipes`);
  if (!recipes.length) {
    recipeGrid.innerHTML = `<p class="empty-msg">레시피가 없습니다.</p>`;
    return;
  }

  recipes.forEach(recipe => {
    const card = createRecipeBlock(recipe);

    // 카드 클릭 → 상세 페이지 이동
    card.addEventListener("click", (e) => {
      if (!e.target.classList.contains("bookmark-btn")) {
        window.location.href = `recipe_detail.html?id=${recipe.id}`;
      }
    });

    recipeGrid.appendChild(card);
  });

  attachBookmarkListeners();
}

/* 검색 이벤트 (Enter 입력 시 이동) */
function setupSearchHandlers() {
  const headerSearchInput = document.getElementById("headerSearchInput");
  if (!headerSearchInput) return;

  headerSearchInput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
      const query = headerSearchInput.value.trim();
      if (query) {
        window.location.href = `recipe_results.html?ingredients=${encodeURIComponent(query)}`;
      }
    }
  });
}

/* 초기 실행 */
document.addEventListener("DOMContentLoaded", () => {
  renderRecommended();
  renderRecipeCards();
  setupSearchHandlers();
});

