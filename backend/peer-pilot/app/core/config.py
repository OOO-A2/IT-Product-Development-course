import logging
import os
import sys
from pydantic_settings import BaseSettings, SettingsConfigDict

from loguru import logger


class Settings(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    PROJECT_NAME: str
    APP_HOST: str
    APP_PORT: int
    APP_RELOAD: bool


def setup_logger(
    *,
    log_to_file: bool = False,
    log_file: str = "app.log",
    level: str | int = "INFO",
    rotation: str | int = "10 MB",
    retention: str | int = "7 days",
    fmt: str | None = None,
    serialize: bool = False,
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
    if log_to_file:
        logger.add(
            log_file,
            level=level,
            format=fmt,
            rotation=rotation,
            retention=retention,
            compression="zip",
            enqueue=True,
            backtrace=False,
            serialize=serialize,
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
