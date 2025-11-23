import { API_BASE } from "./config.js";

// 탭 전환 기능
function switchTab(tabName) {
  const idForm = document.getElementById("findIdForm");
  const pwForm = document.getElementById("findPasswordForm");
  const idTab = document.getElementById("tabId");
  const pwTab = document.getElementById("tabPw");
  document.getElementById("idResult").classList.remove("show");

  if (tabName === "findId") {
    idForm.classList.remove("hidden");
    pwForm.classList.add("hidden");
    idTab.classList.add("active");
    pwTab.classList.remove("active");
  } else {
    idForm.classList.add("hidden");
    pwForm.classList.remove("hidden");
    idTab.classList.add("active");
    pwTab.classList.remove("active");
  }
}

window.switchTab = switchTab;

/** 아이디 찾기 */
document.getElementById("findIdBtn").addEventListener("click", async () => {
  const name = document.getElementById("nameInput").value.trim();
  const email = document.getElementById("emailInputId").value.trim();

  if (!name || !email) return alert("이름과 이메일을 모두 입력해주세요.");

  const res = await fetch(`${API_BASE}/auth/find-id`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email })
  });

  const data = await res.json();
  const resultBox = document.getElementById("idResult");
  const foundId = document.getElementById("foundId");

  if (!res.ok) {
    foundId.textContent = "정보를 찾을 수 없습니다.";
    foundId.style.color = "#ef4444";
  } else {
    foundId.textContent = data.username;
    foundId.style.color = "#3459ff";
  }
  resultBox.classList.add("show");
});

/** 비밀번호 찾기 */
document.getElementById("findPasswordBtn").addEventListener("click", async () => {
  const username = document.getElementById("idInputPw").value.trim();
  const email = document.getElementById("emailInputPw").value.trim();

  if (!username || !email) return alert("아이디와 이메일을 모두 입력해주세요.");

  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email })
  });

  const data = await res.json();
  if (!res.ok) return alert(data.error || "일치하는 회원 정보가 없습니다.");

  alert("비밀번호 재설정 링크가 이메일로 발송되었습니다.");
});
