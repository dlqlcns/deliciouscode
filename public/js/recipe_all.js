// ============================================
// recipe_all.js - Supabase 전체 레시피 페이지
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
// Supabase에서 레시피 가져오기
// ============================================
async function fetchDbRecipes() {
  try {
    const query = new URLSearchParams({
      allergies: getUserAllergies().join(","),
    });

    const res = await fetch(`/api/recipes?${query.toString()}`);

    if (!res.ok) throw new Error("레시피를 불러오지 못했습니다.");
    const recipes = await res.json();

    return recipes.map(r => ({
      ...r,
      bookmarked: false,
    }));
  } catch (err) {
    console.error("전체 레시피 로드 오류:", err);
    showToastNotification("레시피를 불러올 수 없습니다.");
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
  currentRecipes = await fetchDbRecipes();
  renderRecipes();
});

categorySelect?.addEventListener("change", filterRecipes);
sortSelect?.addEventListener("change", filterRecipes);
