from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database import get_db
from services.auth import get_current_user, check_role
import models
from schemas import compras as compras_schemas
from schemas.movimentacoes import MovimentacaoCreate, TipoMovimentacaoSchema
from services.estoque_service import EstoqueService

router = APIRouter(prefix="/compras", tags=["Compras"])

@router.post("/ordens", response_model=compras_schemas.OrdemCompraSchema)
def criar_ordem_compra(
    payload: compras_schemas.OrdemCompraCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    _ = current_user
    
    # 1. Create header
    nova_oc = models.OrdemCompra(
        fornecedor_id=payload.fornecedor_id,
        fornecedor_nome=payload.fornecedor_nome,
        valor_frete=payload.valor_frete,
        desconto_valor=payload.desconto_valor,
        observacoes=payload.observacoes,
        status=payload.status.value if payload.status else compras_schemas.StatusOrdemCompra.RASCUNHO.value,
        valor_total=0.0
    )
    db.add(nova_oc)
    db.flush()

    total_itens = 0.0
    
    # 2. Add items
    for item in payload.itens:
        produto = db.query(models.Produto).filter(models.Produto.id == item.produto_id).first()
        if not produto:
            raise HTTPException(status_code=404, detail=f"Produto ID {item.produto_id} não encontrado")
            
        novo_item = models.OrdemCompraItem(
            ordem_id=nova_oc.id,
            produto_id=item.produto_id,
            quantidade=item.quantidade,
            preco_unitario=item.preco_unitario
        )
        db.add(novo_item)
        total_itens += (item.quantidade * item.preco_unitario)
        
    # 3. Calculate total
    nova_oc.valor_total = (total_itens + payload.valor_frete) - payload.desconto_valor
    db.commit()
    db.refresh(nova_oc)
    
    return nova_oc

@router.get("/ordens", response_model=List[compras_schemas.OrdemCompraSchema])
def listar_ordens_compra(
    status: Optional[str] = Query(default=None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    _ = current_user
    query = db.query(models.OrdemCompra)
    
    if status:
        query = query.filter(models.OrdemCompra.status == status)
        
    return query.order_by(models.OrdemCompra.id.desc()).offset(skip).limit(limit).all()

@router.get("/ordens/{ordem_id}", response_model=compras_schemas.OrdemCompraSchema)
def obter_ordem_compra(
    ordem_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    _ = current_user
    oc = db.query(models.OrdemCompra).filter(models.OrdemCompra.id == ordem_id).first()
    if not oc:
        raise HTTPException(status_code=404, detail="Ordem de Compra não encontrada")
    return oc

@router.post("/ordens/{ordem_id}/aprovar")
def aprovar_ordem_compra(
    ordem_id: int,
    db: Session = Depends(get_db),
    # GAP 7: apenas ADMIN ou GERENTE podem aprovar OCs e gerar Contas a Pagar
    current_user: models.User = Depends(check_role(["ADMIN", "GERENTE"]))
):
    oc = db.query(models.OrdemCompra).filter(models.OrdemCompra.id == ordem_id).first()
    if not oc:
        raise HTTPException(status_code=404, detail="Ordem de Compra não encontrada")
        
    if oc.status != compras_schemas.StatusOrdemCompra.RASCUNHO.value:
        raise HTTPException(status_code=400, detail=f"Apenas OCs em RASCUNHO podem ser aprovadas. Status atual: {oc.status}")
        
    oc.status = compras_schemas.StatusOrdemCompra.AGUARDANDO_RECEBIMENTO.value
    
    # Cria a Conta a Pagar preventivamente na Aprovação
    try:
        from dateutil.relativedelta import relativedelta
        from models import ContaFinanceira
        from datetime import datetime
        
        nova_conta = ContaFinanceira(
            tipo="PAGAR",
            status="PENDENTE",
            descricao=f"Ref. Ordem de Compra #{oc.id} - {oc.fornecedor_nome}",
            valor=oc.valor_total,
            data_vencimento=datetime.utcnow() + relativedelta(days=30),
            observacoes=f"Gerada automaticamente pela aprovação da OC #{oc.id}."
        )
        db.add(nova_conta)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao gerar Conta a Pagar: {str(e)}")
        
    return {"status": "success", "message": f"Ordem de Compra #{oc.id} aprovada (Conta a Pagar gerada e Aguardando Recebimento)."}

@router.post("/ordens/{ordem_id}/receber")
def receber_ordem_compra(
    ordem_id: int,
    db: Session = Depends(get_db),
    # GAP 7: apenas ADMIN ou GERENTE podem confirmar recebimento e dar entrada no estoque
    current_user: models.User = Depends(check_role(["ADMIN", "GERENTE", "OPERADOR"]))
):
    oc = db.query(models.OrdemCompra).filter(models.OrdemCompra.id == ordem_id).first()
    if not oc:
        raise HTTPException(status_code=404, detail="Ordem de Compra não encontrada")
        
    if oc.status != compras_schemas.StatusOrdemCompra.AGUARDANDO_RECEBIMENTO.value:
        raise HTTPException(status_code=400, detail=f"Apenas OCs AGUARDANDO_RECEBIMENTO podem ser recebidas. Status atual: {oc.status}")
        
    # Registrar entrada no estoque e criar conta a pagar
    try:
        from dateutil.relativedelta import relativedelta
        from models import ContaFinanceira
        
        for item in oc.itens:
            mov = MovimentacaoCreate(
                produto_id=item.produto_id,
                tipo=TipoMovimentacaoSchema.ENTRADA_COMPRA,
                quantidade=item.quantidade,
                usuario=current_user.username,
                origem=f"Ordem de Compra #{oc.id}",
                observacao=f"Entrada automática via recebimento de OC - Fornecedor: {oc.fornecedor_nome}"
            )
            EstoqueService.registrar_movimentacao(db, mov)
            
        oc.status = compras_schemas.StatusOrdemCompra.RECEBIDO.value
        oc.data_recebimento = datetime.utcnow()
        db.commit()
        return {"status": "success", "message": f"Ordem de Compra #{oc.id} recebida com sucesso. Estoque atualizado."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno ao processar recebimento: {str(e)}")
