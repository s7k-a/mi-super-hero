// Проверка на тестовое окружение (браузер)
const IS_TEST_ENV = !window.Telegram?.WebApp?.initDataUnsafe?.user;

// Главная функция
async function main() {
  try {
    // Инициализация Telegram WebApp
    if (window.Telegram?.WebApp) {
      Telegram.WebApp.ready();
      Telegram.WebApp.expand();
    }
    
    // Установка тестовых данных для браузера
    if (IS_TEST_ENV) {
      console.log('Запуск в тестовом режиме');
      window.Telegram = {
        WebApp: {
          initData: 'test_mode',
          initDataUnsafe: {
            user: {
              phone_number: "+79999999999"
            }
          },
          ready: () => console.log('Test ready'),
          expand: () => console.log('Test expand')
        }
      };
    }
    
    const initData = window.Telegram?.WebApp?.initData;
    const userPhone = window.Telegram?.WebApp?.initDataUnsafe?.user?.phone_number;
    
    console.log('Режим:', IS_TEST_ENV ? 'Тестовый' : 'Telegram');
    console.log('InitData:', initData);
    console.log('UserPhone:', userPhone);
    
    if (!initData) {
      showError("❌ Запустите через бота:\n1. Нажмите START\n2. Откройте 'Личный кабинет'");
      return;
    }
    
    if (!userPhone) {
      showError("📱 Разрешите доступ к номеру\nв настройках Telegram");
      return;
    }
    
    // Проверка сотрудника
    const employee = await findEmployee(userPhone);
    console.log('Найден сотрудник:', employee);
    
    if (employee) {
      showProfile(employee);
    } else {
      showError("🚫 Доступ запрещён\nВашего номера нет в базе");
    }
    
  } catch (error) {
    showError("⚠️ Ошибка системы\nПопробуйте позже");
    console.error("Ошибка:", error);
  }
}

// Поиск сотрудника
async function findEmployee(phone) {
  try {
    if (!phone) {
      console.error('Номер телефона не предоставлен');
      return null;
    }

    const cleanPhone = normalizePhone(phone);
    console.log('Поиск сотрудника по номеру:', cleanPhone);
    
    const response = await fetch('./data/employees.json');
    if (!response.ok) {
      throw new Error(`Ошибка загрузки файла: ${response.status} ${response.statusText}`);
    }
    
    const employees = await response.json();
    console.log('Загружено сотрудников:', employees.length);
    
    const found = employees.find(e => normalizePhone(e.phone) === cleanPhone);
    console.log('Результат поиска:', found ? 'Найден' : 'Не найден');
    
    return found;
  } catch (error) {
    console.error('Ошибка при поиске сотрудника:', error);
    throw error;
  }
}

// Нормализация номера телефона
function normalizePhone(phone) {
  if (!phone) return '';
  // Убираем все кроме цифр и приводим к формату 7XXXXXXXXXX
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('8')) {
    return '7' + cleaned.slice(1);
  }
  return cleaned;
}

// Показ профиля
function showProfile(employee) {
  document.getElementById('app').innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <img src="${employee.photo}" width="100" style="border-radius:50%">
      <h2>${employee.name}</h2>
      <p>${employee.position}</p>
    </div>
  `;
}

// Показ ошибки
function showError(message) {
  document.getElementById('app').innerHTML = `
    <div style="text-align: center; padding: 20px; color: red;">
      <h2>${message}</h2>
    </div>
  `;
}

// Запуск
main();
// Хранение данных (в реальном проекте используйте сервер)
const users = {
  "admin": { password: "admin123", name: "Администратор", position: "Руководитель" },
  "user1": { password: "pass123", name: "Иванов Иван", position: "Продавец" }
};

function authUser() {
  const login = document.getElementById('login').value;
  const password = document.getElementById('password').value;

  if (users[login] && users[login].password === password) {
    document.getElementById('auth-form').style.display = 'none';
    document.getElementById('profile').style.display = 'block';
    showProfile(users[login]);
  } else {
    alert("Неверный логин или пароль");
  }
}

function showProfile(user) {
  document.getElementById('profile').innerHTML = `
    <div style="text-align: center">
      <h2>${user.name}</h2>
      <p>${user.position}</p>
      <button onclick="logout()" style="padding: 5px 10px; margin-top: 20px;">
        Выйти
      </button>
    </div>
  `;
}

function logout() {
  document.getElementById('auth-form').style.display = 'block';
  document.getElementById('profile').style.display = 'none';
}