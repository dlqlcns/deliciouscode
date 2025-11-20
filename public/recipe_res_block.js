// ============================================
// recipe_res_block.js - 안정 작동 버전
// ============================================

function createRecipeBlock(recipe) {
  const block = document.createElement('article');
  block.className = 'recipe-res-block';

  block.innerHTML = `
    <button class="bookmark-btn ${recipe.bookmarked ? 'active' : ''}" 
            data-bookmark-id="${recipe.id}" aria-label="북마크">
      ${recipe.bookmarked ? '♥' : '♡'}
    </button>

    <a href="recipe_detail.html?id=${recipe.id}" class="recipe-link">
      <div class="recipe-image-box" style="background-image: url('${recipe.image}');"></div>

      <div class="recipe-content">
        <h3 class="recipe-title">${recipe.name}</h3>
        <p class="recipe-category">${recipe.category}</p>
        <p class="recipe-desc-short">${recipe.description}</p>

        <div class="recipe-time">
          <img src="아이콘/timer.png" alt="시간" class="time-icon" />
          <span>${recipe.time}</span>
        </div>
      </div>
    </a>
  `;

  return block;
}


/* ============================================
   북마크 버튼 리스너
   createRecipeBlock()에서 렌더한 DOM에 대해 호출
   ============================================ */
function attachBookmarkListeners(handler) {

  document.querySelectorAll('.bookmark-btn').forEach(btn => {

    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // 카드 클릭 방지
      e.preventDefault();  // 링크 이동 방지

      const id = btn.dataset.bookmarkId;

      // UI 즉시 토글
      const isActive = btn.classList.toggle('active');
      btn.textContent = isActive ? '♥' : '♡';

      // 페이지 단에서 데이터 갱신
      if (handler) handler(id);
    });

  });
}
