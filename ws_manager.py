from typing import Dict, Set
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.online_users: Set[str] = set()
    
    async def connect(self, websocket: WebSocket, username: str):
        self.active_connections[username] = websocket
        self.online_users.add(username)
        print(f"👥 Онлайн: {self.online_users}")
        await self.broadcast_online_users()
    
    def disconnect(self, username: str):
        if username in self.active_connections:
            del self.active_connections[username]
            self.online_users.discard(username)
            print(f"👥 Онлайн: {self.online_users}")
    
    async def broadcast_online_users(self):
        message = {
            "type": "online_users",
            "users": list(self.online_users)
        }
        await self.broadcast(message)
    
    async def send_personal(self, message: dict, username: str):
        if username in self.active_connections:
            await self.active_connections[username].send_json(message)
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections.values():
            try:
                await connection.send_json(message)
            except:
                pass
    
    async def handle_message(self, username: str, data: dict):
        msg_type = data.get("type")
        
        if msg_type == "message":
            await self.broadcast({
                "type": "message",
                "from": username,
                "text": data.get("text", ""),
                "timestamp": data.get("timestamp")
            })
        elif msg_type == "private_message":
            to_user = data.get("to")
            if to_user in self.active_connections:
                await self.send_personal({
                    "type": "private_message",
                    "from": username,
                    "text": data.get("text", ""),
                    "timestamp": data.get("timestamp")
                }, to_user)