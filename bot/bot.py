import os
from telegram.ext import Application, CommandHandler
from telegram import Update, WebAppInfo, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import ContextTypes
from dotenv import load_dotenv

# Загружаем токен
load_dotenv()
TOKEN = os.getenv("TOKEN")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик команды /start"""
    # Используем HTTPS URL для Telegram WebApp
    web_app = WebAppInfo(url="https://s7k-a.github.io/mi-super-hero/")
    button = KeyboardButton(
        text="Личный кабинет",
        web_app=web_app
    )
    keyboard = ReplyKeyboardMarkup(
        keyboard=[[button]],
        resize_keyboard=True
    )
    await update.message.reply_text(
        "Добро пожаловать! Нажмите кнопку ниже, чтобы открыть личный кабинет:",
        reply_markup=keyboard
    )

def main():
    """Запуск бота"""
    if not TOKEN:
        print("Ошибка: Токен бота не найден в файле .env")
        return

    # Создаем и запускаем бота
    app = Application.builder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    print("Бот запущен. Нажмите Ctrl+C для остановки.")
    app.run_polling()

if __name__ == '__main__':
    main()