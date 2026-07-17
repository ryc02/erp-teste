from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import get_db
from services.auth import get_current_user
import models
import schemas
from services.estoque_service import EstoqueService
from datetime import datetime
from routers.configuracoes_vendas import get_or_create_config


router = APIRouter(prefix="/vendas", tags=["Vendas"])


@router.get("/catalogo-produtos", response_model=List[schemas.ProdutoCatalogoVendaSchema])
def listar_catalogo_produtos(
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=5000),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _ = current_user
    query = db.query(models.Produto).filter(models.Produto.ativo == True)

    if search:
        termo = f"%{search.strip()}%"
        query = query.filter(
            or_(
                models.Produto.nome.ilike(termo),
                models.Produto.sku.ilike(termo),
                models.Produto.categoria.ilike(termo),
                models.Produto.descricao.ilike(termo),
            )
        )

    return query.order_by(models.Produto.nome).offset(skip).limit(limit).all()


@router.post("/pedidos", response_model=schemas.PedidoVendaSchema)
def criar_pedido_venda(
    payload: schemas.PedidoVendaCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # 1. Criar cabeçalho do pedido
    # Status padrão é EM_ABERTO, mas avaliaremos o desconto depois.
    novo_pedido = models.PedidoVenda(
        tipo=payload.tipo,
        cliente_id=payload.cliente_id,
        cliente_nome=payload.cliente_nome,
        representante_id=payload.representante_id,
        vendedor_interno_id=current_user.id,
        condicao_pagamento_id=payload.condicao_pagamento_id,
        valor_frete=payload.valor_frete,
        desconto_valor=payload.desconto_valor,
        observacoes=payload.observacoes,
        natureza_operacao=payload.natureza_operacao,
        status="EM_ABERTO",
        valor_total=0.0
    )
    db.add(novo_pedido)
    db.flush() 

    total_itens = 0.0
    
    # 2. Adicionar itens
    for item_payload in payload.itens:
        produto = db.query(models.Produto).filter(models.Produto.id == item_payload.produto_id).first()
        if not produto:
            raise HTTPException(status_code=404, detail=f"Produto ID {item_payload.produto_id} não encontrado")

        novo_item = models.PedidoVendaItem(
            pedido_id=novo_pedido.id,
            produto_id=item_payload.produto_id,
            quantidade=item_payload.quantidade,
            preco_unitario=item_payload.preco_unitario
        )
        db.add(novo_item)
        total_itens += (item_payload.quantidade * item_payload.preco_unitario)

    # 3. Calcular valor líquido final
    novo_pedido.valor_total = (total_itens + payload.valor_frete) - payload.desconto_valor

    # 4. Validar desconto máximo permitido sem aprovação gerencial
    if payload.tipo == "PEDIDO" and total_itens > 0:
        config = get_or_create_config(db)
        desconto_max = config.desconto_maximo_sem_aprovacao
        percentual_aplicado = (payload.desconto_valor / total_itens) * 100
        if percentual_aplicado > desconto_max:
            novo_pedido.status = "AGUARDANDO_GERENCIA"

    db.commit()
    db.refresh(novo_pedido)
    
    return novo_pedido

@router.put("/pedidos/{pedido_id}", response_model=schemas.PedidoVendaSchema)
def atualizar_pedido_venda(
    pedido_id: int,
    payload: schemas.PedidoVendaCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    pedido = db.query(models.PedidoVenda).filter(models.PedidoVenda.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    if pedido.status not in ["EM_ABERTO", "RASCUNHO"]:
        raise HTTPException(status_code=400, detail="Apenas pedidos EM_ABERTO ou RASCUNHO podem ser editados.")

    pedido.cliente_id = payload.cliente_id
    pedido.cliente_nome = payload.cliente_nome
    pedido.valor_frete = payload.valor_frete
    pedido.desconto_valor = payload.desconto_valor
    pedido.observacoes = payload.observacoes
    pedido.natureza_operacao = payload.natureza_operacao

    # Remove itens antigos
    db.query(models.PedidoVendaItem).filter(models.PedidoVendaItem.pedido_id == pedido_id).delete()

    total_itens = 0.0
    
    # Adiciona itens novos
    for item_payload in payload.itens:
        produto = db.query(models.Produto).filter(models.Produto.id == item_payload.produto_id).first()
        if not produto:
            raise HTTPException(status_code=404, detail=f"Produto ID {item_payload.produto_id} não encontrado")

        novo_item = models.PedidoVendaItem(
            pedido_id=pedido.id,
            produto_id=item_payload.produto_id,
            quantidade=item_payload.quantidade,
            preco_unitario=item_payload.preco_unitario
        )
        db.add(novo_item)
        total_itens += (item_payload.quantidade * item_payload.preco_unitario)

    pedido.valor_total = (total_itens + payload.valor_frete) - payload.desconto_valor

    db.commit()
    db.refresh(pedido)
    
    return pedido


@router.post("/pedidos/{pedido_id}/converter-em-pedido")
def converter_cotacao_em_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    pedido = db.query(models.PedidoVenda).filter(models.PedidoVenda.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Cotação não encontrada")
    
    if pedido.tipo != "COTACAO":
        raise HTTPException(status_code=400, detail="Este documento já é um pedido ou não é uma cotação")

    pedido.tipo = "PEDIDO"
    db.commit()
    return {"status": "success", "message": f"Cotação #{pedido.id} convertida em Pedido com sucesso."}


@router.get("/pedidos", response_model=List[schemas.PedidoVendaSchema])
def listar_pedidos_venda(
    cliente_id: Optional[int] = Query(default=None),
    tipo: Optional[str] = Query(default=None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _ = current_user
    query = db.query(models.PedidoVenda)
    
    if cliente_id is not None:
        query = query.filter(models.PedidoVenda.cliente_id == cliente_id)
        
    if tipo is not None:
        query = query.filter(models.PedidoVenda.tipo == tipo)
        
    return query.order_by(models.PedidoVenda.id.desc()).offset(skip).limit(limit).all()


@router.get("/pedidos/{pedido_id}", response_model=schemas.PedidoVendaSchema)
def obter_pedido_venda(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _ = current_user
    pedido = db.query(models.PedidoVenda).filter(models.PedidoVenda.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return pedido

@router.post("/pedidos/{pedido_id}/aprovar-desconto")
def aprovar_desconto_gerencia(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Nota: Em um cenário real, deveríamos checar se current_user tem role 'GERENTE' ou 'ADMIN'
    # Como não temos roles complexos definidos, vamos permitir que admin ou usuário faça, mas manteremos o log
    pedido = db.query(models.PedidoVenda).filter(models.PedidoVenda.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    if pedido.status != "AGUARDANDO_GERENCIA":
        raise HTTPException(status_code=400, detail=f"Apenas pedidos AGUARDANDO_GERENCIA podem ser aprovados pela gerência. Status: {pedido.status}")

    pedido.status = "EM_ABERTO"
    pedido.observacoes = f"{pedido.observacoes or ''}\n[Desconto Aprovado por {current_user.username} em {datetime.now().strftime('%d/%m/%Y %H:%M')}]"
    
    db.commit()
    return {"status": "success", "message": f"Desconto aprovado. Pedido #{pedido.id} retornou para EM_ABERTO."}


@router.post("/pedidos/{pedido_id}/aprovar")
def aprovar_pedido_venda(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    pedido = db.query(models.PedidoVenda).filter(models.PedidoVenda.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    if pedido.status != "EM_ABERTO":
        raise HTTPException(status_code=400, detail=f"Apenas pedidos EM_ABERTO podem ser aprovados. Status atual: {pedido.status}")

    # Processar cada item para baixar o estoque
    try:
        for item in pedido.itens:
            # Registrar movimentação de saída para cada item
            mov = schemas.MovimentacaoCreate(
                produto_id=item.produto_id,
                tipo=schemas.TipoMovimentacaoSchema.SAIDA_VENDA,
                quantidade=item.quantidade,
                usuario=current_user.username,
                origem=f"Pedido de Venda #{pedido.id}",
                observacao=f"Baixa automática via aprovação de pedido - Cliente: {pedido.cliente_nome}"
            )
            EstoqueService.registrar_movimentacao(db, mov)
        
        # Atualizar status do pedido
        pedido.status = "APROVADO"
        db.commit()
        
        return {"status": "success", "message": f"Pedido #{pedido.id} aprovado e estoque baixado."}
    
    except HTTPException as e:
        db.rollback()
        raise e
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno ao processar baixa de estoque: {str(e)}")


@router.post("/pedidos/{pedido_id}/preparar-envio")
def preparar_envio_pedido_venda(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    pedido = db.query(models.PedidoVenda).filter(models.PedidoVenda.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    if pedido.status != "APROVADO":
        raise HTTPException(status_code=400, detail=f"Apenas pedidos APROVADOS podem ser preparados para envio. Status atual: {pedido.status}")

    pedido.status = "PREPARANDO_ENVIO"
    db.commit()
    return {"status": "success", "message": f"Pedido #{pedido.id} está preparando envio."}


@router.post("/pedidos/{pedido_id}/faturar")
def faturar_pedido_venda(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    pedido = db.query(models.PedidoVenda).filter(models.PedidoVenda.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    if pedido.status != "PREPARANDO_ENVIO":
        raise HTTPException(status_code=400, detail=f"Apenas pedidos PREPARANDO_ENVIO podem ser faturados. Status atual: {pedido.status}")

    pedido.status = "FATURADO"
    
    # Buscar categoria padrão de vendas
    cat_padrao = db.query(models.CategoriaFinanceira).filter(models.CategoriaFinanceira.padrao_venda == True).first()
    
    # Lançar no Financeiro automaticamente
    nova_conta = models.ContaFinanceira(
        tipo="RECEBER",
        status="PENDENTE",
        descricao=f"Faturamento do Pedido #{pedido.id}",
        valor=pedido.valor_total,
        data_vencimento=datetime.now(),
        pedido_id=pedido.id,
        cliente_id=pedido.cliente_id,
        categoria_id=cat_padrao.id if cat_padrao else None
    )
    db.add(nova_conta)
    
    db.commit()
    return {"status": "success", "message": f"Pedido #{pedido.id} faturado e lançado no Financeiro com sucesso."}


@router.post("/pedidos/{pedido_id}/pronto-envio")
def pronto_envio_pedido_venda(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    pedido = db.query(models.PedidoVenda).filter(models.PedidoVenda.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    if pedido.status != "FATURADO":
        raise HTTPException(status_code=400, detail=f"Apenas pedidos FATURADOS podem ser marcados como pronto para envio. Status atual: {pedido.status}")

    pedido.status = "PRONTO_ENVIO"
    db.commit()
    return {"status": "success", "message": f"Pedido #{pedido.id} marcado como pronto para envio."}


from pydantic import BaseModel
class EnvioPayload(BaseModel):
    codigo_rastreio: str
    url_rastreio: Optional[str] = None
    transportadora: Optional[str] = None

@router.post("/pedidos/{pedido_id}/enviar")
def enviar_pedido_venda(
    pedido_id: int,
    payload: EnvioPayload,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    pedido = db.query(models.PedidoVenda).filter(models.PedidoVenda.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    if pedido.status != "PRONTO_ENVIO":
        raise HTTPException(status_code=400, detail=f"Apenas pedidos PRONTO_ENVIO podem ser enviados. Status atual: {pedido.status}")

    pedido.status = "ENVIADO"
    pedido.codigo_rastreio = payload.codigo_rastreio
    pedido.url_rastreio = payload.url_rastreio
    pedido.transportadora = payload.transportadora
    
    db.commit()
    return {"status": "success", "message": f"Pedido #{pedido.id} marcado como enviado."}


@router.post("/pedidos/{pedido_id}/entregar")
def entregar_pedido_venda(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    pedido = db.query(models.PedidoVenda).filter(models.PedidoVenda.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    if pedido.status != "ENVIADO":
        raise HTTPException(status_code=400, detail=f"Apenas pedidos ENVIADOS podem ser marcados como entregues. Status atual: {pedido.status}")

    pedido.status = "ENTREGUE"
    db.commit()
    return {"status": "success", "message": f"Pedido #{pedido.id} marcado como entregue."}


@router.post("/pedidos/{pedido_id}/cancelar")
def cancelar_pedido_venda(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    pedido = db.query(models.PedidoVenda).filter(models.PedidoVenda.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    if pedido.status in ["ENTREGUE", "CANCELADO"]:
        raise HTTPException(status_code=400, detail=f"Pedidos finalizados não podem ser cancelados. Status atual: {pedido.status}")

    pedido.status = "CANCELADO"
    # Poderiamos adicionar lógica de estorno financeiro e de estoque aqui
    db.commit()
    return {"status": "success", "message": f"Pedido #{pedido.id} cancelado."}

@router.delete("/pedidos/{pedido_id}")
def excluir_pedido_venda(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    pedido = db.query(models.PedidoVenda).filter(models.PedidoVenda.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    if pedido.status in ["FATURADO", "ENVIADO", "ENTREGUE", "CONCLUIDA"]:
        raise HTTPException(status_code=400, detail=f"Pedidos finalizados não podem ser excluídos de vez. Status atual: {pedido.status}")

    # Remove financeiro (se houver e não estiver pago) e os itens associados
    from models.financeiro import ContaFinanceira
    db.query(ContaFinanceira).filter(ContaFinanceira.pedido_id == pedido_id).delete()
    db.query(models.PedidoVendaItem).filter(models.PedidoVendaItem.pedido_id == pedido_id).delete()
    db.delete(pedido)
    db.commit()
    return {"status": "success", "message": f"Pedido #{pedido.id} excluído com sucesso."}

class PedidoStatusUpdate(BaseModel):
    status: str

@router.post("/pedidos/{pedido_id}/alterar-status")
def alterar_status_pedido(
    pedido_id: int,
    payload: PedidoStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    pedido = db.query(models.PedidoVenda).filter(models.PedidoVenda.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    pedido.status = payload.status.upper()
    
    # Integração com Financeiro
    if pedido.status == "FATURADO":
        # Check if already exists to avoid duplicates
        from models.financeiro import ContaFinanceira, CategoriaFinanceira
        existente = db.query(ContaFinanceira).filter(
            ContaFinanceira.pedido_id == pedido.id,
            ContaFinanceira.tipo == "RECEBER"
        ).first()
        
        if not existente:
            cat = db.query(CategoriaFinanceira).filter(CategoriaFinanceira.descricao == "Receitas de Vendas").first()
            from datetime import timedelta
            vencimento = datetime.now() + timedelta(days=30)
            
            nova_conta = ContaFinanceira(
                tipo="RECEBER",
                descricao=f"Faturamento Pedido #{pedido.id} - {pedido.cliente_nome}",
                valor=pedido.valor_total,
                data_vencimento=vencimento,
                status="PENDENTE",
                cliente_id=pedido.cliente_id,
                pedido_id=pedido.id,
                categoria_id=cat.id if cat else None
            )
            db.add(nova_conta)

    db.commit()
    return {"message": "Status atualizado com sucesso", "status": pedido.status}
