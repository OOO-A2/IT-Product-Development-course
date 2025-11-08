from contextlib import asynccontextmanager
import uvicorn
from fastapi import FastAPI

from app.api.base import api_router
from app.core.config import app_settings
from app.core.db import engine
from loguru import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

    await engine.dispose()
    logger.info("DB connections closed")


web_app = FastAPI(title=app_settings.PROJECT_NAME, lifespan=lifespan)
web_app.include_router(api_router)


if __name__ == "__main__":
    if app_settings.APP_RELOAD:
        uvicorn.run(
            "main:web_app",
            host=app_settings.APP_HOST,
            port=app_settings.APP_PORT,
            reload=True,
            reload_dirs="app",
            log_config=None,
        )
    else:
        uvicorn.run(
            "main:web_app",
            host=app_settings.APP_HOST,
            port=app_settings.APP_PORT,
            reload=False,
            log_config=None,
            workers=4,
            root_path="/app",
        )
