import { API_BASE } from "./config.js";
import { createRecipeBlock } from "./recipe_res_block.js";

let currentRecipes = [];
const recipeList = document.getElementById('recipeList');
const categorySelect = document.getElementById('categorySelect');
const sortSelect = document.getElementById('sortSelect');

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user) {
  alert("로그인이 필요합니다.");
  window.location.href = "/login.html";
}

/* ==========================================================
   DB에서 레시피 + 즐겨찾기 조회
========================================================== */
async function fetchRecipesWithFavorites() {
  try {
    // 전체 레시피
    const resRecipes = await fetch(`${API_BASE}/recipes`);
    const recipes = await resRecipes.json();
    if (!resRecipes.ok) throw new Error("레시피 불러오기 실패");

    // 즐겨찾기 ID 목록
    const resFav = await fetch(`${API_BASE}/favorites`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const favIds = await resFav.json();
    if (!resFav.ok) throw new Error("즐겨찾기 조회 실패");

    // 즐겨찾기 표시 플래그 적용
    recipes.forEach(r => r.bookmarked = favIds.includes(r.id));

    return recipes;
  } catch (err) {
    console.error(err);
    return [];
  }
}

/* ==========================================================
   렌더링 함수
========================================================== */
function renderRecipes() {
  if (!recipeList) return;
  recipeList.innerHTML = "";

  if (!currentRecipes || currentRecipes.length === 0) {
    recipeList.innerHTML =
      '<p style="text-align:center;color:#888;font-size:1.1rem;grid-column:1/-1">검색 결과가 없습니다.</p>';
    return;
  }

  currentRecipes.forEach(r => {
    const card = createRecipeBlock(r);
    recipeList.appendChild(card);

    const bookmarkBtn = card.querySelector(".bookmark-btn");
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener("click", async e => {
        e.stopPropagation();
        await toggleBookmark(r.id);
      });
    }

    card.addEventListener("click", e => {
      if (!e.target.classList.contains("bookmark-btn")) {
        window.location.href = `recipe_detail.html?id=${r.id}`;
      }
    });
  });
}

/* ==========================================================
   즐겨찾기 추가/삭제 (DB 저장)
========================================================== */
async function toggleBookmark(recipeId) {
  const idx = currentRecipes.findIndex(r => r.id === recipeId);
  if (idx < 0) return;

  const isBookmarked = currentRecipes[idx].bookmarked;

  try {
    const res = await fetch(`${API_BASE}/favorites`, {
      method: isBookmarked ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ recipe_id: recipeId })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "즐겨찾기 처리 실패");

    // UI 즉시 반영
    currentRecipes[idx].bookmarked = !isBookmarked;
    renderRecipes();
  } catch (err) {
    console.error("즐겨찾기 오류:", err);
  }
}

/* ==========================================================
   필터 및 정렬
========================================================== */
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

if (categorySelect) categorySelect.addEventListener("change", filterRecipes);
if (sortSelect) sortSelect.addEventListener("change", filterRecipes);

/* ==========================================================
   초기 실행
========================================================== */
document.addEventListener("DOMContentLoaded", async () => {
  currentRecipes = await fetchRecipesWithFavorites();
  renderRecipes();
});
import { API_BASE } from "./config.js";

let currentRecipes = [];
const recipeList = document.getElementById('recipeList');
const categorySelect = document.getElementById('categorySelect');
const sortSelect = document.getElementById('sortSelect');

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user) {
  alert("로그인이 필요합니다.");
  window.location.href = "/login.html";
}

/* ==========================================================
   DB에서 레시피 + 즐겨찾기 조회
========================================================== */
async function fetchRecipesWithFavorites() {
  try {
    // 전체 레시피
    const resRecipes = await fetch(`${API_BASE}/recipes`);
    const recipes = await resRecipes.json();
    if (!resRecipes.ok) throw new Error("레시피 불러오기 실패");

    // 즐겨찾기 ID 목록
    const resFav = await fetch(`${API_BASE}/favorites`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const favIds = await resFav.json();
    if (!resFav.ok) throw new Error("즐겨찾기 조회 실패");

    // 즐겨찾기 표시 플래그 적용
    recipes.forEach(r => r.bookmarked = favIds.includes(r.id));

    return recipes;
  } catch (err) {
    console.error(err);
    return [];
  }
}

/* ==========================================================
   렌더링 함수
========================================================== */
function renderRecipes() {
  if (!recipeList) return;
  recipeList.innerHTML = "";

  if (!currentRecipes || currentRecipes.length === 0) {
    recipeList.innerHTML =
      '<p style="text-align:center;color:#888;font-size:1.1rem;grid-column:1/-1">검색 결과가 없습니다.</p>';
    return;
  }

  currentRecipes.forEach(r => {
    const card = createRecipeBlock(r);
    recipeList.appendChild(card);

    const bookmarkBtn = card.querySelector(".bookmark-btn");
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener("click", async e => {
        e.stopPropagation();
        await toggleBookmark(r.id);
      });
    }

    card.addEventListener("click", e => {
      if (!e.target.classList.contains("bookmark-btn")) {
        window.location.href = `recipe_detail.html?id=${r.id}`;
      }
    });
  });
}

/* ==========================================================
   즐겨찾기 추가/삭제 (DB 저장)
========================================================== */
async function toggleBookmark(recipeId) {
  const idx = currentRecipes.findIndex(r => r.id === recipeId);
  if (idx < 0) return;

  const isBookmarked = currentRecipes[idx].bookmarked;

  try {
    const res = await fetch(`${API_BASE}/favorites`, {
      method: isBookmarked ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ recipe_id: recipeId })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "즐겨찾기 처리 실패");

    // UI 즉시 반영
    currentRecipes[idx].bookmarked = !isBookmarked;
    renderRecipes();
  } catch (err) {
    console.error("즐겨찾기 오류:", err);
  }
}

/* ==========================================================
   필터 및 정렬
========================================================== */
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

if (categorySelect) categorySelect.addEventListener("change", filterRecipes);
if (sortSelect) sortSelect.addEventListener("change", filterRecipes);

/* ==========================================================
   초기 실행
========================================================== */
document.addEventListener("DOMContentLoaded", async () => {
  currentRecipes = await fetchRecipesWithFavorites();
  renderRecipes();
});

