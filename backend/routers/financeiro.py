from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
import re
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

from database import get_db
from services.auth import get_current_user
from models import ContaFinanceira, CategoriaFinanceira, ContaBancaria, FechamentoFinanceiro
from dependencies import get_empresa_id
import pytz
from pydantic import BaseModel

router = APIRouter(prefix="/financeiro", tags=["Financeiro"])

class ContaCreate(BaseModel):
    tipo: str # RECEBER, PAGAR
    descricao: str
    valor: float
    data_vencimento: datetime
    status: str = "PENDENTE"
    observacoes: Optional[str] = None
    cliente_id: Optional[int] = None
    pedido_id: Optional[int] = None
    categoria_id: Optional[int] = None
    conta_bancaria_id: Optional[int] = None
    recorrencia: Optional[str] = None # MENSAL, QUINZENAL, SEMANAL, ANUAL
    total_parcelas: Optional[int] = 1
    tags_csv: Optional[str] = None

class CategoriaCreate(BaseModel):
    descricao: str
    grupo: Optional[str] = None
    considera_dre: Optional[str] = None
    tipo: Optional[str] = None
    padrao_venda: Optional[bool] = False

class ContaBancariaCreate(BaseModel):
    descricao: str
    banco: Optional[str] = None
    agencia: Optional[str] = None
    conta: Optional[str] = None
    saldo_inicial: Optional[float] = 0.0

class ContaUpdateStatus(BaseModel):
    status: str # PAGO, CANCELADO
    data_pagamento: Optional[datetime] = None
    valor_pago: Optional[float] = None

@router.get("/contas")
def get_contas(
    tipo: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user),
    empresa_id: int = Depends(get_empresa_id)
):
    query = db.query(ContaFinanceira)
    if empresa_id:
        query = query.filter(ContaFinanceira.empresa_id == empresa_id)
    if tipo:
        query = query.filter(ContaFinanceira.tipo == tipo.upper())
    if status:
        query = query.filter(ContaFinanceira.status == status.upper())
        
    contas = query.order_by(ContaFinanceira.data_vencimento.asc()).all()
    
    # Monta resposta customizada com dados do cliente/pedido se houver
    res = []
    for c in contas:
        res.append({
            "id": c.id,
            "tipo": c.tipo,
            "status": c.status,
            "descricao": c.descricao,
            "valor": c.valor,
            "data_vencimento": c.data_vencimento.isoformat() if c.data_vencimento else None,
            "data_pagamento": c.data_pagamento.isoformat() if c.data_pagamento else None,
            "cliente_nome": c.cliente.nome_razao if c.cliente else None,
            "pedido_id": c.pedido_id,
            "categoria_id": c.categoria_id,
            "categoria_nome": c.categoria.descricao if c.categoria else None,
            "conta_bancaria_id": c.conta_bancaria_id,
            "conta_bancaria_nome": c.conta_bancaria.descricao if c.conta_bancaria else None,
            "tags_csv": c.tags_csv
        })
    return res

def check_fechamento_financeiro(db: Session, data_movimento: datetime, empresa_id: int = None):
    query = db.query(FechamentoFinanceiro)
    if empresa_id:
        query = query.filter(FechamentoFinanceiro.empresa_id == empresa_id)
    fechamento = query.order_by(FechamentoFinanceiro.data_fechamento.desc()).first()
    if fechamento:
        # Guarantee both are timezone aware or both naive for comparison
        # Simplest is to just compare dates if timezones are annoying, but let's assume datetimes are ok
        if data_movimento.replace(tzinfo=None) <= fechamento.data_fechamento.replace(tzinfo=None):
            raise HTTPException(
                status_code=400, 
                detail=f"Movimentação bloqueada: o período financeiro está fechado até {fechamento.data_fechamento.strftime('%d/%m/%Y')}."
            )

@router.post("/contas")
def create_conta(
    conta: ContaCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    empresa_id: int = Depends(get_empresa_id)
):
    import uuid
    from dateutil.relativedelta import relativedelta
    
    check_fechamento_financeiro(db, conta.data_vencimento, empresa_id)
    
    qtd_parcelas = conta.total_parcelas if conta.total_parcelas and conta.total_parcelas > 0 else 1
    recorrencia_id = str(uuid.uuid4()) if qtd_parcelas > 1 else None
    
    contas_criadas = []
    data_base = conta.data_vencimento
    
    for i in range(1, qtd_parcelas + 1):
        if i > 1:
            if conta.recorrencia == 'MENSAL':
                data_base = data_base + relativedelta(months=1)
            elif conta.recorrencia == 'ANUAL':
                data_base = data_base + relativedelta(years=1)
            elif conta.recorrencia == 'SEMANAL':
                data_base = data_base + relativedelta(weeks=1)
            elif conta.recorrencia == 'QUINZENAL':
                data_base = data_base + relativedelta(days=15)
                
            check_fechamento_financeiro(db, data_base, empresa_id)
            
        desc = conta.descricao
        if qtd_parcelas > 1:
            desc = f"{conta.descricao} ({i}/{qtd_parcelas})"
            
        nova_conta = ContaFinanceira(
            empresa_id=empresa_id,
            tipo=conta.tipo.upper(),
            descricao=desc,
            valor=conta.valor,
            data_vencimento=data_base,
            status=conta.status.upper(),
            observacoes=conta.observacoes,
            cliente_id=conta.cliente_id,
            pedido_id=conta.pedido_id,
            categoria_id=conta.categoria_id,
            conta_bancaria_id=conta.conta_bancaria_id,
            recorrencia_id=recorrencia_id,
            parcela_atual=i,
            total_parcelas=qtd_parcelas,
            tags_csv=conta.tags_csv
        )
        db.add(nova_conta)
        contas_criadas.append(nova_conta)
        
    db.commit()
    return {"message": f"{qtd_parcelas} conta(s) criada(s) com sucesso", "ids": [c.id for c in contas_criadas]}

@router.put("/contas/{conta_id}/status")
def update_status(
    conta_id: int,
    dados: ContaUpdateStatus,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    conta = db.query(ContaFinanceira).filter(ContaFinanceira.id == conta_id).first()
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
        
    check_fechamento_financeiro(db, conta.data_vencimento, conta.empresa_id)
    if conta.data_pagamento:
        check_fechamento_financeiro(db, conta.data_pagamento, conta.empresa_id)
    if dados.data_pagamento:
        check_fechamento_financeiro(db, dados.data_pagamento, conta.empresa_id)
        
    if dados.status.upper() == "PAGO":
        # Handle partial payment
        valor_pagar = dados.valor_pago if dados.valor_pago is not None else conta.valor
        
        if valor_pagar < conta.valor:
            # Create new pending bill for the remainder
            saldo_restante = conta.valor - valor_pagar
            nova_conta = ContaFinanceira(
                empresa_id=conta.empresa_id,
                tipo=conta.tipo,
                status="PENDENTE",
                descricao=f"{conta.descricao} (Saldo Restante)",
                valor=saldo_restante,
                data_vencimento=conta.data_vencimento,
                categoria_id=conta.categoria_id,
                conta_bancaria_id=conta.conta_bancaria_id,
                pedido_id=conta.pedido_id,
                cliente_id=conta.cliente_id,
                observacoes="Gerado automaticamente por baixa parcial."
            )
            db.add(nova_conta)
            conta.valor = valor_pagar # Adjust the current one to the amount actually paid
            
        conta.status = "PAGO"
        conta.data_pagamento = dados.data_pagamento or datetime.now()
    else:
        conta.status = dados.status.upper()
        if conta.status == "PENDENTE":
            conta.data_pagamento = None
            
    db.commit()
    return {"message": "Status da conta atualizado", "status": conta.status}

@router.delete("/contas/{conta_id}")
def delete_conta(
    conta_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    conta = db.query(ContaFinanceira).filter(ContaFinanceira.id == conta_id).first()
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
        
    check_fechamento_financeiro(db, conta.data_vencimento, conta.empresa_id)
    if conta.data_pagamento:
        check_fechamento_financeiro(db, conta.data_pagamento, conta.empresa_id)
        
    db.delete(conta)
    db.commit()
    return {"message": "Conta excluída com sucesso"}

class FechamentoCreate(BaseModel):
    data_fechamento: datetime

@router.get("/fechamentos")
def get_fechamento(db: Session = Depends(get_db), current_user = Depends(get_current_user), empresa_id: int = Depends(get_empresa_id)):
    query = db.query(FechamentoFinanceiro)
    if empresa_id:
        query = query.filter(FechamentoFinanceiro.empresa_id == empresa_id)
    f = query.order_by(FechamentoFinanceiro.data_fechamento.desc()).first()
    if not f:
        return None
    return {
        "id": f.id,
        "data_fechamento": f.data_fechamento.isoformat(),
        "data_registro": f.data_registro.isoformat() if f.data_registro else None,
        "usuario_id": f.usuario_id
    }

@router.post("/fechamentos")
def create_fechamento(
    dados: FechamentoCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    empresa_id: int = Depends(get_empresa_id)
):
    novo = FechamentoFinanceiro(
        empresa_id=empresa_id,
        data_fechamento=dados.data_fechamento,
        usuario_id=current_user.id
    )
    db.add(novo)
    db.commit()
    return {"message": "Período fechado com sucesso"}

@router.post("/caixa/transferencia")
def criar_transferencia(
    dados: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    empresa_id: int = Depends(get_empresa_id)
):
    origem_id = dados.get("origem_id")
    destino_id = dados.get("destino_id")
    valor = float(dados.get("valor", 0))
    data = dados.get("data")
    descricao = dados.get("descricao") or "Transferência"
    
    if origem_id == destino_id:
        raise HTTPException(status_code=400, detail="Contas origem e destino devem ser diferentes")
        
    data_dt = datetime.fromisoformat(data.replace("Z", "+00:00"))
    check_fechamento_financeiro(db, data_dt, empresa_id)
    
    # Needs a Category for Transfer (internal logic or we create one if it doesn't exist)
    cat = db.query(CategoriaFinanceira).filter(CategoriaFinanceira.descricao == "Transferência entre Contas").first()
    if not cat:
        cat = CategoriaFinanceira(descricao="Transferência entre Contas", grupo="Transferências", considera_dre="")
        db.add(cat)
        db.commit()
        db.refresh(cat)
        
    # Saida na origem
    saida = ContaFinanceira(
        empresa_id=empresa_id,
        tipo="PAGAR",
        descricao=descricao,
        valor=valor,
        data_vencimento=data_dt,
        data_pagamento=data_dt,
        status="PAGO",
        conta_bancaria_id=origem_id,
        categoria_id=cat.id,
        observacoes="Transferência de saída"
    )
    # Entrada no destino
    entrada = ContaFinanceira(
        empresa_id=empresa_id,
        tipo="RECEBER",
        descricao=descricao,
        valor=valor,
        data_vencimento=data_dt,
        data_pagamento=data_dt,
        status="PAGO",
        conta_bancaria_id=destino_id,
        categoria_id=cat.id,
        observacoes="Transferência de entrada"
    )
    
    db.add(saida)
    db.add(entrada)
    db.commit()
    
    return {"message": "Transferência realizada com sucesso"}

@router.post("/ofx/importar")
async def importar_ofx(file: UploadFile = File(...), db: Session = Depends(get_db), empresa_id: int = Depends(get_empresa_id)):
    """Lê um arquivo OFX e retorna as transações extraídas."""
    if not file.filename.lower().endswith('.ofx'):
        raise HTTPException(status_code=400, detail="O arquivo deve ser .ofx")
        
    content = await file.read()
    text = content.decode("utf-8", errors="ignore")
    
    # Simple regex parsing for OFX
    # We look for blocks of <STMTTRN> ... </STMTTRN>
    transacoes = []
    blocks = re.findall(r"<STMTTRN>(.*?)</STMTTRN>", text, re.DOTALL | re.IGNORECASE)
    
    for block in blocks:
        # Extract fields
        tipo_match = re.search(r"<TRNTYPE>(.*)", block, re.IGNORECASE)
        data_match = re.search(r"<DTPOSTED>([\d]+)", block, re.IGNORECASE)
        valor_match = re.search(r"<TRNAMT>(.*)", block, re.IGNORECASE)
        desc_match = re.search(r"<MEMO>(.*)", block, re.IGNORECASE)
        
        if not (data_match and valor_match):
            continue
            
        dt_str = data_match.group(1)[:8] # YYYYMMDD
        valor_str = valor_match.group(1).split('<')[0].strip()
        desc_str = desc_match.group(1).split('<')[0].strip() if desc_match else "Transação OFX"
        tipo_str = tipo_match.group(1).split('<')[0].strip() if tipo_match else "OTHER"
        
        try:
            val = float(valor_str)
            dt = datetime.strptime(dt_str, "%Y%m%d").isoformat()
            transacoes.append({
                "data": dt,
                "valor": val,
                "descricao": desc_str,
                "tipo_ofx": tipo_str, # CREDIT / DEBIT
                "tipo_erp": "RECEBER" if val > 0 else "PAGAR"
            })
        except Exception:
            pass
            
    return {"transacoes": transacoes}

@router.delete("/fechamentos")
def delete_fechamento(db: Session = Depends(get_db), current_user = Depends(get_current_user), empresa_id: int = Depends(get_empresa_id)):
    query = db.query(FechamentoFinanceiro)
    if empresa_id:
        query = query.filter(FechamentoFinanceiro.empresa_id == empresa_id)
    f = query.order_by(FechamentoFinanceiro.data_fechamento.desc()).first()
    if f:
        db.delete(f)
        db.commit()
    return {"message": "Último fechamento removido"}

@router.get("/dashboard")
def get_dashboard_financeiro(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    empresa_id: int = Depends(get_empresa_id)
):
    def apply_empresa(q):
        if empresa_id:
            return q.filter(ContaFinanceira.empresa_id == empresa_id)
        return q
        
    # Calcula os totais pendentes a receber e a pagar
    a_receber_total = apply_empresa(db.query(func.sum(ContaFinanceira.valor)).filter(
        ContaFinanceira.tipo == "RECEBER",
        ContaFinanceira.status == "PENDENTE"
    )).scalar() or 0.0
    
    a_pagar_total = apply_empresa(db.query(func.sum(ContaFinanceira.valor)).filter(
        ContaFinanceira.tipo == "PAGAR",
        ContaFinanceira.status == "PENDENTE"
    )).scalar() or 0.0
    
    receitas_pagas = apply_empresa(db.query(func.sum(ContaFinanceira.valor)).filter(
        ContaFinanceira.tipo == "RECEBER",
        ContaFinanceira.status == "PAGO"
    )).scalar() or 0.0
    
    despesas_pagas = apply_empresa(db.query(func.sum(ContaFinanceira.valor)).filter(
        ContaFinanceira.tipo == "PAGAR",
        ContaFinanceira.status == "PAGO"
    )).scalar() or 0.0
    
    saldo_caixa = receitas_pagas - despesas_pagas

    return {
        "a_receber": a_receber_total,
        "a_pagar": a_pagar_total,
        "saldo_caixa": saldo_caixa,
        "receitas_pagas": receitas_pagas,
        "despesas_pagas": despesas_pagas
    }

@router.get("/caixa")
def get_caixa(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    empresa_id: int = Depends(get_empresa_id)
):
    def apply_empresa(q):
        if empresa_id:
            return q.filter(ContaFinanceira.empresa_id == empresa_id)
        return q
        
    receitas_pagas = apply_empresa(db.query(func.sum(ContaFinanceira.valor)).filter(
        ContaFinanceira.tipo == "RECEBER",
        ContaFinanceira.status == "PAGO"
    )).scalar() or 0.0
    
    despesas_pagas = apply_empresa(db.query(func.sum(ContaFinanceira.valor)).filter(
        ContaFinanceira.tipo == "PAGAR",
        ContaFinanceira.status == "PAGO"
    )).scalar() or 0.0
    
    saldo_caixa = receitas_pagas - despesas_pagas

    hoje = datetime.now().date()
    
    # Extrair extrato do dia (movimentações pagas hoje)
    movimentacoes_hoje = apply_empresa(db.query(ContaFinanceira).filter(
        ContaFinanceira.status == "PAGO",
        func.date(ContaFinanceira.data_pagamento) == hoje
    )).order_by(ContaFinanceira.data_pagamento.asc()).all()
    
    extrato = []
    
    # Fake opening balance for demonstration if there is no opening
    extrato.append({
        "tipo": "abertura",
        "hora": "08:00",
        "descricao": "Abertura de Caixa",
        "valor": saldo_caixa
    })
    
    for mov in movimentacoes_hoje:
        extrato.append({
            "tipo": "entrada" if mov.tipo == "RECEBER" else "saida",
            "hora": mov.data_pagamento.strftime("%H:%M") if mov.data_pagamento else "12:00",
            "descricao": mov.descricao,
            "valor": mov.valor
        })
        
    return {
        "saldo": saldo_caixa,
        "extrato": extrato
    }

@router.get("/categorias")
def get_categorias(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(CategoriaFinanceira).all()

@router.post("/categorias")
def create_categoria(cat: CategoriaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    nova_cat = CategoriaFinanceira(**cat.model_dump())
    db.add(nova_cat)
    db.commit()
    db.refresh(nova_cat)
    return nova_cat

@router.get("/contas-bancarias")
def get_contas_bancarias(db: Session = Depends(get_db), current_user = Depends(get_current_user), empresa_id: int = Depends(get_empresa_id)):
    query = db.query(ContaBancaria)
    if empresa_id:
        query = query.filter(ContaBancaria.empresa_id == empresa_id)
    return query.all()

@router.post("/contas-bancarias")
def create_conta_bancaria(cb: ContaBancariaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user), empresa_id: int = Depends(get_empresa_id)):
    nova_cb = ContaBancaria(**cb.model_dump())
    nova_cb.empresa_id = empresa_id
    db.add(nova_cb)
    db.commit()
    db.refresh(nova_cb)
    return nova_cb

@router.get("/dre")
def get_dre(
    data_inicio: Optional[datetime] = None,
    data_fim: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    empresa_id: int = Depends(get_empresa_id)
):
    query = db.query(ContaFinanceira).join(CategoriaFinanceira)
    
    if empresa_id:
        query = query.filter(ContaFinanceira.empresa_id == empresa_id)
    
    if data_inicio:
        query = query.filter(ContaFinanceira.data_vencimento >= data_inicio)
    if data_fim:
        query = query.filter(ContaFinanceira.data_vencimento <= data_fim)
        
    contas = query.all()
    
    dre = {
        "receita_bruta": 0.0,
        "deducoes": 0.0,
        "custos": 0.0,
        "despesas_operacionais": 0.0
    }
    
    for c in contas:
        cat = c.categoria
        if cat:
            if cat.considera_dre == 'Receita Bruta' and c.tipo == 'RECEBER':
                dre["receita_bruta"] += c.valor
            elif cat.considera_dre == 'Deducoes' and c.tipo == 'PAGAR':
                dre["deducoes"] += c.valor
            elif cat.considera_dre == 'Custo' and c.tipo == 'PAGAR':
                dre["custos"] += c.valor
            elif cat.considera_dre == 'Despesa Operacional' and c.tipo == 'PAGAR':
                dre["despesas_operacionais"] += c.valor
                
    dre["receita_liquida"] = dre["receita_bruta"] - dre["deducoes"]
    dre["lucro_bruto"] = dre["receita_liquida"] - dre["custos"]
    dre["resultado_liquido"] = dre["lucro_bruto"] - dre["despesas_operacionais"]
    
    return dre

@router.get("/fluxo-caixa")
def get_fluxo_caixa(
    conta_bancaria_id: Optional[int] = None,
    data_inicio: Optional[datetime] = None,
    data_fim: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    empresa_id: int = Depends(get_empresa_id)
):
    query = db.query(ContaFinanceira)
    if empresa_id:
        query = query.filter(ContaFinanceira.empresa_id == empresa_id)
    
    if conta_bancaria_id:
        query = query.filter(ContaFinanceira.conta_bancaria_id == conta_bancaria_id)
        
    if data_inicio:
        query = query.filter(ContaFinanceira.data_vencimento >= data_inicio)
    if data_fim:
        query = query.filter(ContaFinanceira.data_vencimento <= data_fim)
        
    contas = query.order_by(ContaFinanceira.data_vencimento.asc()).all()
    
    # Group by date
    fluxo = {}
    for c in contas:
        if not c.data_vencimento:
            continue
            
        data_str = c.data_vencimento.strftime("%Y-%m-%d")
        if data_str not in fluxo:
            fluxo[data_str] = {"entradas": 0.0, "saidas": 0.0, "saldo_dia": 0.0}
            
        if c.tipo == "RECEBER":
            fluxo[data_str]["entradas"] += c.valor
        elif c.tipo == "PAGAR":
            fluxo[data_str]["saidas"] += c.valor
            
        fluxo[data_str]["saldo_dia"] = fluxo[data_str]["entradas"] - fluxo[data_str]["saidas"]
        
    # Convert to list sorted by date
    result = []
    for k in sorted(fluxo.keys()):
        result.append({
            "data": k,
            "entradas": fluxo[k]["entradas"],
            "saidas": fluxo[k]["saidas"],
            "saldo_dia": fluxo[k]["saldo_dia"]
        })
        
    return result

class WebhookPagamento(BaseModel):
    conta_id: int
    status: str
    gateway: str
    transacao_id: str

@router.post("/webhook/pagamento")
def webhook_pagamento(payload: WebhookPagamento, db: Session = Depends(get_db)):
    """Recebe notificação de Gateways/Smart POS para baixa automática"""
    conta = db.query(ContaFinanceira).filter(ContaFinanceira.id == payload.conta_id).first()
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
        
    if payload.status.upper() == "PAGO" and conta.status != "PAGO":
        conta.status = "PAGO"
        conta.data_pagamento = datetime.now()
        conta.observacoes = (conta.observacoes or "") + f" | Baixa via Webhook ({payload.gateway}: {payload.transacao_id})"
        db.commit()
        
    return {"message": "Webhook processado"}

@router.post("/cnab/gerar-remessa")
def gerar_remessa_cnab(
    banco_str: str = Query(..., description="Nome do banco, ex: INTER"),
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """
    Simula a geração de um arquivo de remessa CNAB (Cobrança Registrada).
    Seleciona contas pendentes a receber do banco escolhido e retorna um layout mock.
    """
    contas = db.query(ContaFinanceira).join(ContaBancaria).filter(
        ContaFinanceira.tipo == "RECEBER",
        ContaFinanceira.status == "PENDENTE",
        ContaBancaria.banco.ilike(f"%{banco_str}%")
    ).all()
    
    if not contas:
        raise HTTPException(status_code=400, detail="Nenhuma conta elegível encontrada para remessa neste banco.")
        
    # Mock CNAB 400 format (just a string blob to simulate the text file)
    linhas = []
    linhas.append("01REMESSA01COBRANCA       " + banco_str.ljust(15) + datetime.now().strftime("%d%m%y"))
    
    for i, c in enumerate(contas, 1):
        # Detalhe
        venc = c.data_vencimento.strftime("%d%m%y") if c.data_vencimento else "000000"
        val = str(int(c.valor * 100)).zfill(13)
        linhas.append(f"1{str(c.id).zfill(5)}{c.cliente_id or '000'}  {val} {venc} {c.descricao[:30].ljust(30)}")
        
    linhas.append("9" + str(len(linhas) + 1).zfill(6))
    
    # In a real scenario, this would return a FileResponse
    return {
        "arquivo": "\n".join(linhas),
        "total_contas": len(contas)
    }
