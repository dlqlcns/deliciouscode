import { API_BASE } from "./config.js";

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const loginId = document.getElementById('userId')?.value.trim();
    const password = document.getElementById('password')?.value.trim();

    if (!loginId || !password) {
      alert('아이디(또는 이메일)와 비밀번호를 모두 입력해주세요.');
      return;
    }

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "로그인 실패");
      return;
    }

    // 로그인 유지
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    alert(`환영합니다, ${data.user.username}님!`);
    window.location.href = '/index.html';
  });
}
