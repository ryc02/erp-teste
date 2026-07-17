import os
import shutil
import time
import threading
import subprocess
import zipfile
from datetime import datetime
import logging
from database import SQLALCHEMY_DATABASE_URL

logger = logging.getLogger("backup")

BACKUP_DIR = "backups"

def compress_file(file_path):
    """Comprime um arquivo em formato ZIP e remove o original."""
    zip_path = f"{file_path}.zip"
    try:
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            zipf.write(file_path, os.path.basename(file_path))
        os.remove(file_path)
        return zip_path
    except Exception as e:
        logger.error(f"Erro ao comprimir backup: {e}")
        return file_path

def backup_worker():
    """Thread que executa o backup uma vez por dia."""
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
        
    while True:
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            temp_path = None
            
            if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
                db_path = SQLALCHEMY_DATABASE_URL.replace("sqlite:///", "")
                if os.path.exists(db_path):
                    temp_path = os.path.join(BACKUP_DIR, f"backup_sqlite_{timestamp}.db")
                    shutil.copy2(db_path, temp_path)
                else:
                    logger.warning("Banco SQLite não encontrado para backup.")
            
            elif SQLALCHEMY_DATABASE_URL.startswith("postgresql"):
                temp_path = os.path.join(BACKUP_DIR, f"backup_postgres_{timestamp}.sql")
                env = os.environ.copy()
                pg_dump_cmd = os.getenv("PG_DUMP_PATH", "pg_dump")
                try:
                    res = subprocess.run(
                        [pg_dump_cmd, SQLALCHEMY_DATABASE_URL, "-f", temp_path],
                        capture_output=True, text=True, env=env
                    )
                    if res.returncode != 0:
                        logger.error(f"Falha no pg_dump: {res.stderr}")
                        temp_path = None
                except FileNotFoundError:
                    logger.error(f"Utilitário '{pg_dump_cmd}' não encontrado no sistema. Backup Postgres falhou.")
                    temp_path = None

            if temp_path:
                # Comprimir o backup
                final_path = compress_file(temp_path)
                logger.info(f"Backup realizado e comprimido: {final_path}")

        except Exception as e:
            logger.error(f"Erro ao realizar backup: {e}")
            
        time.sleep(86400)

def start_backup_job():
    thread = threading.Thread(target=backup_worker, daemon=True)
    thread.start()
    logger.info("Serviço de backup automático iniciado (24h).")
