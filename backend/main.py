from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
from sqlalchemy import inspect, text
import os
import socket
import sys
from urllib import error, request

from database import engine, Base, SessionLocal, get_db
import comercial
from comercial.models import RepresentanteComercial
import models
from routers import (
    modulos, produtos, movimentacoes, reservas, inventario, 
    dashboard, manutencao, usuarios, configuracoes, pcp,
    produtividade,
    relatorios, auth, vendas, expedicao, financeiro, compras,
    configuracoes_vendas, configuracoes_expedicao, resultados_comerciais, propostas, separacao, fiscal, empresas
)
from comercial.router import router as comercial_router
from services.auth import get_password_hash
from services.produtividade_db_service import normalize_key
from services.websocket_service import manager
from services.backup_service import start_backup_job
from services.sefaz_monitor import start_sefaz_monitor
from fastapi import WebSocket, WebSocketDisconnect

DEFAULT_SERVER_HOST = "0.0.0.0"
DEFAULT_SERVER_PORT = 8000
HEALTHCHECK_PATH = "/api/v1/health"


def resolve_server_host():
    return os.getenv("ERP_HOST", DEFAULT_SERVER_HOST).strip() or DEFAULT_SERVER_HOST


def resolve_server_port():
    configured_port = (os.getenv("ERP_PORT") or str(DEFAULT_SERVER_PORT)).strip()
    try:
        port = int(configured_port)
    except ValueError:
        print(f"AVISO: ERP_PORT invalida ({configured_port}). Usando porta {DEFAULT_SERVER_PORT}.")
        return DEFAULT_SERVER_PORT

    if 1 <= port <= 65535:
        return port

    print(f"AVISO: ERP_PORT fora do intervalo ({configured_port}). Usando porta {DEFAULT_SERVER_PORT}.")
    return DEFAULT_SERVER_PORT


def is_local_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.3)
        return sock.connect_ex(("127.0.0.1", port)) == 0


def is_erp_server_running(port: int) -> bool:
    healthcheck_url = f"http://127.0.0.1:{port}{HEALTHCHECK_PATH}"
    try:
        with request.urlopen(healthcheck_url, timeout=1) as response:
            return response.status == 200
    except (error.URLError, TimeoutError, OSError):
        return False


def ensure_comercial_representante_columns():
    inspector = inspect(engine)
    if "comercial_representantes" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("comercial_representantes")}
    required_columns = {
        "comissao_padrao": "FLOAT DEFAULT 0",
        "email": "VARCHAR",
        "telefone": "VARCHAR",
    }

    # Migrate existing INTEGER comissao_padrao to FLOAT if needed (PostgreSQL)
    with engine.begin() as connection:
        for column_name, column_type in required_columns.items():
            if column_name in existing_columns:
                # Try to fix INTEGER -> FLOAT for comissao_padrao on PostgreSQL
                if column_name == "comissao_padrao":
                    try:
                        connection.execute(text(
                            "ALTER TABLE comercial_representantes ALTER COLUMN comissao_padrao TYPE FLOAT USING comissao_padrao::float"
                        ))
                    except Exception:
                        pass  # ponytail: already float or SQLite which handles this implicitly
                continue
            connection.execute(
                text(f"ALTER TABLE comercial_representantes ADD COLUMN {column_name} {column_type}")
            )


def ensure_usuarios_columns():
    inspector = inspect(engine)
    if "usuarios" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("usuarios")}
    required_columns = {
        "permissoes": "TEXT",
        "comissao_percentual": "FLOAT DEFAULT 0",
    }

    with engine.begin() as connection:
        for column_name, column_type in required_columns.items():
            if column_name in existing_columns:
                continue
            connection.execute(
                text(f"ALTER TABLE usuarios ADD COLUMN {column_name} {column_type}")
            )


def ensure_comercial_clientes_columns():
    inspector = inspect(engine)
    if "comercial_clientes" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("comercial_clientes")}
    required_columns = {
        "rg": "VARCHAR",
        "representante_id": "INTEGER",
        "nome_vendedor_interno": "VARCHAR",
        "forma_pagamento_id": "INTEGER",
        "condicao_pagamento_id": "INTEGER",
        "cep_cobranca": "VARCHAR",
        "endereco_cobranca": "VARCHAR",
        "numero_cobranca": "VARCHAR",
        "complemento_cobranca": "VARCHAR",
        "bairro_cobranca": "VARCHAR",
        "uf_cobranca": "VARCHAR(2)",
        "municipio_cobranca": "VARCHAR",
        "cnpj_cobranca": "VARCHAR",
        "inscricao_estadual_cobranca": "VARCHAR",
        "email_cobranca": "VARCHAR",
        "cep_entrega": "VARCHAR",
        "endereco_entrega": "VARCHAR",
        "numero_entrega": "VARCHAR",
        "complemento_entrega": "VARCHAR",
        "bairro_entrega": "VARCHAR",
        "cidade_entrega": "VARCHAR",
        "uf_entrega": "VARCHAR(2)",
        "whatsapp": "VARCHAR",
        "forma_pagamento_padrao": "VARCHAR",
        "prazo_pagamento_dias": "INTEGER",
        "prazo_entrega_padrao_dias": "INTEGER",
        "observacoes": "TEXT",
        "vendedor_padrao_id": "INTEGER",
        "id_lista_preco": "INTEGER",
    }

    with engine.begin() as connection:
        for column_name, column_type in required_columns.items():
            if column_name in existing_columns:
                continue
            connection.execute(
                text(f"ALTER TABLE comercial_clientes ADD COLUMN {column_name} {column_type}")
            )
def ensure_pedidos_venda_columns():
    inspector = inspect(engine)
    if "pedidos_venda" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("pedidos_venda")}
    required_columns = {
        "tipo": "VARCHAR DEFAULT 'PEDIDO'",
        "cliente_nome": "VARCHAR",
        "cliente_id": "INTEGER",
        "representante_id": "INTEGER",
        "vendedor_interno_id": "INTEGER",
        "condicao_pagamento_id": "INTEGER",
        "valor_frete": "FLOAT DEFAULT 0.0",
        "desconto_valor": "FLOAT DEFAULT 0.0",
        "valor_total": "FLOAT DEFAULT 0.0",
        "observacoes": "TEXT",
        "codigo_rastreio": "VARCHAR",
        "url_rastreio": "VARCHAR",
        "transportadora": "VARCHAR",
        "natureza_operacao": "VARCHAR",
        "codigo_rastreamento": "VARCHAR",
        "url_rastreamento": "VARCHAR",
        "vendedor_id": "INTEGER",
        "data_prevista": "TIMESTAMP",
    }

    with engine.begin() as connection:
        for column_name, column_type in required_columns.items():
            if column_name in existing_columns:
                continue
            connection.execute(
                text(f"ALTER TABLE pedidos_venda ADD COLUMN {column_name} {column_type}")
            )

def ensure_notas_fiscais_columns():
    inspector = inspect(engine)
    if "notas_fiscais" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("notas_fiscais")}
    required_columns = {
        "natureza_operacao": "VARCHAR",
        "regime_tributario": "VARCHAR",
        "finalidade": "VARCHAR DEFAULT '1'",
        "data_saida": "TIMESTAMP",
        "base_icms": "FLOAT DEFAULT 0.0",
        "valor_icms": "FLOAT DEFAULT 0.0",
        "base_icms_st": "FLOAT DEFAULT 0.0",
        "valor_icms_st": "FLOAT DEFAULT 0.0",
        "valor_servicos": "FLOAT DEFAULT 0.0",
        "valor_seguro": "FLOAT DEFAULT 0.0",
        "valor_outras": "FLOAT DEFAULT 0.0",
        "valor_ipi": "FLOAT DEFAULT 0.0",
        "valor_issqn": "FLOAT DEFAULT 0.0",
        "valor_desconto": "FLOAT DEFAULT 0.0",
        "valor_nota": "FLOAT DEFAULT 0.0",
        "valor_faturado": "FLOAT DEFAULT 0.0",
        "valor_ibs": "FLOAT DEFAULT 0.0",
        "valor_cbs": "FLOAT DEFAULT 0.0",
        "valor_is": "FLOAT DEFAULT 0.0",
        "tp_emis": "VARCHAR DEFAULT '1'",
        "codigo_rejeicao": "VARCHAR",
        "motivo_rejeicao": "VARCHAR",
        "frete_por_conta": "VARCHAR",
        "transportador_nome": "VARCHAR",
        "transportador_cpf_cnpj": "VARCHAR",
        "transportador_ie": "VARCHAR",
        "transportador_endereco": "VARCHAR",
        "transportador_cidade": "VARCHAR",
        "transportador_uf": "VARCHAR",
        "placa": "VARCHAR",
        "uf_placa": "VARCHAR",
        "quantidade_volumes": "VARCHAR",
        "especie_volumes": "VARCHAR",
        "peso_bruto": "FLOAT DEFAULT 0.0",
        "peso_liquido": "FLOAT DEFAULT 0.0",
        "condicao_pagamento": "VARCHAR",
        "forma_pagamento": "VARCHAR",
        "meio_pagamento": "VARCHAR",
        "obs": "TEXT",
        "id_tiny": "VARCHAR"
    }

    with engine.begin() as connection:
        for column_name, column_type in required_columns.items():
            if column_name in existing_columns:
                continue
            connection.execute(
                text(f"ALTER TABLE notas_fiscais ADD COLUMN {column_name} {column_type}")
            )

def ensure_notas_fiscais_itens_columns():
    inspector = inspect(engine)
    if "notas_fiscais_itens" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("notas_fiscais_itens")}
    required_columns = {
        "valor_ibs": "FLOAT DEFAULT 0.0",
        "valor_cbs": "FLOAT DEFAULT 0.0",
        "valor_is": "FLOAT DEFAULT 0.0"
    }

    with engine.begin() as connection:
        for column_name, column_type in required_columns.items():
            if column_name in existing_columns:
                continue
            connection.execute(
                text(f"ALTER TABLE notas_fiscais_itens ADD COLUMN {column_name} {column_type}")
            )

def ensure_compras_columns():
    inspector = inspect(engine)
    if "ordens_compra" not in inspector.get_table_names():
        return
    existing_columns = {column["name"] for column in inspector.get_columns("ordens_compra")}
    required_columns = {
        "fornecedor_id": "INTEGER",
        "fornecedor_nome": "VARCHAR",
        "data_emissao": "TIMESTAMP",
        "data_recebimento": "TIMESTAMP",
        "status": "VARCHAR DEFAULT 'RASCUNHO'",
        "valor_frete": "FLOAT DEFAULT 0.0",
        "desconto_valor": "FLOAT DEFAULT 0.0",
        "valor_total": "FLOAT DEFAULT 0.0",
        "observacoes": "TEXT"
    }
    with engine.begin() as connection:
        for column_name, column_type in required_columns.items():
            if column_name in existing_columns:
                continue
            connection.execute(
                text(f"ALTER TABLE ordens_compra ADD COLUMN {column_name} {column_type}")
            )

def ensure_ordem_compra_itens_columns():
    inspector = inspect(engine)
    if "ordens_compra_itens" not in inspector.get_table_names():
        return
    existing_columns = {column["name"] for column in inspector.get_columns("ordens_compra_itens")}
    required_columns = {
        "ordem_id": "INTEGER",
        "produto_id": "INTEGER",
        "quantidade": "FLOAT",
        "preco_unitario": "FLOAT"
    }
    with engine.begin() as connection:
        for column_name, column_type in required_columns.items():
            if column_name in existing_columns:
                continue
            connection.execute(
                text(f"ALTER TABLE ordens_compra_itens ADD COLUMN {column_name} {column_type}")
            )


def ensure_configuracoes_vendas_columns():
    inspector = inspect(engine)
    if "configuracoes_vendas" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("configuracoes_vendas")}
    required_columns = {
        "exibir_preco_desconto_itens": "BOOLEAN DEFAULT true",
        "alerta_endereco_incompleto": "BOOLEAN DEFAULT true",
        "alerta_comissao_zerada": "BOOLEAN DEFAULT true",
        "visualizar_contas_receber": "BOOLEAN DEFAULT true",
        "exibir_marcador_status_pagamento": "BOOLEAN DEFAULT true",
        "exibir_detalhes_venda": "VARCHAR DEFAULT 'SIM'",
        "exibir_dados_adicionais": "VARCHAR DEFAULT 'SIM'",
        "exibir_transportador": "VARCHAR DEFAULT 'SIM'",
    }

    with engine.begin() as connection:
        for column_name, column_type in required_columns.items():
            if column_name in existing_columns:
                continue
            connection.execute(
                text(f"ALTER TABLE configuracoes_vendas ADD COLUMN {column_name} {column_type}")
            )


def ensure_maquinas_columns():
    inspector = inspect(engine)
    if "maquinas" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("maquinas")}
    required_columns = {
        "codigo": "VARCHAR",
        "horas_uso_acumulado": "FLOAT DEFAULT 0.0",
        "horas_manutencao_preventiva": "FLOAT DEFAULT 500.0",
        "ultima_manutencao_horas": "FLOAT DEFAULT 0.0",
    }

    with engine.begin() as connection:
        for column_name, column_type in required_columns.items():
            if column_name in existing_columns:
                continue
            connection.execute(
                text(f"ALTER TABLE maquinas ADD COLUMN {column_name} {column_type}")
            )


def ensure_produtos_columns():
    inspector = inspect(engine)
    if "produtos" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("produtos")}
    required_columns = {
        "marca": "VARCHAR",
        "markup": "FLOAT DEFAULT 0.0",
        "n_volumes": "INTEGER DEFAULT 1",
        "unidade_por_caixa": "INTEGER DEFAULT 1",
        "permitir_vendas": "BOOLEAN DEFAULT true",
        "linha_produto": "VARCHAR",
        "garantia": "VARCHAR",
        "observacoes_internas": "TEXT",
        "codigo_anvisa": "VARCHAR",
        "motivo_isencao_anvisa": "VARCHAR",
        "ex_tipi": "VARCHAR",
    }

    with engine.begin() as connection:
        for column_name, column_type in required_columns.items():
            if column_name in existing_columns:
                continue
            connection.execute(
                text(f"ALTER TABLE produtos ADD COLUMN {column_name} {column_type}")
            )


def ensure_producao_columns():
    pass

def ensure_movimentacoes_estoque_columns():
    inspector = inspect(engine)
    if "movimentacoes_estoque" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("movimentacoes_estoque")}
    required_columns = {
        "lote_id": "INTEGER",
    }

    with engine.begin() as connection:
        for column_name, column_type in required_columns.items():
            if column_name in existing_columns:
                continue
            connection.execute(
                text(f"ALTER TABLE movimentacoes_estoque ADD COLUMN {column_name} {column_type}")
            )


def ensure_comercial_defaults(db: Session):
    representante_direto = (
        db.query(RepresentanteComercial)
        .filter(RepresentanteComercial.codigo == "1")
        .first()
    )
    if not representante_direto:
        db.add(
            RepresentanteComercial(
                codigo="1",
                nome="DIRETO",
                ativo=True,
            )
        )
        db.commit()


def ensure_produtividade_columns():
    inspector = inspect(engine)
    table_names = set(inspector.get_table_names())

    with engine.begin() as connection:
        if "setores_produtividade" in table_names:
            existing_columns = {column["name"] for column in inspector.get_columns("setores_produtividade")}
            required_columns = {
                "meta_colaborador_diaria": "FLOAT DEFAULT 0",
            }

            for column_name, column_type in required_columns.items():
                if column_name in existing_columns:
                    continue
                connection.execute(
                    text(f"ALTER TABLE setores_produtividade ADD COLUMN {column_name} {column_type}")
                )

        if "apontamentos_produtividade" in table_names:
            existing_columns = {column["name"] for column in inspector.get_columns("apontamentos_produtividade")}
            required_columns = {
                "colaborador_id": "INTEGER",
            }

            for column_name, column_type in required_columns.items():
                if column_name in existing_columns:
                    continue
                connection.execute(
                    text(f"ALTER TABLE apontamentos_produtividade ADD COLUMN {column_name} {column_type}")
                )


def ensure_database_indexes():
    index_statements = [
        "CREATE INDEX IF NOT EXISTS ix_movimentacoes_estoque_produto_id ON movimentacoes_estoque (produto_id)",
        "CREATE INDEX IF NOT EXISTS ix_movimentacoes_estoque_created_at ON movimentacoes_estoque (created_at)",
        "CREATE INDEX IF NOT EXISTS ix_movimentacoes_estoque_tipo_created_at ON movimentacoes_estoque (tipo, created_at)",
        "CREATE INDEX IF NOT EXISTS ix_reservas_estoque_produto_id ON reservas_estoque (produto_id)",
        "CREATE INDEX IF NOT EXISTS ix_reservas_estoque_status ON reservas_estoque (status)",
        "CREATE INDEX IF NOT EXISTS ix_inventario_itens_produto_id ON inventario_itens (produto_id)",
        "CREATE INDEX IF NOT EXISTS ix_ordens_servico_status ON ordens_servico (status)",
        "CREATE INDEX IF NOT EXISTS ix_maquinas_status ON maquinas (status)",
        "CREATE INDEX IF NOT EXISTS ix_produtos_ativo ON produtos (ativo)",
        "CREATE INDEX IF NOT EXISTS ix_produtos_posicao ON produtos (posicao)",
    ]

    with engine.begin() as connection:
        for statement in index_statements:
            connection.execute(text(statement))


def ensure_produtividade_collaboradores(db: Session):
    inspector = inspect(engine)
    table_names = set(inspector.get_table_names())
    required_tables = {
        "setores_produtividade",
        "colaboradores_produtividade",
        "apontamentos_produtividade",
    }
    if not required_tables.issubset(table_names):
        return

    colaboradores = (
        db.query(models.ColaboradorProdutividade)
        .order_by(models.ColaboradorProdutividade.id.asc())
        .all()
    )
    colaboradores_por_chave = {
        (colaborador.setor_id, colaborador.nome_chave): colaborador
        for colaborador in colaboradores
    }

    apontamentos = (
        db.query(models.ApontamentoProdutividade)
        .order_by(models.ApontamentoProdutividade.id.asc())
        .all()
    )

    changed = False
    for apontamento in apontamentos:
        nome_chave = apontamento.colaborador_chave or normalize_key(apontamento.colaborador_nome)
        key = (apontamento.setor_id, nome_chave)
        colaborador = colaboradores_por_chave.get(key)

        if not colaborador:
            colaborador = models.ColaboradorProdutividade(
                setor_id=apontamento.setor_id,
                nome=apontamento.colaborador_nome,
                nome_chave=nome_chave,
                ativo=True,
            )
            db.add(colaborador)
            db.flush()
            colaboradores_por_chave[key] = colaborador
            changed = True

        if apontamento.colaborador_id != colaborador.id:
            apontamento.colaborador_id = colaborador.id
            changed = True

    if changed:
        db.commit()

def ensure_etiqueta_templates(db: Session):
    import json
    # Verifica se já existe algum template
    count = db.query(models.EtiquetaTemplate).count()
    if count > 0:
        return

    # Template Padrão Venner (100x40mm - Comum para Zebra)
    campos = [
        {"type": "logo", "x": 2, "y": 2, "w": 25, "h": 12, "fontSize": 14},
        {"type": "sku", "x": 30, "y": 4, "w": 68, "h": 8, "fontSize": 16, "bold": True, "align": "flex-end"},
        {"type": "name", "x": 2, "y": 16, "w": 96, "h": 10, "fontSize": 18, "bold": True},
        {"type": "barcode", "x": 2, "y": 28, "w": 96, "h": 10, "fontSize": 12}
    ]
    
    default_template = models.EtiquetaTemplate(
        nome="Padrão Venner (100x40)",
        html_template="", # Usará os campos_json
        css_template="",
        campos_json=json.dumps(campos),
        zpl_base="", # Gerado dinamicamente via campos_json
        largura_mm=100.0,
        altura_mm=40.0,
        padrao=True
    )
    db.add(default_template)
    db.commit()
    print("Template de etiquetas padrão criado.")

def ensure_categorias_financeiras(db: Session):
    try:
        from models.financeiro import CategoriaFinanceira
        
        # Check if they exist
        if db.query(CategoriaFinanceira).first():
            return
            
        categorias_padrao = [
            CategoriaFinanceira(descricao="Receitas de Vendas", grupo="Receitas Operacionais", considera_dre="Receita Bruta", tipo="RECEITA", padrao_venda=True),
            CategoriaFinanceira(descricao="Receitas Diversas", grupo="Outras Receitas", considera_dre="Outras receitas", tipo="RECEITA", padrao_venda=False),
            CategoriaFinanceira(descricao="Despesas de Frete e Logística", grupo="Despesas de Vendas", considera_dre="Despesas operacionais", tipo="DESPESA", padrao_venda=False),
            CategoriaFinanceira(descricao="Impostos sobre Vendas", grupo="Deduções", considera_dre="Deduções da Receita Bruta", tipo="DESPESA", padrao_venda=False),
            CategoriaFinanceira(descricao="Fornecedores (CMV/CPV)", grupo="Custos", considera_dre="Custo dos Produtos Vendidos", tipo="DESPESA", padrao_venda=False),
            CategoriaFinanceira(descricao="Despesas Administrativas", grupo="Despesas Operacionais", considera_dre="Despesas operacionais", tipo="DESPESA", padrao_venda=False),
            CategoriaFinanceira(descricao="Despesas Financeiras (Taxas)", grupo="Despesas Financeiras", considera_dre="Despesas Financeiras", tipo="DESPESA", padrao_venda=False),
            CategoriaFinanceira(descricao="Folha de Pagamento", grupo="Despesas Operacionais", considera_dre="Despesas operacionais", tipo="DESPESA", padrao_venda=False),
        ]
        db.add_all(categorias_padrao)
        db.commit()
        print("Categorias financeiras padrão criadas.")
    except Exception as e:
        db.rollback()
        print(f"Erro ao criar categorias financeiras: {e}")

def startup_db():
    print("Iniciando conexão com o banco de dados...")
    start_backup_job()
    try:
        Base.metadata.create_all(bind=engine)
        start_sefaz_monitor()
        ensure_comercial_clientes_columns()
        ensure_comercial_representante_columns()
        ensure_usuarios_columns()
        ensure_produtividade_columns()
        ensure_pedidos_venda_columns()
        ensure_configuracoes_vendas_columns()
        ensure_maquinas_columns()
        ensure_produtos_columns()
        ensure_notas_fiscais_columns()
        ensure_notas_fiscais_itens_columns()
        ensure_compras_columns()
        ensure_ordem_compra_itens_columns()
        ensure_producao_columns()
        ensure_movimentacoes_estoque_columns()
        ensure_database_indexes()
        db = SessionLocal()
        try:
            ensure_comercial_defaults(db)
            ensure_produtividade_collaboradores(db)
            ensure_etiqueta_templates(db)
            ensure_categorias_financeiras(db)
            roles_data = {
                "ADMIN": "dashboard,vendas,clientes,produtos,reservas,inventario,relatorios,gestao_fabrica,pcp,produtividade,manutencao,auditoria,usuarios,configuracoes",
                "GERENTE": "dashboard,vendas,clientes,produtos,reservas,inventario,relatorios,gestao_fabrica,pcp,produtividade,manutencao",
                "OPERADOR": "dashboard,produtos,reservas,inventario,gestao_fabrica,pcp",
                "COMERCIAL": "vendas,clientes,relatorios"
            }
            
            for role_nome, perms in roles_data.items():
                role_exist = db.query(models.Role).filter(models.Role.nome == role_nome).first()
                if not role_exist:
                    db.add(models.Role(nome=role_nome, permissoes=perms))
                else:
                    # Se o role existe mas está sem permissões, atualiza
                    if not role_exist.permissoes:
                        role_exist.permissoes = perms
            db.commit()

            admin_role = db.query(models.Role).filter(models.Role.nome == "ADMIN").first()
            admin_exist = db.query(models.User).filter(models.User.username == "admin").first()
            if not admin_exist and admin_role:
                admin_user = models.User(
                    username="admin",
                    email="admin@venner.com.br",
                    nome_completo="Administrador Sistema",
                    hashed_password=get_password_hash("admin123"),
                    role_id=admin_role.id,
                    ativo=True,
                    permissoes="dashboard,vendas,clientes,produtos,reservas,inventario,relatorios,gestao_fabrica,pcp,produtividade,manutencao,auditoria,usuarios,configuracoes"
                )
                db.add(admin_user)
                db.commit()

            estoque_exist = db.query(models.Modulo).filter(models.Modulo.nome == "ESTOQUE").first()
            if not estoque_exist:
                modulos_iniciais = [
                    models.Modulo(nome="ESTOQUE", descricao="Gestão de Produtos, Movimentações e Inventário", ativo=True),
                    models.Modulo(nome="VENDAS", descricao="Pedidos de Venda e Clientes", ativo=True),
                    models.Modulo(nome="PRODUCAO", descricao="Ordens de Produção e Matéria Prima", ativo=True),
                    models.Modulo(nome="FINANCEIRO", descricao="Contas a Pagar/Receber e Fluxo de Caixa", ativo=True),
                ]
                db.add_all(modulos_iniciais)
                db.commit()
            print("Banco de dados inicializado com sucesso!")
        finally:
            db.close()
    except Exception as e:
        print(f"ERRO CRÍTICO NA INICIALIZAÇÃO DO BANCO: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    startup_db()
    yield


is_production = os.getenv("ENVIRONMENT", "development").lower() in ["production", "prod"]
enable_docs = os.getenv("ENABLE_DOCS", "false" if is_production else "true").lower() == "true"
serve_frontend_env = os.getenv("SERVE_FRONTEND", "true" if hasattr(sys, '_MEIPASS') else "false").lower() == "true"

app = FastAPI(
    title="ERP Venner - API",
    version="2.0",
    lifespan=lifespan,
    docs_url="/docs" if enable_docs else None,
    redoc_url="/redoc" if enable_docs else None,
    openapi_url="/openapi.json" if enable_docs else None
)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.contract_connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

raw_origins = os.getenv("ALLOWED_ORIGINS", "*").strip()
allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
if not allowed_origins:
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000, compresslevel=5)

api_prefix = "/api/v1"

# Ordem de registro importante
app.include_router(auth.router, prefix=api_prefix)
app.include_router(modulos.router, prefix=api_prefix)
app.include_router(produtos.router, prefix=api_prefix)
app.include_router(movimentacoes.router, prefix=api_prefix)
app.include_router(fiscal.router, prefix=api_prefix)
app.include_router(reservas.router, prefix=api_prefix)
app.include_router(inventario.router, prefix=api_prefix)
app.include_router(dashboard.router, prefix=api_prefix)
app.include_router(manutencao.router, prefix=api_prefix)
app.include_router(usuarios.router, prefix=api_prefix)
app.include_router(empresas.router, prefix=api_prefix + "/empresas")
app.include_router(configuracoes.router, prefix=api_prefix)
app.include_router(pcp.router, prefix=api_prefix)
app.include_router(produtividade.router, prefix=api_prefix)
app.include_router(relatorios.router, prefix=api_prefix)
app.include_router(vendas.router, prefix=api_prefix)
app.include_router(configuracoes_vendas.router, prefix=api_prefix)
app.include_router(comercial_router, prefix=api_prefix)
app.include_router(expedicao.router, prefix=api_prefix)
app.include_router(financeiro.router, prefix=api_prefix)
app.include_router(compras.router, prefix=api_prefix)
app.include_router(propostas.router, prefix=api_prefix)
app.include_router(separacao.router, prefix=api_prefix)
app.include_router(configuracoes_expedicao.router, prefix=api_prefix)
app.include_router(resultados_comerciais.router, prefix=api_prefix)


@app.get(api_prefix + "/health", tags=["Sistema"])
def check_health(db: Session = Depends(get_db)):
    try:
        db.execute(text('SELECT 1'))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": "disconnected", "detail": str(e)}

def get_frontend_path():
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, "frontend")
    return os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend_react", "dist")

frontend_path = get_frontend_path()

if serve_frontend_env and os.path.exists(frontend_path):
    from fastapi.responses import FileResponse
    from fastapi import HTTPException
    
    @app.get("/{full_path:path}")
    def serve_react_app(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not Found")
            
        requested_file = os.path.join(frontend_path, full_path)
        if os.path.isfile(requested_file):
            return FileResponse(requested_file)
            
        return FileResponse(os.path.join(frontend_path, "index.html"))
else:
    @app.get("/")
    def read_root():
        return {
            "name": "ERP Venner - API REST",
            "status": "online",
            "version": "2.0",
            "mode": "Pure API REST Server"
        }

if __name__ == "__main__":
    import uvicorn
    server_host = resolve_server_host()
    server_port = resolve_server_port()

    if is_local_port_in_use(server_port):
        if is_erp_server_running(server_port):
            print(f"Servidor ERP Venner ja esta em execucao em http://127.0.0.1:{server_port}")
            print("Feche a instancia atual antes de iniciar outra copia do servidor.")
            sys.exit(0)

        print(f"ERRO: a porta {server_port} ja esta em uso por outro processo.")
        print("Libere a porta ocupada ou defina ERP_PORT para outra porta antes de iniciar o servidor.")
        sys.exit(1)

    uvicorn.run(app, host=server_host, port=server_port)
