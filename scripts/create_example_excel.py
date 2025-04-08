import pandas as pd
import os

# Создаем пример данных
data = {
    'login': ['admin', 'user1'],
    'password': ['admin123', 'password123'],
    'name': ['Ишвец Ижнец', 'Иван Иванов'],
    'position': ['На дуде игрец', 'Менеджер'],
    'store': ['Магазин', 'Склад']
}

# Создаем DataFrame
df = pd.DataFrame(data)

# Создаем директорию если не существует
os.makedirs('data', exist_ok=True)

# Сохраняем в Excel
excel_file = 'data/users.xlsx'
df.to_excel(excel_file, index=False)
print(f"✅ Создан пример Excel файла: {excel_file}") 