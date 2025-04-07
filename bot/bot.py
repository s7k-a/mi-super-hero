import os
from telegram import Update, WebAppInfo, KeyboardButton, ReplyKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv("TOKEN")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Отправляем WebApp-кнопку"""
    web_app = WebAppInfo(url="https://s7k-a.github.io/mi-super-hero/")
    keyboard = ReplyKeyboardMarkup(
        [[KeyboardButton("Личный кабинет", web_app=web_app)]],
        resize_keyboard=True,
        one_time_keyboard=True
    )
    await update.message.reply_text(
        "Добро пожаловать! Нажмите кнопку ниже:",
        reply_markup=keyboard
    )

def main():
    if not TOKEN:
        print("❌ Ошибка: Добавьте токен в файл .env")
        return

    app = Application.builder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    
    print("✅ Бот запущен. Нажмите Ctrl+C для остановки")
    app.run_polling()

if __name__ == "__main__":
    main()