// ============================================
// recipe_all.js - AI 추천 전체 레시피 페이지
// ============================================

let currentRecipes = [];
const recipeList = document.getElementById("recipeList");
const categorySelect = document.getElementById("categorySelect");
const sortSelect = document.getElementById("sortSelect");

// ============================================
// AI 서버에서 레시피 가져오기
// ============================================
async function fetchAIRecipes() {
  try {
    const res = await fetch("/api/ai/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients: ["전체 추천"] }),
    });

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

  if (currentRecipes.length === 0) {
    recipeList.innerHTML = `
      <p style="text-align:center;color:#888;grid-column:1/-1;">
        표시할 레시피가 없습니다.
      </p>`;
    return;
  }

  currentRecipes.forEach(recipe => {
    const card = createRecipeBlock(recipe);
    recipeList.appendChild(card);
  });

  attachBookmarkListeners(onBookmarkClicked);
}

// ============================================
// 즐겨찾기 토글 (로컬 기준)
// ============================================
function onBookmarkClicked(id) {
  const recipe = currentRecipes.find(r => r.id === id);
  if (!recipe) return;

  recipe.bookmarked = !recipe.bookmarked;
  renderRecipes();

  showToastNotification(
    `"${recipe.name}"이(가) ${recipe.bookmarked ? "즐겨찾기에 추가" : "즐겨찾기에서 제거"}되었습니다.`
  );
}

// ============================================
// 필터 및 정렬
// ============================================
function filterRecipes() {
  const selectedCategory = categorySelect?.value || "전체";
  const sortOption = sortSelect?.value || "최신순";

  let filtered = [...currentRecipes];
  if (selectedCategory !== "전체") {
    filtered = filtered.filter(r => r.category === selectedCategory);
  }

  switch (sortOption) {
    case "이름순":
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "조리 시간순":
      filtered.sort((a, b) => parseInt(a.time) - parseInt(b.time));
      break;
    default:
      filtered.sort((a, b) => b.id - a.id);
      break;
  }

  currentRecipes = filtered;
  renderRecipes();
}

// ============================================
// 초기화
// ============================================
document.addEventListener("DOMContentLoaded", async () => {
  currentRecipes = await fetchAIRecipes();
  renderRecipes();
});

categorySelect?.addEventListener("change", filterRecipes);
sortSelect?.addEventListener("change", filterRecipes);
