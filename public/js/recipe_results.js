// ============================================
// recipe_results.js - Supabase 레시피 결과 페이지
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
// Supabase에서 레시피 목록 불러오기
// ============================================
async function fetchDbRecipes() {
  const urlParams = new URLSearchParams(window.location.search);
  const ingredientsParam = urlParams.get("ingredients") || "";
  const ingredients = ingredientsParam.split(",").map(i => i.trim()).filter(Boolean);

  if (ingredients.length === 0) {
    showToastNotification("검색할 재료가 없습니다.");
    return [];
  }

  try {
    const query = new URLSearchParams({
      ingredients: ingredients.join(","),
      allergies: getUserAllergies().join(","),
    });

    const res = await fetch(`/api/recipes/search?${query.toString()}`);

    if (!res.ok) throw new Error("레시피 목록을 불러오지 못했습니다.");
    return await res.json();
  } catch (err) {
    console.error("DB 목록 요청 오류:", err);
    showToastNotification("레시피를 불러올 수 없습니다.");
    return [];
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
    card.innerHTML = `
      <div class="recipe-content">
        <h3>${recipe.name}</h3>
        <p>${recipe.description}</p>
        <button class="detail-btn" data-id="${recipe.id}">자세히 보기</button>
      </div>
    `;
    recipeList.appendChild(card);
  });

  // 상세보기 버튼 이벤트
  document.querySelectorAll(".detail-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const recipeId = btn.dataset.id;
      if (recipeId) {
        window.location.href = `recipe_detail.html?id=${recipeId}`;
      }
    });
  });
}

// ============================================
// 페이지 초기화
// ============================================
document.addEventListener("DOMContentLoaded", async () => {
  currentRecipes = await fetchDbRecipes();
  renderRecipes(currentRecipes);

  // 헤더 검색창 - 재검색 기능
  if (headerSearchInput) {
    headerSearchInput.addEventListener("keypress", e => {
      if (e.key !== "Enter") return;
      const query = headerSearchInput.value.trim();
      if (!query) return;
      window.location.href = `recipe_results.html?ingredients=${encodeURIComponent(query)}`;
    });
  }
});
