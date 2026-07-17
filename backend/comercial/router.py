from typing import Optional
import json
from urllib.error import HTTPError, URLError
from urllib.request import urlopen

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

import models
from comercial.models import SituacaoCadastro, TipoPessoaCadastro
from comercial.schemas import (
    ClienteCreate,
    ClienteSchema,
    ClienteUpdate,
    CondicaoPagamentoCreate,
    CondicaoPagamentoSchema,
    CondicaoPagamentoUpdate,
    FormaPagamentoCreate,
    FormaPagamentoSchema,
    FormaPagamentoUpdate,
    RepresentanteCreate,
    RepresentanteSchema,
    RepresentanteUpdate,
)
from comercial.services import (
    ClienteService,
    CpfLookupService,
    CnpjLookupService,
    CondicaoPagamentoService,
    FormaPagamentoService,
    RepresentanteService,
)
from database import get_db
from services.auth import check_role


router = APIRouter(prefix="/comercial", tags=["Comercial"])

COMERCIAL_ALLOWED_ROLES = ["ADMIN", "GERENTE", "COMERCIAL"]


@router.get("/cep/{cep}")
def consultar_cep(
    cep: str,
    current_user: models.User = Depends(check_role(COMERCIAL_ALLOWED_ROLES)),
):
    _ = current_user
    cep_normalizado = "".join(ch for ch in str(cep or "") if ch.isdigit())

    if len(cep_normalizado) != 8:
        raise HTTPException(status_code=400, detail="Informe um CEP com 8 dígitos.")

    try:
        with urlopen(f"https://viacep.com.br/ws/{cep_normalizado}/json/", timeout=10) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except HTTPError:
        raise HTTPException(status_code=404, detail="CEP não encontrado.")
    except URLError:
        raise HTTPException(status_code=503, detail="Não foi possível consultar o CEP no momento.")

    if payload.get("erro"):
        raise HTTPException(status_code=404, detail="CEP não encontrado.")

    return {
        "cep": payload.get("cep"),
        "logradouro": payload.get("logradouro"),
        "bairro": payload.get("bairro"),
        "cidade": payload.get("localidade"),
        "uf": payload.get("uf"),
    }


@router.get("/cnpj/{cnpj}")
def consultar_cnpj(
    cnpj: str,
    current_user: models.User = Depends(check_role(COMERCIAL_ALLOWED_ROLES)),
):
    _ = current_user
    return CnpjLookupService.consultar(cnpj)


@router.get("/cpf/{cpf}")
def consultar_cpf(
    cpf: str,
    current_user: models.User = Depends(check_role(COMERCIAL_ALLOWED_ROLES)),
):
    _ = current_user
    return CpfLookupService.consultar(cpf)


@router.get("/representantes", response_model=list[RepresentanteSchema])
def listar_representantes(
    search: Optional[str] = None,
    include_inativos: bool = True,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(COMERCIAL_ALLOWED_ROLES)),
):
    _ = current_user
    return RepresentanteService.listar(db, search=search, include_inativos=include_inativos)


@router.post("/representantes", response_model=RepresentanteSchema)
def criar_representante(
    payload: RepresentanteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(COMERCIAL_ALLOWED_ROLES)),
):
    _ = current_user
    return RepresentanteService.criar(db, payload)


@router.put("/representantes/{representante_id}", response_model=RepresentanteSchema)
def atualizar_representante(
    representante_id: int,
    payload: RepresentanteUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(COMERCIAL_ALLOWED_ROLES)),
):
    _ = current_user
    return RepresentanteService.atualizar(db, representante_id, payload)


@router.get("/formas-pagamento", response_model=list[FormaPagamentoSchema])
def listar_formas_pagamento(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(COMERCIAL_ALLOWED_ROLES)),
):
    _ = current_user
    return FormaPagamentoService.listar(db, search=search)


@router.post("/formas-pagamento", response_model=FormaPagamentoSchema)
def criar_forma_pagamento(
    payload: FormaPagamentoCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(COMERCIAL_ALLOWED_ROLES)),
):
    _ = current_user
    return FormaPagamentoService.criar(db, payload)


@router.put("/formas-pagamento/{forma_id}", response_model=FormaPagamentoSchema)
def atualizar_forma_pagamento(
    forma_id: int,
    payload: FormaPagamentoUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(COMERCIAL_ALLOWED_ROLES)),
):
    _ = current_user
    return FormaPagamentoService.atualizar(db, forma_id, payload)


@router.get("/condicoes-pagamento", response_model=list[CondicaoPagamentoSchema])
def listar_condicoes_pagamento(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(COMERCIAL_ALLOWED_ROLES)),
):
    _ = current_user
    return CondicaoPagamentoService.listar(db, search=search)


@router.post("/condicoes-pagamento", response_model=CondicaoPagamentoSchema)
def criar_condicao_pagamento(
    payload: CondicaoPagamentoCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(COMERCIAL_ALLOWED_ROLES)),
):
    _ = current_user
    return CondicaoPagamentoService.criar(db, payload)


@router.put("/condicoes-pagamento/{condicao_id}", response_model=CondicaoPagamentoSchema)
def atualizar_condicao_pagamento(
    condicao_id: int,
    payload: CondicaoPagamentoUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(COMERCIAL_ALLOWED_ROLES)),
):
    _ = current_user
    return CondicaoPagamentoService.atualizar(db, condicao_id, payload)


@router.get("/clientes", response_model=list[ClienteSchema])
def listar_clientes(
    search: Optional[str] = None,
    situacao: Optional[SituacaoCadastro] = None,
    tipo_pessoa: Optional[TipoPessoaCadastro] = None,
    tipo_contato: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=5000),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(COMERCIAL_ALLOWED_ROLES)),
):
    _ = current_user
    return ClienteService.listar(
        db,
        search=search,
        situacao=situacao,
        tipo_pessoa=tipo_pessoa,
        tipo_contato=tipo_contato,
        skip=skip,
        limit=limit,
    )


@router.get("/clientes/{cliente_id}", response_model=ClienteSchema)
def obter_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(COMERCIAL_ALLOWED_ROLES)),
):
    _ = current_user
    return ClienteService.obter_ou_404(db, cliente_id)


@router.post("/clientes", response_model=ClienteSchema)
def criar_cliente(
    payload: ClienteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(COMERCIAL_ALLOWED_ROLES)),
):
    _ = current_user
    return ClienteService.criar(db, payload)


@router.put("/clientes/{cliente_id}", response_model=ClienteSchema)
def atualizar_cliente(
    cliente_id: int,
    payload: ClienteUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(COMERCIAL_ALLOWED_ROLES)),
):
    _ = current_user
    return ClienteService.atualizar(db, cliente_id, payload)


@router.delete("/clientes/{cliente_id}")
def excluir_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(COMERCIAL_ALLOWED_ROLES)),
):
    _ = current_user
    ClienteService.excluir(db, cliente_id)
    return {"message": "Cliente excluído com sucesso."}
