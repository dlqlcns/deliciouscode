import { API_BASE } from "./config.js";
import { createRecipeBlock, attachBookmarkListeners } from "./recipe_res_block.js";

let currentRecipes = [];
const recipeList = document.getElementById("recipeList");

/* ============================================
   URL 파라미터 읽기
============================================ */
function getQueryParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    query: urlParams.get("query") || "",
    ingredients: urlParams.get("ingredients") || ""
  };
}

/* ============================================
   서버에서 검색 결과 가져오기
============================================ */
async function fetchSearchResults() {
  const { query, ingredients } = getQueryParams();

  const apiUrl =
    `${API_BASE}/recipes/search?` +
    `query=${encodeURIComponent(query)}` +
    `&ingredients=${encodeURIComponent(ingredients)}`;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("검색 결과 불러오기 실패");
    return await res.json();
  } catch (err) {
    console.error("검색 API 오류:", err);
    return [];
  }
}

/* ============================================
   렌더링
============================================ */
function renderRecipes(recipes) {
  if (!recipeList) return;
  recipeList.innerHTML = "";

   document.getElementById('resultsSubtitle').textContent =
  `총 ${recipes.length}개의 레시피가 검색되었습니다.`;

  if (!recipes.length) {
    recipeList.innerHTML =
      `<p style="text-align:center;color:#888;font-size:1.1rem;padding:20px;">
        검색 결과가 없습니다.
       </p>`;
    return;
  }

  recipes.forEach(r => recipeList.appendChild(createRecipeBlock(r)));
  attachBookmarkListeners();   // 자동 bookmark 처리
}

/* ============================================
   초기 실행
============================================ */
document.addEventListener("DOMContentLoaded", async () => {
  currentRecipes = await fetchSearchResults();
  renderRecipes(currentRecipes);
});

