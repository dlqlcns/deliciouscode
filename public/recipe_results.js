// ============================================
// recipe_results.js - 검색 결과 페이지 (수정본)
// ============================================
// ⚠️ recipe_res_block.js를 먼저 로드해야 함!

// 샘플 레시피 데이터
const sampleRecipes = [
  {
    id: 'kimchi_jjigae',
    name: "김치찌개",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=300&fit=crop",
    time: "30분",
    description: "매콤하고 시원한 국물이 일품인 한국의 대표 찌개",
    category: "한식",
    bookmarked: false  // ✅ 모두 false로 초기화
  },
  {
    id: 'cream_pasta',
    name: "크림 파스타",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop",
    time: "20분",
    description: "부드럽고 고소한 크림 소스가 면발과 완벽하게 어우러진 파스타",
    category: "양식",
    bookmarked: false  // ✅ 변경됨
  },
  {
    id: 'ramen',
    name: "일본식 라멘",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop",
    time: "45분",
    description: "진한 돈코츠 육수에 탱탱한 면발이 일품인 일본식 라멘",
    category: "일식",
    bookmarked: false
  },
  {
    id: 'chocolate_cake',
    name: "초콜릿 케이크",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
    time: "60분",
    description: "촉촉하고 진한 초콜릿 풍미가 가득한 케이크",
    category: "디저트",
    bookmarked: false  // ✅ 변경됨
  },
  {
    id: 'grilled_salad',
    name: "그릴 샐러드",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    time: "15분",
    description: "신선한 채소와 건강한 드레싱으로 만든 샐러드",
    category: "샐러드",
    bookmarked: false
  },
  {
    id: 'homemade_pizza',
    name: "수제 피자",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
    time: "40분",
    description: "바삭한 도우 위에 신선한 토핑이 가득한 수제 피자",
    category: "양식",
    bookmarked: false
  },
  {
    id: 'pu_phat_pong_kari',
    name: "푸팟퐁커리",
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop",
    time: "25분",
    description: "부드러운 게살과 코코넛 밀크 커리가 조화로운 태국 요리",
    category: "동남아",
    bookmarked: false
  },
  {
    id: 'pumpkin_soup',
    name: "단호박 수프",
    image: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&h=300&fit=crop",
    time: "35분",
    description: "달콤하고 부드러운 단호박을 갈아 만든 건강 수프",
    category: "양식",
    bookmarked: false
  }
];

let currentRecipes = [...sampleRecipes];
const recipeList = document.getElementById('recipeList');
const categorySelect = document.getElementById('categorySelect');
const sortSelect = document.getElementById('sortSelect');

// ============================================
// 태그 생성 함수
// ============================================

function createTag(term, type) {
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.style.cursor = 'pointer';
    
    tag.dataset.type = type; 
    tag.dataset.value = term; 

    tag.innerHTML = `
        <span>${term}</span>
        <button class="tag-close">×</button>
    `;
    
    tag.addEventListener('click', function(e) {
        if (!e.target.classList.contains('tag-close')) {
            window.location.href = `recipe_results.html?ingredients=${encodeURIComponent(term)}`;
        }
    });
    
    return tag;
}

// ============================================
// 태그 표시 함수
// ============================================

function displayTags(params) {
    const tagContainer = document.getElementById("tagContainer");
    const resultsTitle = document.getElementById('resultsTitle');
    if (!tagContainer || !resultsTitle) return;

    tagContainer.innerHTML = '';
    
    const query = params.get('query') || '';
    const ingredientsParam = params.get('ingredients') || '';
    
    console.log('🔍 URL 파라미터 확인:');
    console.log('  - query:', query);
    console.log('  - ingredients:', ingredientsParam);
    console.log('  - exclude:', params.get('exclude'));
    
    const ingredients = ingredientsParam
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    
    console.log('📝 파싱된 검색어:', ingredients);
    
    const searchTags = [];
    
    if (query && query.trim() !== '') {
        searchTags.push(createTag(query.trim(), 'query'));
        console.log('✅ query 태그 추가:', query);
    }
    
    ingredients.forEach(ing => {
        searchTags.push(createTag(ing, 'ingredients'));
        console.log('✅ ingredient 태그 추가:', ing);
    });
    
    console.log('🏷️ 총 생성된 태그 수:', searchTags.length);
    
    tagContainer.append(...searchTags);
    
    const allSearchTerms = [];
    if (query && query.trim() !== '') {
        allSearchTerms.push(query.trim());
    }
    allSearchTerms.push(...ingredients);
    
    if (allSearchTerms.length > 0) {
        const formattedTerms = allSearchTerms.map(term => `"${term}"`).join(', ');
        resultsTitle.innerHTML = `${formattedTerms}로 입력한 결과입니다.`;
    } else {
        resultsTitle.textContent = `레시피 검색 결과입니다.`;
    }

    tagContainer.style.display = searchTags.length > 0 ? 'flex' : 'none';
}

// ============================================
// 레시피 렌더링
// ============================================

function renderRecipes(recipes) {
    const resultsSubtitle = document.getElementById('resultsSubtitle');
    if (!recipeList || !resultsSubtitle) return;

    recipeList.innerHTML = '';
    
    const urlParams = new URLSearchParams(window.location.search);
    const excludeString = urlParams.get('exclude') || '';
    const excludeTerms = excludeString.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    let subtitleText = `총 ${recipes.length}개의 레시피가 검색되었습니다.`;
    
    if (excludeTerms.length > 0) {
        const excludeDisplay = excludeTerms.map(term => `"${term}"`).join(', ');
        subtitleText += ` ${excludeDisplay} 결과는 제외했습니다.`;
    }
    
    resultsSubtitle.textContent = subtitleText;

    if (recipes.length === 0) {
        recipeList.innerHTML = '<p style="text-align: center; color: #888; font-size: 1.2rem; grid-column: 1 / -1;">검색 결과가 없습니다.</p>';
        return;
    }

    recipes.forEach(recipe => {
        recipeList.appendChild(createRecipeBlock(recipe));
    });
    
    attachBookmarkListeners(handleBookmarkClick);
}

// ✅ 북마크 핸들러 - 전체 재렌더링 대신 개별 버튼만 업데이트
function handleBookmarkClick(id) {
  const recipeIndex = sampleRecipes.findIndex(r => r.id === id);
  if (recipeIndex > -1) {
    // 상태 토글
    sampleRecipes[recipeIndex].bookmarked = !sampleRecipes[recipeIndex].bookmarked;
    
    // ✅ 해당 버튼만 업데이트 (재렌더링 없음)
    const button = document.querySelector(`.bookmark-btn[data-id="${id}"]`);
    if (button) {
      const isBookmarked = sampleRecipes[recipeIndex].bookmarked;
      button.textContent = isBookmarked ? '♥' : '♡';
      button.classList.toggle('bookmarked', isBookmarked);
    }
    
    // currentRecipes 배열도 동기화
    const currentIndex = currentRecipes.findIndex(r => r.id === id);
    if (currentIndex > -1) {
      currentRecipes[currentIndex].bookmarked = sampleRecipes[recipeIndex].bookmarked;
    }
  }
}

// ============================================
// 레시피 필터링 및 렌더링
// ============================================

function filterAndRenderResults() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query') || '';
    const ingredientsString = urlParams.get('ingredients') || '';
    const excludeString = urlParams.get('exclude') || '';
    
    const selectedCategory = categorySelect?.value || '전체';
    const sortOption = sortSelect?.value || '최근 등록순';
    
    let searchTerms = ingredientsString.split(',')
        .map(s => s.trim().toLowerCase())
        .filter(s => s.length > 0);
    
    if (query && query.trim() !== '') {
        searchTerms.push(query.trim().toLowerCase()); 
    }
    
    searchTerms = [...new Set(searchTerms)];
    
    const excludeTerms = excludeString.split(',')
        .map(s => s.trim().toLowerCase())
        .filter(s => s.length > 0);
    
    let filtered = [...sampleRecipes];
    
    if (searchTerms.length > 0) {
        filtered = filtered.filter(recipe => {
            const searchText = `${recipe.name} ${recipe.category} ${recipe.description}`.toLowerCase();
            return searchTerms.some(term => searchText.includes(term));
        });
    }
    
    if (excludeTerms.length > 0) {
        filtered = filtered.filter(recipe => {
            const searchText = `${recipe.name} ${recipe.category} ${recipe.description}`.toLowerCase();
            return !excludeTerms.some(term => searchText.includes(term));
        });
    }
    
    if (selectedCategory !== '전체') {
        filtered = filtered.filter(recipe => recipe.category === selectedCategory);
    }
    
    switch (sortOption) {
        case '인기순':
            filtered.sort((a, b) => b.bookmarked - a.bookmarked);
            break;
        case '조리 시간순':
            filtered.sort((a, b) => {
                const timeA = parseInt(a.time);
                const timeB = parseInt(b.time);
                return timeA - timeB;
            });
            break;
        case '최신순':
        case '최근 등록순':
        default:
            filtered.sort((a, b) => {
                if (a.id < b.id) return 1;
                if (a.id > b.id) return -1;
                return 0;
            });
            break;
    }
    
    currentRecipes = filtered;
    renderRecipes(filtered);
}

// ============================================
// 초기화 및 이벤트 리스너
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    console.log('🚀 페이지 로드 - 전체 URL:', window.location.href);
    console.log('📋 파라미터 목록:');
    for (let [key, value] of urlParams.entries()) {
        console.log(`  - ${key}: ${value}`);
    }
    
    displayTags(urlParams);
    filterAndRenderResults();
    
    const tagContainer = document.getElementById("tagContainer");

    if (tagContainer) {
        tagContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('tag-close')) {
                e.stopPropagation();
                
                const button = e.target;
                const tag = button.closest('.tag');
                const type = tag.dataset.type;
                const value = tag.dataset.value; 
                
                console.log('🗑️ 태그 삭제:', type, value);
                
                tag.style.transition = 'opacity 0.3s, transform 0.3s';
                tag.style.opacity = '0';
                tag.style.transform = 'scale(0.8)';
                
                setTimeout(() => {
                    tag.remove();
                    
                    let newUrlParams = new URLSearchParams(window.location.search);

                    if (type === 'query') {
                        newUrlParams.delete('query');
                    } else if (type === 'ingredients') {
                        const currentString = newUrlParams.get('ingredients') || '';
                        const currentTerms = currentString.split(',').map(s => s.trim()).filter(s => s.length > 0);
                        
                        const newTerms = currentTerms.filter(s => s !== value);
                        const newString = newTerms.join(',');

                        if (newString) {
                            newUrlParams.set('ingredients', newString);
                        } else {
                            newUrlParams.delete('ingredients');
                        }
                    }

                    const hasQuery = newUrlParams.has('query') && newUrlParams.get('query').trim() !== '';
                    const hasIngredients = newUrlParams.has('ingredients') && newUrlParams.get('ingredients').trim() !== '';

                    if (!hasQuery && !hasIngredients) {
                        console.log('➡️ 모든 검색어 삭제됨, recipe_all.html로 이동');
                        window.location.href = 'recipe_all.html';
                        return; 
                    }

                    const newUrl = newUrlParams.toString() 
                        ? `${window.location.pathname}?${newUrlParams.toString()}`
                        : window.location.pathname;
                    history.replaceState(null, '', newUrl);

                    displayTags(newUrlParams);
                    filterAndRenderResults();
                }, 300);
            }
        });
    }

    const headerSearchInput = document.getElementById("headerSearchInput");
    if (headerSearchInput) {
        headerSearchInput.addEventListener("keypress", e => {
            if (e.key === "Enter") {
                const query = headerSearchInput.value.trim();
                if (query) {
                    let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
                    recentSearches = recentSearches.filter(term => term !== query);
                    recentSearches.unshift(query);
                    if (recentSearches.length > 10) {
                        recentSearches = recentSearches.slice(0, 10);
                    }
                    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
                    
                    const ingredients = query.replace(/\s+/g, ',');
                    window.location.href = `recipe_results.html?ingredients=${encodeURIComponent(ingredients)}`;
                }
            }
        });
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', filterAndRenderResults);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', filterAndRenderResults);
    }
});