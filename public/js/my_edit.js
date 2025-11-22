document.addEventListener('DOMContentLoaded', () => {
  const nameInput = document.getElementById('nameInput')
  const emailInput = document.getElementById('emailInput')
  const allergyCheckboxes = document.querySelectorAll('.allergy-grid input[type="checkbox"]')
  const preferenceCheckboxes = document.querySelectorAll('.preference-grid input[type="checkbox"]')
  const saveBtn = document.querySelector('.save-btn')
  const dangerBtn = document.querySelector('.danger-btn')

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))  // 로그인 시 받은 user 자료(id 포함)

  if (!token || !user) {
    alert('로그인이 필요합니다.')
    return location.href = '/login.html'
  }

  // 사용자 정보 불러오기
  async function loadUserData() {
    const res = await fetch('/api/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()

    if (!res.ok) return alert(data.error)

    nameInput.value = data.username
    emailInput.value = data.email

    allergyCheckboxes.forEach(cb => cb.checked = data.allergies?.includes(cb.value) || false)
    preferenceCheckboxes.forEach(cb => cb.checked = data.ingredients?.includes(cb.value) || false)
  }

  // 정보 저장
  saveBtn.addEventListener('click', async () => {
    const username = nameInput.value.trim()
    const email = emailInput.value.trim()

    if (!username) return alert('이름을 입력해주세요.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert('올바른 이메일 형식이 아닙니다.')

    const allergies = [...allergyCheckboxes].filter(cb => cb.checked).map(cb => cb.value)
    const ingredients = [...preferenceCheckboxes].filter(cb => cb.checked).map(cb => cb.value)

    const res = await fetch('/api/users/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ username, email, allergies, ingredients })
    })

    const data = await res.json()
    if (!res.ok) return alert(data.error)

    // 프론트에서 최신 사용자 정보 유지
    localStorage.setItem('user', JSON.stringify(data.user))

    alert('프로필이 저장되었습니다.')
    location.href = '/mypage.html'
  })

  // 초기화
  dangerBtn.addEventListener('click', async () => {
    if (!confirm("정말 초기화하시겠습니까?")) return

    const res = await fetch('/api/users/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        username: nameInput.value.trim(),
        email: emailInput.value.trim(),
        allergies: [],
        ingredients: []
      })
    })

    const data = await res.json()
    if (!res.ok) return alert(data.error)

    localStorage.setItem('user', JSON.stringify(data.user))
    alert('데이터가 초기화되었습니다.')
    location.reload()
  })

  loadUserData()
})
