async function fetchAllRecipes() {
  try {
    const res = await fetch('/api/recipes');
    if (!res.ok) throw new Error('레시피 목록을 가져오는 데 실패했어요.');
    const recipes = await res.json();

    const recipeList = document.getElementById('recipeList');
    recipeList.innerHTML = ''; // 기존 카드 지우기

    recipes.forEach(r => {
      const card = createRecipeBlock({
        id: r.id,
        name: r.name,
        image: r.image_url,       // Supabase 테이블에 image_url 컬럼 필요
        time: r.time,
        description: r.description,
        category: r.category,
        bookmarked: false         // 이 부분은 나중에 즐겨찾기 상태에 따라 처리 가능
      });

      recipeList.appendChild(card);
    });

    // 북마크 버튼이 있다면 이벤트 연결
    attachBookmarkListeners(onBookmarkClicked);

  } catch (error) {
    console.error('레시피 전체 불러오기 에러:', error);
    const recipeList = document.getElementById('recipeList');
    recipeList.innerHTML = `<p style="text-align:center;color:#888;">레시피를 불러오는 중 문제가 생겼어요.</p>`;
  }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', fetchAllRecipes);
