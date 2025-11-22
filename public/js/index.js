// ============================================
// index.js - 메인 페이지
// ============================================
// ⚠️ recipe_res_block.js를 먼저 로드해야 함!

// 추천 레시피 데이터 (실제로는 서버에서 가져올 데이터)
import { supabase } from './supabaseClient.js'

async function getRecommendedRecipes() {
    // recipes 테이블에서 최신 5개 레시피 가져오기 예시
    const { data, error } = await supabase
        .from('recipes')
        .select('id, name, category, time')
        .order('id', { ascending: true })
        .limit(5)

    if (error) {
        console.error('Error fetching recipes:', error)
        return []
    }
    return data
}

// 페이지 렌더링할 때 사용
async function renderRecommended() {
    const recipes = await getRecommendedRecipes()
    const container = document.getElementById('recommended-container')
    container.innerHTML = ''

    recipes.forEach(recipe => {
        const card = document.createElement('div')
        card.className = 'recipe-card'
        card.innerHTML = `
            <h3>${recipe.name}</h3>
            <p>카테고리: ${recipe.category}</p>
            <p>소요시간: ${recipe.time}</p>
        `
        container.appendChild(card)
    })
}

renderRecommended()

// 북마크 상태 관리
let recipes = [...recommendedRecipes];

// ============================================
// 레시피 카드 생성 및 렌더링
// ============================================

function renderRecipeCards() {
  const recipeGrid = document.getElementById('recipeGrid');
  if (!recipeGrid) return;

  recipeGrid.innerHTML = '';

  recipes.forEach(recipe => {
    // ✅ createRecipeBlock()은 recipe_res_block.js에서 가져옴
    const card = createRecipeBlock(recipe);
    
    // ✅ 카드 클릭 시 상세 페이지로 이동
    card.addEventListener('click', (e) => {
      // 북마크 버튼 클릭은 제외
      if (!e.target.classList.contains('bookmark-btn')) {
        window.location.href = `recipe_detail.html?id=${recipe.id}`;
      }
    });
    
    recipeGrid.appendChild(card);
  });

  // ✅ 북마크 버튼 이벤트 리스너
  attachBookmarkListeners(handleBookmarkClick);
}

// 북마크 클릭 핸들러
function handleBookmarkClick(id) {
  const recipeIndex = recipes.findIndex(r => r.id === id);
  if (recipeIndex > -1) {
    recipes[recipeIndex].bookmarked = !recipes[recipeIndex].bookmarked;
    renderRecipeCards();
  }
}

// ============================================
// 초기화
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  renderRecipeCards();
});


// ===========================================
// [추가] 헤더 검색 (headerSearchInput) Enter 키 이벤트 리스너
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
    // ⚠️ 헤더 검색 입력 필드 (my_fav.html의 headerSearchInput ID를 사용한다고 가정)
    const headerSearchInput = document.getElementById("headerSearchInput");

    if (headerSearchInput) {
        headerSearchInput.addEventListener("keypress", e => {
            // Enter 키 감지
            if (e.key === "Enter") {
                const query = headerSearchInput.value.trim();
                
                if (query) {
                    // (선택 사항) 최근 검색어 로직: recipe_results.js와 동일하게 처리
                    let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
                    recentSearches = recentSearches.filter(term => term !== query);
                    recentSearches.unshift(query);
                    if (recentSearches.length > 10) {
                        recentSearches = recentSearches.slice(0, 10);
                    }
                    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
                    
                    // 검색 결과 페이지로 이동
                    const ingredients = query.replace(/\s+/g, ',');
                    window.location.href = `recipe_results.html?ingredients=${encodeURIComponent(ingredients)}`;
                }
            }
        });
    }

    // my_fav 페이지 내 검색 입력 필드 (favSearchInput) Enter 키 처리 로직도
    // DOMContentLoaded 내에 있다면 함께 확인해 주세요.
    const favSearchInput = document.getElementById('favSearchInput');
    if (favSearchInput) {
        favSearchInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                e.preventDefault(); 
                filterRecipes(); // my_fav 페이지 내 필터링 함수 호출
            }
        });
    }

});
