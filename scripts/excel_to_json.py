import xlrd
import json
import hashlib
import os
import random
from pathlib import Path

def hash_password(password):
    """Хеширует пароль используя SHA-256"""
    return hashlib.sha256(str(password).encode('utf-8')).hexdigest()

def get_random_default_photo():
    """Возвращает случайное стандартное фото из набора"""
    return f"default_{random.randint(1, 10)}.jpg"

def excel_to_json(excel_file):
    """
    Конвертирует Excel файл в JSON формат
    """
    try:
        # Открываем Excel файл
        workbook = xlrd.open_workbook(excel_file)
        sheet = workbook.sheet_by_index(0)
        
        # Получаем заголовки
        headers = [str(sheet.cell_value(0, col)).strip() for col in range(sheet.ncols)]
        
        # Создаем список пользователей
        users = []
        for row in range(1, sheet.nrows):
            user = {}
            for col in range(sheet.ncols):
                # Получаем значение ячейки
                value = sheet.cell_value(row, col)
                
                # Преобразуем даты в строки
                if sheet.cell_type(row, col) == xlrd.XL_CELL_DATE:
                    value = xlrd.xldate_as_datetime(value, workbook.datemode).strftime('%Y-%m-%d')
                
                # Преобразуем числа в строки
                elif sheet.cell_type(row, col) == xlrd.XL_CELL_NUMBER:
                    value = str(int(value)) if value.is_integer() else str(value)
                
                # Добавляем значение в словарь пользователя
                user[headers[col]] = value
            
            # Добавляем хеш пароля
            if 'password' in user:
                user['password_hash'] = user.pop('password')
            
            users.append(user)
        
        return users
        
    except Exception as e:
        print(f"Ошибка при конвертации Excel в JSON: {e}")
        raise

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
        users = excel_to_json(excel_file)
        print(f"✅ Данные успешно конвертированы и сохранены в {json_file}")
        
        # Создание директории если не существует
        os.makedirs(os.path.dirname(json_file), exist_ok=True)
        
        # Сохранение в JSON с правильной кодировкой
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(users, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"❌ Ошибка: {str(e)}") 