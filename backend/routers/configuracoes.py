from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
import sqlalchemy as sa
from typing import List, Optional
from services.auth import get_current_user, check_role

router = APIRouter(prefix="/configuracoes", tags=["Configurações"])

@router.get("/etiquetas", response_model=List[schemas.EtiquetaTemplateSchema])
def listar_templates_etiquetas(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.EtiquetaTemplate).all()

@router.get("/etiquetas/{id}", response_model=schemas.EtiquetaTemplateSchema)
def buscar_template_etiqueta(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_template = db.query(models.EtiquetaTemplate).filter(models.EtiquetaTemplate.id == id).first()
    if not db_template:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    return db_template

@router.post("/etiquetas", response_model=schemas.EtiquetaTemplateSchema)
def criar_template_etiqueta(
    template: schemas.EtiquetaTemplateCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(["ADMIN"]))
):
    # Se for marcado como padrão, desmarca os outros
    if template.padrao:
        db.query(models.EtiquetaTemplate).update({"padrao": False})
    
    db_template = models.EtiquetaTemplate(**template.model_dump())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

@router.put("/etiquetas/{id}", response_model=schemas.EtiquetaTemplateSchema)
def atualizar_template_etiqueta(
    id: int,
    template: schemas.EtiquetaTemplateCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(["ADMIN"]))
):
    db_template = db.query(models.EtiquetaTemplate).filter(models.EtiquetaTemplate.id == id).first()
    if not db_template:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    if template.padrao:
        db.query(models.EtiquetaTemplate).filter(models.EtiquetaTemplate.id != id).update({"padrao": False})
    
    for key, value in template.model_dump().items():
        setattr(db_template, key, value)
        
    db.commit()
    db.refresh(db_template)
    return db_template

@router.delete("/etiquetas/{id}")
def deletar_template_etiqueta(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(["ADMIN"]))
):
    db_template = db.query(models.EtiquetaTemplate).filter(models.EtiquetaTemplate.id == id).first()
    if not db_template:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    db.delete(db_template)
    db.commit()
    return {"message": "Template deletado com sucesso"}

from fastapi import File, UploadFile
import csv

import io
import pandas as pd

@router.get("/db-health")
def get_db_health(db: Session = Depends(get_db)):
    try:
        db.execute(sa.text("SELECT 1"))
        return {"status": "healthy"}
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "detail": str(e)}
        )

@router.post("/importar-estoque")
async def importar_estoque(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(["ADMIN"]))
):
    filename = file.filename.lower()
    if not (filename.endswith('.csv') or filename.endswith('.xlsx')):
        raise HTTPException(status_code=400, detail="Suportado apenas .csv ou .xlsx")

    contents = await file.read()
    try:
        if filename.endswith('.csv'):
            try:
                df = pd.read_csv(io.BytesIO(contents), sep=None, engine='python')
            except:
                df = pd.read_csv(io.BytesIO(contents), sep=None, engine='python', encoding='latin-1')
        else:
            # Tentar detectar cabealho na linha 0 ou 1
            df_detect = pd.read_excel(io.BytesIO(contents), header=None, nrows=2)
            header_row = 0
            row0 = [str(c).lower().strip() for c in df_detect.iloc[0].tolist()]
            # Se no achar SKU ou nome na primeira linha, pula para a segunda
            if not any(h in row0 for h in ["sku", "id", "nome", "quantidade", "cdigo"]):
                header_row = 1
            df = pd.read_excel(io.BytesIO(contents), header=header_row)
            
        # Limpar nomes de colunas
        df.columns = [str(c).strip() for c in df.columns]
        
        # Mapeamento Flexvel (Ultra-robusto)
        def get_col(candidates):
            # 1. Busca exata (ignorando case e espaos)
            for c in df.columns:
                c_clean = str(c).lower().strip()
                if any(cand.lower() == c_clean for cand in candidates):
                    return c
            # 2. Busca por substring (contm)
            for c in df.columns:
                c_clean = str(c).lower().strip()
                if any(cand.lower() in c_clean for cand in candidates):
                    return c
            return None

        # Lista de candidatos expandida para cobrir mais variaes
        col_sku = get_col(["sku", "cdigo", "codigo", "referencia", "id", "ref"])
        col_nome = get_col(["nome", "descrio", "descrio", "item", "produto"])
        col_qtd = get_col(["quantidade", "qtd", "saldo", "atual", "estoque", "fsico"])
        col_cat = get_col(["categoria", "famlia", "famlia", "grupo", "tipo"])
        col_unid = get_col(["unidade", "unid", "u.m", "um"])
        col_desc_c = get_col(["descrio complementar", "complementar", "obs", "detalhes"])
        
        # Sobrescrever se for a planilha do usurio com erros de digitao
        # Coluna B (index 1) -> Nome
        # Coluna D (index 3) -> NCM
        # Coluna U (index 20) -> Descrio Complementar
        if len(df.columns) > 20:
            # Se a coluna 1 contm "descri" ou "nome", usamos ela como nome
            c1 = str(df.columns[1]).lower()
            if "descri" in c1 or "nome" in c1:
                col_nome = df.columns[1]
            
            # Coluna D (index 3) -> NCM
            col_ncm = df.columns[3]
            
            # Coluna S (index 18) -> GTIN
            col_gtin = df.columns[18]
            
            # Se a coluna 20 contm "complementar", usamos ela como descrio
            c20 = str(df.columns[20]).lower()
            if "complementar" in c20:
                col_desc_c = df.columns[20]
        
        col_tipo = get_col(["tipo"])
        col_ncm = get_col(["ncm", "classificao"])
        col_gtin = get_col(["gtin", "ean", "barras"])
        col_ativo = get_col(["ativo", "status", "situao"])
        col_loc = get_col(["localização", "localizacao", "localizao", "posição", "posicao", "posio", "identificação", "identificacao"])
        col_corredor = get_col(["corredor"])
        col_prateleira = get_col(["prateleira"])
        col_peso_l = get_col(["peso terico", "peso_liquido", "peso liquido", "peso liq"])
        col_peso_b = get_col(["peso bruto", "peso_bruto"])

        if not col_sku:
            raise HTTPException(status_code=400, detail=f"Planilha invlida. No foi possvel encontrar coluna de SKU. Colunas: {list(df.columns)}")

        results = {"criados": 0, "atualizados": 0, "ajustes_estoque": 0, "erros": 0, "detalhes": []}
        
        for index, row in df.iterrows():
            try:
                sku_val = row.get(col_sku)
                if pd.isna(sku_val): continue
                
                sku = str(sku_val).strip()
                if not sku or sku == "nan": continue

                produto = db.query(models.Produto).filter(models.Produto.sku == sku).first()
                
                loc_raw = str(row.get(col_loc, "")).strip() if col_loc and not pd.isna(row.get(col_loc)) else ""

                # Dados cadastrais
                corredor = str(row.get(col_corredor, "")).strip() if col_corredor and not pd.isna(row.get(col_corredor)) else ""
                prateleira = str(row.get(col_prateleira, "")).strip() if col_prateleira and not pd.isna(row.get(col_prateleira)) else ""
                posicao = loc_raw
                
                dados = {
                    "sku": sku,
                    "nome": str(row.get(col_nome, "SEM NOME")).strip() if col_nome and not pd.isna(row.get(col_nome)) else "SEM NOME",
                    "categoria": str(row.get(col_cat, "Geral")).strip() if col_cat and not pd.isna(row.get(col_cat)) else "Geral",
                    "unidade_medida": str(row.get(col_unid, "UN")).strip() if col_unid and not pd.isna(row.get(col_unid)) else "UN",
                    "descricao": str(row.get(col_desc_c, "")).strip() if col_desc_c and not pd.isna(row.get(col_desc_c)) else "",
                    "tipo_produto": str(row.get(col_tipo, "Simples")).strip() if col_tipo and not pd.isna(row.get(col_tipo)) else "Simples",
                    "ncm": str(row.get(col_ncm, "")).strip() if col_ncm and not pd.isna(row.get(col_ncm)) else "",
                    "gtin": str(row.get(col_gtin, "")).strip() if col_gtin and not pd.isna(row.get(col_gtin)) else "",
                    "posicao": posicao,
                }
                
                # Nmeros
                for field, col in [("peso_liquido", col_peso_l), ("peso_bruto", col_peso_b)]:
                    if col:
                        val = row.get(col)
                        if not pd.isna(val):
                            try:
                                if isinstance(val, str): val = val.replace(",", ".")
                                dados[field] = float(val)
                            except: dados[field] = 0.0
                
                # Ativo
                if col_ativo:
                    val = str(row.get(col_ativo)).upper()
                    if "INATIVO" in val or "N" in val: dados["ativo"] = False
                    else: dados["ativo"] = True
                
                # Criao/Atualizao Cadastral
                if produto:
                    for key, value in dados.items():
                        setattr(produto, key, value)
                    results["atualizados"] += 1
                else:
                    produto = models.Produto(**dados)
                    db.add(produto)
                    db.flush() # Para pegar o ID se for novo
                    results["criados"] += 1
                
                # Ajuste de Estoque (se houver coluna de quantidade)
                if col_qtd:
                    qtd_val = row.get(col_qtd)
                    if not pd.isna(qtd_val):
                        try:
                            if isinstance(qtd_val, str): qtd_val = qtd_val.replace(",", ".")
                            qtd_num = float(qtd_val)
                            
                            diferenca = qtd_num - produto.estoque_atual
                            if abs(diferenca) > 0.0001:
                                mov = models.MovimentacaoEstoque(
                                    produto_id=produto.id,
                                    tipo=models.TipoMovimentacao.AJUSTE,
                                    quantidade=abs(diferenca),
                                    usuario=current_user.username,
                                    origem="IMPORTACAO",
                                    observacao=f"Ajuste via planilha ({filename}). Saldo: {produto.estoque_atual} -> {qtd_num}"
                                )
                                db.add(mov)
                                results["ajustes_estoque"] += 1
                        except:
                            results["detalhes"].append(f"Qtd invlida na linha {index+2} para SKU {sku}")

            except Exception as e:
                results["erros"] += 1
                results["detalhes"].append(f"Erro na linha {index+2}: {str(e)}")
                
        db.commit()
        
        try:
            from services.auditoria_service import AuditoriaService
            AuditoriaService.registrar(
                db, current_user.username, "IMPORT", "ESTOQUE", 
                f"Importação de estoque via planilha: {filename}. Criados: {results['criados']}, Atualizados: {results['atualizados']}, Ajustes: {results['ajustes_estoque']}",
                request=request
            )
        except Exception as audit_err:
            print(f"Erro ao registrar auditoria de importacao: {audit_err}")

        return results
    except HTTPException: raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao processar arquivo: {str(e)}")

@router.post("/purga-total", dependencies=[Depends(check_role(["ADMIN"]))])
def purga_total_produtos(
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        from services.auditoria_service import AuditoriaService
        
        # 1. Obter todos os IDs de produtos
        produto_ids = [p.id for p in db.query(models.Produto.id).all()]
        total_produtos = len(produto_ids)
        
        if total_produtos == 0:
            return {"message": "Nenhum produto encontrado para purga."}

        # 2. Limpar tabelas relacionadas em lote para performance
        db.query(models.MovimentacaoEstoque).delete(synchronize_session=False)
        db.query(models.FichaTecnicaItem).delete(synchronize_session=False)
        db.query(models.OrdemProducaoItem).delete(synchronize_session=False)
        db.query(models.OrdemProducao).delete(synchronize_session=False)
        db.query(models.MaquinaComponente).delete(synchronize_session=False)
        db.query(models.OSItem).delete(synchronize_session=False)
        db.query(models.PedidoVendaItem).delete(synchronize_session=False)
        db.query(models.ReservaEstoque).delete(synchronize_session=False)
        db.query(models.InventarioItem).delete(synchronize_session=False)
        db.query(models.InventarioSessao).delete(synchronize_session=False)
        
        # 3. Finalmente deletar os produtos
        db.query(models.Produto).delete(synchronize_session=False)
        
        db.commit()
        
        AuditoriaService.registrar(
            db, current_user.username, "PURGE_ALL", "ESTOQUE", 
            f"EXECUTOU PURGA TOTAL: {total_produtos} produtos e todos os históricos relacionados foram removidos.",
            request=request
        )
        
        return {
            "message": "Purga total realizada com sucesso.",
            "total_produtos_removidos": total_produtos
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro na purga total: {str(e)}")


@router.get("/modulos", response_model=List[schemas.ModuloSchema])
def listar_modulos(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(["ADMIN"]))
):
    return db.query(models.Modulo).all()


@router.put("/modulos/{modulo_id}")
def atualizar_modulo(
    modulo_id: int,
    payload: schemas.ModuloUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(["ADMIN"]))
):
    modulo = db.query(models.Modulo).filter(models.Modulo.id == modulo_id).first()
    if not modulo:
        raise HTTPException(status_code=404, detail="Módulo não encontrado")
    
    modulo.ativo = payload.ativo
    db.commit()
    return {"status": "success", "message": f"Módulo {modulo.nome} atualizado."}

@router.get("/produtos", response_model=schemas.ConfiguracaoProdutoSchema)
def get_configuracoes_produtos(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    config = db.query(models.ConfiguracaoProduto).first()
    if not config:
        config = models.ConfiguracaoProduto()
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@router.put("/produtos", response_model=schemas.ConfiguracaoProdutoSchema)
def update_configuracoes_produtos(
    payload: schemas.ConfiguracaoProdutoUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(["ADMIN"]))
):
    config = db.query(models.ConfiguracaoProduto).first()
    if not config:
        config = models.ConfiguracaoProduto()
        db.add(config)
        
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(config, key, value)
        
    db.commit()
    db.refresh(config)
    return config

@router.get("/vendas", response_model=schemas.ConfiguracoesVendaSchema)
def get_configuracoes_vendas(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    config = db.query(models.ConfiguracoesVenda).first()
    if not config:
        config = models.ConfiguracoesVenda()
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@router.put("/vendas", response_model=schemas.ConfiguracoesVendaSchema)
def update_configuracoes_vendas(
    payload: schemas.ConfiguracoesVendaUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(["ADMIN"]))
):
    config = db.query(models.ConfiguracoesVenda).first()
    if not config:
        config = models.ConfiguracoesVenda(**payload.dict())
        db.add(config)
        db.commit()
        db.refresh(config)
    else:
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(config, key, value)
        
    db.commit()
    db.refresh(config)
    return config
