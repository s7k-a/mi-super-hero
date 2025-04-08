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
  showLoginForm();
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

// Функция для хеширования пароля (SHA-256)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
    const response = await fetch('data/users.json');
    const users = await response.json();
    const hashedPassword = await hashPassword(password);
    const user = users.find(u => u.login === login && u.password_hash === hashedPassword);

    if (user) {
      showProfile(user);
    } else {
      showError('Неверный логин или пароль');
    }
  } catch (error) {
    console.error('Ошибка при авторизации:', error);
    showError('Ошибка проверки данных');
  }
}

// Отображение формы входа
function showLoginForm() {
  document.getElementById('app').innerHTML = `
    <div class="auth-form">
      <h2>Вход в систему</h2>
      <input type="text" id="login" class="input-field" placeholder="Логин">
      <input type="password" id="password" class="input-field" placeholder="Пароль">
      <button onclick="checkLogin()" class="btn">Войти</button>
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