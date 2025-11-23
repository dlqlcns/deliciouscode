import { API_BASE } from "./config.js";

async function fetchJSON(url) {
  const res = await fetch(url);
  return await res.json();
}

// 추천 레시피 렌더링
async function renderRecommended() {
  const container = document.getElementById('recommended-container');
  container.innerHTML = '';

  const recipes = await fetchJSON(`${API_BASE}/recipes/recommended`);

  recipes.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
      <h3>${recipe.name}</h3>
      <p>카테고리: ${recipe.category}</p>
      <p>소요시간: ${recipe.time}</p>
    `;
    container.appendChild(card);
  });
}

// 전체 레시피 카드 렌더링
async function renderRecipeCards() {
  const recipeGrid = document.getElementById('recipeGrid')
  if (!recipeGrid) return

  recipeGrid.innerHTML = ''

  const recipes = await fetchJSON(`${API_BASE}/recipes`)

  recipes.forEach(recipe => {
    const card = createRecipeBlock(recipe)

    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('bookmark-btn')) {
        window.location.href = `recipe_detail.html?id=${recipe.id}`
      }
    })

    recipeGrid.appendChild(card)
  })

  attachBookmarkListeners(handleBookmarkClick)
}

// 북마크 토글 처리
function handleBookmarkClick(id) {
  // 북마크 처리 로직 (추후 API 연동 가능)
  console.log(`북마크 토글: ${id}`)
}

// 검색 처리
function setupSearchHandlers() {
  const headerSearchInput = document.getElementById("headerSearchInput")
  const favSearchInput = document.getElementById("favSearchInput")

  if (headerSearchInput) {
    headerSearchInput.addEventListener("keypress", e => {
      if (e.key === "Enter") {
        const query = headerSearchInput.value.trim()
        if (query) {
          let recent = JSON.parse(localStorage.getItem('recentSearches') || '[]')
          recent = [query, ...recent.filter(term => term !== query)].slice(0, 10)
          localStorage.setItem('recentSearches', JSON.stringify(recent))
          window.location.href = `recipe_results.html?ingredients=${encodeURIComponent(query)}`
        }
      }
    })
  }

  if (favSearchInput) {
    favSearchInput.addEventListener("keypress", e => {
      if (e.key === "Enter") {
        e.preventDefault()
        filterRecipes()
      }
    })
  }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  renderRecommended()
  renderRecipeCards()
  setupSearchHandlers()
})

