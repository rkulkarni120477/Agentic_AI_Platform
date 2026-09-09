from pathlib import Path

from app.db.models import Base
from app.db.session import engine


def init_db() -> None:
    Path("data").mkdir(exist_ok=True)
    Base.metadata.create_all(bind=engine)
