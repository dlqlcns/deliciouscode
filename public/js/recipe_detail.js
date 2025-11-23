import { API_BASE } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  const recipeId = new URLSearchParams(window.location.search).get("id");
  if (!recipeId) return;

  /* ==========================================================
     레시피 상세 DB 조회
  ========================================================== */
  async function fetchRecipeDetail() {
    try {
      const res = await fetch(`${API_BASE}/recipes/${recipeId}`);
      if (!res.ok) throw new Error("레시피 정보를 가져오지 못했습니다.");
      return await res.json(); 
    } catch (err) {
      console.error("레시피 조회 오류:", err);
      return null;
    }
  }

  /* ==========================================================
      화면 렌더링
  ========================================================== */
  function renderRecipeDetail(recipe) {
    const container = document.querySelector(".recipe-detail-container");

    if (!recipe) {
      container.innerHTML =
        `<p style="color:#cc0000;text-align:center;font-size:1.3rem;">
          레시피 정보를 찾을 수 없습니다.
        </p>`;
      return;
    }

    // 기본 정보
    document.title = `${recipe.name} | 맛있는 코드`;
    document.getElementById("recipeMainImage").src = recipe.image_url;
    document.getElementById("recipeTitle").textContent = recipe.name;
    document.getElementById("recipeDesc").textContent = recipe.description;
    document.getElementById("recipeTime").textContent = recipe.time;
    document.getElementById("recipeCategory").textContent = recipe.category;

    /* ================= 재료 렌더링 ================= */
    const ingredientsContainer = document.getElementById("ingredientsContainer");
    ingredientsContainer.innerHTML = "";

    if (recipe.ingredients?.length) {
      recipe.ingredients.forEach(item => {
        const div = document.createElement("div");
        div.className = "ingredient-item";
        div.innerHTML = `
          <span class="name">${item.ingredient}</span>
          <span class="amount">${item.amount ?? ""}</span>
          <span class="unit">${item.unit ?? ""}</span>
        `;
        ingredientsContainer.appendChild(div);
      });
    } else {
      ingredientsContainer.innerHTML = `<p style="color:#888;">재료 정보가 없습니다.</p>`;
    }

    /* ================= 조리 단계 렌더링 ================= */
    const stepsList = document.getElementById("recipeStepsList");
    stepsList.innerHTML = "";

    if (recipe.steps?.length) {
      // DB 정렬 안전성을 위해 order에 따라 정렬
      recipe.steps
        .sort((a, b) => a.step_order - b.step_order)
        .forEach(step => {
          const stepItem = document.createElement("div");
          stepItem.className = "recipe-step-item";
          stepItem.innerHTML = `
            <div class="step-number">${step.step_order}</div>
            <p class="step-description">${step.step_description}</p>
          `;
          stepsList.appendChild(stepItem);
        });
    } else {
      stepsList.innerHTML = `<p style="color:#888;">조리 순서 정보가 없습니다.</p>`;
    }
  }

  /* ==========================================================
      초기 실행
  ========================================================== */
  async function init() {
    const recipe = await fetchRecipeDetail();
    renderRecipeDetail(recipe);
  }

  init();
});
