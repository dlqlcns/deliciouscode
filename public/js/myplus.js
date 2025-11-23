import { API_BASE } from "./config.js";

const input = document.querySelector(".add-row .input");
const select = document.querySelector(".add-row .select");
const addBtn = document.querySelector(".btn-add");
const saveBtn = document.querySelector(".btn-save");
const ingredientSection = document.querySelector(".ingredient-section");
const token = localStorage.getItem("token");

if (!token) {
  alert("로그인이 필요합니다.");
  location.href = "/login.html";
}

// 저장된 재료 렌더링
async function loadIngredients() {
  ingredientSection.innerHTML = "";

  const res = await fetch(`${API_BASE}/user-ingredients`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const ingredients = await res.json();

  if (!res.ok) {
    alert(ingredients.error || "재료를 불러오는 중 오류가 발생했습니다.");
    return;
  }

  Object.entries(ingredients).forEach(([category, items]) => {
    const categoryEl = createCategoryElement(category);
    const wrap = categoryEl.querySelector(".badge-wrap");
    items.forEach(name => wrap.appendChild(createBadge(name, category)));
  });

  updateCount();
}

// 카테고리 select 옵션 생성
const CATEGORIES = ["전체", "채소류", "육류", "유제품", "곡물류", "기타"];
function createCategoryOptions() {
  select.innerHTML = "";
  CATEGORIES.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

function updateCount() {
  const countP = document.querySelectorAll(".card .section-header p")[1];
  const totalBadges = document.querySelectorAll(".ingredient-section .badge").length;
  countP.textContent = `총 ${totalBadges}개의 재료가 등록되어 있습니다`;
}

function createCategoryElement(categoryName) {
  let target = document.querySelector(`.category[data-category="${categoryName}"]`);

  if (!target) {
    target = document.createElement("div");
    target.className = "category";
    target.setAttribute("data-category", categoryName);
    target.innerHTML = `
      <h3>${categoryName}</h3>
      <div class="badge-wrap"></div>
    `;
    ingredientSection.appendChild(target);
  }
  return target;
}

function createBadge(name, category) {
  const badge = document.createElement("div");
  badge.className = "badge";
  badge.innerHTML = `${name} <button class="badge-close" type="button">×</button>`;
  badge.dataset.ingredient = name;
  badge.dataset.category = category;
  return badge;
}

// 재료 추가
async function addIngredient() {
  const name = input.value.trim();
  const category = select.value;

  if (!name) {
    alert("재료 이름을 입력하세요!");
    return;
  }

  // 서버에 저장 요청
  const res = await fetch(`${API_BASE}/user-ingredients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ ingredient: name, category })
  });

  const data = await res.json();
  if (!res.ok) return alert(data.error || "재료 추가 실패");

  // UI 반영
  const categoryEl = createCategoryElement(category);
  const wrap = categoryEl.querySelector(".badge-wrap");
  wrap.appendChild(createBadge(name, category));
  input.value = "";
  updateCount();
}

// 저장 버튼 = 전체 초기화 후 다시 저장 ❌
// 👉 DB 방식에서는 따로 저장 버튼 누를 필요 없음 → 저장 버튼 = 아무 동작 안 하도록 변경
saveBtn.addEventListener("click", () => {
  alert("재료는 추가 즉시 자동 저장됩니다!");
  location.href = "mypage.html";
});

// 재료 삭제 (× 버튼)
document.addEventListener("click", async e => {
  if (!e.target.classList.contains("badge-close")) return;

  const badge = e.target.closest(".badge");
  const ingredient = badge.dataset.ingredient;

  // DB 삭제 요청
  await fetch(`${API_BASE}/user-ingredients/${ingredient}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  // UI 반영
  const categoryEl = e.target.closest(".category");
  badge.remove();
  if (categoryEl.querySelector(".badge-wrap").children.length === 0) {
    categoryEl.remove();
  }
  updateCount();
});

// 입력 + 엔터
addBtn.addEventListener("click", addIngredient);
input.addEventListener("keydown", e => {
  if (e.key === "Enter") addIngredient();
});

// 페이지 로드
createCategoryOptions();
loadIngredients();
