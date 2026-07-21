from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, func, select, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property
from database import Base
from .base import TipoMovimentacao, TIPOS_ENTRADA, TIPOS_SAIDA

class Produto(Base):
    __tablename__ = "produtos"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    descricao = Column(String, nullable=True)
    sku = Column(String, unique=True, index=True)
    gtin = Column(String, index=True, nullable=True)
    categoria = Column(String, index=True)
    marca = Column(String, index=True, nullable=True)
    unidade_medida = Column(String)
    
    corredor = Column(String, nullable=True)
    prateleira = Column(String, nullable=True)
    posicao = Column(String, nullable=True, index=True)
    
    estoque_minimo = Column(Float, default=0)
    estoque_medio = Column(Float, default=0)
    estoque_maximo = Column(Float, default=0)
    tipo_produto = Column(String, default="Simples")
    origem_icms = Column(String, default="0")
    ncm = Column(String, nullable=True)
    preco_venda = Column(Float, default=0.0)
    custo = Column(Float, default=0.0)
    markup = Column(Float, default=0.0)
    cod_fornecedor = Column(String, nullable=True)
    
    peso_liquido = Column(Float, default=0.0)
    peso_bruto = Column(Float, default=0.0)
    tipo_embalagem = Column(String, default="Pacote / Caixa")
    n_volumes = Column(Integer, default=1)
    largura = Column(Float, default=0.0)
    altura = Column(Float, default=0.0)
    comprimento = Column(Float, default=0.0)
    unidade_por_caixa = Column(Integer, default=1)
    
    controlar_estoque = Column(Boolean, default=True)
    controlar_lotes = Column(Boolean, default=False)
    permitir_vendas = Column(Boolean, default=True)
    dias_preparacao = Column(Integer, default=0)
    
    linha_produto = Column(String, nullable=True)
    garantia = Column(String, nullable=True)
    observacoes_internas = Column(Text, nullable=True)
    codigo_anvisa = Column(String, nullable=True)
    motivo_isencao_anvisa = Column(String, nullable=True)
    ex_tipi = Column(String, nullable=True)
    
    ativo = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    movimentacoes = relationship("MovimentacaoEstoque", back_populates="produto")
    reservas = relationship("ReservaEstoque", back_populates="produto")
    componentes_maquina = relationship("MaquinaComponente", back_populates="produto")
    itens_kit = relationship("ProdutoKitItem", foreign_keys="ProdutoKitItem.kit_id", back_populates="kit", cascade="all, delete-orphan")
    @hybrid_property
    def estoque_atual(self):
        entradas = sum(m.quantidade for m in self.movimentacoes if m.tipo in TIPOS_ENTRADA)
        saidas = sum(m.quantidade for m in self.movimentacoes if m.tipo in TIPOS_SAIDA)
        devolucoes = sum(m.quantidade for m in self.movimentacoes if m.tipo == TipoMovimentacao.DEVOLUCAO)
        ajustes = sum(m.quantidade for m in self.movimentacoes if m.tipo == TipoMovimentacao.AJUSTE)
        return entradas - saidas + devolucoes + ajustes

    @estoque_atual.expression
    def estoque_atual(cls):
        from sqlalchemy import case
        from .movimentacoes import MovimentacaoEstoque
        return select(
            func.coalesce(func.sum(
                case(
                    (MovimentacaoEstoque.tipo.in_(tuple(TIPOS_ENTRADA)), MovimentacaoEstoque.quantidade),
                    (MovimentacaoEstoque.tipo.in_(tuple(TIPOS_SAIDA)), -MovimentacaoEstoque.quantidade),
                    (MovimentacaoEstoque.tipo == TipoMovimentacao.DEVOLUCAO, MovimentacaoEstoque.quantidade),
                    (MovimentacaoEstoque.tipo == TipoMovimentacao.AJUSTE, MovimentacaoEstoque.quantidade),
                    else_=0.0
                )
            ), 0.0)
        ).where(MovimentacaoEstoque.produto_id == cls.id).scalar_subquery()

class EtiquetaTemplate(Base):
    __tablename__ = "etiqueta_templates"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    html_template = Column(Text, nullable=True)
    css_template = Column(Text, nullable=True)
    campos_json = Column(Text, nullable=True)
    zpl_base = Column(Text, nullable=True)
    largura_mm = Column(Float, default=100.0)
    altura_mm = Column(Float, default=50.0)
    padrao = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ProdutoKitItem(Base):
    __tablename__ = "produtos_kit_itens"
    
    id = Column(Integer, primary_key=True, index=True)
    kit_id = Column(Integer, ForeignKey("produtos.id"), nullable=False, index=True)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False, index=True)
    quantidade = Column(Float, nullable=False, default=1.0)
    
    # Relationships
    kit = relationship("Produto", foreign_keys=[kit_id], back_populates="itens_kit")
    produto = relationship("Produto", foreign_keys=[produto_id])
