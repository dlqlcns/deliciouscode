// DOM 요소 가져오기
const loginForm = document.getElementById('loginForm');
const userIdInput = document.getElementById('userId');
const passwordInput = document.getElementById('password');

// 메시지 요소
function getOrCreateMessageElement(inputEl, uniqueClassName) {
    let formGroup = inputEl.closest('.form-group');
    let messageEl = formGroup.querySelector(`.${uniqueClassName}`);
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.className = uniqueClassName;
        messageEl.classList.add('check-message');
        formGroup.appendChild(messageEl);
    }
    return messageEl;
}

// 비밀번호 SHA-256 해시 함수
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 🔥 로그인 제출
loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const login_id = userIdInput.value.trim();
    const password = passwordInput.value;

    if (!login_id) return alert('아이디를 입력해주세요.');
    if (!password) return alert('비밀번호를 입력해주세요.');

    const hashedPassword = await hashPassword(password);

    const loginData = {
        login_id: login_id,
        password: hashedPassword
    };

    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert(`🎉 로그인 성공! 환영합니다, ${data.username}님.`);
            // 로그인 성공 시 이동
            window.location.href = 'index.html';
        } else {
            const messageEl = getOrCreateMessageElement(passwordInput, 'login-message');
            messageEl.textContent = data.message || '로그인 실패: 아이디 또는 비밀번호 확인';
            messageEl.style.color = '#ef4444';
        }
    })
    .catch(err => {
        console.error('로그인 요청 실패:', err);
        alert('서버 오류 발생');
    });
});