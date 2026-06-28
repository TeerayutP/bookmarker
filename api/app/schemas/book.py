# Kept for any legacy imports — new code uses schemas/user_book.py and schemas/library_book.py
from .user_book import UserBookCreate as BookCreate, UserBookUpdate as BookUpdate, ChapterPatch, UserBookOut as BookOut

__all__ = ["BookCreate", "BookUpdate", "ChapterPatch", "BookOut"]
