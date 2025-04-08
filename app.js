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

// Запускаем проверку
document.addEventListener('DOMContentLoaded', () => {
  console.log('Приложение запущено');
  checkAuth();
});

// 1. Проверяем номер из Telegram
const userPhone = Telegram.WebApp.initDataUnsafe.user?.phone_number;
console.log('Номер телефона из Telegram:', userPhone);

// Функция для вывода сообщений
function showMessage(message) {
  document.getElementById('app').innerHTML = `
    <div class="message">
      <p>${message}</p>
    </div>
  `;
}

// Функция для отображения профиля
function showProfile(employee) {
  document.getElementById('app').innerHTML = `
    <div class="profile">
      <img src="${employee.photo}" alt="${employee.name}" class="profile-photo">
      <h2>${employee.name}</h2>
      <p class="position">${employee.position}</p>
      <p class="store">${employee.store}</p>
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
    
    // Нормализуем номера (убираем +, пробелы)
    const cleanUserPhone = userPhone?.replace(/\D/g, '');
    console.log('Очищенный номер телефона:', cleanUserPhone);
    
    const foundEmployee = employees.find(e => 
      e.phone.replace(/\D/g, '') === cleanUserPhone
    );
    
    console.log('Результат поиска сотрудника:', foundEmployee ? 'Найден' : 'Не найден');

    if (foundEmployee) {
      // Номер есть в базе - показываем профиль
      showProfile(foundEmployee);
    } else if (userPhone) {
      // Номер передан, но не найден
      showMessage("🚫 Ваш номер не зарегистрирован");
    } else {
      // Номер не передан (открыли не через бота)
      console.log('Номер не передан, показываем форму входа');
      showLoginForm(); 
    }
  } catch (error) {
    console.error('Ошибка при проверке авторизации:', error);
    showMessage("⚠️ Ошибка загрузки данных: " + error.message);
  }
}

// 3. Форма входа для "ручного" ввода
function showLoginForm() {
  document.getElementById('app').innerHTML = `
    <div class="auth-form">
      <h2>Вход в систему</h2>
      <div class="tab-container">
        <div class="tabs">
          <button id="tab-phone" class="tab-btn active" onclick="showTab('phone')">По телефону</button>
          <button id="tab-login" class="tab-btn" onclick="showTab('login')">По логину</button>
        </div>
        
        <div id="phone-tab" class="tab-content active">
          <div class="input-group">
            <input type="tel" id="phone" placeholder="Номер телефона (например, +79XXXXXXXXX)">
            <button onclick="phoneAuth()" class="btn-primary">Проверить</button>
          </div>
        </div>
        
        <div id="login-tab" class="tab-content">
          <div class="input-group">
            <input type="text" id="login" placeholder="Логин">
            <input type="password" id="password" placeholder="Пароль">
            <button onclick="manualAuth()" class="btn-primary">Войти</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Добавляем стили
  if (!document.getElementById('auth-styles')) {
    const style = document.createElement('style');
    style.id = 'auth-styles';
    style.textContent = `
      .auth-form {
        max-width: 400px;
        margin: 20px auto;
        padding: 20px;
      }
      .tab-container { width: 100%; }
      .tabs { 
        display: flex; 
        margin-bottom: 20px;
        border-radius: 4px;
        overflow: hidden;
      }
      .tab-btn { 
        flex: 1; 
        padding: 12px; 
        cursor: pointer; 
        background: #f1f1f1; 
        border: none;
        transition: all 0.3s ease;
      }
      .tab-btn.active { 
        background: #007bff; 
        color: white; 
      }
      .tab-content { 
        display: none; 
        padding: 15px 0; 
      }
      .tab-content.active { 
        display: block; 
      }
      .input-group {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      input {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
      }
      .btn-primary {
        padding: 12px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        transition: background 0.3s ease;
      }
      .btn-primary:hover {
        background: #0056b3;
      }
    `;
    document.head.appendChild(style);
  }
}

// Функция для переключения вкладок
function showTab(tabName) {
  // Скрываем все вкладки
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Показываем нужную вкладку
  document.getElementById(`${tabName}-tab`).classList.add('active');
  document.getElementById(`tab-${tabName}`).classList.add('active');
}

// Функция для авторизации по телефону
async function phoneAuth() {
  try {
    const phone = document.getElementById('phone').value;
    console.log('Попытка входа по телефону:', phone);
    
    if (!phone) {
      showMessage("⚠️ Введите номер телефона");
      return;
    }
    
    const response = await fetch('test-data.json');
    if (!response.ok) {
      throw new Error(`Ошибка загрузки данных: ${response.status}`);
    }
    
    const employees = await response.json();
    const cleanPhone = phone.replace(/\D/g, '');
    const employee = employees.find(e => e.phone.replace(/\D/g, '') === cleanPhone);
    
    console.log('Результат проверки телефона:', employee ? 'Успешно' : 'Отказано');
    
    if (employee) {
      showProfile(employee);
    } else {
      showMessage("❌ Номер не найден в базе");
    }
  } catch (error) {
    console.error('Ошибка при авторизации по телефону:', error);
    showMessage("⚠️ Ошибка при проверке: " + error.message);
  }
}

// 4. Проверка ручного ввода
async function manualAuth() {
  try {
    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;
    
    console.log('Попытка входа с логином:', login);
    
    const response = await fetch('test-data.json');
    if (!response.ok) {
      throw new Error(`Ошибка загрузки данных: ${response.status}`);
    }
    
    const employees = await response.json();
    const employee = employees.find(e => e.login === login && e.password === password);
    
    console.log('Результат проверки логина/пароля:', employee ? 'Успешно' : 'Отказано');
    
    if (employee) {
      showProfile(employee);
    } else {
      showMessage("❌ Неверные данные");
    }
  } catch (error) {
    console.error('Ошибка при ручной авторизации:', error);
    showMessage("⚠️ Ошибка при входе: " + error.message);
  }
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