from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

# Importações do ERP Venner
import os, sys
sys.path.append(os.getcwd())
from database import Base
import models
from dotenv import load_dotenv

load_dotenv()
database_url = os.getenv("DATABASE_URL")
# Alembic espera driver postgresql:// mas o async as vezes usa +asyncpg. 
# Como o Alembic roda síncrono, garantimos o driver correto:
if database_url and database_url.startswith("postgresql+psycopg2://"):
    pass # OK
elif database_url and database_url.startswith("postgresql://"):
    pass # OK
else:
    # Se necessário, ajuste o prefixo aqui
    pass

target_metadata = Base.metadata

config = context.config
if database_url:
    # Escape % para evitar erros de interpolação no configparser do Alembic
    safe_db_url = database_url.replace("%", "%%")
    config.set_main_option("sqlalchemy.url", safe_db_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
