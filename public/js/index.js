import { API_BASE } from "./config.js"
import { createRecipeBlock, attachBookmarkListeners } from "./recipe_res_block.js"

async function fetchJSON(url) {
  const res = await fetch(url)
  return await res.json()
}

// 추천 레시피 렌더링
async function renderRecommended() {
  const container = document.getElementById('recommended-container')
  if (!container) return  // 요소 없으면 함수 종료 (에러 방지)

  container.innerHTML = ''
  const recipes = await fetchJSON(`${API_BASE}/recipes/recommended`)

  recipes.forEach(recipe => {
    const card = createRecipeBlock(recipe)
    container.appendChild(card)
  })
}

// 전체 레시피 카드 렌더링
async function renderRecipeCards() {
  const recipeGrid = document.getElementById('recipeGrid')
  if (!recipeGrid) return

  recipeGrid.innerHTML = ''
  const recipes = await fetchJSON(`${API_BASE}/recipes`)

  recipes.forEach(recipe => {
    const card = createRecipeBlock(recipe)
    card.addEventListener("click", (e) => {
      if (!e.target.classList.contains("bookmark-btn")) {
        window.location.href = `recipe_detail.html?id=${recipe.id}`
      }
    })
    recipeGrid.appendChild(card)
  })

  attachBookmarkListeners()
}

function setupSearchHandlers() {
  const headerSearchInput = document.getElementById("headerSearchInput")
  if (!headerSearchInput) return

  headerSearchInput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
      const query = headerSearchInput.value.trim()
      if (query) {
        window.location.href = `recipe_results.html?ingredients=${encodeURIComponent(query)}`
      }
    }
  })
}

document.addEventListener("DOMContentLoaded", () => {
  renderRecommended()
  renderRecipeCards()
  setupSearchHandlers()
})
