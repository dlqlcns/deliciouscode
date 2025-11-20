// ==========================
// 샘플 레시피 데이터
// ==========================
const sampleRecipes = [
  { id: 'kimchi_jjigae', name: "김치찌개", image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=300&fit=crop", time: "30분", description: "매콤하고 시원한 국물이 일품인 한국의 대표 찌개", category: "한식", bookmarked: true },
  { id: 'cream_pasta', name: "크림 파스타", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop", time: "20분", description: "부드럽고 고소한 크림 소스가 면발과 완벽하게 어우러진 파스타", category: "양식", bookmarked: false },
  { id: 'ramen', name: "일본식 라멘", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop", time: "45분", description: "진한 돈코츠 육수에 탱탱한 면발이 일품인 일본식 라멘", category: "일식", bookmarked: true },
  { id: 'chocolate_cake', name: "초콜릿 케이크", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop", time: "60분", description: "촉촉하고 진한 초콜릿 풍미가 가득한 케이크", category: "디저트", bookmarked: false },
  { id: 'grilled_salad', name: "그릴 샐러드", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", time: "15분", description: "신선한 채소와 건강한 드레싱으로 만든 샐러드", category: "샐러드", bookmarked: true },
  { id: 'homemade_pizza', name: "수제 피자", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop", time: "40분", description: "바삭한 도우 위에 신선한 토핑이 가득한 수제 피자", category: "양식", bookmarked: false },
  { id: 'pu_phat_pong_kari', name: "푸팟퐁커리", image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop", time: "25분", description: "부드러운 게살과 코코넛 밀크 커리가 조화로운 태국 요리", category: "동남아", bookmarked: true },
  { id: 'pumpkin_soup', name: "단호박 수프", image: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&h=300&fit=crop", time: "35분", description: "달콤하고 부드러운 단호박을 갈아 만든 건강 수프", category: "양식", bookmarked: false }
];

// ==========================
// DOMContentLoaded
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  const recipeList = document.getElementById('recipeList');
  const categorySelect = document.getElementById('categorySelect');
  const sortSelect = document.getElementById('sortSelect');
  const resultsTitle = document.getElementById('resultsTitle');
  const resultsSubtitle = document.getElementById('resultsSubtitle');

  // 현재 즐겨찾기 레시피
  let currentRecipes = sampleRecipes.filter(r => r.bookmarked);


// ==========================
// 레시피 검색
// ==========================
const recipeSearchInput = document.getElementById('recipeSearchInput');

if (recipeSearchInput) {
  recipeSearchInput.addEventListener('input', () => {
    const query = recipeSearchInput.value.toLowerCase();
    let filtered = currentRecipes.filter(r => r.name.toLowerCase().includes(query));
    
    // 카테고리/정렬 적용
    const selectedCategory = categorySelect?.value || '전체';
    if (selectedCategory !== '전체') filtered = filtered.filter(r => r.category === selectedCategory);

    const sortOption = sortSelect?.value || '최신순';
    switch (sortOption) {
      case '이름순':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case '조리 시간순':
        filtered.sort((a, b) => parseInt(a.time) - parseInt(b.time));
        break;
      case '최신순':
      default:
        filtered.sort((a, b) => (a.id < b.id ? 1 : -1));
        break;
    }

    renderRecipes(filtered);
  });
}


  // ==========================
  // 레시피 카드 생성
  // ==========================
  function createRecipeBlock(recipe) {
    const block = document.createElement('div');
    block.className = 'recipe-res-block';

    block.innerHTML = `
      <a href="#" class="recipe-link">
        <div class="recipe-image-box" style="background-image:url(${recipe.image})">
          <button class="bookmark-btn ${recipe.bookmarked ? 'bookmarked' : ''}" data-id="${recipe.id}">
            ${recipe.bookmarked ? '♥' : '♡'}
          </button>
        </div>
        <div class="recipe-content">
          <h3 class="recipe-title">${recipe.name}</h3>
          <span class="recipe-category">${recipe.category}</span>
          <p class="recipe-desc-short">${recipe.description}</p>
          <p class="recipe-time">⏱️ ${recipe.time}</p>
        </div>
      </a>
    `;

    const bookmarkBtn = block.querySelector('.bookmark-btn');
    bookmarkBtn.addEventListener('click', (e) => {
      e.preventDefault(); // 링크 클릭 막기
      toggleBookmark(recipe.id);
    });

    return block;
  }

  // ==========================
  // 북마크 토글
  // ==========================
  function toggleBookmark(id) {
    const recipe = sampleRecipes.find(r => r.id === id);
    if (!recipe) return;

    recipe.bookmarked = !recipe.bookmarked;

    const button = document.querySelector(`.bookmark-btn[data-id="${id}"]`);
    if (button) {
      button.textContent = recipe.bookmarked ? '♥' : '♡';
      button.classList.toggle('bookmarked', recipe.bookmarked);
    }

    currentRecipes = sampleRecipes.filter(r => r.bookmarked);
    filterAndRenderResults();
  }

  // ==========================
  // 레시피 렌더링
  // ==========================
  function renderRecipes(recipes) {
    if (!recipeList || !resultsTitle || !resultsSubtitle) return;

    recipeList.innerHTML = '';
    resultsTitle.textContent = '즐겨찾기 레시피';
    resultsSubtitle.textContent = `총 ${recipes.length}개의 레시피가 저장되어 있습니다.`;

    if (!recipes.length) {
      recipeList.innerHTML = `<p style="text-align:center;color:#888;font-size:1.2rem;grid-column:1/-1;">즐겨찾기된 레시피가 없습니다.</p>`;
      return;
    }

    recipes.forEach(r => recipeList.appendChild(createRecipeBlock(r)));
  }

  // ==========================
  // 필터/정렬
  // ==========================
  function filterAndRenderResults() {
    let filtered = [...currentRecipes];

    const selectedCategory = categorySelect?.value || '전체';
    if (selectedCategory !== '전체') filtered = filtered.filter(r => r.category === selectedCategory);

    const sortOption = sortSelect?.value || '최신순';
    switch (sortOption) {
      case '이름순':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case '조리 시간순':
        filtered.sort((a, b) => parseInt(a.time) - parseInt(b.time));
        break;
      case '최신순':
      default:
        filtered.sort((a, b) => (a.id < b.id ? 1 : -1));
        break;
    }

    renderRecipes(filtered);
  }

  // ==========================
  // 이벤트
  // ==========================
  if (categorySelect) categorySelect.addEventListener('change', filterAndRenderResults);
  if (sortSelect) sortSelect.addEventListener('change', filterAndRenderResults);

  // ==========================
  // 초기 렌더링
  // ==========================
  filterAndRenderResults();
});
