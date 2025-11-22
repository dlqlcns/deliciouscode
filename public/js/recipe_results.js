// ============================================
// recipe_results.js - AI 생성 레시피 결과 페이지
// ============================================
// ⚠️ recipe_res_block.js 먼저 로드되어 있어야 함
// ============================================

let currentRecipes = [];
const recipeList = document.getElementById("recipeList");
const headerSearchInput = document.getElementById("headerSearchInput");

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
      body: JSON.stringify({ ingredients }),
    });

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
      body: JSON.stringify({ name }),
    });

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
    card.innerHTML = `
      <div class="recipe-content">
        <h3>${recipe.name}</h3>
        <p>${recipe.description}</p>
        <button class="detail-btn" data-name="${recipe.name}">자세히 보기</button>
      </div>
    `;
    recipeList.appendChild(card);
  });

  // 상세보기 버튼 이벤트
  document.querySelectorAll(".detail-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const name = btn.dataset.name;
      const detail = await fetchAIDetail(name);

      if (detail) {
        const detailHtml = `
          <div class="ai-detail-popup">
            <div class="popup-inner">
              <h2>${detail.name}</h2>
              <h4>🧂 재료</h4>
              <ul>${detail.ingredients.map(i => `<li>${i}</li>`).join("")}</ul>
              <h4>👨‍🍳 조리 순서</h4>
              <ol>${detail.steps.map(s => `<li>${s}</li>`).join("")}</ol>
              <button class="close-detail">닫기</button>
            </div>
          </div>
        `;

        document.body.insertAdjacentHTML("beforeend", detailHtml);

        document.querySelector(".close-detail").addEventListener("click", () => {
          document.querySelector(".ai-detail-popup").remove();
        });
      }
    });
  });
}

// ============================================
// 페이지 초기화
// ============================================
document.addEventListener("DOMContentLoaded", async () => {
  currentRecipes = await fetchAIRecipes();
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
