from sqlalchemy.orm import Session
from models.auditoria import AuditoriaLog
from fastapi import Request
import logging

logger = logging.getLogger("auditoria")

class AuditoriaService:
    @staticmethod
    def registrar(
        db: Session, 
        usuario: str, 
        acao: str, 
        modulo: str, 
        detalhes: str, 
        entidade_id: str = None, 
        request: Request = None
    ):
        try:
            ip = request.client.host if request else None
            log_entry = AuditoriaLog(
                usuario=usuario,
                acao=acao,
                modulo=modulo,
                detalhes=detalhes,
                entidade_id=str(entidade_id) if entidade_id else None,
                ip_address=ip
            )
            db.add(log_entry)
            db.commit()
            logger.info(f"AUDIT: [{modulo}] {usuario} -> {acao}: {detalhes}")
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao registrar log de auditoria: {e}")
