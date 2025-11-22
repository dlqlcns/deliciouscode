// ============================================
// recipe_results.js - 프론트엔드 (서버 연동)
// ============================================

let currentRecipes = [];

const recipeList = document.getElementById('recipeList');
const categorySelect = document.getElementById('categorySelect');
const sortSelect = document.getElementById('sortSelect');

// ============================================
// 서버 즐겨찾기 불러오기
// ============================================
async function loadFavoritesFromServer() {
  try {
    const res = await fetch('/api/favorites', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
      }
    });
    if (!res.ok) throw new Error('즐겨찾기 목록 불러오기 실패');
    return await res.json(); // [recipe_id, ...]
  } catch (err) {
    console.error(err);
    showToastNotification('즐겨찾기 목록을 불러올 수 없습니다.');
    return [];
  }
}

// ============================================
// 서버에서 레시피 불러오기
// ============================================
async function fetchRecipesFromServer() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('query') || '';
  const ingredients = urlParams.get('ingredients') || '';
  const exclude = urlParams.get('exclude') || '';
  const category = categorySelect?.value || '전체';
  const sort = sortSelect?.value || '최신순';

  const apiUrl = `/api/recipes/search?query=${encodeURIComponent(query)}&ingredients=${encodeURIComponent(
    ingredients
  )}&exclude=${encodeURIComponent(exclude)}&category=${encodeURIComponent(category)}&sort=${encodeURIComponent(sort)}`;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error('레시피 로드 실패');
    return await res.json(); // [{ id, name, ... }]
  } catch (err) {
    console.error(err);
    showToastNotification('레시피를 불러올 수 없습니다.');
    return [];
  }
}

// ============================================
// 북마크 서버 반영
// ============================================
async function toggleFavoriteOnServer(recipeId, isBookmarked) {
  try {
    const res = await fetch('/api/favorites', {
      method: isBookmarked ? 'POST' : 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify({ recipe_id: recipeId })
    });

    if (!res.ok) throw new Error('서버 즐겨찾기 반영 실패');
    return true;
  } catch (err) {
    console.error(err);
    showToastNotification('즐겨찾기 반영에 실패했습니다.');
    return false;
  }
}

// ============================================
// 북마크 클릭 핸들러
// ============================================
async function handleBookmarkClick(id) {
  const recipe = currentRecipes.find(r => r.id === id);
  if (!recipe) return;

  recipe.bookmarked = !recipe.bookmarked;
  const btn = document.querySelector(`.bookmark-btn[data-bookmark-id="${id}"]`);
  if (btn) btn.textContent = recipe.bookmarked ? '♥' : '♡';

  const success = await toggleFavoriteOnServer(id, recipe.bookmarked);
  if (success) {
    showToastNotification(`"${recipe.name}" ${recipe.bookmarked ? '즐겨찾기에 추가' : '즐겨찾기에서 제거'}되었습니다.`);
  } else {
    recipe.bookmarked = !recipe.bookmarked;
    if (btn) btn.textContent = recipe.bookmarked ? '♥' : '♡';
  }
}

// ============================================
// 렌더링
// ============================================
function renderRecipes(recipes) {
  if (!recipeList) return;
  recipeList.innerHTML = '';

  if (!recipes || recipes.length === 0) {
    recipeList.innerHTML = '<p style="text-align:center;color:#888;grid-column:1/-1;">검색 결과가 없습니다.</p>';
    return;
  }

  recipes.forEach(r => recipeList.appendChild(createRecipeBlock(r)));
  attachBookmarkListeners(handleBookmarkClick);
}

// ============================================
// 페이지 초기화
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  const favIds = await loadFavoritesFromServer();
  const recipes = await fetchRecipesFromServer();

  currentRecipes = recipes.map(r => ({
    ...r,
    bookmarked: favIds.includes(r.id)
  }));

  renderRecipes(currentRecipes);

  const urlParams = new URLSearchParams(window.location.search);
  displayTags(urlParams);

  if (categorySelect) categorySelect.addEventListener('change', refreshResults);
  if (sortSelect) sortSelect.addEventListener('change', refreshResults);
});

async function refreshResults() {
  const recipes = await fetchRecipesFromServer();
  const favIds = await loadFavoritesFromServer();
  currentRecipes = recipes.map(r => ({
    ...r,
    bookmarked: favIds.includes(r.id)
  }));
  renderRecipes(currentRecipes);
}
