import logging
import os
import sys
from pydantic_settings import BaseSettings, SettingsConfigDict

from loguru import logger


class Settings(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")
    
    DATABASE_URL: str = "sqlite:///./peerpilot.db"

    PROJECT_NAME: str = "Peer Pilot"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = "8000"
    APP_RELOAD: bool = True


def setup_logger(
    *,
    level: str | int = "INFO",
    fmt: str | None = None,
    intercept_std_logging: bool = True
) -> None:
    logger.remove()

    if fmt is None:
        fmt = (
            "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
            "<level>{level: <8}</level>| "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan>"
            "- <level>{message}</level>"
        )

    logger.add(
        sys.stdout,
        level=level,
        format=fmt,
        enqueue=True,
        backtrace=False,
        diagnose=False,
    )

    if not intercept_std_logging:
        return

    class InterceptHandler(logging.Handler):
        def emit(self, record: logging.LogRecord) -> None:
            try:
                lvl = logger.level(record.levelname).name
            except ValueError:
                lvl = record.levelno

            logger.opt(
                depth=6,
                exception=record.exc_info,
            ).log(lvl, record.getMessage())

    logging.root.handlers = [InterceptHandler()]
    logging.root.setLevel(0)

    for name in ("prefect", "httpx"):
        prefect_std = logging.getLogger(name)
        prefect_std.handlers = []
        prefect_std.propagate = False

    for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        lg = logging.getLogger(name)
        lg.handlers = [InterceptHandler()]
        lg.setLevel(0)
        lg.propagate = False

app_settings = Settings()
setup_logger()
