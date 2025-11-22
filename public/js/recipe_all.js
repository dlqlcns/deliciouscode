// ============================================
// recipe_all.js - 전체 레시피 페이지 (DB 연동 버전)
// ============================================

let currentRecipes = [];
const recipeList = document.getElementById('recipeList');
const categorySelect = document.getElementById('categorySelect');
const sortSelect = document.getElementById('sortSelect');

// ============================================
// 서버에서 레시피 데이터 가져오기
// ============================================
async function fetchRecipes() {
  try {
    const response = await fetch('/api/recipes');
    if (!response.ok) throw new Error('레시피 데이터를 가져오지 못했습니다.');
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// ============================================
// 로컬 즐겨찾기 상태 적용
// ============================================
function applyFavorites(recipes) {
  const favs = JSON.parse(localStorage.getItem('favorites')) || [];
  recipes.forEach(r => r.bookmarked = favs.includes(r.id));
}

// ============================================
// 렌더링 함수
// ============================================
function renderRecipes() {
  if (!recipeList) return;
  recipeList.innerHTML = '';

  if (!currentRecipes || currentRecipes.length === 0) {
    recipeList.innerHTML = '<p style="text-align:center;color:#888;font-size:1.1rem;grid-column:1/-1">검색 결과가 없습니다.</p>';
    return;
  }

  currentRecipes.forEach(r => {
    const card = createRecipeBlock(r);
    recipeList.appendChild(card);
  });

  attachBookmarkListeners(onBookmarkClicked);
}

// ============================================
// 북마크 클릭 처리
// ============================================
function onBookmarkClicked(id) {
  const idx = currentRecipes.findIndex(x => x.id === id);
  if (idx < 0) return;

  currentRecipes[idx].bookmarked = !currentRecipes[idx].bookmarked;
  const isBookmarked = currentRecipes[idx].bookmarked;
  const recipeName = currentRecipes[idx].name;

  let favs = JSON.parse(localStorage.getItem("favorites")) || [];
  if (isBookmarked) {
    if (!favs.includes(id)) favs.push(id);
  } else {
    favs = favs.filter(favId => favId !== id);
  }
  localStorage.setItem("favorites", JSON.stringify(favs));

  const btn = document.querySelector(`.bookmark-btn[data-bookmark-id="${id}"]`);
  if (btn) {
    btn.textContent = isBookmarked ? '♥' : '♡';
    btn.classList.toggle('active', isBookmarked);
  }

  if (isBookmarked) {
    showToastNotification(`"${recipeName}"이(가) 즐겨찾기에 추가되었습니다.`, "이동", () => { window.location.href = "my_fav.html"; });
  } else {
    showToastNotification(`"${recipeName}"이(가) 즐겨찾기에서 해제되었습니다.`);
  }
}

// ============================================
// 필터 및 정렬
// ============================================
function filterRecipes() {
  const selectedCategory = categorySelect?.value || '전체';
  const sortOption = sortSelect?.value || '최신순';

  let filtered = [...currentRecipes];
  if (selectedCategory !== '전체') {
    filtered = filtered.filter(r => r.category === selectedCategory);
  }

  switch (sortOption) {
    case '이름순':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case '조리 시간순':
      filtered.sort((a, b) => parseInt(a.time) - parseInt(b.time));
      break;
    default:
      filtered.sort((a, b) => (a.id < b.id ? 1 : -1));
      break;
  }

  currentRecipes = filtered;
  renderRecipes();
}

if (categorySelect) categorySelect.addEventListener('change', filterRecipes);
if (sortSelect) sortSelect.addEventListener('change', filterRecipes);

// ============================================
// 초기화
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  currentRecipes = await fetchRecipes();
  applyFavorites(currentRecipes);
  renderRecipes();
});
