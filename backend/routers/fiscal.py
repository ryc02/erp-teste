import os
import requests
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from database import get_db
from dependencies import get_empresa_id
import models
from utils.validators import validar_cnpj, validar_cep, validar_numero_imovel

router = APIRouter(prefix="/fiscal", tags=["Fiscal"])

@router.get("/notas")
def listar_notas_olist(db: Session = Depends(get_db), empresa_id: int = Depends(get_empresa_id)):
    """Busca as últimas notas fiscais (apenas locais)."""
    resultado = []
    
    if db:
        query = db.query(models.NotaFiscal)
        if empresa_id:
            query = query.filter(models.NotaFiscal.empresa_id == empresa_id)
        notas_locais = query.order_by(models.NotaFiscal.id.desc()).limit(100).all()
        for nl in notas_locais:
            resultado.append({
                "id": nl.id,
                "numero": nl.numero or "Avulsa",
                "chave_acesso": "",
                "destinatario": nl.cliente_nome or "Não Informado",
                "valor": float(nl.valor_nota or 0),
                "status": nl.descricao_situacao or "Pendente",
                "data_emissao": nl.data_emissao.strftime("%d/%m/%Y") if nl.data_emissao else "",
                "email_enviado": getattr(nl, "email_enviado", False)
            })
                
    # Ordena por ID descrescente
    resultado.sort(key=lambda x: x["id"], reverse=True)
    return resultado

@router.get("/notas/resumo")
def resumo_notas_olist(db: Session = Depends(get_db)):
    """Retorna os totais para o painel de notas (mês atual simplificado)."""
    notas = listar_notas_olist(db)
    total = len(notas)
    autorizadas = sum(1 for n in notas if n["status"].lower() in ["autorizada", "emitida danfe"])
    rejeitadas = sum(1 for n in notas if n["status"].lower() == "rejeitada")
    canceladas = sum(1 for n in notas if n["status"].lower() == "cancelada")
    
    return {
        "total": total,
        "autorizadas": autorizadas,
        "rejeitadas": rejeitadas,
        "canceladas": canceladas
    }

@router.post("/notas/{id}/enviar-email")
def enviar_email_nfe(id: int, db: Session = Depends(get_db)):
    """Simula o disparo do XML/PDF da NFe por e-mail para o cliente."""
    import datetime
    nota = db.query(models.NotaFiscal).filter(models.NotaFiscal.id == id).first()
    if not nota:
        raise HTTPException(status_code=404, detail="Nota Fiscal não encontrada")
    
    if nota.descricao_situacao.lower() not in ["autorizada", "emitida danfe", "emitida"]:
        raise HTTPException(status_code=400, detail="Apenas notas autorizadas podem ser enviadas")
        
    # [!] Aqui ocorreria a integração real com SMTP ou SendGrid
    # Ex: send_email(to=nota.cliente_email, subject=f"Nota Fiscal {nota.numero}", attachments=[xml, pdf])
    print(f"[Fiscal] E-mail simulado com sucesso para a Nota Fiscal #{nota.id} - {nota.numero}")
    
    nota.email_enviado = True
    nota.data_envio_email = datetime.datetime.utcnow()
    db.commit()
    
    return {"status": "success", "message": "E-mail enviado com sucesso ao cliente."}

@router.get("/alertas-sefaz")
def listar_alertas_sefaz(db: Session = Depends(get_db)):
    """Retorna os avisos lidos pelo Robô Vigia da SEFAZ que ainda não foram marcados como lidos."""
    alertas = db.query(models.SefazAlerta).filter(models.SefazAlerta.lido == False).order_by(models.SefazAlerta.id.desc()).limit(10).all()
    return [
        {
            "id": a.id,
            "tipo": a.tipo,
            "mensagem": a.mensagem,
            "fonte": a.fonte,
            "lido": a.lido,
            "data": a.data_leitura.strftime("%d/%m/%Y %H:%M") if a.data_leitura else ""
        }
        for a in alertas
    ]

@router.put("/alertas-sefaz/{id}/lido")
def marcar_alerta_lido(id: int, db: Session = Depends(get_db)):
    """Marca um alerta como lido para removê-lo da interface."""
    alerta = db.query(models.SefazAlerta).filter(models.SefazAlerta.id == id).first()
    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta não encontrado.")
    alerta.lido = True
    db.commit()
    return {"status": "success", "mensagem": "Alerta marcado como lido."}

@router.get("/preparar-faturamento/{pedido_id}")
def preparar_faturamento(pedido_id: int, db: Session = Depends(get_db)):
    """Prepara a estrutura nativa da NF a partir de um Pedido de Venda."""
    pedido = db.query(models.PedidoVenda).filter(models.PedidoVenda.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    cliente = db.query(models.ClienteComercial).filter(models.ClienteComercial.id == pedido.cliente_id).first()
    
    # Montar rascunho de nota
    rascunho = {
        "pedido_id": pedido.id,
        "natureza_operacao": "Venda de produção própria",
        "tipo": "S",
        "cliente": {
            "nome": cliente.nome_razao_social if cliente else pedido.cliente_nome,
            "cpf_cnpj": cliente.cpf_cnpj if cliente else "",
            "endereco": cliente.endereco if cliente else "",
            "cidade": cliente.cidade if cliente else "",
            "uf": cliente.uf if cliente else ""
        },
        "itens": [],
        "frete": pedido.valor_frete or 0.0,
        "desconto": pedido.desconto_valor or 0.0,
        "condicao_pagamento": str(pedido.condicao_pagamento_id) if pedido.condicao_pagamento_id else "",
        "forma_pagamento": "",
        "meio_pagamento": ""
    }
    
    # Malha Fina de Validação
    erros_validacao = []
    
    if not cliente:
        erros_validacao.append("Cliente não está cadastrado formalmente.")
    else:
        if not cliente.cpf_cnpj:
            erros_validacao.append("Cliente sem CPF/CNPJ cadastrado.")
        if not cliente.endereco:
            erros_validacao.append("Endereço do cliente incompleto.")
            
    valor_produtos = 0.0
    for item in pedido.itens:
        prod = item.produto
        if not prod:
            erros_validacao.append(f"Produto ID {item.produto_id} não possui cadastro válido.")
            ncm = "3917.10.10"
            cfop = "5101"
        else:
            ncm = getattr(prod, 'ncm', None)
            if not ncm:
                erros_validacao.append(f"Produto '{prod.descricao}' sem código NCM informado.")
                ncm = "3917.10.10"
            cfop = "5101"
        
        vl_tot = item.quantidade * item.preco_unitario
        valor_produtos += vl_tot
        
        rascunho["itens"].append({
            "produto_id": item.produto_id,
            "codigo": prod.sku if prod else "",
            "descricao": prod.descricao if prod else "Produto sem cadastro",
            "unidade": prod.unidade_medida if prod else "UN",
            "ncm": ncm,
            "cfop": cfop,
            "quantidade": item.quantidade,
            "valor_unitario": item.preco_unitario,
            "valor_total": vl_tot
        })
    
    if len(rascunho["itens"]) == 0:
        erros_validacao.append("O pedido não possui itens para faturar.")
        
    rascunho["valor_produtos"] = valor_produtos
    rascunho["valor_total"] = valor_produtos + rascunho["frete"] - rascunho["desconto"]
    
    # Estimativa de impostos baseada no Regime Tributário
    faturadora_id = pedido.empresa_faturadora_id or pedido.empresa_id
    empresa_faturadora = db.query(models.Empresa).filter(models.Empresa.id == faturadora_id).first()
    regime = getattr(empresa_faturadora, 'regime_tributario', 'SIMPLES_NACIONAL')

    if regime == 'SIMPLES_NACIONAL':
        rascunho["base_icms"] = 0.0
        rascunho["valor_icms"] = 0.0
        rascunho["valor_ipi"] = 0.0
        rascunho["valor_ibs"] = 0.0
        rascunho["valor_cbs"] = 0.0
        rascunho["valor_is"] = 0.0
    else:
        # Lucro Presumido / Real
        rascunho["base_icms"] = valor_produtos
        rascunho["valor_icms"] = valor_produtos * 0.18
        rascunho["valor_ipi"] = valor_produtos * 0.05
        # Novos impostos RTC
        rascunho["valor_ibs"] = valor_produtos * 0.10 # Estimativa genérica IBS (10%)
        rascunho["valor_cbs"] = valor_produtos * 0.12 # Estimativa genérica CBS (12%)
        rascunho["valor_is"] = 0.0 # Imposto seletivo apenas para produtos específicos
    
    rascunho["erros_validacao"] = erros_validacao
    rascunho["pode_faturar"] = len(erros_validacao) == 0
    rascunho["empresa_faturadora_id"] = faturadora_id
    
    return rascunho

@router.post("/emitir")
def emitir_nota(dados: Dict[Any, Any], db: Session = Depends(get_db), empresa_id: int = Depends(get_empresa_id)):
    """Salva a NF nativamente no Venner e (futuramente) transmite para SEFAZ/Olist"""
    try:
        cliente_dados = dados.get("cliente", {})
        cnpj = cliente_dados.get("cpf_cnpj", "")
        cep = cliente_dados.get("cep", "")
        numero = cliente_dados.get("numero", "")

        # 1. Validação CNPJ
        if not validar_cnpj(cnpj):
            raise HTTPException(status_code=400, detail="CNPJ inválido ou mal formatado. A emissão foi bloqueada.")
        
        # 2. Validação CEP (se informado)
        if cep and not validar_cep(cep):
            raise HTTPException(status_code=400, detail="CEP inválido. Deve conter 8 dígitos numéricos.")
            
        # 3. Validação Número do Imóvel
        numero_validado = validar_numero_imovel(numero)

        # O empresa_id da nota deve ser o da empresa faturadora!
        faturadora_id = dados.get("empresa_faturadora_id", empresa_id)

        # Salva cabeçalho
        db_nota = models.NotaFiscal(
            empresa_id=faturadora_id,
            pedido_id=dados.get("pedido_id"),
            natureza_operacao=dados.get("natureza_operacao"),
            tipo=dados.get("tipo", "S"),
            cliente_nome=dados.get("cliente", {}).get("nome"),
            cliente_cpf_cnpj=dados.get("cliente", {}).get("cpf_cnpj"),
            valor_produtos=dados.get("valor_produtos", 0.0),
            valor_frete=dados.get("frete", 0.0),
            valor_desconto=dados.get("desconto", 0.0),
            valor_nota=dados.get("valor_total", 0.0),
            base_icms=dados.get("base_icms", 0.0),
            valor_icms=dados.get("valor_icms", 0.0),
            valor_ipi=dados.get("valor_ipi", 0.0),
            valor_ibs=dados.get("valor_ibs", 0.0),
            valor_cbs=dados.get("valor_cbs", 0.0),
            valor_is=dados.get("valor_is", 0.0),
            situacao="0", # Pendente
            descricao_situacao="Pendente",
            tp_emis="1" # Normal
        )
        db.add(db_nota)
        db.flush() # Para pegar o ID da nota

        # Salva itens
        itens = dados.get("itens", [])
        for item in itens:
            db_item = models.NotaFiscalItem(
                nota_id=db_nota.id,
                produto_id=item.get("produto_id"),
                codigo=item.get("codigo"),
                descricao=item.get("descricao"),
                unidade=item.get("unidade"),
                ncm=item.get("ncm"),
                cfop=item.get("cfop"),
                quantidade=item.get("quantidade", 1.0),
                valor_unitario=item.get("valor_unitario", 0.0),
                valor_total=item.get("valor_total", 0.0),
                valor_ibs=item.get("valor_total", 0.0) * 0.10,
                valor_cbs=item.get("valor_total", 0.0) * 0.12
            )
            db.add(db_item)
            
        # Muda status do pedido para faturado
        pedido = db.query(models.PedidoVenda).filter(models.PedidoVenda.id == dados.get("pedido_id")).first()
        if pedido:
            pedido.status = "FATURADO"
            
        db.commit()
        db.refresh(db_nota)
        return {"status": "success", "nota_id": db_nota.id, "mensagem": "NF salva nativamente com sucesso!"}
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/notas/local/{id}")
def buscar_nota_local(id: int, db: Session = Depends(get_db)):
    nota = db.query(models.NotaFiscal).filter(models.NotaFiscal.id == id).first()
    if not nota:
        raise HTTPException(status_code=404, detail="Nota Fiscal não encontrada")
    
    itens = db.query(models.NotaFiscalItem).filter(models.NotaFiscalItem.nota_id == id).all()
    
    return {
        "cabecalho": {
            "natureza_operacao": nota.natureza_operacao,
            "dest_nome": nota.cliente_nome,
            "dest_cnpj": nota.cliente_cpf_cnpj,
            "dest_cep": "", # Simplificado
            "dest_numero": ""
        },
        "totais": {
            "produtos": nota.valor_produtos,
            "frete": nota.valor_frete,
            "desconto": nota.valor_desconto,
            "total_nota": nota.valor_nota,
            "base_icms": nota.base_icms,
            "valor_icms": nota.valor_icms,
            "valor_ipi": nota.valor_ipi
        },
        "itens": [
            {
                "id": it.id,
                "descricao": it.descricao,
                "unidade": it.unidade,
                "ncm": it.ncm,
                "cfop": it.cfop,
                "qtde": it.quantidade,
                "preco_un": it.valor_unitario,
                "total": it.valor_total
            } for it in itens
        ]
    }

@router.put("/editar/{id}")
def editar_nota(id: int, dados: Dict[Any, Any], db: Session = Depends(get_db)):
    nota = db.query(models.NotaFiscal).filter(models.NotaFiscal.id == id).first()
    if not nota:
        raise HTTPException(status_code=404, detail="Nota não encontrada")
        
    # Validações Malha Fina
    cliente_dados = dados.get("cliente", {})
    cnpj = cliente_dados.get("cpf_cnpj", "")
    if not validar_cnpj(cnpj):
        raise HTTPException(status_code=400, detail="CNPJ inválido ou mal formatado. A emissão foi bloqueada.")

    nota.natureza_operacao = dados.get("natureza_operacao")
    nota.cliente_nome = cliente_dados.get("nome")
    nota.cliente_cpf_cnpj = cnpj
    nota.valor_produtos = dados.get("valor_produtos", 0.0)
    nota.valor_frete = dados.get("frete", 0.0)
    nota.valor_desconto = dados.get("desconto", 0.0)
    nota.valor_nota = dados.get("valor_total", 0.0)
    nota.base_icms = dados.get("base_icms", 0.0)
    nota.valor_icms = dados.get("valor_icms", 0.0)
    nota.valor_ipi = dados.get("valor_ipi", 0.0)
    
    # Deletar itens antigos e recriar
    db.query(models.NotaFiscalItem).filter(models.NotaFiscalItem.nota_id == id).delete()
    
    itens = dados.get("itens", [])
    for item in itens:
        db_item = models.NotaFiscalItem(
            nota_id=id,
            descricao=item.get("descricao"),
            unidade=item.get("unidade"),
            ncm=item.get("ncm"),
            cfop=item.get("cfop"),
            quantidade=item.get("quantidade", 1.0),
            valor_unitario=item.get("valor_unitario", 0.0),
            valor_total=item.get("valor_total", 0.0)
        )
        db.add(db_item)
        
    nota.situacao = "0" # Volta para pendente
    nota.descricao_situacao = "Pendente"
    
    db.commit()
    return {"status": "success", "mensagem": "Nota editada com sucesso e reenviada para fila."}

@router.post("/enviar-lote")
def enviar_lote(dados: Dict[str, List[int]], db: Session = Depends(get_db)):
    """Simula o envio assíncrono de lote para a SEFAZ (Olist Flow)"""
    notas_ids = dados.get("notas", [])
    if not notas_ids:
        raise HTTPException(status_code=400, detail="Nenhuma nota selecionada.")
        
    notas = db.query(models.NotaFiscal).filter(models.NotaFiscal.id.in_(notas_ids)).all()
    enviadas = 0
    bloqueadas = 0
    
    for nota in notas:
        # Bloqueio contra Consumo Indevido: Se a nota tem rejeição grave, não permite reenvio automático
        if nota.codigo_rejeicao and nota.codigo_rejeicao != "":
            bloqueadas += 1
            continue
            
        if nota.situacao == "0": # Pendente
            nota.situacao = "1" # Simulando 'Aguardando Protocolo'
            nota.descricao_situacao = "Aguardando Protocolo"
            enviadas += 1
            
    db.commit()
    msg = f"{enviadas} notas enviadas para protocolo."
    if bloqueadas > 0:
        msg += f" ({bloqueadas} bloqueadas por conterem rejeições pendentes de correção)."
        
    return {"status": "success", "mensagem": msg}

@router.post("/cancelar-lote")
def cancelar_lote(dados: Dict[str, List[int]], db: Session = Depends(get_db)):
    """Simula o cancelamento de um lote de notas fiscais."""
    notas_ids = dados.get("notas", [])
    if not notas_ids:
        raise HTTPException(status_code=400, detail="Nenhuma nota selecionada para cancelamento.")
        
    notas = db.query(models.NotaFiscal).filter(models.NotaFiscal.id.in_(notas_ids)).all()
    canceladas = 0
    
    for nota in notas:
        nota.situacao = "101" # Cancelada
        nota.descricao_situacao = "Cancelada"
        canceladas += 1
        
    db.commit()
    return {"status": "success", "mensagem": f"{canceladas} nota(s) cancelada(s) com sucesso."}


@router.post("/simular-rejeicao/{nota_id}")
def simular_rejeicao(nota_id: int, db: Session = Depends(get_db)):
    """Apenas para testes: Simula uma rejeição da SEFAZ para ver a trava de consumo indevido funcionando."""
    nota = db.query(models.NotaFiscal).filter(models.NotaFiscal.id == nota_id).first()
    if not nota:
        raise HTTPException(status_code=404, detail="Nota não encontrada.")
        
    nota.situacao = "135" # Erro
    nota.codigo_rejeicao = "778"
    nota.motivo_rejeicao = "Rejeicao: Informado NCM inexistente"
    nota.descricao_situacao = "Rejeitada pela SEFAZ"
    db.commit()
    db.commit()
    return {"status": "success"}

@router.post("/carta-correcao")
def carta_correcao(dados: Dict[str, Any], db: Session = Depends(get_db)):
    nota_id = dados.get("nota_id")
    texto_correcao = dados.get("texto")
    
    if not nota_id or not texto_correcao:
        raise HTTPException(status_code=400, detail="ID da nota e texto de correção são obrigatórios.")
        
    if len(texto_correcao) < 15 or len(texto_correcao) > 1000:
        raise HTTPException(status_code=400, detail="A Carta de Correção (CC-e) deve ter entre 15 e 1000 caracteres conforme regra da SEFAZ.")
        
    nota = db.query(models.NotaFiscal).filter(models.NotaFiscal.id == nota_id).first()
    if not nota:
        raise HTTPException(status_code=404, detail="Nota não encontrada.")
        
    # Anexa a observação da Carta de Correção (em um cenário real seria um evento em tabela separada)
    nota.obs = f"CC-e: {texto_correcao} | " + (nota.obs or "")
    db.commit()
    
    return {"status": "success", "mensagem": "Carta de Correção (CC-e) enviada com sucesso para a SEFAZ."}

@router.post("/inutilizar-numeracao")
def inutilizar_numeracao(dados: Dict[str, Any], db: Session = Depends(get_db)):
    ano = dados.get("ano")
    serie = dados.get("serie")
    num_inicial = dados.get("num_inicial")
    num_final = dados.get("num_final")
    justificativa = dados.get("justificativa")
    
    if not all([ano, serie, num_inicial, num_final, justificativa]):
        raise HTTPException(status_code=400, detail="Todos os campos são obrigatórios para inutilização.")
        
    if len(justificativa) < 15 or len(justificativa) > 255:
        raise HTTPException(status_code=400, detail="A justificativa deve ter entre 15 e 255 caracteres.")
        
    if num_inicial > num_final:
        raise HTTPException(status_code=400, detail="O número inicial não pode ser maior que o final.")

    # Simula o registro de inutilização (em um sistema real, salvaria em uma tabela especifica)
    return {"status": "success", "mensagem": f"A numeração de {num_inicial} a {num_final} (Série {serie}, {ano}) foi inutilizada com sucesso."}
    

@router.get("/marcadores")
def listar_marcadores(db: Session = Depends(get_db)):
    """Lista todos os marcadores disponíveis"""
    marcadores = db.query(models.Marcador).all()
    if not marcadores:
        # Criar os marcadores padrão da Olist na primeira vez
        padroes = [
            models.Marcador(descricao="1ª venda", cor="#808080"),
            models.Marcador(descricao="impresso", cor="#10b981"),
            models.Marcador(descricao="falta de mp - aguardando aço", cor="#f59e0b")
        ]
        db.add_all(padroes)
        db.commit()
        marcadores = db.query(models.Marcador).all()
        
    return [{"id": m.id, "descricao": m.descricao, "cor": m.cor} for m in marcadores]

@router.post("/processar-fila-contingencia")
def processar_fila_contingencia(db: Session = Depends(get_db)):
    """Worker de background: Processa notas travadas e joga para Contingência Offline (tpEmis=9)"""
    notas_pendentes = db.query(models.NotaFiscal).filter(models.NotaFiscal.situacao == "1").all()
    
    contingencias = 0
    
    for nota in notas_pendentes:
        # Simulando uma verificação de Timeout da SEFAZ (20 a 50 segundos)
        # Se falhou, joga para contingência offline (tpEmis=9)
        nota.tp_emis = "9"
        nota.situacao = "9" # Emitida em Contingência
        nota.descricao_situacao = "Emitida em Contingência (Offline)"
        contingencias += 1
        
    db.commit()
    return {"status": "success", "contingencias_ativadas": contingencias}

@router.post("/inutilizar-numeracao")
def inutilizar_numeracao(dados: Dict[str, Any], db: Session = Depends(get_db)):
    """Inutiliza um range de numeração (ex: pulo de sequência)"""
    serie = dados.get("serie", "1")
    numero_inicial = dados.get("numero_inicial")
    numero_final = dados.get("numero_final")
    justificativa = dados.get("justificativa")
    
    if not numero_inicial or not numero_final or not justificativa:
        raise HTTPException(status_code=400, detail="Dados incompletos para inutilização.")
        
    # Salvaríamos na tabela de Inutilizações para envio assíncrono para a SEFAZ
    return {"status": "success", "mensagem": f"Numeração {numero_inicial} a {numero_final} da série {serie} marcada para inutilização."}
