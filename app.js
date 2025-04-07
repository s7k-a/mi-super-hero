Telegram.WebApp.initDataUnsafe.user = { phone_number: "+79211234567" }; // Удалите после проверки!

// 1. Ждём загрузки Telegram WebApp
Telegram.WebApp.ready();

// 2. Проверяем, запущено ли через бота
if (!Telegram.WebApp.initData) {
  document.getElementById('app').innerHTML = `
    <div style="text-align: center; margin-top: 50px;">
      <h1 style="color: #ff3333;">🚫 Ошибка доступа</h1>
      <p>Откройте приложение <strong>через бота</strong>:</p>
      <p>1. Нажмите кнопку "Start" в @Misuperhero_bot</p>
      <p>2. Затем нажмите "Личный кабинет"</p>
    </div>
  `;
  console.error("Mini App запущен не через бота!");
  return;
}

// 3. Получаем номер телефона
const userPhone = Telegram.WebApp.initDataUnsafe.user?.phone_number;
console.log("Номер из Telegram:", userPhone || "не передан");

// 4. Показываем результат
if (userPhone) {
  document.getElementById('app').innerHTML = `
    <h1 style="color: #0088cc; text-align: center; margin-top: 50px;">
      Ваш номер: ${userPhone}
    </h1>
  `;
} else {
  document.getElementById('app').innerHTML = `
    <div style="text-align: center; margin-top: 50px;">
      <h1 style="color: #ff3333;">📱 Номер не передан</h1>
      <p>Разрешите доступ к номеру в настройках Telegram</p>
    </div>
  `;
}