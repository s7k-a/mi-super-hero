from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
import shutil
import os
from pathlib import Path
import random

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене замените на конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Определяем пути
BASE_DIR = Path(".")
PUBLIC_DIR = BASE_DIR / "public"
PROFILES_DIR = PUBLIC_DIR / "images" / "profiles"

# Создаем необходимые директории
PROFILES_DIR.mkdir(parents=True, exist_ok=True)

# Функция для получения случайного стандартного фото
def get_random_default_photo():
    default_photos = list(PROFILES_DIR.glob("default_*.jpg"))
    if not default_photos:
        # Если нет стандартных фото, создаем хотя бы одно
        default_photo = PROFILES_DIR / "default_1.jpg"
        if not default_photo.exists():
            default_photo.touch()
            print("⚠️ Создан пустой файл для стандартного фото. Пожалуйста, замените его реальным изображением.")
        return default_photo
    return random.choice(default_photos)

# Маршрут для главной страницы
@app.get("/", response_class=HTMLResponse)
async def read_root():
    with open("index.html", "r", encoding="utf-8") as f:
        return f.read()

# API маршруты
@app.post("/api/upload-photo")
async def upload_photo(photo: UploadFile = File(...), userId: str = Form(...)):
    try:
        # Проверяем тип файла
        if not photo.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Файл должен быть изображением")

        # Получаем расширение файла
        file_extension = Path(photo.filename).suffix.lower()
        if file_extension not in ['.jpg', '.jpeg', '.png', '.gif']:
            raise HTTPException(status_code=400, detail="Неподдерживаемый формат файла")

        # Создаем имя файла
        photo_filename = f"{userId}{file_extension}"
        file_path = PROFILES_DIR / photo_filename

        # Сохраняем файл
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)

        # Возвращаем URL для доступа к фото
        return {"photoUrl": f"/public/images/profiles/{photo_filename}"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/photo/{user_id}")
async def get_user_photo(user_id: str):
    # Проверяем все возможные расширения
    for ext in ['.jpg', '.jpeg', '.png', '.gif']:
        photo_path = PROFILES_DIR / f"{user_id}{ext}"
        if photo_path.exists():
            return FileResponse(photo_path)
    
    # Если фото пользователя не найдено, возвращаем случайное стандартное
    return FileResponse(get_random_default_photo())

# Монтируем статические файлы после определения API маршрутов
app.mount("/public", StaticFiles(directory="public"), name="public")
app.mount("/data", StaticFiles(directory="data"), name="data")
app.mount("/", StaticFiles(directory="."), name="static")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Запуск сервера на http://localhost:8081")
    uvicorn.run(app, host="0.0.0.0", port=8081) 