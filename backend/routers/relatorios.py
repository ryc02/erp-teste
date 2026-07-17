from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Dict
import io
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import cm

from jose import JWTError, jwt

from services.auth import ALGORITHM, SECRET_KEY, check_role, get_current_user
from services.produtividade_service import ProdutividadeService

router = APIRouter(prefix="/relatorios", tags=["Relatórios"])


def _resolve_document_user(db: Session, request: Request, token: str | None) -> models.User:
    header_value = request.headers.get("Authorization", "").strip()
    bearer_token = header_value[7:].strip() if header_value.lower().startswith("bearer ") else ""
    raw_token = bearer_token or (token or "").strip()

    if not raw_token:
        raise HTTPException(status_code=401, detail="Token de autenticação ausente")

    try:
        payload = jwt.decode(raw_token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Token expirado ou inválido") from exc

    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    if not user.ativo:
        raise HTTPException(status_code=400, detail="Usuário inativo")
    return user


@router.get("/produtividade-real-teorica")
def relatorio_produtividade_real_teorica(
    source_dir: str | None = Query(default=None, description="Pasta com as planilhas de produtividade"),
    current_user: models.User = Depends(get_current_user),
):
    try:
        return ProdutividadeService.load_dashboard(source_dir=source_dir)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

@router.get("/eficiencia_producao")
def relatorio_eficiencia(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Relatório de eficiência: Tempo médio de produção e aproveitamento planejado vs produzido.
    """
    ops_concluidas = db.query(models.OrdemProducao).filter(models.OrdemProducao.status == "CONCLUIDA").all()
    
    resumo = []
    for op in ops_concluidas:
        tempo_producao = None
        if op.data_inicio and op.data_fim:
            delta = op.data_fim - op.data_inicio
            tempo_producao = delta.total_seconds() / 3600 # horas
            
        resumo.append({
            "op_id": op.id,
            "produto": op.produto.nome if op.produto else "N/A",
            "planejado": op.quantidade_planejada,
            "produzido": op.quantidade_produzida,
            "eficiencia_qtd": (op.quantidade_produzida / op.quantidade_planejada) * 100 if op.quantidade_planejada > 0 else 0,
            "tempo_horas": round(tempo_producao, 2) if tempo_producao is not None else 0,
            "data_fim": op.data_fim.strftime("%d/%m/%Y %H:%M") if op.data_fim else "N/A"
        })
        
    return resumo

@router.get("/custos_producao")
def relatorio_custos(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Análise de custos reais baseada em OPs concluídas.
    """
    ops_concluidas = db.query(models.OrdemProducao).filter(models.OrdemProducao.status == "CONCLUIDA").all()
    
    analise = []
    for op in ops_concluidas:
        custo_total_real = op.custo_insumos + op.custo_mao_obra + op.custo_maquina
        custo_unitario_real = custo_total_real / op.quantidade_produzida if op.quantidade_produzida > 0 else 0
        
        analise.append({
            "op_id": op.id,
            "produto": op.produto.nome if op.produto else "N/A",
            "quantidade": op.quantidade_produzida,
            "custo_insumos": round(op.custo_insumos, 2),
            "custo_mao_obra": round(op.custo_mao_obra, 2),
            "custo_maquina": round(op.custo_maquina, 2),
            "custo_total": round(custo_total_real, 2),
            "custo_unitario": round(custo_unitario_real, 2),
            "preco_venda_atual": op.produto.preco_venda if op.produto else 0
        })
        
    return analise
@router.get("/indicadores_manutencao")
def indicadores_manutencao(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Indicadores de manutenção: MTBF (estimado) e Custo Total por Máquina.
    """
    maquinas = db.query(models.Maquina).all()
    dados = []
    
    for m in maquinas:
        os_concluidas = db.query(models.OrdemServico).filter(
            models.OrdemServico.maquina_id == m.id,
            models.OrdemServico.status == "FINALIZADA"
        ).all()
        
        custo_total = sum(os.custo_total for os in os_concluidas)
        
        dados.append({
            "maquina": m.nome,
            "total_os": len(os_concluidas),
            "custo_total_manutencao": round(custo_total, 2),
            "status_atual": m.status
        })
        
    return dados
@router.get("/ordem_producao/{op_id}/pdf")
def exportar_op_pdf(
    op_id: int,
    request: Request,
    token: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    """
    Gera um PDF profissional para uma Ordem de Produção.
    """
    _resolve_document_user(db, request, token)

    op = db.query(models.OrdemProducao).filter(models.OrdemProducao.id == op_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="OP não encontrada")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    elements = []

    # Título
    elements.append(Paragraph(f"ORDEM DE PRODUÇÃO #{op.id}", styles['Title']))
    elements.append(Spacer(1, 0.5*cm))

    # Informações Gerais
    data_geral = [
        ["Produto:", op.produto.nome if op.produto else "N/A"],
        ["SKU:", op.produto.sku if op.produto else "N/A"],
        ["Quantidade Planejada:", f"{op.quantidade_planejada} {op.produto.unidade_medida if op.produto else ''}"],
        ["Status Atual:", op.status],
        ["Data Criação:", op.created_at.strftime("%d/%m/%Y %H:%M")],
        ["Data Início:", op.data_inicio.strftime("%d/%m/%Y %H:%M") if op.data_inicio else "-"],
        ["Data Fim:", op.data_fim.strftime("%d/%m/%Y %H:%M") if op.data_fim else "-"]
    ]
    
    t_info = Table(data_geral, colWidths=[5*cm, 10*cm])
    t_info.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('BACKGROUND', (0,0), (0,-1), colors.whitesmoke),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(t_info)
    elements.append(Spacer(1, 1*cm))

    # Tabela de Componentes
    elements.append(Paragraph("LISTA DE MATERIAIS (INSUMOS)", styles['Heading2']))
    elements.append(Spacer(1, 0.2*cm))
    
    comp_header = ["Insumo / Componente", "SKU", "Qtd Necessária"]
    comp_data = [comp_header]
    
    for item in op.itens:
        comp_data.append([
            item.produto_componente.nome if item.produto_componente else "N/A",
            item.produto_componente.sku if item.produto_componente else "N/A",
            f"{item.quantidade_necessaria} {item.produto_componente.unidade_medida if item.produto_componente else ''}"
        ])

    t_comp = Table(comp_data, colWidths=[8*cm, 3*cm, 4*cm])
    t_comp.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#2C3E50")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.whitesmoke, colors.white]),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(t_comp)
    
    # Rodapé / Assinatura
    elements.append(Spacer(1, 3*cm))
    elements.append(Paragraph("_" * 40, styles['Normal']))
    elements.append(Paragraph("Responsável pela Produção", styles['Normal']))

    doc.build(elements)
    buffer.seek(0)
    
    return StreamingResponse(buffer, media_type="application/pdf", headers={
        "Content-Disposition": f"attachment; filename=OP_{op.id}.pdf"
    })


@router.get("/pedido_venda/{pedido_id}/pdf")
def exportar_pedido_venda_pdf(
    pedido_id: int,
    request: Request,
    token: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    """
    Gera um PDF profissional para um Pedido de Venda.
    """
    _resolve_document_user(db, request, token)

    pedido = db.query(models.PedidoVenda).filter(models.PedidoVenda.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    
    # Estilo customizado para o cabeçalho
    styles.add(ParagraphStyle(name='HeaderInfo', parent=styles['Normal'], fontSize=10, leading=14))
    
    elements = []

    # Logo / Cabeçalho da Empresa
    elements.append(Paragraph("<b>VENNER INDUSTRIAL - ERP</b>", styles['Title']))
    elements.append(Paragraph("Rua da Indústria, 123 - Distrito Industrial", styles['HeaderInfo']))
    elements.append(Paragraph("Telefone: (11) 4002-8922 | email: comercial@venner.com.br", styles['HeaderInfo']))
    elements.append(Spacer(1, 0.5*cm))
    elements.append(Paragraph("<hr/>", styles['Normal']))
    elements.append(Spacer(1, 0.5*cm))

    elements.append(Paragraph(f"PEDIDO DE VENDA #{pedido.id}", styles['Heading1']))
    elements.append(Spacer(1, 0.5*cm))

    # Informações do Cliente e Pedido
    data_geral = [
        ["Cliente:", f"<b>{pedido.cliente_nome}</b>"],
        ["CPF/CNPJ:", pedido.cliente.cpf_cnpj if pedido.cliente else "-"],
        ["Data do Pedido:", pedido.data_pedido.strftime("%d/%m/%Y %H:%M")],
        ["Status:", f"<b>{pedido.status}</b>"],
        ["Vendedor Int.:", pedido.vendedor_interno.nome_completo if pedido.vendedor_interno else "-"],
        ["Representante:", pedido.representante.nome if pedido.representante else "Venda Direta"],
        ["Observações:", pedido.observacoes or "N/A"]
    ]
    
    t_info = Table(data_geral, colWidths=[4*cm, 12*cm])
    t_info.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('BACKGROUND', (0,0), (0,-1), colors.whitesmoke),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    elements.append(t_info)
    elements.append(Spacer(1, 0.5*cm))

    # Endereços e Pagamento
    if pedido.cliente:
        c = pedido.cliente
        addr_data = [
            [Paragraph("<b>ENDEREÇO DE ENTREGA</b>", styles['Normal']), Paragraph("<b>ENDEREÇO DE COBRANÇA</b>", styles['Normal'])],
            [
                Paragraph(f"{c.endereco_entrega or c.endereco or ''}, {c.numero_entrega or c.numero or ''}<br/>{c.bairro_entrega or c.bairro or ''} - {c.cidade_entrega or c.cidade or ''}/{c.uf_entrega or c.uf or ''}<br/>CEP: {c.cep_entrega or c.cep or ''}", styles['Normal']),
                Paragraph(f"{c.endereco_cobranca or c.endereco or ''}, {c.numero_cobranca or c.numero or ''}<br/>{c.bairro_cobranca or c.bairro or ''} - {c.municipio_cobranca or c.cidade or ''}/{c.uf_cobranca or c.uf or ''}<br/>CEP: {c.cep_cobranca or c.cep or ''}", styles['Normal'])
            ],
            [Paragraph(f"<b>PAGAMENTO:</b> {c.forma_pagamento_padrao or 'A combinar'}", styles['Normal']), Paragraph(f"<b>CONDIÇÃO:</b> {c.condicao_pagamento or '-'}", styles['Normal'])]
        ]
        t_addr = Table(addr_data, colWidths=[8*cm, 8*cm])
        t_addr.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(t_addr)
        elements.append(Spacer(1, 1*cm))
    else:
        elements.append(Spacer(1, 1*cm))

    # Tabela de Itens
    elements.append(Paragraph("ITENS DO PEDIDO", styles['Heading2']))
    elements.append(Spacer(1, 0.2*cm))
    
    item_header = ["Produto", "Qtd", "Vlr. Unitário", "Subtotal"]
    item_data = [item_header]
    
    for item in pedido.itens:
        vlr_unit = f"R$ {item.preco_unitario:,.2f}"
        subtotal = f"R$ {(item.quantidade * item.preco_unitario):,.2f}"
        item_data.append([
            item.produto.nome if item.produto else f"ID: {item.produto_id}",
            f"{item.quantidade} {item.produto.unidade_medida if item.produto else ''}",
            vlr_unit,
            subtotal
        ])

    t_items = Table(item_data, colWidths=[8*cm, 3*cm, 3*cm, 3*cm])
    t_items.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#2C3E50")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('ALIGN', (0,1), (0,-1), 'LEFT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.whitesmoke, colors.white]),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(t_items)
    
    # Totalizador
    elements.append(Spacer(1, 0.5*cm))
    total_para = Paragraph(f"<div align='right'><b>TOTAL DO PEDIDO: R$ {pedido.valor_total:,.2f}</b></div>", styles['Heading2'])
    elements.append(total_para)

    # Rodapé / Assinatura
    elements.append(Spacer(1, 3*cm))
    
    # Tabela de assinaturas
    sig_data = [
        ["________________________", "________________________"],
        ["Assinatura do Cliente", "Vendedor / Responsável"]
    ]
    t_sig = Table(sig_data, colWidths=[8*cm, 8*cm])
    t_sig.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTSIZE', (0,1), (-1,1), 9),
    ]))
    elements.append(t_sig)

    doc.build(elements)
    buffer.seek(0)
    
    return StreamingResponse(buffer, media_type="application/pdf", headers={
        "Content-Disposition": f"attachment; filename=Pedido_{pedido.id}.pdf"
    })
