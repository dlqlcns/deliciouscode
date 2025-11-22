// ============================================
// recipe_detail.js - AI 기반 레시피 상세 페이지
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

  async function fetchAIDetail(name) {
    try {
      const res = await fetch("/api/ai/detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, allergies: getUserAllergies() }),
      });
      if (!res.ok) throw new Error("AI 상세 레시피 불러오기 실패");
      return await res.json();
    } catch (err) {
      console.error("AI 레시피 조회 오류:", err);
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
    document.getElementById("recipeDesc").textContent = recipe.description || "AI가 생성한 레시피입니다.";
    document.getElementById("recipeTime").textContent = recipe.time || "약 30분";
    document.getElementById("recipeCategory").textContent = "AI 추천";

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

  // URL에서 레시피 이름 추출
  const params = new URLSearchParams(window.location.search);
  const name = params.get("name");
  if (!name) {
    document.querySelector(".recipe-detail-container").innerHTML =
      "<p>레시피 이름이 전달되지 않았습니다.</p>";
    return;
  }

  const recipe = await fetchAIDetail(name);
  renderRecipeDetail(recipe);
});
