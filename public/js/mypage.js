document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("recipeContainer");
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  let allRecipes = [];
  let favoriteIds = [];

  // 사용자 정보 불러오기
  const resUser = await fetch(`/api/users/${userId}`);
  const user = await resUser.json();

  if (user?.username) {
    document.querySelector('.profile-card .username').textContent = `${user.username}님!`;
  }

  // 알레르기
  const allergyTags = document.querySelector('.allergy-card .tags');
  allergyTags.innerHTML = (user?.allergies?.length > 0)
    ? user.allergies.map(tag => `<span class="tag">${tag}</span>`).join('')
    : '<p style="color:#495565;font-size:14px;">설정된 알레르기가 없습니다.</p>';

  // 선호 카테고리
  const categoryTags = document.querySelector('.category-card .tags');
  categoryTags.innerHTML = (user?.preferences?.length > 0)
    ? user.preferences.map(cat => `<span class="category-tag">${cat}</span>`).join('')
    : '<p style="color:#495565;font-size:14px;">설정된 선호 카테고리가 없습니다.</p>';

  // 재료 표시
  displayIngredients(user?.ingredients || {});

  // 즐겨찾기 로드
  const resFavs = await fetch(`/api/favorites/${userId}`);
  favoriteIds = await resFavs.json();

  const resRecipes = await fetch('/api/recipes');
  allRecipes = await resRecipes.json();

  renderRecipes();

  // 재료 표시 함수
  function displayIngredients(ingredientsData) {
    const container = document.querySelector('.ingredients');
    container.innerHTML = '';
    let hasIngredients = false;

    Object.entries(ingredientsData).forEach(([category, items]) => {
      items.forEach(name => {
        hasIngredients = true;
        container.innerHTML += `
          <div class="ingredient">
            <span class="name">${name}</span>
            <span class="badge">${category}</span>
          </div>
        `;
      });
    });

    if (!hasIngredients) {
      container.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:20px;color:#888;">
          <p>등록된 재료가 없습니다.</p>
          <p style="font-size:14px;margin-top:8px;">
            <a href="myplus.html" style="color:#3459ff;text-decoration:underline;">재료 등록하기</a>
          </p>
        </div>
      `;
    }
  }

  function renderRecipes() {
    container.innerHTML = '';
    const favRecipes = allRecipes.filter(r => favoriteIds.includes(r.id));

    if (favRecipes.length === 0) {
      container.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:40px;color:#888;">
          <p>즐겨찾기한 레시피가 없습니다.</p>
          <p style="font-size:14px;margin-top:8px;">
            <a href="recipe_all.html" style="color:#3459ff;text-decoration:underline;">레시피 둘러보기</a>
          </p>
        </div>
      `;
      return;
    }

    favRecipes.slice(0, 4).forEach(recipe => {
      const card = createRecipeBlock(recipe);
      container.appendChild(card);
    });

    attachBookmarkListeners();
  }

  function createRecipeBlock(recipe) {
    const block = document.createElement('article');
    block.className = 'recipe-res-block';
    block.innerHTML = `
      <a href="recipe_detail.html?id=${recipe.id}" class="recipe-link">
        <div class="recipe-image-box" style="background-image:url('${recipe.image_url}')">
          <button class="bookmark-btn bookmarked" data-id="${recipe.id}">♥</button>
        </div>
        <div class="recipe-content">
          <h3>${recipe.name}</h3>
          <p class="recipe-category">${recipe.category}</p>
          <p class="recipe-desc-short">${recipe.description}</p>
          <div class="recipe-time">
            <img src="/img/icons/timer.png" alt="시간" class="time-icon"/>
            <span>${recipe.time}</span>
          </div>
        </div>
      </a>
    `;
    return block;
  }

  async function toggleBookmark(id) {
    await fetch('/api/favorites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, recipe_id: id })
    });
    favoriteIds = favoriteIds.filter(fid => fid !== id);
    renderRecipes();
  }

  function attachBookmarkListeners() {
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark(e.currentTarget.dataset.id);
      });
    });
  }
});
