// 1. Ждем загрузки Telegram WebApp
Telegram.WebApp.ready();

// 2. Получаем номер телефона из Telegram (закомментировано для теста)
// const userPhone = Telegram.WebApp.initDataUnsafe.user?.phone_number;

// Для теста в браузере - раскомментируйте следующую строку:
const userPhone = "+79211234567"; // Тестовый номер из employees.json

// 3. Асинхронная функция проверки сотрудника
async function checkEmployeeAccess() {
  try {
    if (!userPhone) {
      // Если номер не получен (например, в браузере без мока)
      console.warn("Номер телефона недоступен");
      
      // Вариант 1: Показать кнопку запроса номера в Telegram
      if (Telegram.WebApp.platform !== "tdesktop") {
        Telegram.WebApp.requestContact(); // Покажет кнопку "Поделиться номером"
      }
      
      // Вариант 2: Запросить номер вручную (для теста)
      const manualPhone = prompt("Введите номер для теста (формат: +79211234567):");
      if (manualPhone) {
        const response = await fetch('data/employees.json');
        const employees = await response.json();
        const employee = employees.find(emp => emp.phone === manualPhone);
        processAuthResult(employee);
      }
      return;
    }

    // Основная проверка номера
    const response = await fetch('data/employees.json');
    const employees = await response.json();
    const employee = employees.find(emp => {
      // Нормализация номеров для сравнения
      const cleanUserPhone = userPhone.replace(/\D/g, '');
      const cleanEmpPhone = emp.phone.replace(/\D/g, '');
      return cleanUserPhone === cleanEmpPhone;
    });
    
    processAuthResult(employee);
    
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
    Telegram.WebApp.showAlert("Ошибка системы. Попробуйте позже.");
  }
}

// Обработка результата проверки
function processAuthResult(employee) {
  if (employee) {
    console.log("Доступ разрешен!", employee);
    renderProfile(employee);
    
    // Показываем основное содержимое
    Telegram.WebApp.MainButton.setText("Мой профиль");
    Telegram.WebApp.MainButton.show();
  } else {
    console.warn("Доступ запрещен для номера:", userPhone);
    Telegram.WebApp.showAlert("Доступ запрещён: вас нет в базе!");
    Telegram.WebApp.MainButton.setText("Выход");
    Telegram.WebApp.MainButton.onClick(() => Telegram.WebApp.close());
    Telegram.WebApp.MainButton.show();
  }
}

// 4. Вызываем функцию проверки
checkEmployeeAccess();

// 5. Функция отображения профиля
function renderProfile(employee) {
  document.getElementById('app').innerHTML = `
    <div class="profile">
      <img src="${employee.photo || 'logo.jpg'}" alt="Фото">
      <h1>${employee.name}</h1>
      <p>${employee.position}, ${employee.store}</p>
      <div class="stats">
        <p>Стаж: ${employee.experience || 'не указан'}</p>
      </div>
    </div>
  `;
}

// Для теста в браузере - имитируем Telegram WebApp
if (typeof Telegram === 'undefined') {
  console.warn("Telegram WebApp не обнаружен, запуск в тестовом режиме");
  window.Telegram = {
    WebApp: {
      ready: () => console.log("TWA ready"),
      initDataUnsafe: {},
      showAlert: alert,
      MainButton: {
        setText: console.log,
        show: () => console.log("MainButton shown"),
        onClick: console.log
      },
      requestContact: () => console.log("Request contact button"),
      platform: "browser"
    }
  };
}