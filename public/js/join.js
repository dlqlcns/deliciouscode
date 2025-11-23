import { API_BASE } from "./config.js";

const joinForm = document.getElementById("joinForm");
const idCheckBtn = document.getElementById("idCheck");
const emailCheckBtn = document.getElementById("emailCheck");

function getCheckedValues(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];
  return Array.from(container.querySelectorAll("input[type='checkbox']:checked"))
    .map(input => input.value);
}

async function requestAvailability(url, value, emptyMessage) {
  if (!value) {
    alert(emptyMessage);
    return;
  }

  try {
    const res = await fetch(`${url}?${emptyMessage.includes('아이디') ? 'username' : 'email'}=${encodeURIComponent(value)}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || '확인에 실패했습니다.');

    alert(data.available ? '사용 가능합니다.' : '이미 사용 중입니다.');
  } catch (err) {
    console.error(err);
    alert('중복 확인 중 오류가 발생했습니다.');
  }
}

if (idCheckBtn) {
  idCheckBtn.addEventListener('click', () => {
    const userId = document.getElementById('userId')?.value.trim();
    requestAvailability(`${API_BASE}/auth/check-username`, userId, '아이디를 입력해주세요.');
  });
}

if (emailCheckBtn) {
  emailCheckBtn.addEventListener('click', () => {
    const email = document.getElementById('email')?.value.trim();
    requestAvailability(`${API_BASE}/auth/check-email`, email, '이메일을 입력해주세요.');
  });
}

if (joinForm) {
  joinForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById("userId")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;
    const passwordConfirm = document.getElementById("passwordConfirm")?.value;

    if (!username || !email || !password || !passwordConfirm) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const allergies = getCheckedValues("allergyContainer");
    const preferred_categories = getCheckedValues("categoryContainer");

    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, allergies, preferred_categories })
      });

      const result = await res.json();

      if (res.ok) {
        alert("회원가입 완료!");
        window.location.href = "login.html";
      } else {
        alert(result.error || "회원가입 실패");
      }
    } catch (error) {
      console.error(error);
      alert("서버 오류가 발생했습니다.");
    }
  });
}
