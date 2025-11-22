// ============================================
// recipe_search.js - 검색 페이지 (DB 연동)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');

  function performSearch() {
    const query = searchInput.value.trim();
    if (!query) {
      alert('검색어를 입력하세요!');
      return;
    }
    const ingredients = query.replace(/\s+/g, ',');
    window.location.href = `recipe_results.html?ingredients=${encodeURIComponent(ingredients)}`;
  }

  if (searchButton) searchButton.addEventListener('click', performSearch);
  if (searchInput) {
    searchInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') performSearch();
    });
  }
});
