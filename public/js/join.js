document.getElementById('joinForm').addEventListener('submit', async (e) => {
  e.preventDefault()

  const username = document.getElementById('name').value.trim()
  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value.trim()
  const passwordConfirm = document.getElementById('passwordConfirm').value.trim()

  if (password !== passwordConfirm) {
    return alert('비밀번호가 일치하지 않습니다.')
  }

  const allergies = [...document.querySelectorAll('#allergyContainer input:checked')]
    .map(input => input.value)

  const ingredients = [...document.querySelectorAll('.join-section:last-of-type input:checked')]
    .map(input => input.value)

  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, allergies, ingredients })
  })

  const data = await res.json()

  if (!res.ok) return alert(data.error)
  
  alert('회원가입이 완료되었습니다!')
  window.location.href = '/login.html'
})
