// ============================================
// recipe_detail.js - 레시피 상세 페이지 DB 연동
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  async function fetchRecipeDetail(recipeId) {
    try {
      const res = await fetch(`/api/recipes/${recipeId}`);
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
      container.innerHTML = '<p style="text-align:center;color:#cc0000;font-size:1.3rem;">레시피 정보를 찾을 수 없습니다.</p>';
      return;
    }

    document.title = `${recipe.name} | 맛있는 코드`;
    document.getElementById('recipeMainImage').src = recipe.image_url;
    document.getElementById('recipeTitle').textContent = recipe.name;
    document.getElementById('recipeDesc').textContent = recipe.description;
    document.getElementById('recipeTime').textContent = recipe.time;
    document.getElementById('recipeCategory').textContent = recipe.category;

    const ingredientsContainer = document.getElementById('ingredientsContainer');
    ingredientsContainer.innerHTML = '';
    if (recipe.ingredients?.length) {
      recipe.ingredients.forEach(item => {
        const div = document.createElement('div');
        div.className = 'ingredient-item';
        div.innerHTML = `<span>${item}</span>`;
        ingredientsContainer.appendChild(div);
      });
    } else {
      ingredientsContainer.innerHTML = '<p style="color:#888;">재료 정보가 없습니다.</p>';
    }

    const stepsList = document.getElementById('recipeStepsList');
    stepsList.innerHTML = '';
    if (recipe.steps?.length) {
      recipe.steps.forEach((step, i) => {
        const stepItem = document.createElement('div');
        stepItem.className = 'recipe-step-item';
        stepItem.innerHTML = `
          <div class="step-number">${i + 1}</div>
          <p class="step-description">${step}</p>
        `;
        stepsList.appendChild(stepItem);
      });
    } else {
      stepsList.innerHTML = '<p style="color:#888;">조리 순서 정보가 없습니다.</p>';
    }
  }

  async function init() {
    const recipeId = new URLSearchParams(window.location.search).get('id');
    if (!recipeId) return;

    const recipe = await fetchRecipeDetail(recipeId);
    renderRecipeDetail(recipe);
  }

  init();
});
