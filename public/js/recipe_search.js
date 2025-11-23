import { API_BASE } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  const ingredientInput = document.getElementById("ingredientInput");
  const searchButton = document.getElementById("searchButton");

  function performSearch() {
    if (!ingredientInput) return;  // ⛔ 해당 요소가 없는 페이지에서는 실행 중지

    const query = ingredientInput.value.trim();
    if (!query) {
      alert("검색어를 입력하세요!");
      return;
    }

    // 공백 → 쉼표 변환
    const ingredients = query.replace(/\s+/g, ",");

    // 페이지 이동
    window.location.href = `recipe_results.html?ingredients=${encodeURIComponent(ingredients)}`;
  }

  searchButton?.addEventListener("click", performSearch);
  ingredientInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") performSearch();
  });
});
