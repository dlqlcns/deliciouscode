let currentRecipes = []
const recipeList = document.getElementById('recipeList')
const categorySelect = document.getElementById('categorySelect')
const sortSelect = document.getElementById('sortSelect')

const token = localStorage.getItem('token') || ''

async function fetchRecipesFromServer() {
  try {
    const res = await fetch('/api/recipes', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('레시피를 불러올 수 없습니다.')
    return await res.json()
  } catch (err) {
    console.error(err)
    return []
  }
}

async function fetchFavoritesFromServer() {
  try {
    const res = await fetch('/api/favorites', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

function renderRecipes() {
  if (!recipeList) return
  recipeList.innerHTML = ''

  if (!currentRecipes.length) {
    recipeList.innerHTML = '<p class="empty">검색 결과가 없습니다.</p>'
    return
  }

  currentRecipes.forEach(r => {
    const card = createRecipeBlock(r)
    recipeList.appendChild(card)
  })

  attachBookmarkListeners(onBookmarkClicked)
}

async function onBookmarkClicked(recipeId) {
  const recipe = currentRecipes.find(r => r.id === recipeId)
  if (!recipe) return

  recipe.bookmarked = !recipe.bookmarked

  try {
    await fetch('/api/favorites', {
      method: recipe.bookmarked ? 'POST' : 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ recipe_id: recipeId })
    })

    renderRecipes()
    showToastNotification(`"${recipe.name}"이(가) ${recipe.bookmarked ? '즐겨찾기에 추가' : '즐겨찾기에서 제거'}되었습니다.`)
  } catch (err) {
    console.error('즐겨찾기 토글 오류:', err)
  }
}

function filterRecipes() {
  const selectedCategory = categorySelect?.value || '전체'
  const sortOption = sortSelect?.value || '최신순'

  let filtered = [...currentRecipes]
  if (selectedCategory !== '전체') {
    filtered = filtered.filter(r => r.category === selectedCategory)
  }

  switch (sortOption) {
    case '이름순':
      filtered.sort((a, b) => a.name.localeCompare(b.name))
      break
    case '조리 시간순':
      filtered.sort((a, b) => parseInt(a.time) - parseInt(b.time))
      break
    default:
      filtered.sort((a, b) => (a.id < b.id ? 1 : -1))
      break
  }

  currentRecipes = filtered
  renderRecipes()
}

document.addEventListener('DOMContentLoaded', async () => {
  const [recipes, favorites] = await Promise.all([
    fetchRecipesFromServer(),
    fetchFavoritesFromServer()
  ])

  recipes.forEach(r => {
    r.bookmarked = favorites.includes(r.id)
  })

  currentRecipes = recipes
  renderRecipes()
})

categorySelect?.addEventListener('change', filterRecipes)
sortSelect?.addEventListener('change', filterRecipes)
