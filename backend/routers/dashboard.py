from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
import models, schemas
from sqlalchemy import case, func
from sqlalchemy.orm import joinedload
from datetime import date, datetime, time, timedelta
from models.base import TipoMovimentacao, TIPOS_ENTRADA, TIPOS_SAIDA

from services.auth import check_role, get_current_user

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
    dependencies=[Depends(get_current_user)],
)

TIPOS_MOVIMENTACAO_LABELS = {
    "ENTRADA": "Entrada de estoque",
    "ENTRADA_COMPRA": "Entrada por compra",
    "ENTRADA_PRODUCAO": "Entrada por producao",
    "SAIDA": "Saida de estoque",
    "SAIDA_VENDA": "Saida para venda",
    "SAIDA_PRODUCAO": "Saida para producao",
    "AJUSTE": "Ajuste de estoque",
    "DEVOLUCAO": "Devolucao"
}

def _descrever_movimentacao(movimentacao: models.MovimentacaoEstoque) -> str:
    tipo = getattr(movimentacao.tipo, "value", movimentacao.tipo)
    descricao = TIPOS_MOVIMENTACAO_LABELS.get(str(tipo), str(tipo).replace("_", " ").title())

    origem = (movimentacao.origem or "").strip()
    observacao = (movimentacao.observacao or "").strip()

    partes = [descricao]
    if origem:
        partes.append(f"via {origem}")
    if observacao:
        partes.append(observacao)

    return " - ".join(partes)


def _inicio_do_dia(dia: date) -> datetime:
    return datetime.combine(dia, time.min)


def _fim_do_dia(dia: date) -> datetime:
    return _inicio_do_dia(dia + timedelta(days=1))

def get_daily_counts(db: Session, model, date_column, dias=7):
    hoje = date.today()
    inicio_periodo_dt = _inicio_do_dia(hoje - timedelta(days=dias - 1))
    
    rows = db.query(
        func.date(date_column).label("dia"),
        func.count(model.id).label("qtd")
    ).filter(date_column >= inicio_periodo_dt)\
     .group_by(func.date(date_column)).all()
     
    # SQLite returns string dates, handle both object and string
    counts = {}
    for row in rows:
        dia_str = row.dia if isinstance(row.dia, str) else row.dia.strftime("%Y-%m-%d")
        counts[dia_str] = row.qtd
        
    return [counts.get((hoje - timedelta(days=i)).strftime("%Y-%m-%d"), 0) for i in range(dias - 1, -1, -1)]

@router.get("/stats", response_model=schemas.DashboardStats)
def get_stats(
    db: Session = Depends(get_db),
):
    total_prod = db.query(func.count(models.Produto.id)).filter(models.Produto.ativo.is_(True)).scalar() or 0
    from models.movimentacoes import MovimentacaoEstoque

    subquery = db.query(
        MovimentacaoEstoque.produto_id,
        func.sum(
            case(
                (MovimentacaoEstoque.tipo.in_(tuple(TIPOS_ENTRADA)), MovimentacaoEstoque.quantidade),
                (MovimentacaoEstoque.tipo.in_(tuple(TIPOS_SAIDA)), -MovimentacaoEstoque.quantidade),
                (MovimentacaoEstoque.tipo == TipoMovimentacao.DEVOLUCAO, MovimentacaoEstoque.quantidade),
                (MovimentacaoEstoque.tipo == TipoMovimentacao.AJUSTE, MovimentacaoEstoque.quantidade),
                else_=0.0
            )
        ).label("estoque_calc")
    ).group_by(MovimentacaoEstoque.produto_id).subquery()

    alertas = db.query(models.Produto)\
        .outerjoin(subquery, models.Produto.id == subquery.c.produto_id)\
        .filter(models.Produto.ativo.is_(True))\
        .filter(func.coalesce(subquery.c.estoque_calc, 0) < models.Produto.estoque_minimo)\
        .count()
    
    hoje = date.today()
    inicio_hoje = _inicio_do_dia(hoje)
    fim_hoje = _fim_do_dia(hoje)

    mov_hoje = db.query(models.MovimentacaoEstoque)\
        .filter(models.MovimentacaoEstoque.created_at >= inicio_hoje)\
        .filter(models.MovimentacaoEstoque.created_at < fim_hoje)\
        .count()
        
    reservas = db.query(models.ReservaEstoque)\
        .filter(models.ReservaEstoque.status == models.StatusReserva.ATIVA)\
        .count()
        
    # Manutenção
    maqs = db.query(models.Maquina).filter(models.Maquina.status == "OPERANTE").count()
    oss = db.query(models.OrdemServico).filter(models.OrdemServico.status == "ABERTA").count()
        
    # Produção e Vendas KPIs
    total_vendas = db.query(models.PedidoVenda).count()
    total_produzidos = db.query(models.OrdemProducao).filter(models.OrdemProducao.status == "CONCLUIDA").count()
    pendentes = db.query(models.OrdemProducao).filter(models.OrdemProducao.status != "CONCLUIDA").count()
    eficiencia = 0
    if (total_produzidos + pendentes) > 0:
        eficiencia = int((total_produzidos / (total_produzidos + pendentes)) * 100)

    return {
        "total_produtos": total_prod,
        "alertas_estoque": alertas,
        "movimentacoes_hoje": mov_hoje,
        "reservas_ativas": reservas,
        "maquinas_ativas": maqs,
        "os_abertas": oss,
        "total_vendas": total_vendas,
        "total_produzidos": total_produzidos,
        "pendentes": pendentes,
        "eficiencia": eficiencia
    }

@router.get("/charts")
def get_chart_data(
    db: Session = Depends(get_db),
):
    hoje = date.today()
    inicio_periodo = hoje - timedelta(days=6)
    inicio_periodo_dt = _inicio_do_dia(inicio_periodo)
    fim_periodo_dt = _fim_do_dia(hoje)

    fluxo_rows = db.query(
        func.date(models.MovimentacaoEstoque.created_at).label("dia"),
        func.coalesce(
            func.sum(
                case(
                    (models.MovimentacaoEstoque.tipo.in_(tuple(TIPOS_ENTRADA)), models.MovimentacaoEstoque.quantidade),
                    else_=0.0
                )
            ),
            0.0
        ).label("entradas"),
        func.coalesce(
            func.sum(
                case(
                    (models.MovimentacaoEstoque.tipo.in_(tuple(TIPOS_SAIDA)), models.MovimentacaoEstoque.quantidade),
                    else_=0.0
                )
            ),
            0.0
        ).label("saidas"),
    )\
        .filter(models.MovimentacaoEstoque.created_at >= inicio_periodo_dt)\
        .filter(models.MovimentacaoEstoque.created_at < fim_periodo_dt)\
        .group_by(func.date(models.MovimentacaoEstoque.created_at))\
        .all()

    fluxo_por_dia = {
        row.dia: {
            "entradas": float(row.entradas or 0),
            "saidas": float(row.saidas or 0),
        }
        for row in fluxo_rows
    }

    labels = []
    entradas = []
    saidas = []
    
    for i in range(6, -1, -1):
        dia = hoje - timedelta(days=i)
        labels.append(dia.strftime("%d/%m"))
        fluxo_dia = fluxo_por_dia.get(dia, {"entradas": 0.0, "saidas": 0.0})
        entradas.append(fluxo_dia["entradas"])
        saidas.append(fluxo_dia["saidas"])

    # 2. Distribuição por Categoria
    cat_data = db.query(models.Produto.categoria, func.count(models.Produto.id))\
        .filter(models.Produto.ativo.is_(True))\
        .group_by(models.Produto.categoria).all()
        
    categorias = {
        "labels": [c[0] for c in cat_data],
        "values": [c[1] for c in cat_data]
    }

    # 3. Vendas vs Produção (Status)
    vendas_count = db.query(models.PedidoVenda.status, func.count(models.PedidoVenda.id))\
        .group_by(models.PedidoVenda.status).all()
    prod_count = db.query(models.OrdemProducao.status, func.count(models.OrdemProducao.id))\
        .group_by(models.OrdemProducao.status).all()
        
    # 4. Top 5 Clientes
    top_clientes = db.query(models.PedidoVenda.cliente_nome, func.count(models.PedidoVenda.id))\
        .group_by(models.PedidoVenda.cliente_nome)\
        .order_by(func.count(models.PedidoVenda.id).desc())\
        .limit(5).all()

    return {
        "fluxo": {
            "labels": labels,
            "entradas": entradas,
            "saidas": saidas
        },
        "categorias": categorias,
        "vendas_prod": {
            "labels": ["Vendas", "Produção"],
            "vendas": {status: count for status, count in vendas_count},
            "producao": {status: count for status, count in prod_count}
        },
        "top_clientes": {
            "labels": [c[0] for c in top_clientes],
            "values": [c[1] for c in top_clientes]
        },
        "sparklines": {
            "produtos": get_daily_counts(db, models.Produto, models.Produto.created_at),
            "alertas": [0, 0, 0, 0, 0, 0, 0], # ponytail: cannot historically reconstruct dynamic alerts snapshot
            "movimentos": [int(e + s) for e, s in zip(entradas, saidas)],
            "reservas": get_daily_counts(db, models.ReservaEstoque, models.ReservaEstoque.created_at),
            "maquinas": get_daily_counts(db, models.Maquina, models.Maquina.created_at),
            "os": get_daily_counts(db, models.OrdemServico, models.OrdemServico.data_abertura),
        }
    }

@router.get("/recent-movements", response_model=list[schemas.DashboardRecentMovement])
def get_recent_movements(
    limite: int = 10,
    query: Optional[str] = None,
    tipo: Optional[str] = None,
    db: Session = Depends(get_db),
):
    limite = max(1, min(limite, 50))
    q = db.query(models.MovimentacaoEstoque)
    
    if query:
        q = q.join(models.Produto).filter(
            (models.Produto.nome.ilike(f"%{query}%")) | 
            (models.MovimentacaoEstoque.usuario.ilike(f"%{query}%"))
        )
    else:
        q = q.options(joinedload(models.MovimentacaoEstoque.produto))
        
    if tipo:
        q = q.filter(models.MovimentacaoEstoque.tipo == tipo)

    movimentacoes = q.order_by(models.MovimentacaoEstoque.created_at.desc()).limit(limite).all()

    resultado = []
    for mov in movimentacoes:
        produto_nome = "Produto removido"
        if mov.produto:
            produto_nome = f"{mov.produto.nome} ({mov.produto.sku})"

        tipo = getattr(mov.tipo, "value", mov.tipo)
        resultado.append({
            "id": mov.id,
            "produto": produto_nome,
            "tipo": str(tipo),
            "acao": _descrever_movimentacao(mov),
            "quantidade": mov.quantidade,
            "usuario": mov.usuario or "Sistema",
            "data_hora": mov.created_at
        })

    return resultado

@router.get("/home")
def get_dashboard_home(db: Session = Depends(get_db)):
    """Retorna os dados exatos necessários para o frontend Dashboard.tsx."""
    from models.financeiro import ContaFinanceira
    from models.vendas import PedidoVenda, PedidoVendaItem
    from models.produtos import Produto
    from comercial.models.cliente import ClienteComercial
    from dateutil.relativedelta import relativedelta
    import calendar
    
    hoje = datetime.utcnow().date()
    inicio_mes = hoje.replace(day=1)
    
    # KPIs
    receita_mes = db.query(func.sum(ContaFinanceira.valor)).filter(
        ContaFinanceira.tipo == "RECEBER",
        ContaFinanceira.status == "PAGO",
        ContaFinanceira.data_pagamento >= inicio_mes
    ).scalar() or 0.0
    
    pedidos_hoje = db.query(PedidoVenda).filter(
        func.date(PedidoVenda.data_pedido) == hoje
    ).count()
    
    vendas_mes_total = db.query(func.sum(PedidoVenda.valor_total)).filter(
        PedidoVenda.data_pedido >= inicio_mes
    ).scalar() or 0.0
    qtd_vendas_mes = db.query(PedidoVenda).filter(
        PedidoVenda.data_pedido >= inicio_mes
    ).count()
    ticket_medio = vendas_mes_total / qtd_vendas_mes if qtd_vendas_mes > 0 else 0.0
    
    clientes_novos = db.query(ClienteComercial).filter(
        ClienteComercial.created_at >= inicio_mes
    ).count()
    
    custos_mes = db.query(func.sum(PedidoVendaItem.quantidade * Produto.custo)).join(
        PedidoVenda, PedidoVendaItem.pedido_id == PedidoVenda.id
    ).join(
        Produto, PedidoVendaItem.produto_id == Produto.id
    ).filter(
        PedidoVenda.data_pedido >= inicio_mes
    ).scalar() or 0.0

    lucro_bruto = vendas_mes_total - custos_mes
    lucro_liquido = lucro_bruto - (vendas_mes_total * 0.10) # 10% provisão impostos
    margem_lucro = (lucro_liquido / vendas_mes_total * 100) if vendas_mes_total > 0 else 0.0
    
    kpis = {
        "receita_mes": {"value": f"R$ {receita_mes:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."), "change": "+0.0%", "pos": True},
        "pedidos_hoje": {"value": str(pedidos_hoje), "change": "+0.0%", "pos": True},
        "ticket_medio": {"value": f"R$ {ticket_medio:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."), "change": "+0.0%", "pos": True},
        "margem_lucro": {"value": f"{margem_lucro:.1f}%", "change": "+0.0%", "pos": True}
    }
    
    # Revenue Data (últimos 7 meses)
    revenue_data = []
    meses_str = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    for i in range(6, -1, -1):
        mes_dt = hoje - relativedelta(months=i)
        inicio_m = mes_dt.replace(day=1)
        fim_m = (inicio_m + relativedelta(months=1)) - relativedelta(days=1)
        
        rec = db.query(func.sum(ContaFinanceira.valor)).filter(ContaFinanceira.tipo == "RECEBER", ContaFinanceira.status == "PAGO", ContaFinanceira.data_pagamento >= inicio_m, ContaFinanceira.data_pagamento <= fim_m).scalar() or 0.0
        desp = db.query(func.sum(ContaFinanceira.valor)).filter(ContaFinanceira.tipo == "PAGAR", ContaFinanceira.status == "PAGO", ContaFinanceira.data_pagamento >= inicio_m, ContaFinanceira.data_pagamento <= fim_m).scalar() or 0.0
        revenue_data.append({
            "mes": meses_str[mes_dt.month - 1],
            "receita": rec,
            "despesas": desp
        })
        
    # Últimos Pedidos
    ultimos_pedidos = db.query(PedidoVenda).order_by(PedidoVenda.data_pedido.desc()).limit(5).all()
    orders_data = []
    for p in ultimos_pedidos:
        st = p.status.lower() if p.status else "pendente"
        # Map statuses
        if st in ["aguardando_faturamento", "preparando_envio", "enviado"]: st = "processando"
        if st in ["entregue"]: st = "entregue"
        if st in ["cancelado"]: st = "cancelado"
        orders_data.append({
            "id": f"#{str(p.id).zfill(4)}",
            "cliente": p.cliente_nome or "Cliente não informado",
            "produto": f"{len(p.itens)} itens",
            "valor": p.valor_total,
            "status": st
        })
        
    # Pedidos da Semana
    daily_orders_data = []
    dias_str = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
    for i in range(6, -1, -1):
        dia = hoje - relativedelta(days=i)
        qtd = db.query(PedidoVenda).filter(func.date(PedidoVenda.data_pedido) == dia).count()
        daily_orders_data.append({"dia": dias_str[dia.weekday()], "pedidos": qtd})
        
    # Curva ABC (Top 5 Produtos Mês)
    top_produtos = db.query(
        Produto.nome,
        func.sum(PedidoVendaItem.quantidade * PedidoVendaItem.preco_unitario).label('total_vendas')
    ).join(
        PedidoVendaItem, PedidoVendaItem.produto_id == Produto.id
    ).join(
        PedidoVenda, PedidoVendaItem.pedido_id == PedidoVenda.id
    ).filter(
        PedidoVenda.data_pedido >= inicio_mes
    ).group_by(
        Produto.nome
    ).order_by(
        func.sum(PedidoVendaItem.quantidade * PedidoVendaItem.preco_unitario).desc()
    ).limit(5).all()

    # Cores fixas para gráfico de pizza/rosca
    cores = ["#F05A28", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"]
    curva_abc_data = []
    for i, p in enumerate(top_produtos):
        curva_abc_data.append({
            "name": p[0],
            "value": float(p[1]),
            "color": cores[i % len(cores)]
        })
        
    return {
        "kpis": kpis,
        "revenueData": revenue_data,
        "ordersData": orders_data,
        "dailyOrdersData": daily_orders_data,
        "curvaAbcData": curva_abc_data
    }
