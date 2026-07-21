from typing import Optional

from fastapi import HTTPException
from sqlalchemy import String
from sqlalchemy.orm import Session

from comercial.models import RepresentanteComercial
from comercial.schemas import RepresentanteCreate, RepresentanteUpdate


class RepresentanteService:
    CODIGO_DIRETO = "1"
    NOME_DIRETO = "DIRETO"

    @staticmethod
    def _clean_text(value: Optional[str], *, upper: bool = False) -> Optional[str]:
        if value is None:
            return None

        text = str(value).strip()
        if not text:
            return None

        return text.upper() if upper else text

    @classmethod
    def _normalizar_payload(cls, payload: dict) -> dict:
        data = payload.copy()
        if "nome" in data:
            data["nome"] = cls._clean_text(data.get("nome"), upper=True)
        return data

    @classmethod
    def _validar_codigo_unico(
        cls,
        db: Session,
        codigo: Optional[int],
        *,
        representante_id_atual: Optional[int] = None,
    ):
        if codigo is None or str(codigo).strip() == "":
            return

        query = db.query(RepresentanteComercial).filter(RepresentanteComercial.codigo == codigo)
        if representante_id_atual is not None:
            query = query.filter(RepresentanteComercial.id != representante_id_atual)

        if query.first():
            raise HTTPException(status_code=400, detail="Já existe um representante com este código.")

    @classmethod
    def obter_ou_404(cls, db: Session, representante_id: int) -> RepresentanteComercial:
        representante = db.query(RepresentanteComercial).filter(RepresentanteComercial.id == representante_id).first()
        if not representante:
            raise HTTPException(status_code=404, detail="Representante não encontrado.")
        return representante

    @classmethod
    def obter_direto(cls, db: Session) -> RepresentanteComercial:
        representante = (
            db.query(RepresentanteComercial)
            .filter(RepresentanteComercial.codigo == cls.CODIGO_DIRETO)
            .first()
        )
        if not representante:
            representante = RepresentanteComercial(
                codigo=cls.CODIGO_DIRETO,
                nome=cls.NOME_DIRETO,
                ativo=True,
            )
            db.add(representante)
            db.commit()
            db.refresh(representante)
        return representante

    @classmethod
    def listar(cls, db: Session, *, search: Optional[str] = None, include_inativos: bool = True) -> list[RepresentanteComercial]:
        query = db.query(RepresentanteComercial)
        if search:
            termo = f"%{search.strip()}%"
            query = query.filter(
                (RepresentanteComercial.nome.ilike(termo))
                | (RepresentanteComercial.codigo.cast(String).ilike(termo))
            )
        if not include_inativos:
            query = query.filter(RepresentanteComercial.ativo.is_(True))
        return query.order_by(RepresentanteComercial.codigo).all()

    @classmethod
    def criar(cls, db: Session, payload: RepresentanteCreate) -> RepresentanteComercial:
        data = cls._normalizar_payload(payload.model_dump())
        if not data.get("nome"):
            raise HTTPException(status_code=400, detail="Informe o nome do representante.")

        cls._validar_codigo_unico(db, data.get("codigo"))

        representante = RepresentanteComercial(**data)
        db.add(representante)
        db.commit()
        db.refresh(representante)
        return representante

    @classmethod
    def atualizar(cls, db: Session, representante_id: int, payload: RepresentanteUpdate) -> RepresentanteComercial:
        representante = cls.obter_ou_404(db, representante_id)
        data = payload.model_dump(exclude_unset=True)
        if not data:
            return representante

        data = cls._normalizar_payload(data)
        if "codigo" in data:
            cls._validar_codigo_unico(db, data.get("codigo"), representante_id_atual=representante.id)
        if "nome" in data and not data.get("nome"):
            raise HTTPException(status_code=400, detail="Informe o nome do representante.")

        for key, value in data.items():
            setattr(representante, key, value)

        db.commit()
        db.refresh(representante)
        return representante
