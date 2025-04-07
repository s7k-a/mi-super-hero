// 1. Делаем главную функцию асинхронной
async function initApp() {
  // 2. Инициализация Telegram WebApp
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();

  // 3. Загрузка данных (теперь с правильным await)
  const employees = await loadEmployees();
  const userPhone = Telegram.WebApp.initDataUnsafe.user?.phone_number;

  // 4. Проверка номера
  if (userPhone) {
    const employee = employees.find(e => 
      e.phone.replace(/\D/g, '') === userPhone.replace(/\D/g, '')
    );
    
    if (employee) {
      showProfile(employee);
    } else {
      showMessage("Доступ запрещён: номер не найден");
    }
  } else {
    showMessage("Откройте приложение через бота");
  }
}

// 5. Функция загрузки данных
async function loadEmployees() {
  try {
    const dataUrl = window.location.hostname === 'localhost' 
      ? 'data/employees.json' 
      : 'test-data.json';
      
    const response = await fetch(dataUrl);
    return await response.json();
  } catch (error) {
    console.error("Ошибка загрузки:", error);
    return [];
  }
}

// 6. Вспомогательные функции (без изменений)
function showProfile(employee) {
  document.getElementById('app').innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <img src="${employee.photo}" width="100" style="border-radius: 50%">
      <h1>${employee.name}</h1>
      <p>${employee.position}</p>
    </div>
  `;
}

function showMessage(text) {
  document.getElementById('app').innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <h2>${text}</h2>
    </div>
  `;
}

// 7. Запускаем приложение
initApp();