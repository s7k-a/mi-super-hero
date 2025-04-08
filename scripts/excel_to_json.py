import pandas as pd
import json
import hashlib
import os
import random

def hash_password(password):
    """Хеширует пароль используя SHA-256"""
    return hashlib.sha256(str(password).encode('utf-8')).hexdigest()

def get_random_default_photo():
    """Возвращает случайное стандартное фото из набора"""
    return f"default_{random.randint(1, 10)}.jpg"

def excel_to_json(excel_file, json_file):
    """Конвертирует Excel файл в JSON с хешированием паролей"""
    # Чтение Excel файла
    df = pd.read_excel(excel_file)
    
    # Конвертация DataFrame в список словарей
    users = []
    for _, row in df.iterrows():
        user = {
            "login": row["login"],
            "password_hash": hash_password(row["password"]),
            "name": row["name"],
            "position": row["position"],
            "store": row["store"],
            "photo": get_random_default_photo()  # Назначаем случайное стандартное фото
        }
        users.append(user)
    
    # Создание директории если не существует
    os.makedirs(os.path.dirname(json_file), exist_ok=True)
    
    # Сохранение в JSON с правильной кодировкой
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(users, f, ensure_ascii=False, indent=2)

def create_default_photos():
    """Создает стандартные фото если они не существуют"""
    profiles_dir = "public/images/profiles"
    os.makedirs(profiles_dir, exist_ok=True)
    
    # Создаем 10 пустых файлов для стандартных фото
    for i in range(1, 11):
        photo_path = os.path.join(profiles_dir, f"default_{i}.jpg")
        if not os.path.exists(photo_path):
            with open(photo_path, 'w') as f:
                f.write('')
            print(f"⚠️ Создан пустой файл для стандартного фото: default_{i}.jpg")
            print(f"   Пожалуйста, замените его реальным изображением в {photo_path}")

if __name__ == "__main__":
    excel_file = "data/users.xlsx"
    json_file = "data/users.json"
    
    try:
        # Создаем стандартные фото
        create_default_photos()
        
        # Конвертируем Excel в JSON
        excel_to_json(excel_file, json_file)
        print(f"✅ Данные успешно конвертированы и сохранены в {json_file}")
    except Exception as e:
        print(f"❌ Ошибка: {str(e)}") 