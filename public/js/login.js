document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value.trim()

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })

  const data = await res.json()

  if (!res.ok) return alert(data.error)

  // 로그인 유지
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))

  alert(`환영합니다, ${data.user.username}님!`)
  window.location.href = '/index.html'
})
