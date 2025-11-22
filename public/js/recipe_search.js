// ============================================
// recipe_search.js - AI 기반 검색 페이지
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.getElementById("searchButton");
  const ingredientInput = document.getElementById("ingredientInput");

  // Enter 키로 검색
  ingredientInput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchButton.click();
    }
  });

  // 검색 버튼 클릭 시 -> recipe_results.html로 이동
  searchButton.addEventListener("click", () => {
    const ingredients = ingredientInput.value
      .split(",")
      .map(i => i.trim())
      .filter(Boolean);

    if (ingredients.length === 0) {
      alert("재료를 하나 이상 입력해주세요!");
      return;
    }

    const query = encodeURIComponent(ingredients.join(","));
    window.location.href = `recipe_results.html?ingredients=${query}`;
  });
});
