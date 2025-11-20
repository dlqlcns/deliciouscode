// ============================================
// index.js - 메인 페이지
// ============================================
// ⚠️ recipe_res_block.js를 먼저 로드해야 함!

// 추천 레시피 데이터 (실제로는 서버에서 가져올 데이터)
const recommendedRecipes = [
  {
    id: 'kimchi_jjigae',
    name: "김치찌개",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=300&fit=crop",
    time: "30분",
    description: "매콤하고 시원한 국물이 일품인 한국의 대표 찌개",
    category: "한식",
    bookmarked: false
  },
  {
    id: 'cream_pasta',
    name: "크림 파스타",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop",
    time: "20분",
    description: "부드럽고 고소한 크림 소스가 면발과 완벽하게 어우러진 파스타",
    category: "양식",
    bookmarked: false
  },
  {
    id: 'ramen',
    name: "일본식 라멘",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop",
    time: "45분",
    description: "진한 돈코츠 육수에 탱탱한 면발이 일품인 일본식 라멘",
    category: "일식",
    bookmarked: false
  },
  {
    id: 'chocolate_cake',
    name: "초콜릿 케이크",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
    time: "60분",
    description: "촉촉하고 진한 초콜릿 풍미가 가득한 케이크",
    category: "디저트",
    bookmarked: false
  },
  {
    id: 'grilled_salad',
    name: "그릴 샐러드",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    time: "15분",
    description: "신선한 채소와 건강한 드레싱으로 만든 샐러드",
    category: "샐러드",
    bookmarked: false
  },

];

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