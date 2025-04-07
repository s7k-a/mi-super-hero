// 1. Инициализация
Telegram.WebApp.ready();
Telegram.WebApp.expand(); // Раскрываем на весь экран

// 2. Проверяем доступность номера телефона
function checkAuth() {
  const user = Telegram.WebApp.initDataUnsafe.user;
  
  // Если номер есть - проверяем доступ
  if (user?.phone_number) {
    verifyEmployee(user.phone_number);
  } 
  // Если номера нет - показываем инструкцию
  else {
    showPhoneWarning();
  }
}

// 3. Проверка сотрудника
async function verifyEmployee(phone) {
  try {
    // Для GitHub Pages используем относительный путь
    const response = await fetch('data/employees.json');
    const employees = await response.json();
    
    const cleanPhone = phone.replace(/\D/g, '');
    const employee = employees.find(emp => 
      emp.phone.replace(/\D/g, '') === cleanPhone
    );
    
    if (employee) {
      renderProfile(employee);
    } else {
      showAccessDenied();
    }
  } catch (error) {
    console.error("Ошибка:", error);
    showDataError();
  }
}

// 4. UI функции
function showPhoneWarning() {
  document.getElementById('app').innerHTML = `
    <div class="warning">
      <h2>Доступ через Telegram</h2>
      <p>Для входа откройте это приложение через бота компании</p>
      <button onclick="Telegram.WebApp.close()">Закрыть</button>
    </div>
  `;
}

function showAccessDenied() {
  document.getElementById('app').innerHTML = `
    <div class="warning">
      <h2>Доступ запрещён</h2>
      <p>Ваш номер не найден в системе</p>
      <button onclick="Telegram.WebApp.close()">Закрыть</button>
    </div>
  `;
}

function showDataError() {
  document.getElementById('app').innerHTML = `
    <div class="warning">
      <h2>Ошибка загрузки</h2>
      <p>Попробуйте позже</p>
      <button onclick="Telegram.WebApp.close()">Закрыть</button>
    </div>
  `;
}

// 5. Запускаем проверку
checkAuth();