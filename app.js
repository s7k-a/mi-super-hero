// 1. Инициализация
Telegram.WebApp.ready();

// 2. Получаем номер телефона
const userPhone = Telegram.WebApp.initDataUnsafe.user?.phone_number;

// 3. Функция загрузки данных
async function loadEmployees() {
  try {
    // Для GitHub Pages используйте относительный путь
    const response = await fetch('data/employees.json');
    if (!response.ok) throw new Error('Ошибка загрузки данных');
    return await response.json();
  } catch (error) {
    console.error('Ошибка:', error);
    // Альтернативный вариант для локального тестирования
    return [
      {
        "phone": "+79253555985",
        "name": "Калинин Сергей",
        "position": "Project Manager",
        "store": "Москва, Офис",
        "photo": "logo.jpg"
      }
    ];
  }
}

// 4. Проверка доступа
async function checkEmployeeAccess() {
  const employees = await loadEmployees();
  const employee = employees.find(emp => 
    emp.phone.replace(/\D/g, '') === userPhone?.replace(/\D/g, '')
  );

  if (employee) {
    renderProfile(employee);
  } else {
    try {
      await Telegram.WebApp.showAlert("Доступ запрещён");
      Telegram.WebApp.close();
    } catch (e) {
      console.error("Ошибка WebApp:", e);
      alert("Доступ запрещён"); // Фолбэк для браузера
    }
  }
}

// 5. Проверяем режим запуска
if (window.location.protocol === 'file:') {
  console.warn("Запуск через file:// - используйте локальный сервер");
  renderProfile({
    name: "Локальный тест",
    position: "Режим разработки",
    store: "Тестовые данные",
    photo: "logo.jpg"
  });
} else if (userPhone) {
  checkEmployeeAccess();
} else {
  Telegram.WebApp.requestContact();
}