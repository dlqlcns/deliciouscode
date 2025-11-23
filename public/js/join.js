import { API_BASE } from "./config.js";

document.getElementById("signupBtn").addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const allergies = document.getElementById("allergies").value;
  const ingredients = document.getElementById("ingredients").value;

  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, allergies, ingredients })
    });

    const result = await res.json();
    console.log(result);

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
