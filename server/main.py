from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
import shutil
import os
import sys
from pathlib import Path
import random
import json
import logging
import hashlib
import pandas as pd
from openpyxl import Workbook
from typing import List, Dict

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('server.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Добавляем корневую директорию проекта в путь Python
root_dir = Path(__file__).parent.parent
sys.path.append(str(root_dir))

# Инициализация FastAPI приложения
app = FastAPI(
    title="User Management System",
    description="API для управления пользователями и их фотографиями",
    version="1.0.0"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Определение путей
BASE_DIR = Path(".")
PUBLIC_DIR = BASE_DIR / "public"
PROFILES_DIR = PUBLIC_DIR / "images" / "profiles"
DATA_DIR = BASE_DIR / "data"

# Создание необходимых директорий
PROFILES_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Создание стандартных фото
for i in range(1, 6):
    default_photo = PROFILES_DIR / f"default_{i}.jpg"
    if not default_photo.exists():
        # Создаем пустой файл для стандартных фото
        with open(default_photo, "wb") as f:
            f.write(b"")

def hash_password(password: str) -> str:
    """Хеширует пароль с помощью SHA-256"""
    return hashlib.sha256(str(password).encode('utf-8')).hexdigest()

def get_random_default_photo() -> str:
    """Возвращает случайное стандартное фото из набора"""
    default_photos = [
        "default_1.jpg",
        "default_2.jpg",
        "default_3.jpg",
        "default_4.jpg",
        "default_5.jpg"
    ]
    return random.choice(default_photos)

@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Возвращает главную страницу приложения"""
    try:
        with open("index.html", "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        logger.error(f"Ошибка при загрузке главной страницы: {e}")
        raise HTTPException(status_code=500, detail="Ошибка загрузки страницы")

@app.post("/api/upload-photo")
async def upload_photo(photo: UploadFile = File(...), userId: str = Form(...)):
    """
    Загружает фотографию пользователя
    
    Args:
        photo (UploadFile): Файл фотографии
        userId (str): ID пользователя
        
    Returns:
        dict: URL загруженной фотографии
    """
    try:
        if not photo.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Файл должен быть изображением")

        file_extension = Path(photo.filename).suffix.lower()
        if file_extension not in ['.jpg', '.jpeg', '.png', '.gif']:
            raise HTTPException(status_code=400, detail="Неподдерживаемый формат файла")

        photo_filename = f"{userId}{file_extension}"
        file_path = PROFILES_DIR / photo_filename

        with file_path.open("wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)

        logger.info(f"Фото успешно загружено для пользователя {userId}")
        return {"photoUrl": f"/public/images/profiles/{photo_filename}"}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Ошибка при загрузке фото: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/photo/{user_id}")
async def get_user_photo(user_id: str):
    """Возвращает фотографию пользователя"""
    try:
        # Проверяем существование фото пользователя
        for ext in ['.jpg', '.jpeg', '.png', '.gif']:
            photo_path = PROFILES_DIR / f"{user_id}{ext}"
            if photo_path.exists():
                return FileResponse(photo_path)
        
        # Если фото не найдено, возвращаем стандартное
        default_photo = PROFILES_DIR / get_random_default_photo()
        if default_photo.exists():
            return FileResponse(default_photo)
        else:
            raise HTTPException(status_code=404, detail="Фото не найдено")
    except Exception as e:
        logger.error(f"Ошибка при получении фото: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin", response_class=HTMLResponse)
async def admin_panel():
    """Возвращает страницу административной панели"""
    try:
        with open("admin.html", "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        logger.error(f"Ошибка при загрузке админ-панели: {e}")
        raise HTTPException(status_code=500, detail="Ошибка загрузки страницы")

@app.get("/api/users")
async def get_users() -> List[Dict]:
    """Возвращает список всех пользователей"""
    try:
        json_file = DATA_DIR / "users.json"
        if not json_file.exists():
            default_users = [
                {
                    "login": "admin",
                    "password_hash": hash_password("admin123"),
                    "name": "Администратор",
                    "position": "Администратор",
                    "store": "Главный офис",
                    "photo": "default_1.jpg"
                }
            ]
            with json_file.open("w", encoding="utf-8") as f:
                json.dump(default_users, f, ensure_ascii=False, indent=2)
            logger.info("Создан файл users.json с пользователем по умолчанию")
            return default_users
        
        with json_file.open("r", encoding="utf-8") as f:
            users = json.load(f)
        return users
    except Exception as e:
        logger.error(f"Ошибка при получении пользователей: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload-users")
async def upload_users(file: UploadFile = File(...)):
    """Загружает и обрабатывает Excel файл с пользователями"""
    try:
        logger.info(f"Начало загрузки файла: {file.filename}")
        
        if not file.filename.endswith('.xlsx'):
            raise HTTPException(status_code=400, detail="Файл должен быть в формате Excel (.xlsx)")
        
        # Создаем временный файл
        temp_file = DATA_DIR / f"temp_{random.randint(1000, 9999)}.xlsx"
        logger.info(f"Сохранение во временный файл: {temp_file}")
        
        with temp_file.open("wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        logger.info("Файл успешно сохранен")
        
        try:
            # Читаем Excel файл
            df = pd.read_excel(temp_file, engine='openpyxl')
            
            # Проверяем наличие необходимых столбцов
            required_columns = ['login', 'password', 'name', 'position', 'store']
            if not all(col in df.columns for col in required_columns):
                raise ValueError("Файл должен содержать все необходимые столбцы: login, password, name, position, store")
            
            # Конвертируем в список словарей
            users = []
            for _, row in df.iterrows():
                user = {
                    "login": str(row['login']).strip(),
                    "password_hash": hash_password(str(row['password']).strip()),
                    "name": str(row['name']).strip(),
                    "position": str(row['position']).strip(),
                    "store": str(row['store']).strip(),
                    "photo": get_random_default_photo()
                }
                users.append(user)
            
            logger.info(f"Успешно обработано {len(users)} пользователей")
            
            # Сохраняем в JSON
            json_file = DATA_DIR / "users.json"
            with json_file.open("w", encoding="utf-8") as f:
                json.dump(users, f, ensure_ascii=False, indent=2)
            
            logger.info("Данные успешно сохранены в JSON")
            return {"success": True, "message": "Пользователи успешно обновлены"}
            
        except Exception as e:
            logger.error(f"Ошибка при обработке файла: {e}")
            raise HTTPException(status_code=500, detail=f"Ошибка при обработке файла: {e}")
            
        finally:
            if temp_file.exists():
                temp_file.unlink()
                logger.info("Временный файл удален")
                
    except Exception as e:
        logger.error(f"Ошибка при загрузке файла: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/favicon.ico")
async def favicon():
    """Возвращает favicon сайта"""
    return FileResponse("public/favicon.ico")

# Монтирование статических файлов
app.mount("/public", StaticFiles(directory="public"), name="public")
app.mount("/data", StaticFiles(directory="data"), name="data")
app.mount("/", StaticFiles(directory="."), name="static")

if __name__ == "__main__":
    import uvicorn
    logger.info("Запуск сервера на http://localhost:8081")
    uvicorn.run(app, host="0.0.0.0", port=8081) 