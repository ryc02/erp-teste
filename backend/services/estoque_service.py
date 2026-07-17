from sqlalchemy.orm import Session
from sqlalchemy import func
import models, schemas
from fastapi import HTTPException
from models.base import TipoMovimentacao, TIPOS_SAIDA, normalizar_tipo_movimentacao

class EstoqueService:
    @staticmethod
    def get_saldo_disponivel(db: Session, produto_id: int):
        produto = db.query(models.Produto).filter(models.Produto.id == produto_id).first()
        if not produto:
            return 0
        
        # Soma de reservas ativas
        reservas_ativas = db.query(func.sum(models.ReservaEstoque.quantidade))\
            .filter(models.ReservaEstoque.produto_id == produto_id)\
            .filter(models.ReservaEstoque.status == models.StatusReserva.ATIVA)\
            .scalar() or 0
            
        return produto.estoque_atual - reservas_ativas

    @staticmethod
    def verificar_inventario_aberto(db: Session):
        sessao = db.query(models.InventarioSessao)\
            .filter(models.InventarioSessao.status == "ABERTO")\
            .first()
        if sessao:
            raise HTTPException(status_code=400, detail="Movimentação bloqueada: Existe uma sessão de inventário aberta.")

    @staticmethod
    def registrar_movimentacao(db: Session, mov: schemas.MovimentacaoCreate):
        tipo_db = normalizar_tipo_movimentacao(mov.tipo)

        if mov.quantidade <= 0 and tipo_db != TipoMovimentacao.AJUSTE:
            raise HTTPException(status_code=400, detail="A quantidade deve ser maior que zero.")
            
        # 1. Bloqueia se inventário aberto
        EstoqueService.verificar_inventario_aberto(db)
        
        produto = db.query(models.Produto).filter(models.Produto.id == mov.produto_id).first()
        if not produto:
            raise HTTPException(status_code=404, detail="Produto não encontrado")

        # 2. Se for saída, validar saldo disponível
        is_saida = tipo_db in TIPOS_SAIDA
        
        if is_saida:
            saldo_disp = EstoqueService.get_saldo_disponivel(db, mov.produto_id)
            if mov.quantidade > saldo_disp:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Saldo insuficiente. Disponível (Estoque - Reservas): {saldo_disp}"
                )

        # 3. Criar registro de movimentação
        mov_data = mov.model_dump()
        mov_data['tipo'] = tipo_db

        db_mov = models.MovimentacaoEstoque(**mov_data)
        db.add(db_mov)
        db.commit()
        db.refresh(db_mov)
        return db_mov

    @staticmethod
    def criar_reserva(db: Session, reserva: schemas.ReservaCreate):
        EstoqueService.verificar_inventario_aberto(db)
        
        saldo_disp = EstoqueService.get_saldo_disponivel(db, reserva.produto_id)
        if reserva.quantidade > saldo_disp:
            raise HTTPException(status_code=400, detail=f"Saldo insuficiente para reserva. Disponível: {saldo_disp}")
            
        db_reserva = models.ReservaEstoque(**reserva.model_dump())
        db.add(db_reserva)
        db.commit()
        db.refresh(db_reserva)
        return db_reserva

    @staticmethod
    def confirmar_reserva(db: Session, reserva_id: int, usuario: str):
        """Transforma reserva em saída real (venda)"""
        reserva = db.query(models.ReservaEstoque).filter(models.ReservaEstoque.id == reserva_id).first()
        if not reserva or reserva.status != models.StatusReserva.ATIVA:
            raise HTTPException(status_code=404, detail="Reserva ativa não encontrada")
            
        # Gera a saída
        mov = schemas.MovimentacaoCreate(
            produto_id=reserva.produto_id,
            tipo=schemas.TipoMovimentacaoSchema.SAIDA_VENDA,
            quantidade=reserva.quantidade,
            usuario=usuario,
            origem=f"Consumo Reserva #{reserva.id} (Pedido: {reserva.pedido_ref})",
            observacao="Baixa automática via confirmação de reserva"
        )
        
        # Baixa no estoque físico
        # (O estoque_atual é calculado automaticamente pela soma das movimentações)
        
        # Atualiza status da reserva
        reserva.status = models.StatusReserva.CONSUMIDA
        
        db_mov = models.MovimentacaoEstoque(**mov.model_dump())
        db.add(db_mov)
        db.commit()
        return db_mov
