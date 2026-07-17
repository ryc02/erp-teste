from typing import Optional

from fastapi import HTTPException
from sqlalchemy import inspect, or_, text
from sqlalchemy.orm import Session

from comercial.models import (
    ClienteComercial,
    CondicaoPagamentoCadastro,
    CondicaoPagamentoComercial,
    FormaPagamentoComercial,
    RepresentanteComercial,
    SituacaoCadastro,
    TipoPessoaCadastro,
)
from comercial.schemas import ClienteCreate, ClienteUpdate
from .representante_service import RepresentanteService


class ClienteService:
    PRAZOS_PAGAMENTO_VALIDOS = {30, 60, 120}

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
        normalizado = payload.copy()
        campos_texto = [
            "nome_razao_social",
            "nome_fantasia",
            "rg",
            "inscricao_estadual",
            "telefone",
            "whatsapp",
            "email",
            "cep",
            "endereco",
            "numero",
            "complemento",
            "bairro",
            "cidade",
            "nome_vendedor_interno",
            "cep_cobranca",
            "endereco_cobranca",
            "numero_cobranca",
            "complemento_cobranca",
            "bairro_cobranca",
            "municipio_cobranca",
            "inscricao_estadual_cobranca",
            "email_cobranca",
            "cep_entrega",
            "endereco_entrega",
            "numero_entrega",
            "complemento_entrega",
            "bairro_entrega",
            "cidade_entrega",
            "forma_pagamento_padrao",
            "observacoes",
        ]

        for campo in campos_texto:
            if campo in normalizado:
                normalizado[campo] = cls._clean_text(normalizado.get(campo))

        if "cpf_cnpj" in normalizado:
            digits = "".join(ch for ch in str(normalizado.get("cpf_cnpj") or "") if ch.isdigit())
            normalizado["cpf_cnpj"] = digits or None

        tipo_pessoa = normalizado.get("tipo_pessoa")
        if tipo_pessoa == TipoPessoaCadastro.FISICA:
            normalizado["inscricao_estadual"] = None
        elif tipo_pessoa == TipoPessoaCadastro.JURIDICA:
            normalizado["rg"] = None

        if "cnpj_cobranca" in normalizado:
            digits = "".join(ch for ch in str(normalizado.get("cnpj_cobranca") or "") if ch.isdigit())
            normalizado["cnpj_cobranca"] = digits or None

        if "uf" in normalizado:
            normalizado["uf"] = cls._clean_text(normalizado.get("uf"), upper=True)

        if "uf_cobranca" in normalizado:
            normalizado["uf_cobranca"] = cls._clean_text(normalizado.get("uf_cobranca"), upper=True)

        if "uf_entrega" in normalizado:
            normalizado["uf_entrega"] = cls._clean_text(normalizado.get("uf_entrega"), upper=True)

        return normalizado

    @staticmethod
    def _quote_identifier(name: str) -> str:
        return '"' + str(name).replace('"', '""') + '"'

    @classmethod
    def _validar_regras_negocio(
        cls,
        db: Session,
        payload: dict,
        *,
        cliente_id_atual: Optional[int] = None,
    ) -> dict:
        data = cls._normalizar_payload(payload)

        if not data.get("nome_razao_social"):
            raise HTTPException(status_code=400, detail="Informe a razão social ou nome do cliente.")

        prazo_entrega = data.get("prazo_entrega_padrao_dias")
        if prazo_entrega is not None and int(prazo_entrega) < 0:
            raise HTTPException(status_code=400, detail="O prazo de entrega não pode ser negativo.")

        prazo_pagamento = data.get("prazo_pagamento_dias")
        condicao_pagamento = data.get("condicao_pagamento")

        if condicao_pagamento == CondicaoPagamentoCadastro.A_VISTA:
            data["prazo_pagamento_dias"] = None
        elif condicao_pagamento == CondicaoPagamentoCadastro.A_PRAZO:
            if prazo_pagamento not in cls.PRAZOS_PAGAMENTO_VALIDOS:
                raise HTTPException(
                    status_code=400,
                    detail="Para pagamento a prazo, informe 30, 60 ou 120 dias."
                )
        else:
            data["prazo_pagamento_dias"] = None

        cpf_cnpj = data.get("cpf_cnpj")
        if cpf_cnpj:
            query = db.query(ClienteComercial).filter(ClienteComercial.cpf_cnpj == cpf_cnpj)
            if cliente_id_atual is not None:
                query = query.filter(ClienteComercial.id != cliente_id_atual)
            existente = query.first()
            if existente:
                raise HTTPException(status_code=400, detail="Já existe um cliente com este CPF/CNPJ.")

        representante_id = data.get("representante_id")
        if representante_id is None:
            representante = RepresentanteService.obter_direto(db)
            data["representante_id"] = representante.id
        else:
            representante = (
                db.query(RepresentanteComercial)
                .filter(RepresentanteComercial.id == representante_id)
                .first()
            )
            if not representante:
                raise HTTPException(status_code=400, detail="Representante informado não existe.")

        forma_pagamento_id = data.get("forma_pagamento_id")
        if forma_pagamento_id is not None:
            forma_pagamento = (
                db.query(FormaPagamentoComercial)
                .filter(FormaPagamentoComercial.id == forma_pagamento_id)
                .first()
            )
            if not forma_pagamento:
                raise HTTPException(status_code=400, detail="Forma de pagamento informada não existe.")
            data["forma_pagamento_padrao"] = forma_pagamento.descricao

        condicao_pagamento_id = data.get("condicao_pagamento_id")
        if condicao_pagamento_id is not None:
            condicao_cadastro = (
                db.query(CondicaoPagamentoComercial)
                .filter(CondicaoPagamentoComercial.id == condicao_pagamento_id)
                .first()
            )
            if not condicao_cadastro:
                raise HTTPException(status_code=400, detail="Condição de pagamento informada não existe.")

        return data

    @staticmethod
    def obter_ou_404(db: Session, cliente_id: int) -> ClienteComercial:
        cliente = db.query(ClienteComercial).filter(ClienteComercial.id == cliente_id).first()
        if not cliente:
            raise HTTPException(status_code=404, detail="Cliente não encontrado.")
        return cliente

    @classmethod
    def _listar_vinculos_exclusao(cls, db: Session, cliente_id: int) -> list[str]:
        inspector = inspect(db.get_bind())
        tabela_cliente = ClienteComercial.__tablename__
        vinculos: list[str] = []

        for table_name in inspector.get_table_names():
            if table_name == tabela_cliente:
                continue

            for foreign_key in inspector.get_foreign_keys(table_name):
                if foreign_key.get("referred_table") != tabela_cliente:
                    continue

                constrained_columns = foreign_key.get("constrained_columns") or []
                referred_columns = foreign_key.get("referred_columns") or []
                if not constrained_columns or not referred_columns:
                    continue

                for index, column_name in enumerate(constrained_columns):
                    referred_column = referred_columns[min(index, len(referred_columns) - 1)]
                    if referred_column != "id":
                        continue

                    query = text(
                        f"SELECT COUNT(*) FROM {cls._quote_identifier(table_name)} "
                        f"WHERE {cls._quote_identifier(column_name)} = :cliente_id"
                    )
                    total = db.execute(query, {"cliente_id": cliente_id}).scalar() or 0
                    if total:
                        vinculos.append(f"{table_name}.{column_name} ({total})")

        return vinculos

    @classmethod
    def listar(
        cls,
        db: Session,
        *,
        search: Optional[str] = None,
        situacao: Optional[SituacaoCadastro] = None,
        tipo_pessoa: Optional[TipoPessoaCadastro] = None,
        tipo_contato: Optional[str] = None,
        skip: int = 0,
        limit: int = 200,
    ) -> list[ClienteComercial]:
        query = db.query(ClienteComercial)

        if situacao:
            query = query.filter(ClienteComercial.situacao == situacao)

        if tipo_pessoa:
            query = query.filter(ClienteComercial.tipo_pessoa == tipo_pessoa)

        if tipo_contato:
            query = query.filter(ClienteComercial.tipo_contato == tipo_contato)

        if search:
            termo = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    ClienteComercial.nome_razao_social.ilike(termo),
                    ClienteComercial.nome_fantasia.ilike(termo),
                    ClienteComercial.cpf_cnpj.ilike(termo),
                    ClienteComercial.email.ilike(termo),
                    ClienteComercial.cidade.ilike(termo),
                )
            )

        return query.order_by(ClienteComercial.nome_razao_social).offset(skip).limit(limit).all()

    @classmethod
    def criar(cls, db: Session, payload: ClienteCreate) -> ClienteComercial:
        data = cls._validar_regras_negocio(db, payload.model_dump())
        cliente = ClienteComercial(**data)
        db.add(cliente)
        db.commit()
        db.refresh(cliente)
        return cliente

    @classmethod
    def atualizar(cls, db: Session, cliente_id: int, payload: ClienteUpdate) -> ClienteComercial:
        cliente = cls.obter_ou_404(db, cliente_id)
        update_data = payload.model_dump(exclude_unset=True)
        data_atual = {
            "situacao": cliente.situacao,
            "tipo_pessoa": cliente.tipo_pessoa,
            "nome_razao_social": cliente.nome_razao_social,
            "nome_fantasia": cliente.nome_fantasia,
            "cpf_cnpj": cliente.cpf_cnpj,
            "rg": cliente.rg,
            "inscricao_estadual": cliente.inscricao_estadual,
            "telefone": cliente.telefone,
            "whatsapp": cliente.whatsapp,
            "email": cliente.email,
            "cep": cliente.cep,
            "endereco": cliente.endereco,
            "numero": cliente.numero,
            "complemento": cliente.complemento,
            "bairro": cliente.bairro,
            "cidade": cliente.cidade,
            "uf": cliente.uf,
            "representante_id": cliente.representante_id,
            "nome_vendedor_interno": cliente.nome_vendedor_interno,
            "forma_pagamento_id": cliente.forma_pagamento_id,
            "condicao_pagamento_id": cliente.condicao_pagamento_id,
            "cep_cobranca": cliente.cep_cobranca,
            "endereco_cobranca": cliente.endereco_cobranca,
            "numero_cobranca": cliente.numero_cobranca,
            "complemento_cobranca": cliente.complemento_cobranca,
            "bairro_cobranca": cliente.bairro_cobranca,
            "uf_cobranca": cliente.uf_cobranca,
            "municipio_cobranca": cliente.municipio_cobranca,
            "cnpj_cobranca": cliente.cnpj_cobranca,
            "inscricao_estadual_cobranca": cliente.inscricao_estadual_cobranca,
            "email_cobranca": cliente.email_cobranca,
            "cep_entrega": cliente.cep_entrega,
            "endereco_entrega": cliente.endereco_entrega,
            "numero_entrega": cliente.numero_entrega,
            "complemento_entrega": cliente.complemento_entrega,
            "bairro_entrega": cliente.bairro_entrega,
            "cidade_entrega": cliente.cidade_entrega,
            "uf_entrega": cliente.uf_entrega,
            "forma_pagamento_padrao": cliente.forma_pagamento_padrao,
            "condicao_pagamento": cliente.condicao_pagamento,
            "prazo_pagamento_dias": cliente.prazo_pagamento_dias,
            "prazo_entrega_padrao_dias": cliente.prazo_entrega_padrao_dias,
            "observacoes": cliente.observacoes,
        }
        data_atual.update(update_data)

        data_validada = cls._validar_regras_negocio(db, data_atual, cliente_id_atual=cliente.id)

        for key, value in data_validada.items():
            setattr(cliente, key, value)

        db.commit()
        db.refresh(cliente)
        return cliente

    @classmethod
    def excluir(cls, db: Session, cliente_id: int) -> None:
        cliente = cls.obter_ou_404(db, cliente_id)
        vinculos = cls._listar_vinculos_exclusao(db, cliente.id)
        if vinculos:
            raise HTTPException(
                status_code=409,
                detail=(
                    "Cliente possui vínculos e não pode ser excluído. "
                    f"Referências encontradas: {', '.join(vinculos)}."
                ),
            )

        db.delete(cliente)
        db.commit()
