from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
import shutil
import uuid
from contextlib import asynccontextmanager
from datetime import datetime

from db import init_db, save_message, get_messages
from config import UPLOAD_DIR

class ConnectionManager:
    def __init__(self):
        self.active_connections = {}
        self.online_users = set()
    
    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        # Генерируем уникальный ID сессии
        session_id = str(uuid.uuid4())[:8]
        self.active_connections[username] = {
            "websocket": websocket,
            "session_id": session_id
        }
        self.online_users.add(username)
        print(f"✅ {username} вошел в чат (сессия: {session_id})")
        await self.broadcast_online()
        await self.broadcast_system(f"🟢 {username} присоединился к чату")
    
    def disconnect(self, username: str):
        if username in self.active_connections:
            del self.active_connections[username]
            self.online_users.discard(username)
            print(f"❌ {username} покинул чат")
    
    def get_session_id(self, username: str):
        if username in self.active_connections:
            return self.active_connections[username]["session_id"]
        return None
    
    async def broadcast_online(self):
        await self.broadcast({"type": "online_users", "users": list(self.online_users)})
    
    async def broadcast_system(self, text: str):
        await self.broadcast({
            "type": "system",
            "text": text,
            "time": datetime.now().strftime("%H:%M")
        })
    
    async def broadcast(self, message: dict):
        for username, data in self.active_connections.items():
            try:
                await data["websocket"].send_json(message)
            except:
                pass
    
    async def handle_message(self, username: str, data: dict):
        msg_type = data.get("type")
        session_id = self.get_session_id(username)
        
        if msg_type == "message":
            text = data.get("text", "")
            # Сохраняем с session_id
            await save_message(username, text, None, session_id)
            await self.broadcast({
                "type": "message",
                "from": username,
                "text": text,
                "time": datetime.now().strftime("%H:%M"),
                "session_id": session_id
            })
        
        elif msg_type == "file":
            file_url = data.get("file_url")
            filename = data.get("filename")
            await save_message(username, f"📎 {filename}", file_url, session_id)
            await self.broadcast({
                "type": "message",
                "from": username,
                "text": f"📎 {filename}",
                "time": datetime.now().strftime("%H:%M"),
                "file": file_url,
                "session_id": session_id
            })

manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    manager.active_connections.clear()
    manager.online_users.clear()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def get_index():
    return FileResponse("static/index.html")

@app.get("/messages")
async def get_messages_endpoint(limit: int = 200):
    messages = await get_messages(limit)
    return {
        "messages": [
            {
                "from": m[1],
                "text": m[2] or "",
                "time": datetime.fromisoformat(m[4]).strftime("%H:%M") if m[4] else "",
                "file": m[3],
                "session_id": m[5] if len(m) > 5 else None
            }
            for m in messages
        ]
    }

@app.post("/upload")
async def upload_file(username: str = Form(...), file: UploadFile = File(...)):
    filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
    file_path = UPLOAD_DIR / filename
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"success": True, "file_url": f"/uploads/{filename}", "filename": file.filename}

@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    try:
        await manager.connect(websocket, username)
        while True:
            data = await websocket.receive_text()
            await manager.handle_message(username, json.loads(data))
    except WebSocketDisconnect:
        manager.disconnect(username)
        await manager.broadcast_online()
        await manager.broadcast_system(f"🔴 {username} покинул чат")
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        manager.disconnect(username)
        await manager.broadcast_online()
        await manager.broadcast_system(f"🔴 {username} покинул чат")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)