// ============================================
// recipe_results.js - 검색 결과 페이지 (DB 연동)
// ============================================

let currentRecipes = [];
const recipeList = document.getElementById('recipeList');

// 검색 쿼리 파라미터 가져오기
function getQueryParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    query: urlParams.get('query') || '',
    ingredients: urlParams.get('ingredients') || ''
  };
}

// 서버에서 검색 결과 가져오기
async function fetchSearchResults() {
  const { query, ingredients } = getQueryParams();

  const apiUrl = `/api/recipes/search?query=${encodeURIComponent(query)}&ingredients=${encodeURIComponent(ingredients)}`;
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error('검색 결과 불러오기 실패');
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

// 렌더링
function renderRecipes(recipes) {
  if (!recipeList) return;
  recipeList.innerHTML = '';

  if (!recipes.length) {
    recipeList.innerHTML = '<p style="text-align:center;color:#888;">검색 결과가 없습니다.</p>';
    return;
  }

  recipes.forEach(r => recipeList.appendChild(createRecipeBlock(r)));
  attachBookmarkListeners(onBookmarkClicked);
}

function onBookmarkClicked(id) {
  console.log("Bookmark clicked:", id);
}

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
  currentRecipes = await fetchSearchResults();
  renderRecipes(currentRecipes);
});
