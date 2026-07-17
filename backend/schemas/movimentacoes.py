from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List
from enum import Enum

class TipoMovimentacaoSchema(str, Enum):
    ENTRADA = "ENTRADA"
    ENTRADA_COMPRA = "ENTRADA_COMPRA"
    ENTRADA_PRODUCAO = "ENTRADA_PRODUCAO"
    SAIDA = "SAIDA"
    SAIDA_VENDA = "SAIDA_VENDA"
    SAIDA_PRODUCAO = "SAIDA_PRODUCAO"
    AJUSTE = "AJUSTE"
    DEVOLUCAO = "DEVOLUCAO"

class StatusReservaSchema(str, Enum):
    ATIVA = "ATIVA"
    LIBERADA = "LIBERADA"
    CONSUMIDA = "CONSUMIDA"

class MovimentacaoBase(BaseModel):
    produto_id: int
    tipo: TipoMovimentacaoSchema
    quantidade: float
    usuario: str
    origem: str
    observacao: Optional[str] = None

class MovimentacaoCreate(MovimentacaoBase):
    pass

class MovimentacaoSchema(MovimentacaoBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ReservaBase(BaseModel):
    produto_id: int
    pedido_ref: str
    quantidade: float
    usuario: str

class ReservaCreate(ReservaBase):
    pass

class ReservaSchema(ReservaBase):
    id: int
    status: StatusReservaSchema
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class InventarioSessaoBase(BaseModel):
    usuario_abertura: str

class InventarioItemSchema(BaseModel):
    id: int
    produto_id: int
    quantidade_sistema: float
    quantidade_fisica: Optional[float] = None
    diferenca: Optional[float] = None
    processado: bool
    
    # Detalhes do produto para o frontend
    sku: Optional[str] = None
    nome: Optional[str] = None
    corredor: Optional[str] = None
    prateleira: Optional[str] = None
    posicao: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class InventarioSessaoSchema(InventarioSessaoBase):
    id: int
    status: str
    data_abertura: datetime
    data_fechamento: Optional[datetime] = None
    itens: Optional[List[InventarioItemSchema]] = None
    model_config = ConfigDict(from_attributes=True)

class ContagemItem(BaseModel):
    produto_id: int
    quantidade_fisica: float

class DashboardStats(BaseModel):
    total_produtos: int
    alertas_estoque: int
    movimentacoes_hoje: int
    reservas_ativas: int
    maquinas_ativas: int
    os_abertas: int
    # New KPIs for Vendas vs Producao
    total_vendas: int = 0
    total_produzidos: int = 0
    pendentes: int = 0
    eficiencia: int = 0

class DashboardRecentMovement(BaseModel):
    id: int
    produto: str
    tipo: str
    acao: str
    quantidade: float
    usuario: str
    data_hora: datetime
