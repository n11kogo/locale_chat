from typing import Dict, Set
from fastapi import WebSocket
import json
from datetime import datetime
from db import save_message, get_or_create_chat

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.online_users: Set[str] = set()
    
    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        self.active_connections[username] = websocket
        self.online_users.add(username)
        print(f"✅ {username} подключился")
        await self.broadcast_online()
    
    def disconnect(self, username: str):
        if username in self.active_connections:
            del self.active_connections[username]
            self.online_users.discard(username)
            print(f"❌ {username} отключился")
    
    async def broadcast_online(self):
        await self.broadcast({"type": "online_users", "users": list(self.online_users)})
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections.values():
            try:
                await connection.send_json(message)
            except:
                pass
    
    async def send_personal(self, message: dict, username: str):
        if username in self.active_connections:
            try:
                await self.active_connections[username].send_json(message)
            except:
                pass
    
    async def handle_message(self, username: str, data: dict):
        msg_type = data.get("type")
        
        if msg_type == "message":
            text = data.get("text", "")
            await save_message(0, username, None, text)
            await self.broadcast({
                "type": "message",
                "from": username,
                "text": text,
                "time": datetime.now().strftime("%H:%M"),
                "timestamp": datetime.now().isoformat()
            })
        
        elif msg_type == "private_message":
            to_user = data.get("to")
            text = data.get("text", "")
            chat_id = await get_or_create_chat(username, to_user)
            await save_message(chat_id, username, to_user, text)
            
            await self.send_personal({
                "type": "private_message",
                "from": username,
                "to": to_user,
                "text": text,
                "time": datetime.now().strftime("%H:%M"),
                "is_my": True
            }, username)
            
            if to_user in self.active_connections:
                await self.send_personal({
                    "type": "private_message",
                    "from": username,
                    "to": to_user,
                    "text": text,
                    "time": datetime.now().strftime("%H:%M"),
                    "is_my": False
                }, to_user)
