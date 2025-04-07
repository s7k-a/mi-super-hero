// 1. Проверяем номер из Telegram
const userPhone = Telegram.WebApp.initDataUnsafe.user?.phone_number;

// 2. Загружаем список разрешенных номеров
async function checkAuth() {
  try {
    const response = await fetch('test-data.json');
    const employees = await response.json();
    
    // Нормализуем номера (убираем +, пробелы)
    const cleanUserPhone = userPhone?.replace(/\D/g, '');
    const foundEmployee = employees.find(e => 
      e.phone.replace(/\D/g, '') === cleanUserPhone
    );

    if (foundEmployee) {
      // Номер есть в базе - показываем профиль
      showProfile(foundEmployee);
    } else if (userPhone) {
      // Номер передан, но не найден
      showMessage("🚫 Ваш номер не зарегистрирован");
    } else {
      // Номер не передан (открыли не через бота)
      showLoginForm(); 
    }
  } catch (error) {
    showMessage("⚠️ Ошибка загрузки данных");
  }
}

// 3. Форма входа для "ручного" ввода
function showLoginForm() {
  document.getElementById('app').innerHTML = `
    <div class="auth-form">
      <h2>Вход по логину/паролю</h2>
      <input type="text" id="login" placeholder="Логин">
      <input type="password" id="password" placeholder="Пароль">
      <button onclick="manualAuth()">Войти</button>
    </div>
  `;
}

// 4. Проверка ручного ввода
async function manualAuth() {
  const login = document.getElementById('login').value;
  const password = document.getElementById('password').value;
  
  const response = await fetch('test-data.json');
  const employees = await response.json();
  const employee = employees.find(e => e.login === login && e.password === password);
  
  employee ? showProfile(employee) : showMessage("❌ Неверные данные");
}

// Запускаем проверку
checkAuth();