# Система управления пользователями

## Структура проекта
```
├── public/                 # Статические файлы
│   ├── images/            # Изображения
│   │   └── profiles/      # Фотографии пользователей
│   ├── css/               # Стили
│   └── js/                # JavaScript файлы
├── data/                  # Данные приложения
│   └── users.json        # База данных пользователей
├── scripts/              # Скрипты обработки данных
│   └── excel_to_json.py  # Конвертация Excel в JSON
├── server/               # Серверная часть
│   └── main.py          # Основной серверный код
├── index.html           # Главная страница
├── admin.html          # Административная панель
└── README.md           # Документация
```

## Зависимости проекта
- Frontend:
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Fetch API для HTTP запросов

- Backend:
  - Python 3.8+
  - FastAPI
  - Uvicorn
  - Pandas
  - Openpyxl

## Блок-схема взаимодействия
```
[Frontend] <-> [FastAPI Server] <-> [Data Processing] <-> [Storage]
   │              │                    │                    │
   │              │                    │                    │
   ├─ Запросы ────┘                    │                    │
   │                                   │                    │
   ├─ Загрузка файлов ─────────────────┘                    │
   │                                                        │
   └─ Получение данных ─────────────────────────────────────┘
```

## Основные функции
1. Административная панель:
   - Просмотр списка пользователей
   - Загрузка новых пользователей через Excel
   - Управление фотографиями пользователей

2. Обработка данных:
   - Конвертация Excel в JSON
   - Валидация данных пользователей
   - Хеширование паролей

3. API Endpoints:
   - GET /api/users - получение списка пользователей
   - POST /api/upload-users - загрузка новых пользователей
   - POST /api/upload-photo - загрузка фотографий
   - GET /api/photo/{user_id} - получение фотографии пользователя

## Безопасность
- Хеширование паролей с использованием SHA-256
- Валидация загружаемых файлов
- Проверка типов файлов
- CORS настройки для API

## Установка и запуск
1. Установка зависимостей:
```bash
pip install -r requirements.txt
```

2. Запуск сервера:
```bash
python server/main.py
```

3. Открыть в браузере:
```
http://localhost:8081
```

## Разработка
- Для добавления новых функций используйте существующую структуру
- При изменении API обновляйте документацию
- Тестируйте изменения на локальной копии
- Следуйте PEP 8 для Python кода
- Используйте ESLint для JavaScript 