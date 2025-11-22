document.addEventListener('DOMContentLoaded', () => {
  const recipeList = document.getElementById('recipeList')
  const categorySelect = document.getElementById('categorySelect')
  const sortSelect = document.getElementById('sortSelect')
  const favSearchInput = document.getElementById('favSearchInput')
  const favSearchIcon = document.getElementById('favSearchIcon')

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  if (!token || !user) {
    alert('로그인이 필요합니다.')
    window.location.href = '/login.html'
    return
  }

  let currentRecipes = []

  async function fetchFavorites() {
    try {
      const resFav = await fetch('/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const favIds = await resFav.json()
      if (!resFav.ok) throw new Error(favIds.error || '즐겨찾기 조회 실패')

      const resRecipes = await fetch('/api/recipes')
      const allRecipes = await resRecipes.json()
      currentRecipes = allRecipes.filter(r => favIds.includes(r.id))
      filterAndRender()
    } catch (err) {
      console.error('즐겨찾기 불러오기 오류:', err)
    }
  }

  function renderRecipes(recipes) {
    if (!recipeList) return
    recipeList.innerHTML = ''
    if (recipes.length === 0) {
      recipeList.innerHTML = '<p style="text-align:center;color:#888;font-size:1.1rem">즐겨찾기 된 레시피가 없습니다.</p>'
      return
    }
    recipes.forEach(r => {
      const card = createRecipeBlock({ ...r, bookmarked: true })
      card.addEventListener('click', e => {
        if (!e.target.classList.contains('bookmark-btn')) {
          window.location.href = `recipe_detail.html?id=${r.id}`
        }
      })
      const bookmarkBtn = card.querySelector('.bookmark-btn')
      if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', async e => {
          e.stopPropagation()
          await handleBookmarkClick(r.id)
        })
      }
      recipeList.appendChild(card)
    })
  }

  async function handleBookmarkClick(id) {
    try {
      const res = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ recipe_id: id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '삭제 실패')

      currentRecipes = currentRecipes.filter(r => r.id !== id)
      renderRecipes(currentRecipes)
      alert('즐겨찾기에서 해제되었습니다.')
    } catch (err) {
      console.error('즐겨찾기 삭제 오류:', err)
    }
  }

  function filterAndRender() {
    let filtered = [...currentRecipes]
    const selectedCategory = categorySelect?.value || '전체'
    const sortOption = sortSelect?.value || '최신순'
    const searchQuery = favSearchInput?.value.toLowerCase().trim() || ''

    if (selectedCategory !== '전체') {
      filtered = filtered.filter(r => r.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchQuery) ||
        (r.description && r.description.toLowerCase().includes(searchQuery))
      )
    }

    switch (sortOption) {
      case '이름순':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case '조리 시간순':
        filtered.sort((a, b) => parseInt(a.time) - parseInt(b.time))
        break
      case '최신순':
      default:
        filtered.sort((a, b) => b.id - a.id)
        break
    }

    renderRecipes(filtered)
  }

  if (favSearchInput) {
    favSearchInput.addEventListener('input', filterAndRender)
    favSearchInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') e.preventDefault(), filterAndRender()
    })
  }
  if (favSearchIcon) favSearchIcon.addEventListener('click', filterAndRender)
  if (categorySelect) categorySelect.addEventListener('change', filterAndRender)
  if (sortSelect) sortSelect.addEventListener('change', filterAndRender)

  fetchFavorites()
})
