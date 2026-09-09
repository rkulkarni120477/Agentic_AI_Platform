from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import settings
from app.db.init_db import init_db


def create_app() -> FastAPI:
    app = FastAPI(
        title="Academian Agentic AI Platform",
        version="0.1.0",
        description="Python API for multi-agent content, skills, standards, accessibility, and knowledge workflows.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def on_startup() -> None:
        init_db()

    app.include_router(router, prefix="/api/v1")
    return app


app = create_app()
