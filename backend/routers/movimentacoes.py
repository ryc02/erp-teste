from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import schemas, models
from services.estoque_service import EstoqueService
from services.auth import get_current_user, check_role
from services.auditoria_service import AuditoriaService
from services.websocket_service import manager
from fastapi import Request

ALLOWED_STOCK_ROLES = ["ADMIN", "GERENTE", "OPERADOR"]

router = APIRouter(
    prefix="/movimentacoes",
    tags=["Movimentações"],
    dependencies=[Depends(check_role(ALLOWED_STOCK_ROLES))],
)

@router.post("", response_model=schemas.MovimentacaoSchema, dependencies=[Depends(check_role(["ADMIN", "GERENTE"]))])
@router.post("/", response_model=schemas.MovimentacaoSchema, dependencies=[Depends(check_role(["ADMIN", "GERENTE"]))], include_in_schema=False)
async def registrar_movimentacao(
    mov: schemas.MovimentacaoCreate, 
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    resultado = EstoqueService.registrar_movimentacao(db, mov)
    
    # Auditoria
    AuditoriaService.registrar(
        db, current_user.username, "REGISTRAR", "ESTOQUE", 
        f"Lançou movimentação de {mov.quantidade} para produto ID {mov.produto_id} ({mov.tipo})",
        entidade_id=resultado.id,
        request=request
    )
    
    # WebSocket Notifications
    produto = db.query(models.Produto).filter(models.Produto.id == mov.produto_id).first()
    
    # 1. Alerta de Estoque Baixo
    if produto and produto.estoque_atual <= produto.estoque_minimo:
        await manager.broadcast({
            "type": "LOW_STOCK",
            "title": "Alerta de Estoque Crítico",
            "message": f"O produto {produto.nome} ({produto.sku}) atingiu o nível crítico: {produto.estoque_atual} {produto.unidade_medida}.",
            "severity": "warning",
            "produto_id": produto.id
        })
    
    # 2. Atualização Geral (para recarregar tabelas)
    await manager.broadcast({
        "type": "STOCK_UPDATED",
        "produto_id": mov.produto_id,
        "sku": produto.sku if produto else None
    })
    
    return resultado

@router.get("", response_model=list[schemas.MovimentacaoSchema])
@router.get("/", response_model=list[schemas.MovimentacaoSchema], include_in_schema=False)
def listar_movimentacoes(
    produto_id: int = None, 
    db: Session = Depends(get_db),
):
    query = db.query(models.MovimentacaoEstoque)
    if produto_id:
        query = query.filter(models.MovimentacaoEstoque.produto_id == produto_id)
    return query.order_by(models.MovimentacaoEstoque.created_at.desc()).all()
