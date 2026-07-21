from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List

class ProdutoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    sku: str
    gtin: Optional[str] = None
    categoria: str
    marca: Optional[str] = None
    unidade_medida: str
    corredor: Optional[str] = None
    prateleira: Optional[str] = None
    posicao: Optional[str] = None
    estoque_minimo: float = 0
    estoque_medio: float = 0
    estoque_maximo: float = 0
    
    tipo_produto: str = "Simples"
    origem_icms: str = "0"
    ncm: Optional[str] = None
    preco_venda: float = 0.0
    markup: float = 0.0
    peso_liquido: float = 0.0
    peso_bruto: float = 0.0
    tipo_embalagem: str = "Pacote / Caixa"
    n_volumes: int = 1
    largura: float = 0.0
    altura: float = 0.0
    comprimento: float = 0.0
    unidade_por_caixa: int = 1
    controlar_estoque: bool = True
    controlar_lotes: bool = False
    permitir_vendas: bool = True
    dias_preparacao: int = 0
    
    linha_produto: Optional[str] = None
    garantia: Optional[str] = None
    observacoes_internas: Optional[str] = None
    codigo_anvisa: Optional[str] = None
    motivo_isencao_anvisa: Optional[str] = None
    ex_tipi: Optional[str] = None

class ProdutoKitItemCreate(BaseModel):
    produto_id: int
    quantidade: float

class ProdutoKitItemSchema(BaseModel):
    id: int
    kit_id: int
    produto_id: int
    quantidade: float
    model_config = ConfigDict(from_attributes=True)

class ProdutoCreate(ProdutoBase):
    sku: Optional[str] = None
    itens_kit: Optional[List[ProdutoKitItemCreate]] = []

class ProdutoUpdate(ProdutoBase):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    sku: Optional[str] = None
    categoria: Optional[str] = None
    unidade_medida: Optional[str] = None
    ativo: Optional[bool] = None
    tipo_produto: Optional[str] = None
    origem_icms: Optional[str] = None
    ncm: Optional[str] = None
    preco_venda: Optional[float] = None
    markup: Optional[float] = None
    peso_liquido: Optional[float] = None
    peso_bruto: Optional[float] = None
    tipo_embalagem: Optional[str] = None
    n_volumes: Optional[int] = None
    largura: Optional[float] = None
    altura: Optional[float] = None
    comprimento: Optional[float] = None
    unidade_por_caixa: Optional[int] = None
    controlar_estoque: Optional[bool] = None
    controlar_lotes: Optional[bool] = None
    permitir_vendas: Optional[bool] = None
    dias_preparacao: Optional[int] = None
    
    linha_produto: Optional[str] = None
    garantia: Optional[str] = None
    observacoes_internas: Optional[str] = None
    codigo_anvisa: Optional[str] = None
    motivo_isencao_anvisa: Optional[str] = None
    ex_tipi: Optional[str] = None
    itens_kit: Optional[List[ProdutoKitItemCreate]] = None

class ProdutoSchema(ProdutoBase):
    id: int
    estoque_atual: float
    ativo: bool
    created_at: datetime
    itens_kit: Optional[List[ProdutoKitItemSchema]] = []
    model_config = ConfigDict(from_attributes=True)


class ProdutoCatalogoSchema(BaseModel):
    id: int
    nome: str
    sku: str
    categoria: str
    unidade_medida: str
    prateleira: Optional[str] = None
    posicao: Optional[str] = None
    estoque_minimo: float = 0
    estoque_maximo: float = 0
    estoque_atual: float
    tipo_produto: str = "Simples"
    preco_venda: float = 0.0
    ativo: bool
    model_config = ConfigDict(from_attributes=True)

class EtiquetaTemplateBase(BaseModel):
    nome: str
    html_template: Optional[str] = None
    css_template: Optional[str] = None
    campos_json: Optional[str] = None
    zpl_base: Optional[str] = None
    largura_mm: float = 100.0
    altura_mm: float = 40.0
    padrao: bool = False

class EtiquetaTemplateCreate(EtiquetaTemplateBase):
    pass

class EtiquetaTemplateSchema(EtiquetaTemplateBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
