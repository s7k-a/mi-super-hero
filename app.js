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

// Инициализация стилей
const styles = `
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
  .btn:hover {
    background: #0056b3;
  }
  .message {
    padding: 15px;
    margin: 10px 0;
    border-radius: 4px;
    text-align: center;
  }
  .error {
    background: #ffe6e6;
    color: #ff0000;
  }
  .profile {
    text-align: center;
  }
  .profile-photo {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin: 10px auto;
  }
`;

// Добавляем стили на страницу
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Запускаем проверку
document.addEventListener('DOMContentLoaded', () => {
  console.log('Приложение запущено');
  checkAuth();
});

// 1. Проверяем номер из Telegram
const userPhone = Telegram.WebApp.initDataUnsafe.user?.phone_number;
console.log('Номер телефона из Telegram:', userPhone);

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
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container profile">
      <img src="${employee.photo}" alt="${employee.name}" class="profile-photo">
      <h2>${employee.name}</h2>
      <p>${employee.position}</p>
      <p>${employee.store}</p>
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

// Функция для отображения формы входа
function showLoginForm() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container">
      <h2>Вход в систему</h2>
      <input type="tel" id="phone" class="input-field" placeholder="Номер телефона (например, +79XXXXXXXXX)">
      <button class="btn" onclick="checkPhone()">Войти по телефону</button>
      
      <div style="margin: 20px 0; text-align: center;">или</div>
      
      <input type="text" id="login" class="input-field" placeholder="Логин">
      <input type="password" id="password" class="input-field" placeholder="Пароль">
      <button class="btn" onclick="checkLoginPassword()">Войти по логину</button>
    </div>
  `;
}

// Функция проверки телефона
async function checkPhone() {
  const phoneInput = document.getElementById('phone');
  const phone = phoneInput.value.trim();
  
  if (!phone) {
    showMessage('Введите номер телефона', true);
    return;
  }

  try {
    const response = await fetch('test-data.json');
    if (!response.ok) throw new Error('Ошибка загрузки данных');
    
    const employees = await response.json();
    const cleanPhone = phone.replace(/\D/g, '');
    const employee = employees.find(e => e.phone.replace(/\D/g, '') === cleanPhone);

    if (employee) {
      showProfile(employee);
    } else {
      showMessage('Номер не найден в базе', true);
    }
  } catch (error) {
    showMessage('Ошибка при проверке данных', true);
  }
}

// Функция проверки логина и пароля
async function checkLoginPassword() {
  const login = document.getElementById('login').value.trim();
  const password = document.getElementById('password').value.trim();
  
  if (!login || !password) {
    showMessage('Введите логин и пароль', true);
    return;
  }

  try {
    const response = await fetch('test-data.json');
    if (!response.ok) throw new Error('Ошибка загрузки данных');
    
    const employees = await response.json();
    const employee = employees.find(e => e.login === login && e.password === password);

    if (employee) {
      showProfile(employee);
    } else {
      showMessage('Неверный логин или пароль', true);
    }
  } catch (error) {
    showMessage('Ошибка при проверке данных', true);
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