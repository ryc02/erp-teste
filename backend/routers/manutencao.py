from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from services.estoque_service import EstoqueService
from datetime import datetime

from services.auth import get_current_user

router = APIRouter(prefix="/manutencao", tags=["Manutenção"])

# Máquinas
@router.get("/maquinas", response_model=list[schemas.MaquinaSchema])
def listar_maquinas(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Maquina).all()

@router.post("/maquinas", response_model=schemas.MaquinaSchema)
def criar_maquina(
    maquina: schemas.MaquinaCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_maquina = models.Maquina(**maquina.model_dump())
    db.add(db_maquina)
    db.commit()
    db.refresh(db_maquina)
    return db_maquina

@router.put("/maquinas/{id}", response_model=schemas.MaquinaSchema)
async def atualizar_maquina(
    id: int, 
    maquina: schemas.MaquinaCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_maquina = db.query(models.Maquina).filter(models.Maquina.id == id).first()
    if not db_maquina:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    
    old_status = db_maquina.status
    for key, value in maquina.model_dump().items():
        setattr(db_maquina, key, value)
        
    db.commit()
    db.refresh(db_maquina)
    
    # WebSocket: Notificação de Mudança de Status
    if old_status != db_maquina.status:
        from services.websocket_service import manager
        await manager.broadcast({
            "type": "MACHINE_STATUS",
            "title": "Mudança em Máquina",
            "message": f"A máquina {db_maquina.nome} mudou seu status para: {db_maquina.status}.",
            "severity": "info" if db_maquina.status == "OPERANTE" else "warning",
            "maquina_id": db_maquina.id
        })
    
    return db_maquina

@router.delete("/maquinas/{id}")
def excluir_maquina(
    id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_maquina = db.query(models.Maquina).filter(models.Maquina.id == id).first()
    if not db_maquina:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    
    db.delete(db_maquina)
    db.commit()
    return {"message": "Máquina excluída com sucesso"}

# Ordens de Serviço
@router.get("/os", response_model=list[schemas.OrdemServicoSchema])
def listar_ordens_servico(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.OrdemServico).all()

@router.post("/os", response_model=schemas.OrdemServicoSchema)
def abrir_os(
    os: schemas.OrdemServicoCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_maquina = db.query(models.Maquina).filter(models.Maquina.id == os.maquina_id).first()
    if not db_maquina:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")

    os_aberta = db.query(models.OrdemServico).filter(
        models.OrdemServico.maquina_id == os.maquina_id,
        models.OrdemServico.status == "ABERTA"
    ).first()
    if os_aberta:
        raise HTTPException(status_code=400, detail="Já existe uma OS em aberto para esta máquina")

    db_os = models.OrdemServico(**os.model_dump(), status="ABERTA")
    db.add(db_os)
    db_maquina.status = "MANUTENCAO"
    db.commit()
    db.refresh(db_os)
    return db_os

@router.post("/os/{os_id}/adicionar-item")
def adicionar_item_os(
    os_id: int, 
    item: schemas.OSItemCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_os = db.query(models.OrdemServico).filter(models.OrdemServico.id == os_id).first()
    if not db_os:
        raise HTTPException(status_code=404, detail="OS não encontrada")

    if db_os.status != "ABERTA":
        raise HTTPException(status_code=400, detail="Apenas OS em aberto podem receber itens")
    
    # 1. Registrar baixa no estoque automaticamente!
    mov = schemas.MovimentacaoCreate(
        produto_id=item.produto_id,
        tipo=schemas.TipoMovimentacaoSchema.SAIDA_PRODUCAO,
        quantidade=item.quantidade,
        usuario="Sistema de Manutenção",
        origem=f"OS #{os_id}"
    )
    EstoqueService.registrar_movimentacao(db, mov)
    
    # 2. Adicionar o item na OS
    db_item = models.OSItem(os_id=os_id, **item.model_dump())
    db.add(db_item)
    
    # 3. Atualizar custo total da OS
    db_os.custo_total += (item.quantidade * (item.custo_unitario or 0))
    
    db.commit()
    return {"message": "Item adicionado e estoque baixado"}

@router.post("/os/{os_id}/finalizar")
def finalizar_os(
    os_id: int, 
    payload: schemas.OSFinalizacaoPayload | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_os = db.query(models.OrdemServico).filter(models.OrdemServico.id == os_id).first()
    if not db_os:
        raise HTTPException(status_code=404, detail="OS não encontrada")

    if db_os.status == "FINALIZADA":
        raise HTTPException(status_code=400, detail="Esta OS já foi finalizada")

    custo_mao_obra_atual = db_os.custo_mao_obra or 0.0
    novo_custo_mao_obra = max((payload.custo_mao_obra if payload else 0.0) or 0.0, 0.0)

    db_os.custo_total = max((db_os.custo_total or 0.0) - custo_mao_obra_atual, 0.0) + novo_custo_mao_obra
    db_os.custo_mao_obra = novo_custo_mao_obra
    db_os.status = "FINALIZADA"
    db_os.data_fechamento = datetime.now()

    if db_os.maquina:
        db_os.maquina.status = "OPERANTE"

    db.commit()
    return {"message": "OS Finalizada com sucesso"}

@router.delete("/os/{os_id}")
def excluir_os(
    os_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_os = db.query(models.OrdemServico).filter(models.OrdemServico.id == os_id).first()
    if not db_os:
        raise HTTPException(status_code=404, detail="OS não encontrada")

    maquina = db_os.maquina
    maquina_id = db_os.maquina_id
    status_os = db_os.status

    db.delete(db_os)
    db.flush()

    if maquina and status_os == "ABERTA":
        outra_os_aberta = db.query(models.OrdemServico).filter(
            models.OrdemServico.maquina_id == maquina_id,
            models.OrdemServico.status == "ABERTA"
        ).first()

        if not outra_os_aberta:
            maquina.status = "OPERANTE"

    db.commit()
    return {"message": "OS excluída com sucesso"}


@router.get("/alertas")
def listar_alertas_manutencao(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Lista máquinas que atingiram o limite de horas para manutenção preventiva.
    """
    maquinas = db.query(models.Maquina).all()
    alertas = []
    
    for m in maquinas:
        uso_desde_ultima = m.horas_uso_acumulado - m.ultima_manutencao_horas
        if uso_desde_ultima >= m.horas_manutencao_preventiva:
            alertas.append({
                "maquina_id": m.id,
                "maquina_nome": m.nome,
                "uso_atual": m.horas_uso_acumulado,
                "ultima_manutencao": m.ultima_manutencao_horas,
                "limite": m.horas_manutencao_preventiva,
                "excesso": uso_desde_ultima - m.horas_manutencao_preventiva
            })
            
    return alertas
