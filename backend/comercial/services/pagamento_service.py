import json
from datetime import date
from typing import Optional

from fastapi import HTTPException
from sqlalchemy import String
from sqlalchemy.orm import Session

from comercial.models import CondicaoPagamentoComercial, FormaPagamentoComercial
from comercial.schemas import (
    CondicaoPagamentoCreate,
    CondicaoPagamentoParcela,
    CondicaoPagamentoUpdate,
    FormaPagamentoCreate,
    FormaPagamentoUpdate,
)


class FormaPagamentoService:
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
        if "descricao" in data:
            data["descricao"] = cls._clean_text(data.get("descricao"), upper=True)
        return data

    @classmethod
    def _validar_codigo_unico(
        cls,
        db: Session,
        codigo: Optional[int],
        *,
        forma_id_atual: Optional[int] = None,
    ):
        if codigo is None:
            raise HTTPException(status_code=400, detail="Informe o código da forma de pagamento.")

        query = db.query(FormaPagamentoComercial).filter(FormaPagamentoComercial.codigo == codigo)
        if forma_id_atual is not None:
            query = query.filter(FormaPagamentoComercial.id != forma_id_atual)

        if query.first():
            raise HTTPException(status_code=400, detail="Já existe uma forma de pagamento com este código.")

    @classmethod
    def obter_ou_404(cls, db: Session, forma_id: int) -> FormaPagamentoComercial:
        forma = db.query(FormaPagamentoComercial).filter(FormaPagamentoComercial.id == forma_id).first()
        if not forma:
            raise HTTPException(status_code=404, detail="Forma de pagamento não encontrada.")
        return forma

    @classmethod
    def listar(cls, db: Session, *, search: Optional[str] = None) -> list[FormaPagamentoComercial]:
        query = db.query(FormaPagamentoComercial)
        if search:
            termo = f"%{search.strip()}%"
            query = query.filter(
                (FormaPagamentoComercial.descricao.ilike(termo))
                | (FormaPagamentoComercial.codigo.cast(String).ilike(termo))
            )
        return query.order_by(FormaPagamentoComercial.codigo).all()

    @classmethod
    def criar(cls, db: Session, payload: FormaPagamentoCreate) -> FormaPagamentoComercial:
        data = cls._normalizar_payload(payload.model_dump())
        if not data.get("descricao"):
            raise HTTPException(status_code=400, detail="Informe a descrição da forma de pagamento.")

        cls._validar_codigo_unico(db, data.get("codigo"))
        forma = FormaPagamentoComercial(**data)
        db.add(forma)
        db.commit()
        db.refresh(forma)
        return forma

    @classmethod
    def atualizar(cls, db: Session, forma_id: int, payload: FormaPagamentoUpdate) -> FormaPagamentoComercial:
        forma = cls.obter_ou_404(db, forma_id)
        data = payload.model_dump(exclude_unset=True)
        if not data:
            return forma

        data = cls._normalizar_payload(data)
        if "codigo" in data:
            cls._validar_codigo_unico(db, data.get("codigo"), forma_id_atual=forma.id)
        if "descricao" in data and not data.get("descricao"):
            raise HTTPException(status_code=400, detail="Informe a descrição da forma de pagamento.")

        for key, value in data.items():
            setattr(forma, key, value)

        db.commit()
        db.refresh(forma)
        return forma


class CondicaoPagamentoService:
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
        if "descricao" in data:
            data["descricao"] = cls._clean_text(data.get("descricao"), upper=True)
        return data

    @classmethod
    def _validar_codigo_unico(
        cls,
        db: Session,
        codigo: Optional[int],
        *,
        condicao_id_atual: Optional[int] = None,
    ):
        if codigo is None:
            raise HTTPException(status_code=400, detail="Informe o código da condição de pagamento.")

        query = db.query(CondicaoPagamentoComercial).filter(CondicaoPagamentoComercial.codigo == codigo)
        if condicao_id_atual is not None:
            query = query.filter(CondicaoPagamentoComercial.id != condicao_id_atual)

        if query.first():
            raise HTTPException(status_code=400, detail="Já existe uma condição de pagamento com este código.")

    @classmethod
    def obter_ou_404(cls, db: Session, condicao_id: int) -> CondicaoPagamentoComercial:
        condicao = db.query(CondicaoPagamentoComercial).filter(CondicaoPagamentoComercial.id == condicao_id).first()
        if not condicao:
            raise HTTPException(status_code=404, detail="Condição de pagamento não encontrada.")
        return condicao

    @staticmethod
    def _serializar_parcelas(parcelas: list[CondicaoPagamentoParcela]) -> str:
        payload = []
        for parcela in parcelas:
            payload.append(
                {
                    "numero": parcela.numero,
                    "dias": parcela.dias,
                    "data_fixa": parcela.data_fixa.isoformat() if parcela.data_fixa else None,
                }
            )
        return json.dumps(payload, ensure_ascii=False)

    @staticmethod
    def _desserializar_parcelas(parcelas_json: Optional[str]) -> list[dict]:
        if not parcelas_json:
            return []
        try:
            return json.loads(parcelas_json)
        except json.JSONDecodeError:
            return []

    @classmethod
    def _validar_parcelas(cls, numero_parcelas: int, parcelas: list[CondicaoPagamentoParcela]) -> list[CondicaoPagamentoParcela]:
        if numero_parcelas < 1:
            raise HTTPException(status_code=400, detail="Informe ao menos uma parcela.")

        if len(parcelas) != numero_parcelas:
            raise HTTPException(
                status_code=400,
                detail="A quantidade de parcelas informada deve bater com o número de parcelas."
            )

        numeros = sorted(parcela.numero for parcela in parcelas)
        esperado = list(range(1, numero_parcelas + 1))
        if numeros != esperado:
            raise HTTPException(status_code=400, detail="Numere as parcelas em sequência, começando por 1.")

        return sorted(parcelas, key=lambda item: item.numero)

    @classmethod
    def listar(cls, db: Session, *, search: Optional[str] = None) -> list[dict]:
        query = db.query(CondicaoPagamentoComercial)
        if search:
            termo = f"%{search.strip()}%"
            query = query.filter(
                (CondicaoPagamentoComercial.descricao.ilike(termo))
                | (CondicaoPagamentoComercial.codigo.cast(String).ilike(termo))
            )

        itens = query.order_by(CondicaoPagamentoComercial.codigo).all()
        return [cls.to_schema(item) for item in itens]

    @classmethod
    def to_schema(cls, model: CondicaoPagamentoComercial) -> dict:
        parcelas = []
        for parcela in cls._desserializar_parcelas(model.parcelas_json):
            data_fixa = parcela.get("data_fixa")
            parcelas.append(
                {
                    "numero": parcela.get("numero"),
                    "dias": parcela.get("dias"),
                    "data_fixa": date.fromisoformat(data_fixa) if data_fixa else None,
                }
            )

        return {
            "id": model.id,
            "codigo": model.codigo,
            "descricao": model.descricao,
            "indice_financeiro": model.indice_financeiro,
            "base_calculo": model.base_calculo,
            "numero_parcelas": model.numero_parcelas,
            "parcelas": parcelas,
            "ativo": model.ativo,
            "created_at": model.created_at,
            "updated_at": model.updated_at,
        }

    @classmethod
    def criar(cls, db: Session, payload: CondicaoPagamentoCreate) -> dict:
        data = cls._normalizar_payload(payload.model_dump())
        if not data.get("descricao"):
            raise HTTPException(status_code=400, detail="Informe a descrição da condição de pagamento.")

        cls._validar_codigo_unico(db, data.get("codigo"))

        parcelas = cls._validar_parcelas(payload.numero_parcelas, payload.parcelas)
        condicao = CondicaoPagamentoComercial(
            codigo=payload.codigo,
            descricao=data["descricao"],
            indice_financeiro=payload.indice_financeiro,
            base_calculo=payload.base_calculo,
            numero_parcelas=payload.numero_parcelas,
            parcelas_json=cls._serializar_parcelas(parcelas),
            ativo=payload.ativo,
        )
        db.add(condicao)
        db.commit()
        db.refresh(condicao)
        return cls.to_schema(condicao)

    @classmethod
    def atualizar(cls, db: Session, condicao_id: int, payload: CondicaoPagamentoUpdate) -> dict:
        condicao = cls.obter_ou_404(db, condicao_id)
        data = payload.model_dump(exclude_unset=True)
        if not data:
            return cls.to_schema(condicao)

        data = cls._normalizar_payload(data)
        if "codigo" in data:
            cls._validar_codigo_unico(db, data.get("codigo"), condicao_id_atual=condicao.id)
        if "descricao" in data and not data.get("descricao"):
            raise HTTPException(status_code=400, detail="Informe a descrição da condição de pagamento.")

        numero_parcelas = data.get("numero_parcelas", condicao.numero_parcelas)
        parcelas = payload.parcelas
        if parcelas is None:
            parcelas = [
                CondicaoPagamentoParcela(**item)
                for item in cls._desserializar_parcelas(condicao.parcelas_json)
            ]

        parcelas_validadas = cls._validar_parcelas(numero_parcelas, parcelas)

        condicao.codigo = data.get("codigo", condicao.codigo)
        condicao.descricao = data.get("descricao", condicao.descricao)
        condicao.indice_financeiro = data.get("indice_financeiro", condicao.indice_financeiro)
        condicao.base_calculo = data.get("base_calculo", condicao.base_calculo)
        condicao.numero_parcelas = numero_parcelas
        condicao.parcelas_json = cls._serializar_parcelas(parcelas_validadas)
        condicao.ativo = data.get("ativo", condicao.ativo)

        db.commit()
        db.refresh(condicao)
        return cls.to_schema(condicao)
