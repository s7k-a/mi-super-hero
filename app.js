// Инициализация приложения
function initApp() {
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
  Telegram.WebApp.setHeaderColor('#1e1e1e');
  Telegram.WebApp.setBackgroundColor('#1e1e1e');
  
  // Проверяем параметры запуска
  const initData = Telegram.WebApp.initDataUnsafe;
  
  // Для теста (удалить в продакшене)
  if (!initData.user?.phone_number && window.location.search.includes('test')) {
    initData.user = { phone_number: '+79211234567' };
  }
  
  checkAuth(initData);
}

// Проверка авторизации
async function checkAuth(initData) {
  const phone = initData.user?.phone_number;
  
  if (!phone) {
    showPhoneWarning();
    return;
  }
  
  try {
    const employee = await verifyEmployee(phone);
    if (employee) {
      renderProfile(employee);
    } else {
      showAccessDenied();
    }
  } catch (error) {
    console.error('Auth error:', error);
    showDataError();
  }
}

// Проверка сотрудника
async function verifyEmployee(phone) {
  const response = await fetch('data/employees.json');
  const employees = await response.json();
  const cleanPhone = phone.replace(/\D/g, '');
  
  return employees.find(emp => 
    emp.phone.replace(/\D/g, '') === cleanPhone
  );
}

// UI компоненты
function showPhoneWarning() {
  document.getElementById('app').innerHTML = `
    <div class="warning">
      <h2>🔒 Доступ через Telegram</h2>
      <p>Для входа откройте это приложение через <strong>бота компании</strong></p>
      <p>Или запустите команду в боте: <code>/startapp</code></p>
      <button onclick="Telegram.WebApp.close()">Закрыть</button>
    </div>
  `;
}

function showAccessDenied() {
  document.getElementById('app').innerHTML = `
    <div class="warning">
      <h2>⛔ Доступ запрещён</h2>
      <p>Ваш номер телефона не зарегистрирован в системе</p>
      <button onclick="Telegram.WebApp.close()">Закрыть</button>
    </div>
  `;
}

function showDataError() {
  document.getElementById('app').innerHTML = `
    <div class="warning">
      <h2>⚠️ Ошибка системы</h2>
      <p>Попробуйте позже или обратитесь в поддержку</p>
      <button onclick="Telegram.WebApp.close()">Закрыть</button>
    </div>
  `;
}

function renderProfile(employee) {
  document.getElementById('app').innerHTML = `
    <div class="profile">
      <img src="${employee.photo || 'logo.jpg'}" alt="Фото">
      <h1>${employee.name}</h1>
      <p>${employee.position}, ${employee.store}</p>
      <p>Телефон: ${employee.phone}</p>
    </div>
  `;
}

// Запускаем приложение
initApp();