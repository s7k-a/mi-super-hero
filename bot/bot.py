import telebot
bot = telebot.TeleBot("7795297927:AAECmuYwQ2CJNrv6UZBb154g2e9NjcqltrQ")

@bot.message_handler(commands=['start'])
def start(message):
    bot.send_message(message.chat.id, "Привет!")

bot.polling()