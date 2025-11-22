// ===========================================
// mypage.js - 사용자 정보 & 즐겨찾기 DB 연동
// ===========================================

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("recipeContainer");
  const userId = localStorage.getItem("userId"); // 로그인 시 저장된 userId

  if (!userId) return;

  let allRecipes = [];
  let favoriteIds = [];

  // ============================================
  // 사용자 정보 가져오기
  // ============================================
  async function fetchUserInfo() {
    try {
      const res = await fetch(`/api/users/${userId}`);
      const currentUser = await res.json();

      // 사용자 이름
      const usernameElement = document.querySelector('.profile-card .username');
      if (usernameElement && currentUser?.name) {
        usernameElement.textContent = `${currentUser.name}님!`;
      }

      // 알레르기 정보
      const allergyTags = document.querySelector('.allergy-card .tags');
      if (allergyTags) {
        allergyTags.innerHTML = '';
        if (!currentUser?.allergies?.length) {
          allergyTags.innerHTML = '<p style="color: #495565; font-size: 14px;">설정된 알레르기가 없습니다.</p>';
        } else {
          currentUser.allergies.forEach(allergy => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = allergy;
            allergyTags.appendChild(tag);
          });
        }
      }

      // 선호 카테고리
      const categoryTags = document.querySelector('.category-card .tags');
      if (categoryTags) {
        categoryTags.innerHTML = '';
        if (!currentUser?.preferences?.length) {
          categoryTags.innerHTML = '<p style="color: #495565; font-size: 14px;">설정된 선호 카테고리가 없습니다.</p>';
        } else {
          currentUser.preferences.forEach(category => {
            const tag = document.createElement('span');
            tag.className = 'category-tag';
            tag.textContent = category;
            categoryTags.appendChild(tag);
          });
        }
      }

      // 보유 재료
      displayIngredients(currentUser?.ingredients || {});
    } catch (err) {
      console.error("사용자 정보 불러오기 오류:", err);
    }
  }

  // ============================================
  // 보유 재료 표시
  // ============================================
  function displayIngredients(ingredientsData) {
    const ingredientsContainer = document.querySelector('.ingredients');
    if (!ingredientsContainer) return;

    ingredientsContainer.innerHTML = '';

    const categoryColors = {
      '채소류': { bgColor: '#b8f7cf', textColor: '#008235', label: '채소' },
      '육류': { bgColor: '#ffe2e2', textColor: '#c10007', label: '육류' },
      '유제품': { bgColor: '#bddaff', textColor: '#1347e5', label: '유제품' },
      '곡물류': { bgColor: '#fff4d6', textColor: '#8b6914', label: '곡물' },
      '기타': { bgColor: '#f3f4f6', textColor: '#6b7280', label: '기타' },
      '전체': { bgColor: '#f3f4f6', textColor: '#6b7280', label: '전체' }
    };

    let hasIngredients = false;

    for (const category in ingredientsData) {
      const ingredientList = ingredientsData[category];
      const colorInfo = categoryColors[category] || categoryColors['기타'];

      ingredientList.forEach(name => {
        hasIngredients = true;
        const ingredientDiv = document.createElement('div');
        ingredientDiv.className = 'ingredient';
        ingredientDiv.innerHTML = `
          <span class="name">${name}</span>
          <span class="badge" style="background: ${colorInfo.bgColor}; color: ${colorInfo.textColor};">
            ${colorInfo.label}
          </span>
        `;
        ingredientsContainer.appendChild(ingredientDiv);
      });
    }

    if (!hasIngredients) {
      ingredientsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: #888;">
          <p>등록된 재료가 없습니다.</p>
          <p style="font-size: 14px; margin-top: 8px;">
            <a href="myplus.html" style="color: #3459ff; text-decoration: underline;">
              재료 등록하기
            </a>
          </p>
        </div>
      `;
    }
  }

  // ============================================
  // 즐겨찾기 레시피 가져오기
  // ============================================
  async function fetchFavorites() {
    try {
      // 즐겨찾기 ID 가져오기
      const resFavs = await fetch(`/api/favorites/${userId}`);
      favoriteIds = await resFavs.json();

      // 전체 레시피 가져오기
      const resRecipes = await fetch('/api/recipes');
      allRecipes = await resRecipes.json();

      renderRecipes();
    } catch (err) {
      console.error("즐겨찾기 불러오기 오류:", err);
    }
  }

  // ============================================
  // 레시피 렌더링
  // ============================================
  function renderRecipes() {
    if (!container) return;
    container.innerHTML = '';

    const favoriteRecipes = allRecipes.filter(r => favoriteIds.includes(r.id));

    if (favoriteRecipes.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #888;">
          <p>즐겨찾기한 레시피가 없습니다.</p>
          <p style="font-size: 14px; margin-top: 8px;">
            <a href="recipe_all.html" style="color: #3459ff; text-decoration: underline;">
              레시피 둘러보기
            </a>
          </p>
        </div>
      `;
      return;
    }

    const displayRecipes = favoriteRecipes.slice(0, 4);
    displayRecipes.forEach(recipe => {
      const card = createRecipeBlock(recipe);
      container.appendChild(card);
    });

    attachBookmarkListeners();
  }

  // ============================================
  // 레시피 블록 생성
  // ============================================
  function createRecipeBlock(recipe) {
    const block = document.createElement('article');
    block.className = 'recipe-res-block';

    block.innerHTML = `
      <a href="recipe_detail.html?id=${recipe.id}" class="recipe-link">
        <div class="recipe-image-box" style="background-image: url('${recipe.image}');">
          <button class="bookmark-btn bookmarked" 
                  data-id="${recipe.id}" 
                  aria-label="북마크 해제">
            ♥
          </button>
        </div>

        <div class="recipe-content">
          <h3 class="recipe-title">${recipe.name}</h3>
          <p class="recipe-category">${recipe.category}</p>
          <p class="recipe-desc-short">${recipe.description}</p>
          <div class="recipe-time">
            <img src="/img/icons/timer.png" alt="시간" class="time-icon" />
            <span>${recipe.time}</span>
          </div>
        </div>
      </a>
    `;
    return block;
  }

  // ============================================
  // 북마크 토글 (DB 연동)
  // ============================================
  async function toggleBookmark(recipeId) {
    try {
      await fetch('/api/favorites', {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ user_id: userId, recipe_id: recipeId })
      });

      favoriteIds = favoriteIds.filter(id => id !== recipeId);
      renderRecipes();
      console.log("즐겨찾기 해제됨:", recipeId);
    } catch (err) {
      console.error("즐겨찾기 해제 오류:", err);
    }
  }

  // ============================================
  // 북마크 이벤트
  // ============================================
  function attachBookmarkListeners() {
    document.querySelectorAll('.bookmark-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const recipeId = e.currentTarget.dataset.id;
        toggleBookmark(recipeId);
      });
    });
  }

  // ============================================
  // 초기 호출
  // ============================================
  fetchUserInfo();
  fetchFavorites();
});
