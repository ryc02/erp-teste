from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from services.auth import get_current_user
from dependencies import get_empresa_id
import models
from datetime import datetime, timedelta

router = APIRouter(prefix="/vendas/resultados", tags=["Resultados Comerciais"])

@router.get("/performance")
def get_performance(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    empresa_id: int = Depends(get_empresa_id)
):
    """
    Retorna métricas de performance de vendas: Total Faturado, Ticket Médio, 
    Qtd Pedidos e Top Vendedores. (Simplificado para os últimos 30 dias)
    """
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    # Base query for approved/completed orders
    query = db.query(models.PedidoVenda).filter(
        models.PedidoVenda.status.in_(["APROVADO", "PREPARANDO_ENVIO", "SEPARADO", "FATURADO", "PRONTO_ENVIO", "ENVIADO", "ENTREGUE"]),
        models.PedidoVenda.data_pedido >= thirty_days_ago
    )
    if empresa_id:
        query = query.filter(models.PedidoVenda.empresa_id == empresa_id)
        
    base_query = query

    total_faturado = base_query.with_entities(func.sum(models.PedidoVenda.valor_total)).scalar() or 0.0
    qtd_pedidos = base_query.count()
    ticket_medio = total_faturado / qtd_pedidos if qtd_pedidos > 0 else 0.0

    # Top Vendedores
    top_vendedores = base_query.with_entities(
        models.PedidoVenda.vendedor_interno_id,
        func.count(models.PedidoVenda.id).label("qtd"),
        func.sum(models.PedidoVenda.valor_total).label("total")
    ).group_by(models.PedidoVenda.vendedor_interno_id).order_by(func.sum(models.PedidoVenda.valor_total).desc()).limit(5).all()

    top_vendedores_data = []
    for tv in top_vendedores:
        user = db.query(models.User).filter(models.User.id == tv[0]).first()
        nome = user.username if user else f"User {tv[0]}"
        top_vendedores_data.append({
            "nome": nome,
            "qtd": tv.qtd,
            "total": float(tv.total)
        })

    return {
        "total_faturado": float(total_faturado),
        "qtd_pedidos": qtd_pedidos,
        "ticket_medio": float(ticket_medio),
        "top_vendedores": top_vendedores_data
    }


@router.get("/curva-abc")
def get_curva_abc(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    empresa_id: int = Depends(get_empresa_id)
):
    """
    Gera Curva ABC de produtos baseada nos pedidos finalizados/aprovados.
    Classe A: até 80% do faturamento acumulado.
    Classe B: de 80% a 95% do faturamento.
    Classe C: resto.
    """
    # Consulta o faturamento por produto
    query = db.query(
        models.PedidoVendaItem.produto_id,
        models.Produto.nome,
        models.Produto.sku,
        func.sum(models.PedidoVendaItem.quantidade).label("qtd_vendida"),
        func.sum(models.PedidoVendaItem.quantidade * models.PedidoVendaItem.preco_unitario).label("valor_total")
    ).join(
        models.PedidoVenda, models.PedidoVendaItem.pedido_id == models.PedidoVenda.id
    ).join(
        models.Produto, models.PedidoVendaItem.produto_id == models.Produto.id
    ).filter(
        models.PedidoVenda.status.in_(["APROVADO", "PREPARANDO_ENVIO", "SEPARADO", "FATURADO", "PRONTO_ENVIO", "ENVIADO", "ENTREGUE"])
    )
    
    if empresa_id:
        query = query.filter(models.PedidoVenda.empresa_id == empresa_id)
        
    vendas_produtos = query.group_by(
        models.PedidoVendaItem.produto_id, models.Produto.nome, models.Produto.sku
    ).order_by(
        func.sum(models.PedidoVendaItem.quantidade * models.PedidoVendaItem.preco_unitario).desc()
    ).all()

    # Cálculo da curva
    faturamento_total = sum(v.valor_total for v in vendas_produtos)
    
    resultados = []
    acumulado = 0.0

    for v in vendas_produtos:
        valor = float(v.valor_total)
        acumulado += valor
        perc_acumulado = (acumulado / faturamento_total * 100) if faturamento_total > 0 else 0

        classe = "A"
        if perc_acumulado > 95:
            classe = "C"
        elif perc_acumulado > 80:
            classe = "B"

        resultados.append({
            "produto_id": v.produto_id,
            "nome": v.nome,
            "sku": v.sku or "",
            "qtd_vendida": float(v.qtd_vendida),
            "valor_total": valor,
            "percentual_acumulado": perc_acumulado,
            "classe": classe
        })

    return resultados


@router.get("/comissoes")
def get_comissoes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    empresa_id: int = Depends(get_empresa_id)
):
    """
    Retorna o relatório de comissões por representante comercial.
    Comissão = Total Vendas (aprovadas/finalizadas) * (comissao_padrao / 100)
    """
    from comercial.models.representante import RepresentanteComercial

    representantes = db.query(RepresentanteComercial).filter(RepresentanteComercial.ativo == True).all()
    resultados = []

    for rep in representantes:
        # Faturamento do representante
        query = db.query(func.sum(models.PedidoVenda.valor_total)).filter(
            models.PedidoVenda.representante_id == rep.id,
            models.PedidoVenda.status.in_(["APROVADO", "PREPARANDO_ENVIO", "SEPARADO", "FATURADO", "PRONTO_ENVIO", "ENVIADO", "ENTREGUE"])
        )
        if empresa_id:
            query = query.filter(models.PedidoVenda.empresa_id == empresa_id)
            
        total_vendas = query.scalar() or 0.0

        percentual = rep.comissao_padrao or 0
        valor_comissao = (total_vendas * percentual) / 100

        resultados.append({
            "representante_id": rep.id,
            "nome": rep.nome,
            "percentual_comissao": percentual,
            "total_vendas": float(total_vendas),
            "valor_comissao": float(valor_comissao)
        })

    return resultados
