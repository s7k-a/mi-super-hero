import xlwt
import os
from pathlib import Path

def create_example_excel():
    # Создаем рабочую книгу
    workbook = xlwt.Workbook()
    sheet = workbook.add_sheet('Users')
    
    # Заголовки
    headers = ['login', 'password', 'name', 'position', 'store']
    for col, header in enumerate(headers):
        sheet.write(0, col, header)
    
    # Данные
    data = [
        ['admin', 'admin123', 'Ишвец Ижнец', 'На дуде игрец', 'Магазин'],
        ['user1', 'user123', 'Иван Иванов', 'Менеджер', 'Склад']
    ]
    
    # Записываем данные
    for row, user_data in enumerate(data, start=1):
        for col, value in enumerate(user_data):
            sheet.write(row, col, value)
    
    # Создаем директорию если не существует
    output_dir = Path('data')
    output_dir.mkdir(exist_ok=True)
    
    # Сохраняем файл
    excel_file = output_dir / 'users.xlsx'
    workbook.save(str(excel_file))
    print(f"✅ Создан пример Excel файла: {excel_file}")

if __name__ == "__main__":
    create_example_excel() 