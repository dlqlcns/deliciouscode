// ============================================
// recipe_results.js - 서버 연동 버전 (통합 알림)
// ============================================
// ⚠️ recipe_res_block.js 먼저 로드 필요

let currentRecipes = [];

const recipeList = document.getElementById('recipeList');
const categorySelect = document.getElementById('categorySelect');
const sortSelect = document.getElementById('sortSelect');

// ============================================
// 서버에서 즐겨찾기 불러오기
// ============================================
async function loadFavoritesFromServer() {
    try {
        const res = await fetch('/api/favorites', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });
        if (!res.ok) throw new Error('즐겨찾기 목록 불러오기 실패');
        return await res.json(); // ["kimchi_jjigae", ...]
    } catch (err) {
        console.error(err);
        showToastNotification("즐겨찾기 목록을 불러올 수 없습니다.");
        return [];
    }
}

// ============================================
// 서버에서 레시피 불러오기
// ============================================
async function fetchRecipesFromServer() {
    const urlParams = new URLSearchParams(window.location.search);

    const query = urlParams.get('query') || '';
    const ingredients = urlParams.get('ingredients') || '';
    const exclude = urlParams.get('exclude') || '';
    const category = categorySelect?.value || '전체';
    const sort = sortSelect?.value || '최신 등록순';

    const apiUrl = `/api/recipes?query=${encodeURIComponent(query)}&ingredients=${encodeURIComponent(ingredients)}&exclude=${encodeURIComponent(exclude)}&category=${encodeURIComponent(category)}&sort=${encodeURIComponent(sort)}`;

    try {
        const res = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });
        if (!res.ok) throw new Error('레시피 로드 실패');
        return await res.json(); // [{ id, name, image, time, description, category, bookmarked }]
    } catch (err) {
        console.error(err);
        showToastNotification("레시피를 불러올 수 없습니다.");
        return [];
    }
}

// ============================================
// 북마크 서버 연동
// ============================================
async function toggleFavoriteOnServer(recipeId, isBookmarked) {
    try {
        const url = isBookmarked ? '/api/favorites' : `/api/favorites/${recipeId}`;
        const method = isBookmarked ? 'POST' : 'DELETE';
        const body = isBookmarked ? JSON.stringify({ recipeId }) : null;

        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            },
            body
        });

        if (!res.ok) throw new Error('서버 즐겨찾기 반영 실패');
        return true;
    } catch (err) {
        console.error(err);
        showToastNotification("즐겨찾기 반영에 실패했습니다.");
        return false;
    }
}

// ============================================
// 북마크 클릭 핸들러
// ============================================
async function handleBookmarkClick(id) {
    const recipe = currentRecipes.find(r => r.id === id);
    if (!recipe) return;

    recipe.bookmarked = !recipe.bookmarked;
    const btn = document.querySelector(`.bookmark-btn[data-bookmark-id="${id}"]`);
    if (btn) btn.textContent = recipe.bookmarked ? '♥' : '♡';

    const success = await toggleFavoriteOnServer(id, recipe.bookmarked);
    if (success) {
        showToastNotification(
            `"${recipe.name}" ${recipe.bookmarked ? '즐겨찾기에 추가' : '즐겨찾기에서 제거'}되었습니다.`
        );
    } else {
        // 실패 시 원상복구
        recipe.bookmarked = !recipe.bookmarked;
        if (btn) btn.textContent = recipe.bookmarked ? '♥' : '♡';
    }
}

// ============================================
// 레시피 렌더링
// ============================================
function renderRecipes(recipes) {
    if (!recipeList) return;
    recipeList.innerHTML = '';

    if (!recipes || recipes.length === 0) {
        recipeList.innerHTML = '<p style="text-align:center;color:#888;grid-column:1/-1;">검색 결과가 없습니다.</p>';
        return;
    }

    recipes.forEach(r => recipeList.appendChild(createRecipeBlock(r)));
    attachBookmarkListeners(handleBookmarkClick);
}

// ============================================
// 태그 생성
// ============================================
function createTag(term, type) {
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.style.cursor = 'pointer';
    tag.dataset.type = type;
    tag.dataset.value = term;

    tag.innerHTML = `<span>${term}</span><button class="tag-close">×</button>`;

    tag.addEventListener('click', e => {
        if (!e.target.classList.contains('tag-close')) {
            window.location.href = `recipe_results.html?ingredients=${encodeURIComponent(term)}`;
        }
    });

    return tag;
}

function displayTags(params) {
    const tagContainer = document.getElementById("tagContainer");
    const resultsTitle = document.getElementById('resultsTitle');
    if (!tagContainer || !resultsTitle) return;

    tagContainer.innerHTML = '';

    const query = params.get('query') || '';
    const ingredientsParam = params.get('ingredients') || '';
    const ingredients = ingredientsParam.split(',').map(s => s.trim()).filter(Boolean);

    const tags = [];
    if (query.trim() !== '') tags.push(createTag(query.trim(), 'query'));
    ingredients.forEach(ing => tags.push(createTag(ing, 'ingredients')));
    tagContainer.append(...tags);

    const allTerms = [];
    if (query.trim() !== '') allTerms.push(query.trim());
    allTerms.push(...ingredients);

    resultsTitle.innerHTML = allTerms.length > 0
        ? `${allTerms.map(t => `"${t}"`).join(', ')}로 입력한 결과입니다.`
        : "레시피 검색 결과입니다.";

    tagContainer.style.display = tags.length > 0 ? 'flex' : 'none';
}

// ============================================
// DOMContentLoaded
// ============================================
document.addEventListener("DOMContentLoaded", async () => {

    // 1. 서버 즐겨찾기 가져오기
    const favIds = await loadFavoritesFromServer();

    // 2. 서버 레시피 가져오기
    const recipes = await fetchRecipesFromServer();

    // 3. 즐겨찾기 상태 반영
    currentRecipes = recipes.map(r => ({ ...r, bookmarked: favIds.includes(r.id) }));

    renderRecipes(currentRecipes);

    // 4. 태그 표시
    const urlParams = new URLSearchParams(window.location.search);
    displayTags(urlParams);

    // 5. 태그 제거 이벤트
    const tagContainer = document.getElementById("tagContainer");
    if (tagContainer) {
        tagContainer.addEventListener('click', function(e) {
            if (!e.target.classList.contains('tag-close')) return;
            e.stopPropagation();

            const tag = e.target.closest('.tag');
            const type = tag.dataset.type;
            const value = tag.dataset.value;

            tag.style.opacity = '0';
            tag.style.transform = 'scale(0.8)';
            setTimeout(() => tag.remove(), 300);

            let newParams = new URLSearchParams(window.location.search);
            if (type === 'query') newParams.delete('query');
            if (type === 'ingredients') {
                const items = (newParams.get('ingredients') || '')
                    .split(',').map(s => s.trim()).filter(s => s && s !== value);
                if (items.length > 0) newParams.set('ingredients', items.join(','));
                else newParams.delete('ingredients');
            }

            const hasQuery = newParams.has('query') && newParams.get('query').trim() !== '';
            const hasIng = newParams.has('ingredients') && newParams.get('ingredients').trim() !== '';
            if (!hasQuery && !hasIng) {
                window.location.href = "recipe_all.html";
                return;
            }

            history.replaceState(null, '', `${window.location.pathname}?${newParams.toString()}`);
            displayTags(newParams);
            fetchRecipesFromServer().then(recipes => {
                currentRecipes = recipes;
                renderRecipes(currentRecipes);
            });
        });
    }

    // 6. 헤더 검색 기능
    const headerSearchInput = document.getElementById("headerSearchInput");
    if (headerSearchInput) {
        headerSearchInput.addEventListener("keypress", e => {
            if (e.key !== "Enter") return;

            const query = headerSearchInput.value.trim();
            if (!query) return;

            let recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
            recent = recent.filter(q => q !== query);
            recent.unshift(query);
            if (recent.length > 10) recent = recent.slice(0, 10);
            localStorage.setItem('recentSearches', JSON.stringify(recent));

            const ing = query.replace(/\s+/g, ',');
            window.location.href = `recipe_results.html?ingredients=${encodeURIComponent(ing)}`;
        });
    }

    // 7. 카테고리/정렬 변경 시 재검색
    if (categorySelect) categorySelect.addEventListener('change', async () => {
        const recipes = await fetchRecipesFromServer();
        currentRecipes = recipes;
        renderRecipes(currentRecipes);
    });
    if (sortSelect) sortSelect.addEventListener('change', async () => {
        const recipes = await fetchRecipesFromServer();
        currentRecipes = recipes;
        renderRecipes(currentRecipes);
    });
});
