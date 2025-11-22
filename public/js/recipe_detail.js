// ============================================
// recipe_detail.js - Supabase 기반 레시피 상세 페이지
// ============================================

document.addEventListener("DOMContentLoaded", async () => {
  const getUserAllergies = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return Array.isArray(user?.allergies) ? user.allergies : [];
    } catch (e) {
      console.warn("알레르기 정보를 불러오지 못했습니다:", e);
      return [];
    }
  };

  async function fetchRecipeDetail(id) {
    try {
      const query = new URLSearchParams({ allergies: getUserAllergies().join(",") });
      const res = await fetch(`/api/recipes/${id}?${query.toString()}`);
      if (!res.ok) throw new Error("레시피 불러오기 실패");
      return await res.json();
    } catch (err) {
      console.error("레시피 조회 오류:", err);
      return null;
    }
  }

  function renderRecipeDetail(recipe) {
    const container = document.querySelector(".recipe-detail-container");
    if (!recipe) {
      container.innerHTML =
        '<p style="text-align:center;color:#cc0000;font-size:1.2rem;">레시피 정보를 불러올 수 없습니다.</p>';
      return;
    }

    document.title = `${recipe.name} | 맛있는 코드`;
    document.getElementById("recipeMainImage").src = recipe.image_url || "/img/default_recipe.png";
    document.getElementById("recipeTitle").textContent = recipe.name;
    document.getElementById("recipeDesc").textContent = recipe.description || "레시피 설명이 없습니다.";
    document.getElementById("recipeTime").textContent = recipe.time || "약 30분";
    document.getElementById("recipeCategory").textContent = recipe.category || "일반";

    const ingredientsContainer = document.getElementById("ingredientsContainer");
    ingredientsContainer.innerHTML = recipe.ingredients?.length
      ? recipe.ingredients.map(i => `<div class="ingredient-item">${i}</div>`).join("")
      : "<p>재료 정보가 없습니다.</p>";

    const stepsList = document.getElementById("recipeStepsList");
    stepsList.innerHTML = recipe.steps?.length
      ? recipe.steps.map((s, idx) => `
          <div class="recipe-step-item">
            <div class="step-number">${idx + 1}</div>
            <p class="step-description">${s}</p>
          </div>`).join("")
      : "<p>조리 순서가 없습니다.</p>";
  }

  // URL에서 레시피 id 추출
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    document.querySelector(".recipe-detail-container").innerHTML =
      "<p>레시피 정보가 전달되지 않았습니다.</p>";
    return;
  }

  const recipe = await fetchRecipeDetail(id);
  renderRecipeDetail(recipe);
});
