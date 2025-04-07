// 1. Ждем загрузки Telegram WebApp
Telegram.WebApp.ready();

// 2. Получаем номер телефона из Telegram
const userPhone = Telegram.WebApp.initDataUnsafe.user?.phone_number;

// 3. Загружаем базу сотрудников (локальный JSON)
async function verifyEmployee(phone) {
  const response = await fetch('data/employees.json');
  const employees = await response.json();
  return employees.find(emp => emp.phone === phone);
}

// 4. Проверяем доступ
if (userPhone) {
  const employee = await verifyEmployee(userPhone);
  if (employee) {
    console.log("Доступ разрешен!", employee);
    renderProfile(employee); // Покажем профиль (шаг 3)
  } else {
    Telegram.WebApp.showAlert("Доступ запрещён: вас нет в базе!");
    Telegram.WebApp.close(); // Закрываем Mini App
  }
}

function renderProfile(employee) {
    document.getElementById('app').innerHTML = `
      <div class="profile">
        <img src="${employee.photo || 'logo.jpg'}" alt="Фото">
        <h1>${employee.name}</h1>
        <p>${employee.position}, ${employee.store}</p>
      </div>
    `;
  }