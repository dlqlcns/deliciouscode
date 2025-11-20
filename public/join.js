// DOM 요소 가져오기
const joinForm = document.getElementById('joinForm');
const nameInput = document.getElementById('name');
const userIdInput = document.getElementById('userId');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const passwordConfirmInput = document.getElementById('passwordConfirm');
const idCheckBtn = document.getElementById('idCheck');
const emailCheckBtn = document.getElementById('emailCheck');
const customAllergyInput = document.getElementById('customAllergy');
const addAllergyBtn = document.getElementById('addAllergy');
const allergyContainer = document.getElementById('allergyContainer');

// 유효성 검사 상태
let isIdChecked = false;
let isEmailChecked = false;

// 전역 변수: 비밀번호 힌트 텍스트 (유효성 검사 실패 시 복원용)
const passwordHintElement = passwordInput.nextElementSibling;
const originalPasswordHint = passwordHintElement ? passwordHintElement.textContent.trim() : '';


// 메시지 요소 동적으로 가져오거나 생성하는 함수
function getOrCreateMessageElement(inputEl, uniqueClassName) {
    let formGroup = inputEl.closest('.form-group');
    let messageEl = formGroup.querySelector(`.${uniqueClassName}`);
    
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.className = uniqueClassName;
        messageEl.classList.add('check-message');

        let hintTexts = formGroup.querySelectorAll('.hint-text');
        let insertionPoint = hintTexts.length > 0 ? hintTexts[hintTexts.length - 1].nextSibling : inputEl.nextSibling;
        
        formGroup.insertBefore(messageEl, insertionPoint);
    }
    return messageEl;
}


// 아이디 유효성 검사 (영문 + 숫자 포함, 8자 이상)
function validateUserId() {
    const userId = userIdInput.value;
    const idMessage = getOrCreateMessageElement(userIdInput, 'id-message');
    
    const hasEnglish = /[a-zA-Z]/.test(userId);
    const hasNumber = /[0-9]/.test(userId);
    const isLongEnough = userId.length >= 8;
    const hasOnlyEnglishAndNumbers = /^[a-zA-Z0-9]*$/.test(userId);

    const isValid = hasEnglish && hasNumber && isLongEnough && hasOnlyEnglishAndNumbers;

    if (userId && !isValid) {
        idMessage.textContent = '아이디는 영문, 숫자를 포함하여 8자 이상이어야 합니다';
        idMessage.style.color = '#ef4444';
        userIdInput.classList.add('error');
        isIdChecked = false;
        return false;
    }
    
    if (isValid) {
        userIdInput.classList.remove('error');
        if (idMessage.textContent !== '사용 가능한 아이디입니다' && idMessage.textContent !== '이미 사용중인 아이디입니다') { 
            idMessage.textContent = '';
            idMessage.classList.remove('valid-message');
        }
    } else if (!userId) {
        userIdInput.classList.remove('error');
        idMessage.textContent = '';
        idMessage.classList.remove('valid-message');
    }

    return isValid;
}


// 아이디 중복 확인
idCheckBtn.addEventListener('click', function() {
    const userId = userIdInput.value.trim();
    const idMessage = getOrCreateMessageElement(userIdInput, 'id-message');
    
    if (!userId) {
        alert('⚠️ 아이디를 입력해주세요');
        isIdChecked = false;
        return;
    }
    
    if (!validateUserId()) {
        return; 
    }

    if (userId === 'admin') {
        idMessage.textContent = '이미 사용중인 아이디입니다';
        idMessage.style.color = '#ef4444';
        idMessage.style.fontWeight = '400';
        isIdChecked = false;
    } else {
        idMessage.textContent = '사용 가능한 아이디입니다';
        idMessage.style.color = '#16a34a';
        idMessage.style.fontWeight = '400';
        isIdChecked = true;
    }
});


// 이메일 유효성 검사 함수
function checkEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 이메일 중복 확인
emailCheckBtn.addEventListener('click', function() {
    const email = emailInput.value.trim();
    const emailMessage = getOrCreateMessageElement(emailInput, 'email-message');
    
    if (!email) {
        alert('⚠️ 이메일을 입력해주세요');
        isEmailChecked = false;
        return;
    }
    
    if (!checkEmailFormat(email)) {
        alert('❌ 올바른 이메일 형식이 아닙니다');
        isEmailChecked = false;
        return;
    }
    
    if (email === 'test@test.com') {
        emailMessage.textContent = '이미 사용중인 이메일입니다';
        emailMessage.style.color = '#ef4444';
        emailMessage.style.fontWeight = '400';
        isEmailChecked = false;
    } else {
        emailMessage.textContent = '사용 가능한 이메일입니다';
        emailMessage.style.color = '#16a34a';
        emailMessage.style.fontWeight = '400';
        isEmailChecked = true;
    }
});


// 아이디 입력 변경 시 중복확인 및 강도 검사
userIdInput.addEventListener('input', function() {
    isIdChecked = false;
    validateUserId();
});

// 이메일 입력 변경 시 중복확인 초기화
emailInput.addEventListener('input', function() {
    isEmailChecked = false;
    const emailMessage = getOrCreateMessageElement(emailInput, 'email-message');
    emailMessage.textContent = '';
    emailMessage.classList.remove('valid-message');
    emailInput.classList.remove('error');
});

// 이름 입력 필드에서 Enter 키 처리
nameInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        userIdInput.focus();
    }
});

// 비밀번호 유효성 검사 설정 함수
function setupPasswordValidation(inputEl, validationFn) {
    inputEl.addEventListener('input', function() {
        inputEl.classList.remove('error');
        if (inputEl === passwordInput && passwordConfirmInput.value) {
            validatePasswordConfirm(); 
        } else if (inputEl === passwordConfirmInput) {
            validatePasswordConfirm();
        }
    });
    
    inputEl.addEventListener('blur', validationFn);
    
    inputEl.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            
            if (inputEl === passwordInput) {
                passwordConfirmInput.focus();
            } 
            else if (inputEl === passwordConfirmInput) {
                joinForm.dispatchEvent(new Event('submit'));
            }
        }
    });
}

// 비밀번호 유효성 검사
function validatePassword() {
    const password = passwordInput.value;
    const hintText = passwordHintElement;
    
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!%^&*_]/.test(password);
    const isLongEnough = password.length >= 8;
    
    const conditionsMet = [hasLowercase, hasUppercase, hasNumber, hasSpecialChar].filter(Boolean).length;
    const isValid = isLongEnough && conditionsMet >= 2;
    
    if (password && !isValid) {
        hintText.style.color = '#ef4444';
        hintText.textContent = '영문(대소문자), 숫자, 특수문자(!%^&*_ 중 1개 이상) 중 2가지 이상을 포함하여 8자 이상 설정해야합니다';
        passwordInput.classList.add('error');
    } else {
        hintText.style.color = '#9ca3af';
        hintText.textContent = originalPasswordHint;
        passwordInput.classList.remove('error');
    }
    
    return isValid;
}

// 비밀번호 확인 유효성 검사
function validatePasswordConfirm() {
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;
    
    const confirmMessage = getOrCreateMessageElement(passwordConfirmInput, 'password-confirm-message');
    
    if (passwordConfirm) {
        const isPasswordValid = validatePassword();
        
        if (password !== passwordConfirm) {
            confirmMessage.textContent = '비밀번호가 일치하지 않습니다';
            confirmMessage.classList.remove('valid-message');
            confirmMessage.style.color = '#ef4444';
            confirmMessage.style.fontWeight = '400';
            passwordConfirmInput.classList.add('error');
            return false;
        } 
        else if (password === passwordConfirm) {
            if (isPasswordValid) {
                confirmMessage.textContent = '입력하신 비밀번호를 사용하실 수 있습니다';
                confirmMessage.classList.add('valid-message');
                confirmMessage.style.color = '#16a34a';
                confirmMessage.style.fontWeight = '400';
                passwordConfirmInput.classList.remove('error');
                return true;
            } else {
                confirmMessage.textContent = '비밀번호는 일치하지만, 비밀번호 조건을 충족해주세요.';
                confirmMessage.classList.remove('valid-message');
                confirmMessage.style.color = '#ef4444';
                confirmMessage.style.fontWeight = '400';
                passwordConfirmInput.classList.add('error');
                return false;
            }
        }
    } else {
        confirmMessage.textContent = '';
        confirmMessage.classList.remove('valid-message');
        passwordConfirmInput.classList.remove('error');
        return false;
    }
}

// 비밀번호 필드에 지연 유효성 검사 설정 적용
setupPasswordValidation(passwordInput, validatePassword);
setupPasswordValidation(passwordConfirmInput, validatePasswordConfirm);


// 알레르기 재료 추가
addAllergyBtn.addEventListener('click', function() {
    const allergyValue = customAllergyInput.value.trim();
    
    if (!allergyValue) {
        alert('⚠️ 재료명을 입력해주세요.');
        return;
    }
    
    const existingCheckboxes = allergyContainer.querySelectorAll('input[type="checkbox"]');
    for (let checkbox of existingCheckboxes) {
        if (checkbox.value === allergyValue) {
            alert('⚠️ 이미 추가된 재료입니다.');
            return;
        }
    }
    
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    const safeAllergyValue = allergyValue.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    
    checkbox.value = safeAllergyValue;
    checkbox.checked = true;
    
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(' ' + safeAllergyValue));
    
    allergyContainer.appendChild(label);
    
    customAllergyInput.value = '';
});

// 알레르기 재료 입력 필드에서 Enter 키 처리
customAllergyInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        addAllergyBtn.click();
    }
});

// 폼 제출
joinForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = nameInput.value.trim();
    const userId = userIdInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;
    
    if (!name) {
        alert('이름을 입력해주세요.');
        nameInput.ocus();
        return;
    }
    
    if (!userId) {
        alert( '아이디를 입력해주세요.');
        userIdInput.focus();
        return;
    }

    if (!validateUserId()) {
        alert( '아이디 형식을 확인해주세요. (영문, 숫자 포함 8자 이상)');
        userIdInput.focus();
        return;
    }
    
    if (!isIdChecked) {
        alert('아이디 중복 확인 버튼을 눌러 "사용 가능" 상태로 만들어주세요.');
        idCheckBtn.focus();
        return;
    }
    
    if (!email) {
        alert('이메일을 입력해주세요.');
        emailInput.focus();
        return;
    }
    
    if (!checkEmailFormat(email)) {
        alert('올바른 이메일 형식이 아닙니다 (예: example@email.com).');
        emailInput.focus();
        return;
    }

    if (!isEmailChecked) {
        alert('이메일 중복 확인 버튼을 눌러 "사용 가능" 상태로 만들어주세요.');
        emailCheckBtn.focus();
        return;
    }
    
    if (!password) {
        alert('비밀번호를 입력해주세요.');
        passwordInput.focus();
        return;
    }
    
    if (!validatePassword()) {
        console.error('유효성 검사 실패: 비밀번호 강도 조건 미충족');
        alert('비밀번호는 영문(대소문자), 숫자, 특수문자(!%^&*_ 중 1개 이상) 중 2가지 이상을 포함하여 8자 이상이어야 합니다.');
        passwordInput.focus();
        return;
    }
    
    if (!passwordConfirm) {
        alert('비밀번호 확인을 입력해주세요.');
        passwordConfirmInput.focus();
        return;
    }
    
    if (password !== passwordConfirm) {
        console.error('유효성 검사 실패: 비밀번호 불일치');
        alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        passwordConfirmInput.focus();
        return;
    }
    
    console.log('✅ 모든 유효성 검사 통과. 회원가입 절차 진행.');
    
    const allergies = [];
    const allergyCheckboxes = document.querySelectorAll('#allergyContainer input[type="checkbox"]:checked');
    allergyCheckboxes.forEach(checkbox => {
        allergies.push(checkbox.value);
    });
    
    const preferences = [];
    const preferenceCheckboxes = document.querySelectorAll('.join-section:last-of-type input[type="checkbox"]:checked');
    preferenceCheckboxes.forEach(checkbox => {
        preferences.push(checkbox.value);
    });
    
    const formData = {
        name: name,
        userId: userId,
        email: email,
        password: password, 
        allergies: allergies,
        preferences: preferences,
        isLoggedIn: true 
    };
    
    console.log('회원가입 데이터 (localStorage 저장):', formData);

    localStorage.setItem('currentUser', JSON.stringify(formData));

    alert('🎉 회원가입이 완료되었습니다!');
    window.location.href = 'main.html';
});