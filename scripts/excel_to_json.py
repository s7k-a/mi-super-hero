import pandas as pd
import json
import hashlib
import os

def hash_password(password):
    """Хеширует пароль используя SHA-256"""
    return hashlib.sha256(str(password).encode()).hexdigest()

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
            "photo": row["photo"] if "photo" in row else "default.jpg"
        }
        users.append(user)
    
    # Создание директории если не существует
    os.makedirs(os.path.dirname(json_file), exist_ok=True)
    
    # Сохранение в JSON
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(users, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    excel_file = "data/users.xlsx"  # Путь к Excel файлу
    json_file = "data/users.json"   # Путь к JSON файлу
    
    try:
        excel_to_json(excel_file, json_file)
        print(f"✅ Данные успешно конвертированы и сохранены в {json_file}")
    except Exception as e:
        print(f"❌ Ошибка: {str(e)}") 