// Инициализация Telegram WebApp для тестирования
if (typeof Telegram === 'undefined') {
  console.log('Создаем заглушку для Telegram WebApp');
  window.Telegram = {
    WebApp: {
      initDataUnsafe: {
        user: null
      },
      ready: () => {},
      expand: () => {}
    }
  };
}

// Базовые стили
document.head.innerHTML += `
<style>
  .container {
    max-width: 400px;
    margin: 20px auto;
    padding: 20px;
  }
  .input-field {
    width: 100%;
    padding: 12px;
    margin: 8px 0;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    box-sizing: border-box;
  }
  .btn {
    width: 100%;
    padding: 12px;
    margin: 8px 0;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
  }
  .divider {
    text-align: center;
    margin: 15px 0;
    color: #666;
  }
  .error {
    color: #ff0000;
    text-align: center;
    margin: 10px 0;
  }
  .profile {
    text-align: center;
  }
  .profile img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin: 10px auto;
  }
</style>
`;

// Запускаем проверку
document.addEventListener('DOMContentLoaded', () => {
  console.log('Приложение запущено');
  checkAuth();
});

// Функция для отображения сообщений
function showMessage(message, isError = false) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container">
      <div class="message ${isError ? 'error' : ''}">
        <p>${message}</p>
        <button class="btn" onclick="showLoginForm()">Назад</button>
      </div>
    </div>
  `;
}

// Функция для отображения профиля
function showProfile(employee) {
  document.getElementById('app').innerHTML = `
    <div class="profile">
      <img src="${employee.photo}" alt="${employee.name}">
      <h2>${employee.name}</h2>
      <p>${employee.position}</p>
      <p>${employee.store}</p>
    </div>
  `;
}

// Функция для отображения ошибки
function showError(message) {
  document.getElementById('app').innerHTML = `
    <div class="warning">
      <p>${message}</p>
      <button onclick="showLoginForm()">Назад</button>
    </div>
  `;
}

// 2. Загружаем список разрешенных номеров
async function checkAuth() {
  try {
    console.log('Начинаем проверку авторизации...');
    const response = await fetch('test-data.json');
    
    if (!response.ok) {
      throw new Error(`Ошибка загрузки данных: ${response.status}`);
    }
    
    const employees = await response.json();
    console.log('Загружены данные сотрудников:', employees);
    
    // Проверяем, есть ли номер от Telegram
    const userPhone = window.Telegram?.WebApp?.initDataUnsafe?.user?.phone_number;
    
    if (userPhone) {
      // Если есть номер от Telegram, проверяем его
      const phoneInput = document.getElementById('phone');
      if (phoneInput) {
        phoneInput.value = userPhone;
        checkPhone();
      } else {
        showLoginForm();
      }
    } else {
      // Если нет номера, показываем форму входа
      console.log('Номер не передан, показываем форму входа');
      showLoginForm();
    }
  } catch (error) {
    console.error('Ошибка при проверке авторизации:', error);
    showMessage("⚠️ Ошибка загрузки данных: " + error.message);
  }
}

// Функция проверки телефона
async function checkPhone() {
  const phone = document.getElementById('phone').value.trim();
  if (!phone) {
    showError('Введите номер телефона');
    return;
  }

  try {
    const response = await fetch('test-data.json');
    const employees = await response.json();
    const cleanPhone = phone.replace(/\D/g, '');
    const employee = employees.find(e => e.phone.replace(/\D/g, '') === cleanPhone);

    if (employee) {
      showProfile(employee);
    } else {
      showError('Номер не найден');
    }
  } catch (error) {
    showError('Ошибка проверки данных');
  }
}

// Функция проверки логина
async function checkLogin() {
  const login = document.getElementById('login').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!login || !password) {
    showError('Введите логин и пароль');
    return;
  }

  try {
    const response = await fetch('test-data.json');
    const employees = await response.json();
    const employee = employees.find(e => e.login === login && e.password === password);

    if (employee) {
      showProfile(employee);
    } else {
      showError('Неверный логин или пароль');
    }
  } catch (error) {
    showError('Ошибка проверки данных');
  }
}

// Отображение формы входа
function showLoginForm() {
  document.getElementById('app').innerHTML = `
    <div class="auth-form">
      <h2>Вход в систему</h2>
      <input type="tel" id="phone" class="input-field" placeholder="Номер телефона (например, +79XXXXXXXXX)">
      <button onclick="checkPhone()">Войти по телефону</button>
      
      <div class="divider">или</div>
      
      <input type="text" id="login" class="input-field" placeholder="Логин">
      <input type="password" id="password" class="input-field" placeholder="Пароль">
      <button onclick="checkLogin()">Войти по логину</button>
    </div>
  `;
}

// Добавляем отладку Telegram WebApp
if (!Telegram.WebApp.initDataUnsafe.user) {
  console.log('Режим тестирования: создаем тестовые данные');
  // Только для тестирования в браузере
  Telegram.WebApp.initDataUnsafe = { 
    user: {
      phone_number: "+79253555985" // Раскомментируйте для теста с номером
    }
  };
}