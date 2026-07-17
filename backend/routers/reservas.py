from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import schemas, models
from services.estoque_service import EstoqueService
from services.auth import check_role

ALLOWED_STOCK_ROLES = ["ADMIN", "GERENTE", "OPERADOR"]

router = APIRouter(
    prefix="/reservas",
    tags=["Reservas"],
    dependencies=[Depends(check_role(ALLOWED_STOCK_ROLES))],
)

@router.post("/", response_model=schemas.ReservaSchema)
def criar_reserva(reserva: schemas.ReservaCreate, db: Session = Depends(get_db)):
    return EstoqueService.criar_reserva(db, reserva)

@router.get("/", response_model=list[schemas.ReservaSchema])
def listar_reservas_ativas(db: Session = Depends(get_db)):
    return db.query(models.ReservaEstoque)\
        .filter(models.ReservaEstoque.status == models.StatusReserva.ATIVA)\
        .all()

@router.post("/{id}/confirmar")
def confirmar_reserva(id: int, usuario: str, db: Session = Depends(get_db)):
    return EstoqueService.confirmar_reserva(db, id, usuario)

@router.post("/{id}/liberar")
def liberar_reserva(id: int, db: Session = Depends(get_db)):
    reserva = db.query(models.ReservaEstoque).filter(models.ReservaEstoque.id == id).first()
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
    reserva.status = models.StatusReserva.LIBERADA
    db.commit()
    return {"message": "Reserva liberada (estornada)"}
