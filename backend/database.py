import os
import socket

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

LOCAL_SQLITE_URL = os.getenv("DATABASE_FALLBACK_URL", "sqlite:///./erp_venner.db")
DATABASE_CONNECT_TIMEOUT = max(int(os.getenv("DATABASE_CONNECT_TIMEOUT", "3")), 1)


def get_default_port(backend_name: str) -> int | None:
    if backend_name.startswith("postgresql"):
        return 5432
    if backend_name.startswith("mysql"):
        return 3306
    return None


def resolve_database_url() -> str:
    configured_url = os.getenv("DATABASE_URL")

    if not configured_url:
        print("AVISO: DATABASE_URL não encontrada no .env. Usando banco de dados SQLite local.")
        return LOCAL_SQLITE_URL

    try:
        parsed_url = make_url(configured_url)
    except Exception as exc:
        print(f"AVISO: DATABASE_URL inválida ({exc}). Usando banco de dados SQLite local.")
        return LOCAL_SQLITE_URL

    if parsed_url.get_backend_name() == "sqlite":
        return configured_url

    host = parsed_url.host
    port = parsed_url.port or get_default_port(parsed_url.get_backend_name())
    if not host or not port:
        return configured_url

    try:
        with socket.create_connection((host, port), timeout=DATABASE_CONNECT_TIMEOUT):
            return configured_url
    except OSError as exc:
        print(
            f"AVISO: banco remoto {host}:{port} indisponível ({exc}). "
            f"Usando banco de dados SQLite local em {LOCAL_SQLITE_URL}."
        )
        return LOCAL_SQLITE_URL


SQLALCHEMY_DATABASE_URL = resolve_database_url()

# Configurações de pool para evitar desconexões (Server has gone away)
engine_kwargs = {
    "pool_pre_ping": True,
    "pool_recycle": 3600,
}

# Se for SQLite, precisa de parâmetros específicos de thread
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    parsed_url = make_url(SQLALCHEMY_DATABASE_URL)
    connect_args = {}

    # Parâmetros de pool para bancos remotos (PostgreSQL/MySQL)
    engine_kwargs["pool_size"] = int(os.getenv("DATABASE_POOL_SIZE", "10"))
    engine_kwargs["max_overflow"] = int(os.getenv("DATABASE_MAX_OVERFLOW", "20"))

    if parsed_url.get_backend_name().startswith(("postgresql", "mysql")):
        connect_args["connect_timeout"] = DATABASE_CONNECT_TIMEOUT

    if connect_args:
        engine_kwargs["connect_args"] = connect_args

engine = create_engine(SQLALCHEMY_DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
