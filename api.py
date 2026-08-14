from fastapi import APIRouter, Form, UploadFile, File
from fastapi.responses import JSONResponse
from datetime import datetime
import os
import shutil
from db import create_user, get_user, save_message, get_all_messages, get_or_create_chat
from config import UPLOAD_DIR

router = APIRouter()

@router.post("/register")
async def register(username: str = Form(...), password: str = Form(...)):
    existing = await get_user(username)
    if existing:
        return JSONResponse({"error": "Пользователь уже существует"}, status_code=400)
    await create_user(username, password)
    print(f"✅ Зарегистрирован: {username}")
    return {"success": True}

@router.post("/login")
async def login(username: str = Form(...), password: str = Form(...)):
    user = await get_user(username)
    if not user:
        return JSONResponse({"error": "Пользователь не найден"}, status_code=401)
    if user[2] != password:
        return JSONResponse({"error": "Неверный пароль"}, status_code=401)
    print(f"✅ Вход выполнен: {username}")
    return {"success": True, "username": username}

@router.post("/logout")
async def logout(username: str = Form(...)):
    from main import manager
    manager.disconnect(username)
    await manager.broadcast_online()
    return {"success": True}

@router.get("/online")
async def get_online():
    from main import manager
    return {"users": list(manager.online_users)}

@router.post("/send")
async def send_message(username: str = Form(...), text: str = Form(...)):
    await save_message(0, username, None, text)
    return {"success": True}

@router.get("/messages")
async def get_messages(limit: int = 100):
    messages = await get_all_messages(limit)
    return {
        "messages": [
            {
                "from": m[2],
                "text": m[4],
                "time": datetime.fromisoformat(m[6]).strftime('%H:%M') if m[6] else ""
            }
            for m in messages
        ]
    }

@router.post("/upload")
async def upload_file(username: str = Form(...), file: UploadFile = File(...)):
    filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
    file_path = UPLOAD_DIR / filename
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    await save_message(0, username, None, f"📎 {file.filename}", f"/uploads/{filename}")
    return {"success": True, "file_url": f"/uploads/{filename}"}
