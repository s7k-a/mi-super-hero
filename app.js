// 1. Ждем загрузки Telegram WebApp
Telegram.WebApp.ready();

// 2. Получаем номер телефона
const userPhone = Telegram.WebApp.initDataUnsafe.user?.phone_number;

// 3. Проверяем и выводим в консоль
console.log("Номер из Telegram:", userPhone || "не получен");

if (userPhone) {
  document.getElementById('app').innerHTML = `
    <h1 style="color: #0088cc; text-align: center; margin-top: 50px;">
      Номер получен: ${userPhone}
    </h1>
  `;
} else {
  document.getElementById('app').innerHTML = `
    <h1 style="color: #ff3333; text-align: center; margin-top: 50px;">
      Номер не передан. Откройте через бота!
    </h1>
  `;
}