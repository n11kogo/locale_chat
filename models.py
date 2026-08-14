from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class User(BaseModel):
    id: Optional[int] = None
    user_name: str  # уникальный, только латиница
    name: str       # может повторяться
    password: str
    avatar: Optional[str] = None  # путь к аватарке
    bio: Optional[str] = None     # описание профиля
    created_at: datetime = datetime.now()
    last_seen: datetime = datetime.now()

class Message(BaseModel):
    id: Optional[int] = None
    chat_id: int
    from_user_id: int
    text: str
    file_path: Optional[str] = None
    timestamp: datetime = datetime.now()
    is_read: bool = False

class Chat(BaseModel):
    id: Optional[int] = None
    chat_type: str  # 'private' или 'group'
    name: Optional[str] = None  # для групп
    avatar: Optional[str] = None  # для групп
    created_at: datetime = datetime.now()
    created_by: int

class ChatMember(BaseModel):
    chat_id: int
    user_id: int
    role: str = 'member'  # 'admin', 'member'
    joined_at: datetime = datetime.now()
