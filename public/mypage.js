document.addEventListener("DOMContentLoaded", () => {

  // 테스트용 레시피 데이터
  const recipes = [
    {
      id: 1,
      name: "김치찌개",
      image: "./음식/김치찌개.jpg",
      time: "30분",
      description: "깊고 진한 국물 맛의 김치찌개",
      category: "한식",
      bookmarked: false
    },
    {
      id: 2,
      name: "크림 파스타",
      image: "./음식/파스타.jpg",
      time: "25분",
      description: "부드러운 크림과 고소한 치즈가 어울리는 크림 파스타",
      category: "양식",
      bookmarked: false
    },
    {
      id: 3,
      name: "건강 샐러드",
      image: "./음식/건강샐러드.jpg",
      time: "15분",
      description: "신선한 채소와 과일로 만드는 건강 샐러드",
      category: "건강식",
      bookmarked: false
    },
    {
      id: 4,
      name: "초코 케이크",
      image: "./음식/초코케이크.jpg",
      time: "60분",
      description: "진한 초콜릿 맛의 촉촉한 케이크",
      category: "디저트",
      bookmarked: false
    }
  ];

  const container = document.getElementById("recipeContainer");

  // 레시피 블록 생성 함수
  function createRecipeBlock(recipe) {
    const block = document.createElement('article');
    block.className = 'recipe-res-block';

    block.innerHTML = `
      <a href="recipe_detail.html?id=${recipe.id}" class="recipe-link">
        <div class="recipe-image-box" style="background-image: url('${recipe.image}');">
          <button class="bookmark-btn ${recipe.bookmarked ? 'bookmarked' : ''}" 
                  data-id="${recipe.id}" aria-label="북마크">
            ${recipe.bookmarked ? '♥' : '♡'}
          </button>
        </div>

        <div class="recipe-content">
          <h3 class="recipe-title">${recipe.name}</h3>
          <p class="recipe-category">${recipe.category}</p>
          <p class="recipe-desc-short">${recipe.description}</p>
          <div class="recipe-time">
            <img src="아이콘/timer.png" alt="시간" class="time-icon" />
            <span>${recipe.time}</span>
          </div>
        </div>
      </a>
    `;
    
    return block;
  }

  // 북마크 클릭 이벤트 연결
  function attachBookmarkListeners() {
    document.querySelectorAll('.bookmark-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const recipeId = parseInt(e.currentTarget.dataset.id);
        const recipe = recipes.find(r => r.id === recipeId);
        if (recipe) {
          recipe.bookmarked = !recipe.bookmarked;
          e.currentTarget.textContent = recipe.bookmarked ? '♥' : '♡';
          console.log("북마크 클릭:", recipeId, "현재 상태:", recipe.bookmarked);
        }
      });
    });
  }

  // 레시피 렌더링
  recipes.forEach(recipe => {
    const card = createRecipeBlock(recipe);
    container.appendChild(card);
  });

  attachBookmarkListeners();

});