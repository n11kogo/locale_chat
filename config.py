import os
from pathlib import Path

BASE_DIR = Path(__file__).parent
DATABASE_PATH = BASE_DIR / "database" / "messenger.db"
UPLOAD_DIR = BASE_DIR / "uploads"

DATABASE_PATH.parent.mkdir(exist_ok=True)
UPLOAD_DIR.mkdir(exist_ok=True)
