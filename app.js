// Главная функция
async function main() {
  try {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    
    // Для ТЕСТА в браузере - раскомментируйте:
    // Telegram.WebApp.initDataUnsafe = { user: { phone_number: "+79253555985" } };
    
    const initData = Telegram.WebApp.initData;
    const userPhone = Telegram.WebApp.initDataUnsafe.user?.phone_number;
    
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
  const cleanPhone = phone.replace(/\D/g, '');
  const response = await fetch('data/employees.json');
  const employees = await response.json();
  return employees.find(e => e.phone.replace(/\D/g, '') === cleanPhone);
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