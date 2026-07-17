import enum
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class TipoMovimentacao(enum.Enum):
    ENTRADA_COMPRA = "ENTRADA_COMPRA"
    ENTRADA_PRODUCAO = "ENTRADA_PRODUCAO"
    SAIDA_VENDA = "SAIDA_VENDA"
    SAIDA_PRODUCAO = "SAIDA_PRODUCAO"
    AJUSTE = "AJUSTE"
    DEVOLUCAO = "DEVOLUCAO"

class StatusReserva(enum.Enum):
    ATIVA = "ATIVA"
    LIBERADA = "LIBERADA"
    CONSUMIDA = "CONSUMIDA"


TIPOS_ENTRADA = frozenset({
    TipoMovimentacao.ENTRADA_COMPRA,
    TipoMovimentacao.ENTRADA_PRODUCAO,
})

TIPOS_SAIDA = frozenset({
    TipoMovimentacao.SAIDA_VENDA,
    TipoMovimentacao.SAIDA_PRODUCAO,
})

_TIPO_MOVIMENTACAO_ALIASES = {
    "ENTRADA": TipoMovimentacao.ENTRADA_COMPRA,
    "ENTRADA_COMPRA": TipoMovimentacao.ENTRADA_COMPRA,
    "ENTRADA_PRODUCAO": TipoMovimentacao.ENTRADA_PRODUCAO,
    "SAIDA": TipoMovimentacao.SAIDA_VENDA,
    "SAIDA_VENDA": TipoMovimentacao.SAIDA_VENDA,
    "SAIDA_PRODUCAO": TipoMovimentacao.SAIDA_PRODUCAO,
    "AJUSTE": TipoMovimentacao.AJUSTE,
    "DEVOLUCAO": TipoMovimentacao.DEVOLUCAO,
}


def normalizar_tipo_movimentacao(tipo):
    if isinstance(tipo, TipoMovimentacao):
        return tipo

    valor = getattr(tipo, "value", tipo)
    chave = str(valor).upper()
    if chave not in _TIPO_MOVIMENTACAO_ALIASES:
        raise ValueError(f"Tipo de movimentação inválido: {valor}")
    return _TIPO_MOVIMENTACAO_ALIASES[chave]
