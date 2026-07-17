from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, UploadFile, File
from fastapi.responses import HTMLResponse, PlainTextResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, case
from database import get_db
import models, schemas
from typing import Optional, List
from services.auth import get_current_user, check_role
from services.auditoria_service import AuditoriaService
from models.base import TIPOS_ENTRADA, TIPOS_SAIDA, TipoMovimentacao
from jose import JWTError, jwt
import pandas as pd
import io
import json

from services.auth import ALGORITHM, SECRET_KEY

router = APIRouter(prefix="/produtos", tags=["Produtos"])


def _obter_produto_ou_404(db: Session, produto_id: int):
    produto = db.query(models.Produto).filter(models.Produto.id == produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return produto

def _validar_acesso_estoque(current_user: models.User):
    role_nome = getattr(getattr(current_user, "role", None), "nome", None)
    if role_nome == "COMERCIAL":
        raise HTTPException(
            status_code=403,
            detail="Acesso negado: perfil COMERCIAL deve usar o catálogo comercial de vendas."
        )

def _contar_referencias_produto(db: Session, produto_id: int):
    return {
        "movimentacoes de estoque": db.query(models.MovimentacaoEstoque)
            .filter(models.MovimentacaoEstoque.produto_id == produto_id)
            .count(),
        "reservas": db.query(models.ReservaEstoque)
            .filter(models.ReservaEstoque.produto_id == produto_id)
            .count(),
        "itens de inventario": db.query(models.InventarioItem)
            .filter(models.InventarioItem.produto_id == produto_id)
            .count(),
        "fichas tecnicas": db.query(models.FichaTecnicaItem)
            .filter(
                or_(
                    models.FichaTecnicaItem.produto_composto_id == produto_id,
                    models.FichaTecnicaItem.produto_componente_id == produto_id
                )
            )
            .count(),
        "ordens de producao": db.query(models.OrdemProducao)
            .filter(models.OrdemProducao.produto_id == produto_id)
            .count(),
        "itens de ordem de producao": db.query(models.OrdemProducaoItem)
            .filter(models.OrdemProducaoItem.produto_componente_id == produto_id)
            .count(),
        "componentes de maquina": db.query(models.MaquinaComponente)
            .filter(models.MaquinaComponente.produto_id == produto_id)
            .count(),
        "itens de ordem de servico": db.query(models.OSItem)
            .filter(models.OSItem.produto_id == produto_id)
            .count(),
        "itens de pedido de venda": db.query(models.PedidoVendaItem)
            .filter(models.PedidoVendaItem.produto_id == produto_id)
            .count(),
    }

def _formatar_referencias_ativas(referencias: dict):
    referencias_ativas = {nome: total for nome, total in referencias.items() if total > 0}
    detalhes = ", ".join(f"{nome}: {total}" for nome, total in referencias_ativas.items())
    return referencias_ativas, detalhes

def _contar_referencias_em_inventario_aberto(db: Session, produto_id: int):
    return db.query(models.InventarioItem)\
        .join(models.InventarioSessao, models.InventarioItem.sessao_id == models.InventarioSessao.id)\
        .filter(models.InventarioItem.produto_id == produto_id)\
        .filter(models.InventarioSessao.status == "ABERTO")\
        .count()


PRODUTO_PROJECTION_COLUMNS = [
    models.Produto.id.label("id"),
    models.Produto.nome.label("nome"),
    models.Produto.descricao.label("descricao"),
    models.Produto.sku.label("sku"),
    models.Produto.gtin.label("gtin"),
    models.Produto.categoria.label("categoria"),
    models.Produto.unidade_medida.label("unidade_medida"),
    models.Produto.corredor.label("corredor"),
    models.Produto.prateleira.label("prateleira"),
    models.Produto.posicao.label("posicao"),
    models.Produto.estoque_minimo.label("estoque_minimo"),
    models.Produto.estoque_medio.label("estoque_medio"),
    models.Produto.estoque_maximo.label("estoque_maximo"),
    models.Produto.tipo_produto.label("tipo_produto"),
    models.Produto.origem_icms.label("origem_icms"),
    models.Produto.ncm.label("ncm"),
    models.Produto.preco_venda.label("preco_venda"),
    models.Produto.custo.label("custo"),
    models.Produto.cod_fornecedor.label("cod_fornecedor"),
    models.Produto.peso_liquido.label("peso_liquido"),
    models.Produto.peso_bruto.label("peso_bruto"),
    models.Produto.tipo_embalagem.label("tipo_embalagem"),
    models.Produto.largura.label("largura"),
    models.Produto.altura.label("altura"),
    models.Produto.comprimento.label("comprimento"),
    models.Produto.controlar_estoque.label("controlar_estoque"),
    models.Produto.controlar_lotes.label("controlar_lotes"),
    models.Produto.dias_preparacao.label("dias_preparacao"),
    models.Produto.ativo.label("ativo"),
    models.Produto.created_at.label("created_at"),
    models.Produto.estoque_atual.label("estoque_atual"),
]

PRODUTO_CATALOGO_COLUMNS = [
    models.Produto.id.label("id"),
    models.Produto.nome.label("nome"),
    models.Produto.sku.label("sku"),
    models.Produto.categoria.label("categoria"),
    models.Produto.unidade_medida.label("unidade_medida"),
    models.Produto.prateleira.label("prateleira"),
    models.Produto.posicao.label("posicao"),
    models.Produto.estoque_minimo.label("estoque_minimo"),
    models.Produto.estoque_maximo.label("estoque_maximo"),
    models.Produto.estoque_atual.label("estoque_atual"),
    models.Produto.tipo_produto.label("tipo_produto"),
    models.Produto.preco_venda.label("preco_venda"),
    models.Produto.ativo.label("ativo"),
]


def _normalizar_status(status: str | None, default: str = "ativos") -> str:
    return (status or default).strip().lower()


def _aplicar_filtro_status(query, status_normalizado: str):
    if status_normalizado == "ativos":
        return query.filter(models.Produto.ativo.is_(True))
    if status_normalizado == "inativos":
        return query.filter(models.Produto.ativo.is_(False))
    if status_normalizado == "todos":
        return query
    raise HTTPException(
        status_code=400,
        detail="Filtro de status inválido. Use: ativos, inativos ou todos."
    )


def _row_to_dict(row):
    return dict(row._mapping)


def _buscar_produto_schema(db: Session, produto_id: int):
    row = db.query(*PRODUTO_PROJECTION_COLUMNS)\
        .filter(models.Produto.id == produto_id)\
        .first()
    if not row:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return _row_to_dict(row)


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


def _buscar_template_etiqueta(
    db: Session,
    *,
    template_id: int | None = None,
) -> models.EtiquetaTemplate | None:
    template = None
    if template_id:
        template = db.query(models.EtiquetaTemplate).filter(models.EtiquetaTemplate.id == template_id).first()
    if not template:
        template = db.query(models.EtiquetaTemplate).filter(models.EtiquetaTemplate.padrao.is_(True)).first()
    return template


def _build_label_context(produto: models.Produto) -> dict[str, str]:
    location = f"{produto.corredor or ''}/{produto.prateleira or ''}/{produto.posicao or ''}".strip("/")
    return {
        "{{sku}}": produto.sku or "",
        "{{nome}}": produto.nome or "",
        "{{descricao}}": produto.descricao or "",
        "{{gtin}}": produto.gtin or "",
        "{{categoria}}": produto.categoria or "",
        "{{localizacao}}": location,
    }


def _sanitize_zpl_value(value: str) -> str:
    return (
        str(value or "")
        .replace("^", " ")
        .replace("~", " ")
        .replace("\r", " ")
        .replace("\n", " ")
    )


def _resolve_label_field_value(produto: models.Produto, field: dict[str, object]) -> str:
    field_type = str(field.get("type", "")).strip().lower()
    if field_type == "sku":
        return produto.sku or ""
    if field_type == "name":
        return produto.nome or ""
    if field_type == "descricao":
        return produto.descricao or ""
    if field_type == "gtin":
        return produto.gtin or ""
    if field_type == "categoria":
        return produto.categoria or ""
    if field_type == "location":
        return f"{produto.corredor or ''}/{produto.prateleira or ''}/{produto.posicao or ''}".strip("/")
    if field_type == "custom":
        return str(field.get("customText", "") or "")
    if field_type == "barcode":
        return produto.gtin or produto.sku or ""
    return ""


def _generate_zpl_from_fields(
    produto: models.Produto,
    fields: list[dict[str, object]],
    *,
    largura_mm: float,
    altura_mm: float,
    dpi: int = 203,
) -> str:
    factor = dpi / 25.4
    pw = max(1, round(largura_mm * factor))
    ll = max(1, round(altura_mm * factor))
    zpl_lines = [f"^XA", f"^PW{pw}", f"^LL{ll}", "^CI28", ""]

    for field in fields:
        x = round(float(field.get("x", 0) or 0) * factor)
        y = round(float(field.get("y", 0) or 0) * factor)
        fw = max(1, round(float(field.get("w", 1) or 1) * factor))
        fh = max(1, round(float(field.get("h", 1) or 1) * factor))
        fs = max(12, round(float(field.get("fontSize", 10) or 10) * factor * 0.8))
        field_type = str(field.get("type", "")).strip().lower()

        if field_type == "barcode":
            barcode_value = _sanitize_zpl_value(_resolve_label_field_value(produto, field))
            barcode_height = max(24, round(fh * 0.7))
            zpl_lines.append(f"^FO{x},{y}^BY2^BCN,{barcode_height},Y,N,N^FD{barcode_value}^FS")
            continue

        if field_type == "logo":
            zpl_lines.append(f"^FO{x},{y}^A0N,{fs + 8},{fs + 8}^FDVENNER^FS")
            zpl_lines.append(
                f"^FO{x},{y + fs + 10}^A0N,{max(10, round(fs * 0.55))},{max(10, round(fs * 0.55))}^FDMETALURGICA E INJECAO PLASTICA^FS"
            )
            continue

        align = str(field.get("align", "flex-start"))
        zpl_align = "C" if align == "center" else "R" if align == "flex-end" else "L"
        text_value = _sanitize_zpl_value(_resolve_label_field_value(produto, field))
        zpl_lines.append(f"^FO{x},{y}^A0N,{fs},{fs}^FB{fw},1,0,{zpl_align}^FD{text_value}^FS")

    zpl_lines.extend(["", "^XZ"])
    return "\n".join(zpl_lines)


def _render_zpl_template(template: models.EtiquetaTemplate | None, produto: models.Produto) -> str:
    if template and template.campos_json:
        try:
            fields = json.loads(template.campos_json)
            if isinstance(fields, list) and fields:
                return _generate_zpl_from_fields(
                    produto,
                    fields,
                    largura_mm=template.largura_mm or 100.0,
                    altura_mm=template.altura_mm or 40.0,
                )
        except (TypeError, ValueError, json.JSONDecodeError):
            pass

    context = _build_label_context(produto)
    zpl_base = template.zpl_base if template and template.zpl_base else ""
    if zpl_base:
        rendered = zpl_base
        for key, value in context.items():
            rendered = rendered.replace(key, _sanitize_zpl_value(value))
        return rendered

    default_template = (
        "^XA\n"
        "^PW799\n"
        "^LL320\n"
        "^CI28\n"
        "^FO40,30^A0N,36,36^FD{{nome}}^FS\n"
        "^FO40,90^A0N,28,28^FDSKU: {{sku}}^FS\n"
        "^FO40,130^A0N,24,24^FD{{descricao}}^FS\n"
        "^FO40,200^BY2^BCN,80,Y,N,N^FD{{gtin}}^FS\n"
        "^XZ"
    )
    rendered = default_template
    for key, value in context.items():
        rendered = rendered.replace(key, _sanitize_zpl_value(value))
    return rendered

@router.post("", response_model=schemas.ProdutoSchema, dependencies=[Depends(check_role(["ADMIN", "GERENTE"]))])
@router.post("/", response_model=schemas.ProdutoSchema, dependencies=[Depends(check_role(["ADMIN", "GERENTE"]))], include_in_schema=False)
def criar_produto(
    produto: schemas.ProdutoCreate, 
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    config = db.query(models.ConfiguracaoProduto).first()
    
    if not produto.sku:
        if config and config.sku_automatico:
            # Generate sequential SKU
            last_prod = db.query(models.Produto).order_by(models.Produto.id.desc()).first()
            next_id = (last_prod.id + 1) if last_prod else 1
            produto.sku = f"PRD{next_id:05d}"
        else:
            raise HTTPException(status_code=400, detail="O SKU é obrigatório.")

    # Validação de SKU duplicado
    existente = db.query(models.Produto).filter(models.Produto.sku == produto.sku).first()
    if existente:
        if existente.ativo:
            detail = f"O SKU '{produto.sku}' já está cadastrado."
        else:
            detail = (
                f"O SKU '{produto.sku}' já existe em um produto inativo. "
                "Reative-o ou exclua-o definitivamente."
            )
        raise HTTPException(status_code=400, detail=detail)
        
    if produto.estoque_minimo > produto.estoque_maximo:
        raise HTTPException(status_code=400, detail="O estoque mínimo não pode ser maior que o máximo.")

    db_produto = models.Produto(**produto.model_dump())
    db.add(db_produto)
    db.commit()
    db.refresh(db_produto)
    
    AuditoriaService.registrar(
        db, current_user.username, "CREATE", "ESTOQUE", 
        f"Criou produto: {db_produto.nome} (SKU: {db_produto.sku})",
        entidade_id=db_produto.id,
        request=request
    )
    
    return _buscar_produto_schema(db, db_produto.id)

@router.get("", response_model=list[schemas.ProdutoSchema])
@router.get("/", response_model=list[schemas.ProdutoSchema], include_in_schema=False)
def listar_produtos(
    response: Response,
    categoria: Optional[str] = None, 
    posicao: Optional[str] = None,
    tipo: Optional[str] = None,
    abaixo_minimo: bool = False,
    status: str = Query(default="ativos"),
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    _validar_acesso_estoque(current_user)
    status_normalizado = _normalizar_status(status)
    
    # Se status for 'todos', o limite padrão é muito maior para suportar o catálogo completo do frontend
    if limit is None:
        limit = 50 if status_normalizado != "todos" else 10000
    
    query = db.query(models.Produto)
    query = _aplicar_filtro_status(query, status_normalizado)

    if categoria:
        query = query.filter(models.Produto.categoria == categoria)
    
    if posicao:
        query = query.filter(models.Produto.posicao.ilike(posicao))
        
    if tipo:
        if tipo.lower() == "simples":
            # Backward compatibility for 'simples' which we now treat as 'Revenda' or 'Simples'
            query = query.filter(models.Produto.tipo_produto.in_(["Simples", "Revenda"]))
        elif tipo.lower() == "kit":
            # Backward compatibility for 'composto'
            query = query.filter(models.Produto.tipo_produto.in_(["Composto", "Kit"]))
        else:
            query = query.filter(models.Produto.tipo_produto.ilike(tipo))
    
    if search:
        search_filter = or_(
            models.Produto.nome.ilike(f"%{search}%"),
            models.Produto.sku.ilike(f"%{search}%"),
            models.Produto.posicao.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)

    if abaixo_minimo:
        query = query.filter(models.Produto.estoque_atual < models.Produto.estoque_minimo)
    
    total = query.count()
    response.headers["X-Total-Count"] = str(total)
    
    rows = query.with_entities(*PRODUTO_PROJECTION_COLUMNS)\
        .order_by(models.Produto.nome)\
        .offset(skip)\
        .limit(limit)\
        .all()
    return [_row_to_dict(row) for row in rows]

@router.get("/stats")
def obter_estatisticas_produtos(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    _validar_acesso_estoque(current_user)
    # Status sempre = ativos para essa contagem
    q_base = db.query(models.Produto).filter(models.Produto.ativo.is_(True))
    
    total_todos = q_base.count()
    
    # We will map standard types: Simples, Kit, Variacao, Fabricado, Materia-Prima
    total_simples = q_base.filter(models.Produto.tipo_produto.in_(["Simples", "Revenda"])).count()
    total_kits = q_base.filter(models.Produto.tipo_produto.in_(["Composto", "Kit"])).count()
    total_variacoes = q_base.filter(models.Produto.tipo_produto.ilike("Variacao")).count()
    total_fabricado = q_base.filter(models.Produto.tipo_produto.ilike("Fabricado")).count()
    total_materia_prima = q_base.filter(models.Produto.tipo_produto.ilike("Materia-Prima")).count()
    
    return {
        "todos": total_todos,
        "simples": total_simples,
        "kits": total_kits,
        "variacoes": total_variacoes,
        "fabricado": total_fabricado,
        "materia_prima": total_materia_prima
    }


@router.get("/catalogo", response_model=list[schemas.ProdutoCatalogoSchema])
def listar_catalogo_produtos(
    status: str = Query(default="todos"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    _validar_acesso_estoque(current_user)
    status_normalizado = _normalizar_status(status, default="todos")
    query = _aplicar_filtro_status(db.query(models.Produto), status_normalizado)
    rows = query.with_entities(*PRODUTO_CATALOGO_COLUMNS)\
        .order_by(models.Produto.nome)\
        .all()
    return [_row_to_dict(row) for row in rows]

@router.get("/{id}", response_model=schemas.ProdutoSchema)
def obter_produto(
    id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    _validar_acesso_estoque(current_user)
    return _buscar_produto_schema(db, id)

@router.put("/{id}", response_model=schemas.ProdutoSchema, dependencies=[Depends(check_role(["ADMIN", "GERENTE"]))])
def atualizar_produto(
    id: int, 
    produto: schemas.ProdutoUpdate, 
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_produto = db.query(models.Produto).filter(models.Produto.id == id).first()
    if not db_produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    # Validação de SKU duplicado se estiver mudando o SKU
    if produto.sku and produto.sku != db_produto.sku:
        existente = db.query(models.Produto).filter(models.Produto.sku == produto.sku).first()
        if existente:
            if existente.ativo:
                detail = f"O SKU '{produto.sku}' já está em uso por outro produto."
            else:
                detail = (
                    f"O SKU '{produto.sku}' já pertence a um produto inativo. "
                    "Reative-o ou exclua-o definitivamente antes de reutilizar este SKU."
                )
            raise HTTPException(status_code=400, detail=detail)

    if produto.estoque_minimo is not None and produto.estoque_maximo is not None:
        if produto.estoque_minimo > produto.estoque_maximo:
            raise HTTPException(status_code=400, detail="O estoque mínimo não pode ser maior que o máximo.")

    obj_data = produto.model_dump(exclude_unset=True)
    for key, value in obj_data.items():
        setattr(db_produto, key, value)
        
    db.commit()
    
    AuditoriaService.registrar(
        db, current_user.username, "UPDATE", "ESTOQUE", 
        f"Atualizou produto: {db_produto.nome} (SKU: {db_produto.sku})",
        entidade_id=db_produto.id,
        request=request
    )
    
    return _buscar_produto_schema(db, db_produto.id)

@router.get("/{id}/etiqueta")
def obter_etiqueta_html(
    id: int,
    request: Request,
    token: str | None = None,
    template_id: Optional[int] = None,
    quantidade: int = 1,
    db: Session = Depends(get_db)
):
    _resolve_document_user(db, request, token)

    produto = db.query(models.Produto).filter(models.Produto.id == id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    # Busca template
    template = _buscar_template_etiqueta(db, template_id=template_id)
    
    html_label_content = ""
    css_style = ""
    largura = 100.0
    altura = 40.0

    is_visual = False
    import json
    
    if template:
        largura = template.largura_mm
        altura = template.altura_mm
        try:
            # Prioriza campos_json do editor visual, senão tenta html_template como JSON (legacy fallback)
            raw_fields = template.campos_json or template.html_template
            fields = json.loads(raw_fields)
            is_visual = True
            for f in fields:
                val = ""
                if f['type'] == 'sku': val = produto.sku
                elif f['type'] == 'name': val = produto.nome
                elif f['type'] == 'descricao': val = produto.descricao or ""
                elif f['type'] == 'gtin': val = produto.gtin or ""
                elif f['type'] == 'categoria': val = produto.categoria
                elif f['type'] == 'location': val = f"{produto.corredor or ''}/{produto.prateleira or ''}/{produto.posicao or ''}"
                elif f['type'] == 'custom': val = f.get('customText', '')
                
                field_style = f"position: absolute; left: {f['x']}mm; top: {f['y']}mm; width: {f['w']}mm; height: {f['h']}mm; "
                field_style += f"display: flex; align-items: center; justify-content: {f.get('align', 'flex-start')}; "
                field_style += f"font-size: {f['fontSize']}px; font-weight: {'bold' if f.get('bold') else 'normal'}; overflow: hidden;"
                
                if f['type'] == 'barcode':
                    html_label_content += f'<div style="{field_style} flex-direction: column;"><svg class="barcode-svg" data-value="{produto.gtin or produto.sku}" style="width: 100%; height: 100%;"></svg></div>'
                elif f['type'] == 'logo':
                    html_label_content += f'<div style="{field_style} flex-direction: column; justify-content: center; line-height: 1; text-align: center;">'
                    html_label_content += f'<div style="font-weight: 900; letter-spacing: 1px; font-size: {f["fontSize"]+2}px;">VENNER</div>'
                    html_label_content += f'<div style="font-size: {f["fontSize"]-5}px; opacity: 0.7;">METALURGICA</div></div>'
                else:
                    html_label_content += f'<div style="{field_style}"><span>{val}</span></div>'
        except:
            html_label_content = template.html_template
            css_style = template.css_template or ""

    if not is_visual and not html_label_content:
        html_label_content = f"""
        <div class="product-name">{produto.nome}</div>
        <div class="barcode-container"><svg class="barcode-svg" data-value="{produto.sku}"></svg></div>
        <div class="description">{produto.descricao or 'Sem descrição'}</div>
        <div class="footer">
            <span>Validade: Indeterminada</span>
            <span>Fabricado no Brasil</span>
        </div>
        """
        css_style = """
        .label-content { padding: 4mm 6mm; text-align: center; display: flex; flex-direction: column; justify-content: space-between; align-items: center; height: 100%; width: 100%; }
        .product-name { font-size: 13pt; font-weight: bold; text-transform: uppercase; margin-bottom: 1mm; width: 100%; }
        .barcode-container { width: 100%; display: flex; flex-direction: column; align-items: center; }
        .barcode-svg { max-width: 90%; height: auto; max-height: 20mm; }
        .description { font-size: 9pt; font-weight: bold; margin: 1mm 0; width: 100%; }
        .footer { width: 100%; display: flex; justify-content: space-between; font-size: 9pt; font-weight: bold; }
        """

    if not is_visual and template:
        replacements = {"{{nome}}": produto.nome, "{{sku}}": produto.sku, "{{gtin}}": produto.gtin or "", "{{categoria}}": produto.categoria, "{{descricao}}": produto.descricao or ""}
        for key, val in replacements.items():
            html_label_content = html_label_content.replace(key, str(val))

    # Repete a etiqueta 'quantidade' vezes
    full_body_html = ""
    for i in range(max(1, quantidade)):
        style_page = "page-break-after: always;" if i < (quantidade - 1) else ""
        full_body_html += f'<div class="label-wrapper" style="position: relative; width: {largura}mm; height: {altura}mm; {style_page}">{html_label_content}</div>'

    html_content = f"""
    <!DOCTYPE html>
    <html style="margin: 0; padding: 0; overflow: hidden;">
    <head>
        <meta charset="UTF-8">
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <style>
            @page {{ size: {largura}mm {altura}mm; margin: 0; }}
            * {{ box-sizing: border-box; -webkit-print-color-adjust: exact; }}
            html, body {{ margin: 0; padding: 0; background: white; color: black; }}
            .label-wrapper {{ overflow: hidden; }}
            {css_style}
        </style>
    </head>
    <body onload="generateBarcodes()">
        {full_body_html}
        <script>
            function generateBarcodes() {{
                const svgs = document.querySelectorAll(".barcode-svg");
                svgs.forEach(svg => {{
                    const val = svg.dataset.value;
                    JsBarcode(svg, val, {{
                        format: (val.length === 13 && /^\\d+$/.test(val)) ? "EAN13" : "CODE128",
                        width: 2, height: 50, displayValue: true, fontSize: 16, fontOptions: "bold", margin: 0
                    }});
                }});
                setTimeout(() => {{
                    window.print();
                    setTimeout(() => window.close(), 500);
                }}, 300);
            }}
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)


@router.get("/{id}/etiqueta/zpl")
def obter_etiqueta_zpl(
    id: int,
    request: Request,
    token: str | None = None,
    template_id: Optional[int] = None,
    quantidade: int = 1,
    db: Session = Depends(get_db),
):
    _resolve_document_user(db, request, token)

    produto = db.query(models.Produto).filter(models.Produto.id == id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    template = _buscar_template_etiqueta(db, template_id=template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Nenhum template de etiqueta foi encontrado")

    zpl_document = "\n".join(
        _render_zpl_template(template, produto)
        for _ in range(max(1, quantidade))
    )

    return PlainTextResponse(
        content=zpl_document,
        headers={
            "Content-Disposition": f'attachment; filename="etiqueta_{produto.sku or produto.id}.zpl"',
            "X-Venner-Label-Format": "zpl",
        },
    )

@router.delete("/{id}", dependencies=[Depends(check_role(["ADMIN"]))])
def deletar_produto(
    id: int, 
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_produto = _obter_produto_ou_404(db, id)
    
    # Fazemos uma exclusão lógica (soft delete) para manter integridade de históricos
    db_produto.ativo = False
    db.commit()
    
    AuditoriaService.registrar(
        db, current_user.username, "DELETE", "ESTOQUE", 
        f"Excluiu (logicamente) produto: {db_produto.nome} (SKU: {db_produto.sku})",
        entidade_id=id,
        request=request
    )
    
    return {"message": "Produto excluído com sucesso"}

@router.patch(
    "/{id}/reativar",
    response_model=schemas.ProdutoSchema,
    dependencies=[Depends(check_role(["ADMIN"]))]
)
def reativar_produto(
    id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_produto = _obter_produto_ou_404(db, id)

    db_produto.ativo = True
    db.commit()
    db.refresh(db_produto)
    
    AuditoriaService.registrar(
        db, current_user.username, "UPDATE", "ESTOQUE", 
        f"Reativou produto: {db_produto.nome} (SKU: {db_produto.sku})",
        entidade_id=id,
        request=request
    )
    
    return db_produto

@router.delete(
    "/{id}/permanente",
    dependencies=[Depends(check_role(["ADMIN"]))]
)
def excluir_produto_permanentemente(
    id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_produto = _obter_produto_ou_404(db, id)
    sku_del = db_produto.sku
    nome_del = db_produto.nome

    if db_produto.ativo:
        raise HTTPException(
            status_code=400,
            detail="Exclua o produto logicamente primeiro antes de remover definitivamente."
        )

    referencias = _contar_referencias_produto(db, id)
    referencias_ativas, detalhes = _formatar_referencias_ativas(referencias)
    if referencias_ativas:
        raise HTTPException(
            status_code=400,
            detail=(
                "Nao e possivel excluir definitivamente este produto porque ha historico vinculado. "
                f"Referencias encontradas: {detalhes}. "
                "Use Forcar Purga se quiser remover tambem o historico relacionado."
            )
        )

    db.delete(db_produto)
    db.commit()
    
    AuditoriaService.registrar(
        db, current_user.username, "DELETE", "ESTOQUE", 
        f"Excluiu PERMANENTEMENTE produto: {nome_del} (SKU: {sku_del})",
        entidade_id=id,
        request=request
    )
    
    return {"message": "Produto excluido definitivamente com sucesso"}

@router.delete(
    "/{id}/purga",
    dependencies=[Depends(check_role(["ADMIN"]))]
)
def forcar_purga_produto(
    id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_produto = _obter_produto_ou_404(db, id)
    sku_del = db_produto.sku
    nome_del = db_produto.nome

    if db_produto.ativo:
        raise HTTPException(
            status_code=400,
            detail="A purga forçada só é permitida para produtos já inativos."
        )

    referencias_inventario_aberto = _contar_referencias_em_inventario_aberto(db, id)
    if referencias_inventario_aberto:
        raise HTTPException(
            status_code=400,
            detail=(
                "Nao e possivel fazer a purga forçada porque o produto participa de inventario em andamento. "
                f"Referencias em inventario aberto: {referencias_inventario_aberto}."
            )
        )

    ordem_ids = [
        row[0] for row in db.query(models.OrdemProducao.id)
        .filter(models.OrdemProducao.produto_id == id)
        .all()
    ]

    try:
        removidos = {}

        removidos["itens de inventario"] = db.query(models.InventarioItem)\
            .filter(models.InventarioItem.produto_id == id)\
            .delete(synchronize_session=False)

        removidos["reservas"] = db.query(models.ReservaEstoque)\
            .filter(models.ReservaEstoque.produto_id == id)\
            .delete(synchronize_session=False)

        removidos["movimentacoes de estoque"] = db.query(models.MovimentacaoEstoque)\
            .filter(models.MovimentacaoEstoque.produto_id == id)\
            .delete(synchronize_session=False)

        removidos["fichas tecnicas"] = db.query(models.FichaTecnicaItem)\
            .filter(
                or_(
                    models.FichaTecnicaItem.produto_composto_id == id,
                    models.FichaTecnicaItem.produto_componente_id == id
                )
            )\
            .delete(synchronize_session=False)

        if ordem_ids:
            removidos["itens de ordens de producao do produto"] = db.query(models.OrdemProducaoItem)\
                .filter(models.OrdemProducaoItem.ordem_producao_id.in_(ordem_ids))\
                .delete(synchronize_session=False)
        else:
            removidos["itens de ordens de producao do produto"] = 0

        removidos["itens de ordem de producao como componente"] = db.query(models.OrdemProducaoItem)\
            .filter(models.OrdemProducaoItem.produto_componente_id == id)\
            .delete(synchronize_session=False)

        if ordem_ids:
            removidos["ordens de producao"] = db.query(models.OrdemProducao)\
                .filter(models.OrdemProducao.id.in_(ordem_ids))\
                .delete(synchronize_session=False)
        else:
            removidos["ordens de producao"] = 0

        removidos["componentes de maquina"] = db.query(models.MaquinaComponente)\
            .filter(models.MaquinaComponente.produto_id == id)\
            .delete(synchronize_session=False)

        removidos["itens de ordem de servico"] = db.query(models.OSItem)\
            .filter(models.OSItem.produto_id == id)\
            .delete(synchronize_session=False)

        removidos["itens de pedido de venda"] = db.query(models.PedidoVendaItem)\
            .filter(models.PedidoVendaItem.produto_id == id)\
            .delete(synchronize_session=False)

        db.delete(db_produto)
        db.commit()
        
        AuditoriaService.registrar(
            db, current_user.username, "PURGE", "ESTOQUE", 
            f"EXECUTOU PURGA (remoção total) do produto: {nome_del} (SKU: {sku_del})",
            entidade_id=id,
            request=request
        )

        removidos = {nome: total for nome, total in removidos.items() if total > 0}
        return {
            "message": "Produto e historico removidos com purga forçada.",
            "produto_id": id,
            "registros_removidos": removidos
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro na purga forçada: {str(e)}")


@router.get("/analise-abc")
def obter_analise_abc(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(["ADMIN", "GERENTE", "OPERADOR"])),
):
    _ = current_user
    from models.movimentacoes import MovimentacaoEstoque
    
    saldo_query = db.query(
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

    produtos = db.query(
        models.Produto.id,
        models.Produto.nome,
        models.Produto.sku,
        models.Produto.preco_venda,
        func.coalesce(saldo_query.c.estoque_calc, 0).label("saldo")
    ).outerjoin(saldo_query, models.Produto.id == saldo_query.c.produto_id)\
     .filter(models.Produto.ativo.is_(True)).all()

    analise = []
    valor_total_global = 0.0
    for p in produtos:
        vlr_estoque = p.saldo * p.preco_venda
        analise.append({
            "id": p.id,
            "sku": p.sku,
            "nome": p.nome,
            "valor_estoque": vlr_estoque
        })
        valor_total_global += vlr_estoque

    analise.sort(key=lambda x: x["valor_estoque"], reverse=True)

    acumulado = 0.0
    for item in analise:
        acumulado += item["valor_estoque"]
        perc = (acumulado / valor_total_global * 100) if valor_total_global > 0 else 100
        
        if perc <= 80:
            item["categoria_abc"] = "A"
        elif perc <= 95:
            item["categoria_abc"] = "B"
        else:
            item["categoria_abc"] = "C"

    return analise
