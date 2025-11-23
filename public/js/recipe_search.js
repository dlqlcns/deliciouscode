import { API_BASE } from "./config.js";

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');

  function performSearch() {
    const query = searchInput.value.trim();
    if (!query) {
      alert('검색어를 입력하세요!');
      return;
    }

    // 검색어 공백 → 쉼표(,) 변환
    const ingredients = query.replace(/\s+/g, ',');

    // 🔥 서버 주소 포함하도록 변경
    window.location.href = `recipe_results.html?ingredients=${encodeURIComponent(ingredients)}`;
  }

  if (searchButton) searchButton.addEventListener('click', performSearch);
  if (searchInput) {
    searchInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') performSearch();
    });
  }
});
