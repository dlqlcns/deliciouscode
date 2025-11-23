import { API_BASE } from "./config.js";

/* ============================================
   카드 생성
   ============================================ */
function createRecipeBlock(recipe) {
  const block = document.createElement("article");
  block.className = "recipe-res-block";

  block.innerHTML = `
    <button class="bookmark-btn ${recipe.bookmarked ? "active" : ""}"   
            data-bookmark-id="${recipe.id}" aria-label="북마크">
      ${recipe.bookmarked ? "♥" : "♡"}
    </button>

    <a href="recipe_detail.html?id=${recipe.id}" class="recipe-link">
      <div class="recipe-image-box" style="background-image: url('${recipe.image_url || "/img/default.jpg"}');"></div>
      <div class="recipe-content">
        <h3 class="recipe-title">${recipe.name}</h3>
        <p class="recipe-category">${recipe.category}</p>
        <p class="recipe-desc-short">${recipe.description || ""}</p>
        <div class="recipe-time">
          <img src="/img/icons/timer.png" alt="시간" class="time-icon" />
          <span>${recipe.time || "-"}</span>
        </div>
      </div>
    </a>
  `;

  return block;
}

/* ============================================
   공통 토스트 알림
   ============================================ */
function showToastNotification(message, actionText = null, actionCallback = null) {
  const existing = document.getElementById("commonNotification");
  if (existing) existing.remove();

  const notif = document.createElement("div");
  notif.id = "commonNotification";
  notif.style.cssText = `
    position: fixed;
    top: 90%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.9);
    background-color: rgba(33, 33, 33, 0.95);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 14px;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  `;

  const msgSpan = document.createElement("span");
  msgSpan.textContent = message;
  notif.appendChild(msgSpan);

  if (actionText && actionCallback) {
    const btn = document.createElement("button");
    btn.textContent = actionText;
    btn.style.cssText = `
      background-color: #3459ff;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
    `;
    btn.onclick = () => {
      actionCallback();
      removeNotification(notif);
    };
    notif.appendChild(btn);
  }

  const close = document.createElement("button");
  close.innerHTML = "&times;";
  close.style.cssText = `
    background: none; border: none; color: #999; font-size: 20px; cursor: pointer;
  `;
  close.onclick = () => removeNotification(notif);
  notif.appendChild(close);

  document.body.appendChild(notif);

  requestAnimationFrame(() => {
    notif.style.opacity = "1";
    notif.style.transform = "translate(-50%, -50%) scale(1)";
  });

  setTimeout(() => {
    if (document.body.contains(notif)) removeNotification(notif);
  }, 4000);
}

function removeNotification(el) {
  el.style.opacity = "0";
  setTimeout(() => el.remove(), 300);
}

function showLoginRequestNotification() {
  showToastNotification("로그인이 필요한 서비스입니다.", "로그인 하러가기", () => {
    window.location.href = "login.html";
  });
}

/* ============================================
   북마크 버튼 리스너 (DB 연동 + API_BASE)
   ============================================ */
function attachBookmarkListeners() {
  document.querySelectorAll(".bookmark-btn").forEach(btn => {
    btn.addEventListener("click", async e => {
      e.stopPropagation();
      e.preventDefault();

      const token = localStorage.getItem("token");
      if (!token) {
        showLoginRequestNotification();
        return;
      }

      const recipeId = btn.dataset.bookmarkId;
      const isActive = btn.classList.toggle("active");
      btn.textContent = isActive ? "♥" : "♡";

      try {
        const res = await fetch(`${API_BASE}/favorites`, {
          method: isActive ? "POST" : "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ recipe_id: recipeId })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "요청 실패");

        showToastNotification(
          isActive ? "즐겨찾기에 추가되었습니다." : "즐겨찾기에서 제거되었습니다.",
          isActive ? "내 즐겨찾기 보기" : null,
          isActive ? () => (window.location.href = "my_fav.html") : null
        );
      } catch (err) {
        console.error("즐겨찾기 오류:", err);
        showToastNotification("서버 오류가 발생했습니다.");
      }
    });
  });
}

/* export — 다른 JS 파일에서 import 해 사용 */
export { createRecipeBlock, attachBookmarkListeners };
