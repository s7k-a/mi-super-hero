import telebot
from telebot.types import WebAppInfo, ReplyKeyboardMarkup

bot = telebot.TeleBot("7795297927:AAECmuYwQ2CJNrv6UZBb154g2e9NjcqltrQ")

@bot.message_handler(commands=['start'])
def start(message):
    # Создаем кнопку с ссылкой на ваше приложение
    markup = ReplyKeyboardMarkup(resize_keyboard=True)
    btn = telebot.types.KeyboardButton(
        text="📱 Личный кабинет",
        web_app=WebAppInfo(url="https://s7k-a.github.io/mi-super-hero/")
    )
    markup.add(btn)
    
    bot.send_message(
        message.chat.id,
        "Нажмите кнопку ниже для входа:",
        reply_markup=markup
    )

bot.polling()