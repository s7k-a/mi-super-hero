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
  .photo-container {
    position: relative;
    width: 150px;
    margin: 0 auto;
  }
  .profile img {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
    margin: 10px auto;
    border: 3px solid var(--accent-color);
  }
  .photo-btn {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    background: var(--accent-color);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .photo-container:hover .photo-btn {
    opacity: 1;
  }
  .message {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    border-radius: 5px;
    background: var(--accent-color);
    color: white;
    z-index: 1000;
    animation: fadeInOut 3s forwards;
  }
  .message.error {
    background: #ff4444;
  }
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translate(-50%, -20px); }
    10% { opacity: 1; transform: translate(-50%, 0); }
    90% { opacity: 1; transform: translate(-50%, 0); }
    100% { opacity: 0; transform: translate(-50%, -20px); }
  }
</style>
`;

// Запускаем проверку
document.addEventListener('DOMContentLoaded', () => {
  console.log('Приложение запущено');
  showLoginForm();
});

// Конфигурация API
const API_BASE_URL = 'http://localhost:8081'; // Изменено на порт 8081

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

// Функция для загрузки фото
async function uploadPhoto(file, userId) {
  try {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('userId', userId);

    const response = await fetch(`${API_BASE_URL}/api/upload-photo`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Ошибка загрузки фото');
    }

    const result = await response.json();
    return result.photoUrl;
  } catch (error) {
    console.error('Ошибка при загрузке фото:', error);
    showMessage(error.message || 'Ошибка при загрузке фото', true);
    return null;
  }
}

// Функция для получения URL фото пользователя
function getUserPhotoUrl(userId) {
  return `${API_BASE_URL}/api/photo/${userId}`;
}

// Функция для отображения профиля
function showProfile(user) {
  const photoUrl = getUserPhotoUrl(user.login);
  
  document.getElementById('app').innerHTML = `
    <div class="profile">
      <div class="photo-container">
        <img src="${photoUrl}" alt="${user.name}" id="profile-photo">
        <input type="file" id="photo-upload" accept="image/*" style="display: none">
        <button class="btn photo-btn" onclick="document.getElementById('photo-upload').click()">
          Изменить фото
        </button>
      </div>
      <h2>${user.name}</h2>
      <p>${user.position}</p>
      <p>${user.store}</p>
    </div>
  `;

  // Показываем кнопку административной панели только для администратора
  const adminLink = document.getElementById('admin-link');
  if (user.login === 'admin') {
    adminLink.style.display = 'block';
  } else {
    adminLink.style.display = 'none';
  }

  // Обработчик загрузки фото
  document.getElementById('photo-upload').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('Размер файла не должен превышать 5MB', true);
      return;
    }
    
    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      showMessage('Пожалуйста, выберите изображение', true);
      return;
    }
    
    // Показываем индикатор загрузки
    const img = document.getElementById('profile-photo');
    img.style.opacity = '0.5';

    try {
      // Загружаем фото
      const newPhotoUrl = await uploadPhoto(file, user.login);
      if (newPhotoUrl) {
        // Обновляем фото на странице
        img.src = getUserPhotoUrl(user.login) + '?t=' + new Date().getTime();
        showMessage('Фото успешно обновлено');
      }
    } finally {
      // Возвращаем нормальную прозрачность
      img.style.opacity = '1';
    }
  });
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
    console.log('Начинаем процесс авторизации...');
    const response = await fetch('data/users.json');
    
    if (!response.ok) {
      console.error('Ошибка загрузки данных:', response.status, response.statusText);
      throw new Error('Ошибка загрузки данных');
    }
    
    const users = await response.json();
    console.log('Загружены данные пользователей:', users);
    
    const hashedPassword = await hashPassword(password);
    console.log('Попытка входа:', { 
      login, 
      hashedPassword,
      availableLogins: users.map(u => u.login),
      matchingUser: users.find(u => u.login === login)
    });
    
    const user = users.find(u => u.login === login && u.password_hash === hashedPassword);

    if (user) {
      console.log('Успешная авторизация:', user);
      showProfile(user);
    } else {
      console.log('Неверные учетные данные');
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