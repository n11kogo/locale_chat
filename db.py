import aiosqlite
from config import DATABASE_PATH

async def init_db():
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                text TEXT,
                file_path TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                session_id TEXT
            )
        ''')
        await db.commit()

async def save_message(username: str, text: str, file_path: str = None, session_id: str = None):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        cursor = await db.execute(
            "INSERT INTO messages (username, text, file_path, session_id) VALUES (?, ?, ?, ?)",
            (username, text, file_path, session_id)
        )
        await db.commit()
        return cursor.lastrowid

async def get_messages(limit: int = 200):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        cursor = await db.execute(
            "SELECT * FROM messages ORDER BY timestamp DESC LIMIT ?",
            (limit,)
        )
        rows = await cursor.fetchall()
        return rows[::-1]