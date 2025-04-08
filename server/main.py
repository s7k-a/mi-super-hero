from fastapi import FastAPI, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from pathlib import Path

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене замените на конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Монтируем статические файлы
app.mount("/public", StaticFiles(directory="public"), name="public")

# Создаем директорию для фото, если её нет
UPLOAD_DIR = Path("public/images/profiles")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@app.post("/api/upload-photo")
async def upload_photo(photo: UploadFile = File(...), userId: str = Form(...)):
    try:
        # Создаем имя файла из ID пользователя и расширения загруженного файла
        file_extension = Path(photo.filename).suffix
        photo_filename = f"{userId}{file_extension}"
        file_path = UPLOAD_DIR / photo_filename

        # Сохраняем файл
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)

        # Возвращаем URL для доступа к фото
        return {"photoUrl": f"/public/images/profiles/{photo_filename}"}
    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 