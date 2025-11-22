// ============================================
// recipe_detail.js - 프론트엔드 (DB 연동)
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  async function fetchRecipeDetail(recipeId) {
    try {
      const res = await fetch(`/api/recipes/${recipeId}`); // 서버에 요청
      if (!res.ok) throw new Error("레시피 정보를 가져오지 못했습니다.");
      const recipe = await res.json();
      return recipe;
    } catch (err) {
      console.error("레시피 조회 오류:", err);
      return null;
    }
  }

  function renderRecipeDetail(recipe) {
    const container = document.querySelector('.recipe-detail-container');
    if (!recipe) {
      container.innerHTML = '<p style="text-align: center; font-size: 1.5rem; color: #cc0000; margin: 4rem 0;">레시피 정보를 찾을 수 없습니다.</p>';
      return;
    }

    // 페이지 제목 및 기본 정보
    document.title = `${recipe.name} | 맛있는 코드`;
    document.getElementById('recipeMainImage').src = recipe.image_url;
    document.getElementById('recipeMainImage').alt = recipe.name;
    document.getElementById('recipeTitle').textContent = recipe.name;
    document.getElementById('recipeDesc').textContent = recipe.description || '';
    document.getElementById('recipeTime').textContent = recipe.time || '';
    document.getElementById('recipeCategory').textContent = recipe.category || '';

    // 1️⃣ 재료 목록
    const ingredientsContainer = document.getElementById('ingredientsContainer');
    ingredientsContainer.innerHTML = '';
    if (recipe.ingredients?.length) {
      recipe.ingredients.forEach(item => {
        const ingredientItem = document.createElement('div');
        ingredientItem.className = 'ingredient-item';
        ingredientItem.innerHTML = `
          <div class="ingredient-info">
            <span class="ingredient-name">${item.name}</span>
            <span class="ingredient-amount">${item.amount}</span>
          </div>
        `;
        ingredientsContainer.appendChild(ingredientItem);
      });
    } else {
      ingredientsContainer.innerHTML = '<p style="color: #888; font-size: 14px;">준비된 재료 정보가 없습니다.</p>';
    }

    // 2️⃣ 조리 순서
    const stepsList = document.getElementById('recipeStepsList');
    stepsList.innerHTML = '';
    if (recipe.steps?.length) {
      recipe.steps.forEach(step => {
        const stepItem = document.createElement('div');
        stepItem.className = 'recipe-step-item';
        stepItem.innerHTML = `
          <div class="step-image-box" style="background-image: url('${step.image_url || recipe.image_url}');"></div>
          <div class="step-content">
            <div class="step-number">${step.num}</div>
            <h3 class="step-title">${step.title}</h3>
            <p class="step-description">${step.desc}</p>
          </div>
        `;
        stepsList.appendChild(stepItem);
      });
    } else {
      stepsList.innerHTML = '<p style="color: #888; text-align: center;">준비된 조리 순서가 없습니다.</p>';
    }
  }

  async function initialize() {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');

    if (!recipeId) {
      document.querySelector('.recipe-detail-container').innerHTML =
        '<p style="text-align: center; font-size: 1.5rem; color: #cc0000; margin: 4rem 0;">레시피 ID가 전달되지 않았습니다.</p>';
      console.error("레시피 ID가 URL에 없습니다.");
      return;
    }

    const recipe = await fetchRecipeDetail(recipeId);
    renderRecipeDetail(recipe);
  }

  initialize();
});
