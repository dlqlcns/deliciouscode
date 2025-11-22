// ===========================================
// my_fav.js - 즐겨찾기 페이지 (DB 연동)
// ===========================================

let currentRecipes = [];

// DOM 요소
const recipeList = document.getElementById('recipeList');
const categorySelect = document.getElementById('categorySelect');
const sortSelect = document.getElementById('sortSelect');
const favSearchInput = document.getElementById('favSearchInput');
const favSearchIcon = document.getElementById('favSearchIcon');

// 유저 ID (로그인 시 localStorage에 저장)
const userId = localStorage.getItem("userId");

// ============================================
// DOMContentLoaded 및 이벤트 리스너
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    fetchFavorites(); // DB에서 즐겨찾기 불러오기

    // 헤더 검색
    const headerSearchInput = document.getElementById("headerSearchInput");
    if (headerSearchInput) {
        headerSearchInput.addEventListener("keypress", e => {
            if (e.key === "Enter") {
                const query = headerSearchInput.value.trim();
                if (query) {
                    let recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
                    recent = recent.filter(t => t !== query);
                    recent.unshift(query);
                    localStorage.setItem('recentSearches', JSON.stringify(recent.slice(0, 10)));
                    
                    const ingredients = query.replace(/\s+/g, ',');
                    window.location.href = `recipe_results.html?ingredients=${encodeURIComponent(ingredients)}`;
                }
            }
        });
    }

    // 페이지 내 검색
    if (favSearchInput) {
        favSearchInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                e.preventDefault(); 
                filterRecipes();
            }
        });
        favSearchInput.addEventListener('input', filterRecipes);
    }

    if (favSearchIcon) {
        favSearchIcon.addEventListener('click', filterRecipes);
    }
});

if (categorySelect) categorySelect.addEventListener('change', filterRecipes);
if (sortSelect) sortSelect.addEventListener('change', filterRecipes);

// ============================================
// DB 연동 로직
// ============================================

async function fetchFavorites() {
    if (!userId) return;
    try {
        // 1. 즐겨찾기 레시피 ID 가져오기
        const resFavs = await fetch(`/api/favorites/${userId}`);
        const favIds = await resFavs.json();

        if (!favIds || favIds.length === 0) {
            currentRecipes = [];
            renderRecipes();
            return;
        }

        // 2. 전체 레시피 가져오기
        const resRecipes = await fetch('/api/recipes');
        const allRecipes = await resRecipes.json();

        // 3. 즐겨찾기 필터
        currentRecipes = allRecipes.filter(r => favIds.includes(r.id));
        filterRecipes();
    } catch (err) {
        console.error("즐겨찾기 불러오기 오류:", err);
    }
}

// ============================================
// 렌더링 및 필터링 로직
// ============================================

function renderRecipes() {
    if (!recipeList) return;
    recipeList.innerHTML = '';

    if (!currentRecipes || currentRecipes.length === 0) {
        recipeList.innerHTML = '<p style="text-align:center;color:#888;font-size:1.1rem;grid-column:1/-1">즐겨찾기 된 레시피가 없습니다.</p>';
        return;
    }

    currentRecipes.forEach(r => {
        const card = createRecipeBlock({...r, bookmarked: true}); 
        recipeList.appendChild(card);
    });

    attachBookmarkListeners(onBookmarkClicked); 
}

async function onBookmarkClicked(id) {
    try {
        await fetch('/api/favorites', {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: userId, recipe_id: id })
        });

        currentRecipes = currentRecipes.filter(r => r.id !== id);
        renderRecipes();
        showToastNotification(`즐겨찾기에서 해제되었습니다.`);
    } catch (err) {
        console.error("즐겨찾기 삭제 오류:", err);
    }
}

function filterRecipes() {
    let filtered = [...currentRecipes];

    const selectedCategory = categorySelect?.value || '전체';
    const sortOption = sortSelect?.value || '최신순';
    const searchQuery = favSearchInput?.value.toLowerCase().trim() || ''; 

    if (selectedCategory !== '전체') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    if (searchQuery) {
        filtered = filtered.filter(r => 
            r.name.toLowerCase().includes(searchQuery) ||
            r.description.toLowerCase().includes(searchQuery)
        );
    }

    switch (sortOption) {
      case '이름순':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case '조리 시간순':
        filtered.sort((a, b) => parseInt(a.time) - parseInt(b.time));
        break;
      case '최신순':
      default:
        filtered.sort((a, b) => (a.id < b.id ? 1 : (a.id > b.id ? -1 : 0)));
        break;
    }

    currentRecipes = filtered;
    renderRecipes();
}
