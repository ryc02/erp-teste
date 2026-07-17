--
-- PostgreSQL database dump
--

\restrict DBgfareXSpFgZ9JlgDfd51UizCJAOUcuEmZ1r0YWBirGmEJHYq69jv1DXN73qXP

-- Dumped from database version 17.9
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: basecalculocondicao; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.basecalculocondicao AS ENUM (
    'DATA_DO_DIA',
    'DATA_EMISSAO',
    'DATA_FATURAMENTO'
);


ALTER TYPE public.basecalculocondicao OWNER TO postgres;

--
-- Name: condicaopagamentocadastro; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.condicaopagamentocadastro AS ENUM (
    'A_VISTA',
    'A_PRAZO'
);


ALTER TYPE public.condicaopagamentocadastro OWNER TO postgres;

--
-- Name: situacaocadastro; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.situacaocadastro AS ENUM (
    'ATIVO',
    'INATIVO'
);


ALTER TYPE public.situacaocadastro OWNER TO postgres;

--
-- Name: statusreserva; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.statusreserva AS ENUM (
    'ATIVA',
    'LIBERADA',
    'CONSUMIDA'
);


ALTER TYPE public.statusreserva OWNER TO postgres;

--
-- Name: tipomovimentacao; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipomovimentacao AS ENUM (
    'ENTRADA_COMPRA',
    'ENTRADA_PRODUCAO',
    'SAIDA_VENDA',
    'SAIDA_PRODUCAO',
    'AJUSTE',
    'DEVOLUCAO'
);


ALTER TYPE public.tipomovimentacao OWNER TO postgres;

--
-- Name: tipopessoacadastro; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipopessoacadastro AS ENUM (
    'FISICA',
    'JURIDICA'
);


ALTER TYPE public.tipopessoacadastro OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- Name: apontamentos_produtividade; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.apontamentos_produtividade (
    id integer NOT NULL,
    data_referencia date NOT NULL,
    setor_id integer NOT NULL,
    colaborador_nome character varying NOT NULL,
    colaborador_chave character varying NOT NULL,
    quantidade double precision NOT NULL,
    ocorrencia character varying NOT NULL,
    observacao text,
    criado_por character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    colaborador_id integer
);


ALTER TABLE public.apontamentos_produtividade OWNER TO postgres;

--
-- Name: apontamentos_produtividade_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.apontamentos_produtividade_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.apontamentos_produtividade_id_seq OWNER TO postgres;

--
-- Name: apontamentos_produtividade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.apontamentos_produtividade_id_seq OWNED BY public.apontamentos_produtividade.id;


--
-- Name: auditoria_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditoria_logs (
    id integer NOT NULL,
    usuario character varying(50),
    acao character varying(100),
    modulo character varying(50),
    detalhes text,
    entidade_id character varying(50),
    ip_address character varying(45),
    created_at timestamp without time zone
);


ALTER TABLE public.auditoria_logs OWNER TO postgres;

--
-- Name: auditoria_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auditoria_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auditoria_logs_id_seq OWNER TO postgres;

--
-- Name: auditoria_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auditoria_logs_id_seq OWNED BY public.auditoria_logs.id;


--
-- Name: categorias_financeiras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias_financeiras (
    id integer NOT NULL,
    descricao character varying NOT NULL,
    grupo character varying,
    considera_dre character varying,
    tipo character varying,
    padrao_venda boolean
);


ALTER TABLE public.categorias_financeiras OWNER TO postgres;

--
-- Name: categorias_financeiras_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categorias_financeiras_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categorias_financeiras_id_seq OWNER TO postgres;

--
-- Name: categorias_financeiras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categorias_financeiras_id_seq OWNED BY public.categorias_financeiras.id;


--
-- Name: colaboradores_produtividade; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.colaboradores_produtividade (
    id integer NOT NULL,
    setor_id integer NOT NULL,
    nome character varying NOT NULL,
    nome_chave character varying NOT NULL,
    ativo boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.colaboradores_produtividade OWNER TO postgres;

--
-- Name: colaboradores_produtividade_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.colaboradores_produtividade_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.colaboradores_produtividade_id_seq OWNER TO postgres;

--
-- Name: colaboradores_produtividade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.colaboradores_produtividade_id_seq OWNED BY public.colaboradores_produtividade.id;


--
-- Name: comercial_clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comercial_clientes (
    id integer NOT NULL,
    situacao public.situacaocadastro NOT NULL,
    tipo_pessoa public.tipopessoacadastro NOT NULL,
    nome_razao_social character varying NOT NULL,
    nome_fantasia character varying,
    cpf_cnpj character varying,
    inscricao_estadual character varying,
    telefone character varying,
    whatsapp character varying,
    email character varying,
    cep character varying,
    endereco character varying,
    numero character varying,
    complemento character varying,
    bairro character varying,
    cidade character varying,
    uf character varying(2),
    forma_pagamento_padrao character varying,
    condicao_pagamento public.condicaopagamentocadastro,
    prazo_pagamento_dias integer,
    prazo_entrega_padrao_dias integer,
    observacoes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    cep_entrega character varying,
    endereco_entrega character varying,
    numero_entrega character varying,
    complemento_entrega character varying,
    bairro_entrega character varying,
    cidade_entrega character varying,
    uf_entrega character varying(2),
    cep_cobranca character varying,
    endereco_cobranca character varying,
    numero_cobranca character varying,
    complemento_cobranca character varying,
    bairro_cobranca character varying,
    uf_cobranca character varying(2),
    municipio_cobranca character varying,
    cnpj_cobranca character varying,
    inscricao_estadual_cobranca character varying,
    email_cobranca character varying,
    representante_id integer,
    nome_vendedor_interno character varying,
    forma_pagamento_id integer,
    condicao_pagamento_id integer,
    rg character varying,
    tipo_contato character varying DEFAULT 'Cliente'::character varying NOT NULL,
    codigo_externo character varying,
    contribuinte character varying,
    inscricao_municipal character varying,
    codigo_regime_tributario character varying,
    inscricao_suframa character varying,
    data_nascimento timestamp without time zone,
    status_crm character varying,
    vendedor_id character varying,
    limite_credito integer,
    vendedor_padrao_id integer,
    id_lista_preco integer
);


ALTER TABLE public.comercial_clientes OWNER TO postgres;

--
-- Name: comercial_clientes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comercial_clientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comercial_clientes_id_seq OWNER TO postgres;

--
-- Name: comercial_clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comercial_clientes_id_seq OWNED BY public.comercial_clientes.id;


--
-- Name: comercial_condicoes_pagamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comercial_condicoes_pagamento (
    id integer NOT NULL,
    codigo integer NOT NULL,
    descricao character varying NOT NULL,
    indice_financeiro double precision NOT NULL,
    base_calculo public.basecalculocondicao NOT NULL,
    numero_parcelas integer NOT NULL,
    parcelas_json text,
    ativo boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.comercial_condicoes_pagamento OWNER TO postgres;

--
-- Name: comercial_condicoes_pagamento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comercial_condicoes_pagamento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comercial_condicoes_pagamento_id_seq OWNER TO postgres;

--
-- Name: comercial_condicoes_pagamento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comercial_condicoes_pagamento_id_seq OWNED BY public.comercial_condicoes_pagamento.id;


--
-- Name: comercial_formas_pagamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comercial_formas_pagamento (
    id integer NOT NULL,
    codigo integer NOT NULL,
    descricao character varying NOT NULL,
    ativo boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.comercial_formas_pagamento OWNER TO postgres;

--
-- Name: comercial_formas_pagamento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comercial_formas_pagamento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comercial_formas_pagamento_id_seq OWNER TO postgres;

--
-- Name: comercial_formas_pagamento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comercial_formas_pagamento_id_seq OWNED BY public.comercial_formas_pagamento.id;


--
-- Name: comercial_representantes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comercial_representantes (
    id integer NOT NULL,
    codigo character varying,
    nome character varying NOT NULL,
    ativo boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    comissao_padrao double precision DEFAULT 0 NOT NULL,
    email character varying,
    telefone character varying,
    fantasia character varying,
    tipo_pessoa character varying,
    cpf_cnpj character varying,
    contribuinte character varying,
    inscricao_estadual character varying,
    cep character varying,
    cidade character varying,
    uf character varying,
    endereco character varying,
    bairro character varying,
    numero character varying,
    complemento character varying,
    celular character varying
);


ALTER TABLE public.comercial_representantes OWNER TO postgres;

--
-- Name: comercial_representantes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comercial_representantes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comercial_representantes_id_seq OWNER TO postgres;

--
-- Name: comercial_representantes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comercial_representantes_id_seq OWNED BY public.comercial_representantes.id;


--
-- Name: configuracoes_expedicao; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuracoes_expedicao (
    id integer NOT NULL,
    formato_etiqueta character varying(50),
    imprimir_dce boolean,
    remetente_nome character varying(255),
    remetente_documento character varying(50),
    remetente_endereco character varying(255),
    remetente_cidade character varying(100),
    remetente_estado character varying(2),
    remetente_cep character varying(20)
);


ALTER TABLE public.configuracoes_expedicao OWNER TO postgres;

--
-- Name: configuracoes_expedicao_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.configuracoes_expedicao_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.configuracoes_expedicao_id_seq OWNER TO postgres;

--
-- Name: configuracoes_expedicao_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.configuracoes_expedicao_id_seq OWNED BY public.configuracoes_expedicao.id;


--
-- Name: configuracoes_produtos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuracoes_produtos (
    id integer NOT NULL,
    casas_decimais_quantidade integer,
    casas_decimais_preco integer,
    somar_peso_pedidos boolean,
    sku_automatico boolean,
    base_calculo_custo character varying,
    cadastro_automatico_compras boolean,
    exibir_estoque_lista_precos boolean,
    unidade_medida_padrao character varying,
    ncm_padrao character varying,
    origem_padrao character varying
);


ALTER TABLE public.configuracoes_produtos OWNER TO postgres;

--
-- Name: configuracoes_produtos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.configuracoes_produtos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.configuracoes_produtos_id_seq OWNER TO postgres;

--
-- Name: configuracoes_produtos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.configuracoes_produtos_id_seq OWNED BY public.configuracoes_produtos.id;


--
-- Name: configuracoes_vendas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuracoes_vendas (
    id integer NOT NULL,
    desconto_tipo character varying,
    considerar_taxa_cartao boolean,
    dias_vencimento_padrao integer,
    imprimir_vendedor boolean,
    imprimir_observacoes boolean,
    desconto_maximo_sem_aprovacao double precision,
    exibir_preco_desconto_itens boolean DEFAULT true,
    alerta_endereco_incompleto boolean DEFAULT true,
    alerta_comissao_zerada boolean DEFAULT true,
    visualizar_contas_receber boolean DEFAULT true,
    exibir_marcador_status_pagamento boolean DEFAULT true,
    exibir_detalhes_venda character varying DEFAULT 'SIM'::character varying,
    exibir_dados_adicionais character varying DEFAULT 'SIM'::character varying,
    exibir_transportador character varying DEFAULT 'SIM'::character varying
);


ALTER TABLE public.configuracoes_vendas OWNER TO postgres;

--
-- Name: configuracoes_vendas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.configuracoes_vendas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.configuracoes_vendas_id_seq OWNER TO postgres;

--
-- Name: configuracoes_vendas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.configuracoes_vendas_id_seq OWNED BY public.configuracoes_vendas.id;


--
-- Name: contas_bancarias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contas_bancarias (
    id integer NOT NULL,
    descricao character varying NOT NULL,
    banco character varying,
    agencia character varying,
    conta character varying,
    saldo_inicial double precision
);


ALTER TABLE public.contas_bancarias OWNER TO postgres;

--
-- Name: contas_bancarias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contas_bancarias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contas_bancarias_id_seq OWNER TO postgres;

--
-- Name: contas_bancarias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contas_bancarias_id_seq OWNED BY public.contas_bancarias.id;


--
-- Name: contas_financeiras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contas_financeiras (
    id integer NOT NULL,
    tipo character varying,
    status character varying,
    descricao character varying NOT NULL,
    valor double precision NOT NULL,
    data_emissao timestamp with time zone DEFAULT now(),
    data_vencimento timestamp with time zone NOT NULL,
    data_pagamento timestamp with time zone,
    pedido_id integer,
    cliente_id integer,
    observacoes text,
    categoria_id integer,
    conta_bancaria_id integer,
    recorrencia_id character varying,
    parcela_atual integer,
    total_parcelas integer,
    tags_csv character varying
);


ALTER TABLE public.contas_financeiras OWNER TO postgres;

--
-- Name: contas_financeiras_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contas_financeiras_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contas_financeiras_id_seq OWNER TO postgres;

--
-- Name: contas_financeiras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contas_financeiras_id_seq OWNED BY public.contas_financeiras.id;


--
-- Name: estoque_lotes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estoque_lotes (
    id integer NOT NULL,
    produto_id integer,
    codigo_lote character varying,
    data_fabricacao timestamp with time zone,
    data_validade timestamp with time zone,
    quantidade_inicial double precision,
    quantidade_atual double precision,
    ativo boolean,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.estoque_lotes OWNER TO postgres;

--
-- Name: estoque_lotes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estoque_lotes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estoque_lotes_id_seq OWNER TO postgres;

--
-- Name: estoque_lotes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estoque_lotes_id_seq OWNED BY public.estoque_lotes.id;


--
-- Name: etiqueta_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.etiqueta_templates (
    id integer NOT NULL,
    nome character varying,
    html_template text,
    css_template text,
    largura_mm double precision,
    altura_mm double precision,
    padrao boolean,
    created_at timestamp with time zone DEFAULT now(),
    campos_json text,
    zpl_base text
);


ALTER TABLE public.etiqueta_templates OWNER TO postgres;

--
-- Name: etiqueta_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.etiqueta_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.etiqueta_templates_id_seq OWNER TO postgres;

--
-- Name: etiqueta_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.etiqueta_templates_id_seq OWNED BY public.etiqueta_templates.id;


--
-- Name: fechamentos_financeiros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fechamentos_financeiros (
    id integer NOT NULL,
    data_fechamento timestamp with time zone NOT NULL,
    data_registro timestamp with time zone DEFAULT now(),
    usuario_id integer
);


ALTER TABLE public.fechamentos_financeiros OWNER TO postgres;

--
-- Name: fechamentos_financeiros_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fechamentos_financeiros_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fechamentos_financeiros_id_seq OWNER TO postgres;

--
-- Name: fechamentos_financeiros_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fechamentos_financeiros_id_seq OWNED BY public.fechamentos_financeiros.id;


--
-- Name: ficha_tecnica_itens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ficha_tecnica_itens (
    id integer NOT NULL,
    produto_composto_id integer,
    produto_componente_id integer,
    quantidade_necessaria double precision NOT NULL
);


ALTER TABLE public.ficha_tecnica_itens OWNER TO postgres;

--
-- Name: ficha_tecnica_itens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ficha_tecnica_itens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ficha_tecnica_itens_id_seq OWNER TO postgres;

--
-- Name: ficha_tecnica_itens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ficha_tecnica_itens_id_seq OWNED BY public.ficha_tecnica_itens.id;


--
-- Name: inventario_itens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventario_itens (
    id integer NOT NULL,
    sessao_id integer,
    produto_id integer,
    quantidade_sistema double precision,
    quantidade_fisica double precision,
    diferenca double precision,
    processado boolean
);


ALTER TABLE public.inventario_itens OWNER TO postgres;

--
-- Name: inventario_itens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventario_itens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventario_itens_id_seq OWNER TO postgres;

--
-- Name: inventario_itens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventario_itens_id_seq OWNED BY public.inventario_itens.id;


--
-- Name: inventario_sessoes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventario_sessoes (
    id integer NOT NULL,
    status character varying,
    usuario_abertura character varying,
    data_abertura timestamp with time zone DEFAULT now(),
    data_fechamento timestamp with time zone
);


ALTER TABLE public.inventario_sessoes OWNER TO postgres;

--
-- Name: inventario_sessoes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventario_sessoes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventario_sessoes_id_seq OWNER TO postgres;

--
-- Name: inventario_sessoes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventario_sessoes_id_seq OWNED BY public.inventario_sessoes.id;


--
-- Name: maquina_componentes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maquina_componentes (
    id integer NOT NULL,
    maquina_id integer,
    produto_id integer,
    data_instalacao timestamp without time zone DEFAULT now(),
    vida_util_dias integer
);


ALTER TABLE public.maquina_componentes OWNER TO postgres;

--
-- Name: maquina_componentes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.maquina_componentes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maquina_componentes_id_seq OWNER TO postgres;

--
-- Name: maquina_componentes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maquina_componentes_id_seq OWNED BY public.maquina_componentes.id;


--
-- Name: maquinas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maquinas (
    id integer NOT NULL,
    nome character varying NOT NULL,
    tipo character varying,
    capacidade character varying,
    status character varying,
    created_at timestamp with time zone DEFAULT now(),
    codigo character varying,
    horas_uso_acumulado double precision DEFAULT 0.0,
    horas_manutencao_preventiva double precision DEFAULT 500.0,
    ultima_manutencao_horas double precision DEFAULT 0.0
);


ALTER TABLE public.maquinas OWNER TO postgres;

--
-- Name: maquinas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.maquinas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maquinas_id_seq OWNER TO postgres;

--
-- Name: maquinas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maquinas_id_seq OWNED BY public.maquinas.id;


--
-- Name: marcadores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marcadores (
    id integer NOT NULL,
    descricao character varying,
    cor character varying
);


ALTER TABLE public.marcadores OWNER TO postgres;

--
-- Name: marcadores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.marcadores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.marcadores_id_seq OWNER TO postgres;

--
-- Name: marcadores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.marcadores_id_seq OWNED BY public.marcadores.id;


--
-- Name: modulos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modulos (
    id integer NOT NULL,
    nome character varying,
    descricao character varying,
    ativo boolean
);


ALTER TABLE public.modulos OWNER TO postgres;

--
-- Name: modulos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.modulos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.modulos_id_seq OWNER TO postgres;

--
-- Name: modulos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.modulos_id_seq OWNED BY public.modulos.id;


--
-- Name: movimentacoes_estoque; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movimentacoes_estoque (
    id integer NOT NULL,
    produto_id integer,
    tipo public.tipomovimentacao,
    quantidade double precision,
    usuario character varying,
    origem character varying,
    observacao text,
    created_at timestamp with time zone DEFAULT now(),
    lote_id integer
);


ALTER TABLE public.movimentacoes_estoque OWNER TO postgres;

--
-- Name: movimentacoes_estoque_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.movimentacoes_estoque_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movimentacoes_estoque_id_seq OWNER TO postgres;

--
-- Name: movimentacoes_estoque_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.movimentacoes_estoque_id_seq OWNED BY public.movimentacoes_estoque.id;


--
-- Name: nota_fiscal_marcador; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nota_fiscal_marcador (
    nota_id integer,
    marcador_id integer
);


ALTER TABLE public.nota_fiscal_marcador OWNER TO postgres;

--
-- Name: notas_fiscais; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notas_fiscais (
    id integer NOT NULL,
    pedido_id integer,
    tipo character varying,
    serie character varying,
    numero character varying,
    numero_ecommerce character varying,
    data_emissao timestamp without time zone,
    cliente_id integer,
    cliente_nome character varying,
    cliente_cpf_cnpj character varying,
    valor_produtos double precision,
    valor_frete double precision,
    valor_total double precision,
    vendedor_id integer,
    nome_vendedor character varying,
    situacao character varying,
    descricao_situacao character varying,
    id_forma_frete character varying,
    id_forma_envio character varying,
    codigo_rastreamento character varying,
    url_rastreamento character varying,
    xml_conteudo character varying,
    chave_acesso character varying,
    created_at timestamp with time zone,
    natureza_operacao character varying,
    regime_tributario character varying,
    finalidade character varying DEFAULT '1'::character varying,
    data_saida timestamp without time zone,
    base_icms double precision DEFAULT 0.0,
    valor_icms double precision DEFAULT 0.0,
    base_icms_st double precision DEFAULT 0.0,
    valor_icms_st double precision DEFAULT 0.0,
    valor_servicos double precision DEFAULT 0.0,
    valor_seguro double precision DEFAULT 0.0,
    valor_outras double precision DEFAULT 0.0,
    valor_ipi double precision DEFAULT 0.0,
    valor_issqn double precision DEFAULT 0.0,
    valor_desconto double precision DEFAULT 0.0,
    valor_nota double precision DEFAULT 0.0,
    valor_faturado double precision DEFAULT 0.0,
    frete_por_conta character varying,
    transportador_nome character varying,
    transportador_cpf_cnpj character varying,
    transportador_ie character varying,
    transportador_endereco character varying,
    transportador_cidade character varying,
    transportador_uf character varying,
    placa character varying,
    uf_placa character varying,
    quantidade_volumes character varying,
    especie_volumes character varying,
    peso_bruto double precision DEFAULT 0.0,
    peso_liquido double precision DEFAULT 0.0,
    condicao_pagamento character varying,
    forma_pagamento character varying,
    meio_pagamento character varying,
    obs text,
    id_tiny character varying,
    valor_ibs double precision DEFAULT 0.0,
    valor_cbs double precision DEFAULT 0.0,
    valor_is double precision DEFAULT 0.0,
    tp_emis character varying DEFAULT '1'::character varying,
    codigo_rejeicao character varying,
    motivo_rejeicao character varying
);


ALTER TABLE public.notas_fiscais OWNER TO postgres;

--
-- Name: notas_fiscais_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notas_fiscais_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notas_fiscais_id_seq OWNER TO postgres;

--
-- Name: notas_fiscais_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notas_fiscais_id_seq OWNED BY public.notas_fiscais.id;


--
-- Name: notas_fiscais_itens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notas_fiscais_itens (
    id integer NOT NULL,
    nota_id integer,
    produto_id integer,
    codigo character varying,
    descricao character varying,
    unidade character varying,
    ncm character varying,
    cfop character varying,
    natureza character varying,
    quantidade double precision,
    valor_unitario double precision,
    valor_total double precision,
    valor_ibs double precision DEFAULT 0.0,
    valor_cbs double precision DEFAULT 0.0,
    valor_is double precision DEFAULT 0.0
);


ALTER TABLE public.notas_fiscais_itens OWNER TO postgres;

--
-- Name: notas_fiscais_itens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notas_fiscais_itens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notas_fiscais_itens_id_seq OWNER TO postgres;

--
-- Name: notas_fiscais_itens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notas_fiscais_itens_id_seq OWNED BY public.notas_fiscais_itens.id;


--
-- Name: notas_fiscais_parcelas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notas_fiscais_parcelas (
    id integer NOT NULL,
    nota_id integer,
    dias integer,
    data_vencimento character varying,
    valor double precision,
    obs character varying,
    forma_pagamento character varying,
    meio_pagamento character varying
);


ALTER TABLE public.notas_fiscais_parcelas OWNER TO postgres;

--
-- Name: notas_fiscais_parcelas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notas_fiscais_parcelas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notas_fiscais_parcelas_id_seq OWNER TO postgres;

--
-- Name: notas_fiscais_parcelas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notas_fiscais_parcelas_id_seq OWNED BY public.notas_fiscais_parcelas.id;


--
-- Name: ordem_producao_itens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ordem_producao_itens (
    id integer NOT NULL,
    ordem_producao_id integer,
    produto_componente_id integer,
    quantidade_necessaria double precision NOT NULL,
    custo_unitario double precision DEFAULT 0.0
);


ALTER TABLE public.ordem_producao_itens OWNER TO postgres;

--
-- Name: ordem_producao_itens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ordem_producao_itens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ordem_producao_itens_id_seq OWNER TO postgres;

--
-- Name: ordem_producao_itens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ordem_producao_itens_id_seq OWNED BY public.ordem_producao_itens.id;


--
-- Name: ordens_compra; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ordens_compra (
    id integer NOT NULL,
    fornecedor_id integer,
    fornecedor_nome character varying NOT NULL,
    data_emissao timestamp without time zone,
    data_recebimento timestamp without time zone,
    status character varying,
    valor_frete double precision,
    desconto_valor double precision,
    valor_total double precision,
    observacoes character varying
);


ALTER TABLE public.ordens_compra OWNER TO postgres;

--
-- Name: ordens_compra_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ordens_compra_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ordens_compra_id_seq OWNER TO postgres;

--
-- Name: ordens_compra_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ordens_compra_id_seq OWNED BY public.ordens_compra.id;


--
-- Name: ordens_compra_itens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ordens_compra_itens (
    id integer NOT NULL,
    ordem_id integer,
    produto_id integer,
    quantidade double precision NOT NULL,
    preco_unitario double precision NOT NULL
);


ALTER TABLE public.ordens_compra_itens OWNER TO postgres;

--
-- Name: ordens_compra_itens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ordens_compra_itens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ordens_compra_itens_id_seq OWNER TO postgres;

--
-- Name: ordens_compra_itens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ordens_compra_itens_id_seq OWNED BY public.ordens_compra_itens.id;


--
-- Name: ordens_producao; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ordens_producao (
    id integer NOT NULL,
    produto_id integer,
    quantidade_planejada double precision NOT NULL,
    quantidade_produzida double precision,
    status character varying,
    data_inicio timestamp with time zone,
    data_fim timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    custo_mao_obra double precision DEFAULT 0.0,
    custo_insumos double precision DEFAULT 0.0,
    custo_maquina double precision DEFAULT 0.0
);


ALTER TABLE public.ordens_producao OWNER TO postgres;

--
-- Name: ordens_producao_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ordens_producao_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ordens_producao_id_seq OWNER TO postgres;

--
-- Name: ordens_producao_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ordens_producao_id_seq OWNED BY public.ordens_producao.id;


--
-- Name: ordens_servico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ordens_servico (
    id integer NOT NULL,
    maquina_id integer,
    tipo character varying,
    status character varying,
    problema_desc character varying,
    custo_mao_obra double precision,
    custo_total double precision,
    data_abertura timestamp without time zone DEFAULT now(),
    data_fechamento timestamp without time zone
);


ALTER TABLE public.ordens_servico OWNER TO postgres;

--
-- Name: ordens_servico_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ordens_servico_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ordens_servico_id_seq OWNER TO postgres;

--
-- Name: ordens_servico_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ordens_servico_id_seq OWNED BY public.ordens_servico.id;


--
-- Name: os_itens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.os_itens (
    id integer NOT NULL,
    os_id integer,
    produto_id integer,
    quantidade double precision NOT NULL,
    custo_unitario double precision
);


ALTER TABLE public.os_itens OWNER TO postgres;

--
-- Name: os_itens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.os_itens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.os_itens_id_seq OWNER TO postgres;

--
-- Name: os_itens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.os_itens_id_seq OWNED BY public.os_itens.id;


--
-- Name: pedido_venda_itens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedido_venda_itens (
    id integer NOT NULL,
    pedido_id integer,
    produto_id integer,
    quantidade double precision NOT NULL,
    preco_unitario double precision NOT NULL
);


ALTER TABLE public.pedido_venda_itens OWNER TO postgres;

--
-- Name: pedido_venda_itens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedido_venda_itens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pedido_venda_itens_id_seq OWNER TO postgres;

--
-- Name: pedido_venda_itens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedido_venda_itens_id_seq OWNED BY public.pedido_venda_itens.id;


--
-- Name: pedidos_venda; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedidos_venda (
    id integer NOT NULL,
    cliente_nome character varying,
    data_pedido timestamp with time zone DEFAULT now(),
    status character varying,
    valor_total double precision,
    observacoes text,
    tipo character varying DEFAULT 'PEDIDO'::character varying,
    cliente_id integer,
    representante_id integer,
    vendedor_interno_id integer,
    condicao_pagamento_id integer,
    valor_frete double precision DEFAULT 0.0,
    desconto_valor double precision DEFAULT 0.0,
    codigo_rastreio character varying,
    url_rastreio character varying,
    transportadora character varying,
    proposta_id integer,
    peso_bruto double precision DEFAULT 0.0,
    peso_liquido double precision DEFAULT 0.0,
    volumes double precision DEFAULT 1.0,
    status_separacao character varying DEFAULT 'PENDENTE'::character varying,
    natureza_operacao character varying,
    codigo_rastreamento character varying,
    url_rastreamento character varying,
    vendedor_id integer,
    data_prevista timestamp without time zone
);


ALTER TABLE public.pedidos_venda OWNER TO postgres;

--
-- Name: pedidos_venda_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedidos_venda_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pedidos_venda_id_seq OWNER TO postgres;

--
-- Name: pedidos_venda_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedidos_venda_id_seq OWNED BY public.pedidos_venda.id;


--
-- Name: produtos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.produtos (
    id integer NOT NULL,
    nome character varying,
    sku character varying,
    gtin character varying,
    categoria character varying,
    unidade_medida character varying,
    corredor character varying,
    prateleira character varying,
    posicao character varying,
    estoque_minimo double precision,
    estoque_medio double precision,
    estoque_maximo double precision,
    ativo boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    tipo_produto character varying DEFAULT 'Simples'::character varying,
    origem_icms character varying DEFAULT '0'::character varying,
    ncm character varying,
    preco_venda double precision DEFAULT 0.0,
    peso_liquido double precision DEFAULT 0.0,
    peso_bruto double precision DEFAULT 0.0,
    tipo_embalagem character varying DEFAULT 'Pacote / Caixa'::character varying,
    largura double precision DEFAULT 0.0,
    altura double precision DEFAULT 0.0,
    comprimento double precision DEFAULT 0.0,
    controlar_estoque boolean DEFAULT true,
    controlar_lotes boolean DEFAULT false,
    dias_preparacao integer DEFAULT 0,
    descricao character varying,
    marca character varying,
    markup double precision DEFAULT 0.0,
    n_volumes integer DEFAULT 1,
    unidade_por_caixa integer DEFAULT 1,
    permitir_vendas boolean DEFAULT true,
    linha_produto character varying,
    garantia character varying,
    observacoes_internas text,
    codigo_anvisa character varying,
    motivo_isencao_anvisa character varying,
    ex_tipi character varying,
    custo double precision DEFAULT 0.0,
    cod_fornecedor character varying
);


ALTER TABLE public.produtos OWNER TO postgres;

--
-- Name: produtos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.produtos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.produtos_id_seq OWNER TO postgres;

--
-- Name: produtos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.produtos_id_seq OWNED BY public.produtos.id;


--
-- Name: proposta_comercial_itens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proposta_comercial_itens (
    id integer NOT NULL,
    proposta_id integer,
    produto_id integer,
    quantidade double precision NOT NULL,
    preco_unitario double precision NOT NULL,
    desconto_percentual double precision,
    preco_total double precision NOT NULL
);


ALTER TABLE public.proposta_comercial_itens OWNER TO postgres;

--
-- Name: proposta_comercial_itens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.proposta_comercial_itens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.proposta_comercial_itens_id_seq OWNER TO postgres;

--
-- Name: proposta_comercial_itens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.proposta_comercial_itens_id_seq OWNED BY public.proposta_comercial_itens.id;


--
-- Name: propostas_comerciais; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.propostas_comerciais (
    id integer NOT NULL,
    numero integer,
    cliente_id integer,
    representante_id integer,
    vendedor_interno_id integer,
    natureza_operacao character varying,
    lista_preco character varying,
    data_proposta timestamp with time zone DEFAULT now(),
    prox_contato timestamp with time zone,
    validade_dias integer,
    status character varying,
    valor_frete double precision,
    desconto_valor double precision,
    valor_total double precision,
    peso_bruto double precision,
    peso_liquido double precision,
    volumes double precision,
    tags_csv character varying,
    observacoes text
);


ALTER TABLE public.propostas_comerciais OWNER TO postgres;

--
-- Name: propostas_comerciais_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.propostas_comerciais_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.propostas_comerciais_id_seq OWNER TO postgres;

--
-- Name: propostas_comerciais_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.propostas_comerciais_id_seq OWNED BY public.propostas_comerciais.id;


--
-- Name: reservas_estoque; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservas_estoque (
    id integer NOT NULL,
    produto_id integer,
    pedido_ref character varying,
    quantidade double precision,
    status public.statusreserva,
    usuario character varying,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.reservas_estoque OWNER TO postgres;

--
-- Name: reservas_estoque_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reservas_estoque_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reservas_estoque_id_seq OWNER TO postgres;

--
-- Name: reservas_estoque_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reservas_estoque_id_seq OWNED BY public.reservas_estoque.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    nome character varying,
    permissoes text
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: sefaz_alertas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sefaz_alertas (
    id integer NOT NULL,
    tipo character varying,
    mensagem character varying,
    data_leitura timestamp without time zone,
    fonte character varying,
    lido boolean
);


ALTER TABLE public.sefaz_alertas OWNER TO postgres;

--
-- Name: sefaz_alertas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sefaz_alertas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sefaz_alertas_id_seq OWNER TO postgres;

--
-- Name: sefaz_alertas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sefaz_alertas_id_seq OWNED BY public.sefaz_alertas.id;


--
-- Name: setores_produtividade; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.setores_produtividade (
    id integer NOT NULL,
    nome character varying NOT NULL,
    nome_chave character varying NOT NULL,
    meta_diaria double precision NOT NULL,
    ativo boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    meta_colaborador_diaria double precision DEFAULT 0 NOT NULL
);


ALTER TABLE public.setores_produtividade OWNER TO postgres;

--
-- Name: setores_produtividade_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.setores_produtividade_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.setores_produtividade_id_seq OWNER TO postgres;

--
-- Name: setores_produtividade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.setores_produtividade_id_seq OWNED BY public.setores_produtividade.id;


--
-- Name: tags_financeiras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags_financeiras (
    id integer NOT NULL,
    descricao character varying NOT NULL,
    cor character varying
);


ALTER TABLE public.tags_financeiras OWNER TO postgres;

--
-- Name: tags_financeiras_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tags_financeiras_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_financeiras_id_seq OWNER TO postgres;

--
-- Name: tags_financeiras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tags_financeiras_id_seq OWNED BY public.tags_financeiras.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    username character varying,
    email character varying,
    hashed_password character varying,
    nome_completo character varying,
    role_id integer,
    ativo boolean,
    created_at timestamp with time zone DEFAULT now(),
    permissoes text,
    comissao_percentual double precision DEFAULT 0
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: apontamentos_produtividade id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.apontamentos_produtividade ALTER COLUMN id SET DEFAULT nextval('public.apontamentos_produtividade_id_seq'::regclass);


--
-- Name: auditoria_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria_logs ALTER COLUMN id SET DEFAULT nextval('public.auditoria_logs_id_seq'::regclass);


--
-- Name: categorias_financeiras id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias_financeiras ALTER COLUMN id SET DEFAULT nextval('public.categorias_financeiras_id_seq'::regclass);


--
-- Name: colaboradores_produtividade id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colaboradores_produtividade ALTER COLUMN id SET DEFAULT nextval('public.colaboradores_produtividade_id_seq'::regclass);


--
-- Name: comercial_clientes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comercial_clientes ALTER COLUMN id SET DEFAULT nextval('public.comercial_clientes_id_seq'::regclass);


--
-- Name: comercial_condicoes_pagamento id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comercial_condicoes_pagamento ALTER COLUMN id SET DEFAULT nextval('public.comercial_condicoes_pagamento_id_seq'::regclass);


--
-- Name: comercial_formas_pagamento id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comercial_formas_pagamento ALTER COLUMN id SET DEFAULT nextval('public.comercial_formas_pagamento_id_seq'::regclass);


--
-- Name: comercial_representantes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comercial_representantes ALTER COLUMN id SET DEFAULT nextval('public.comercial_representantes_id_seq'::regclass);


--
-- Name: configuracoes_expedicao id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracoes_expedicao ALTER COLUMN id SET DEFAULT nextval('public.configuracoes_expedicao_id_seq'::regclass);


--
-- Name: configuracoes_produtos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracoes_produtos ALTER COLUMN id SET DEFAULT nextval('public.configuracoes_produtos_id_seq'::regclass);


--
-- Name: configuracoes_vendas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracoes_vendas ALTER COLUMN id SET DEFAULT nextval('public.configuracoes_vendas_id_seq'::regclass);


--
-- Name: contas_bancarias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contas_bancarias ALTER COLUMN id SET DEFAULT nextval('public.contas_bancarias_id_seq'::regclass);


--
-- Name: contas_financeiras id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contas_financeiras ALTER COLUMN id SET DEFAULT nextval('public.contas_financeiras_id_seq'::regclass);


--
-- Name: estoque_lotes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estoque_lotes ALTER COLUMN id SET DEFAULT nextval('public.estoque_lotes_id_seq'::regclass);


--
-- Name: etiqueta_templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etiqueta_templates ALTER COLUMN id SET DEFAULT nextval('public.etiqueta_templates_id_seq'::regclass);


--
-- Name: fechamentos_financeiros id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fechamentos_financeiros ALTER COLUMN id SET DEFAULT nextval('public.fechamentos_financeiros_id_seq'::regclass);


--
-- Name: ficha_tecnica_itens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ficha_tecnica_itens ALTER COLUMN id SET DEFAULT nextval('public.ficha_tecnica_itens_id_seq'::regclass);


--
-- Name: inventario_itens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario_itens ALTER COLUMN id SET DEFAULT nextval('public.inventario_itens_id_seq'::regclass);


--
-- Name: inventario_sessoes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario_sessoes ALTER COLUMN id SET DEFAULT nextval('public.inventario_sessoes_id_seq'::regclass);


--
-- Name: maquina_componentes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maquina_componentes ALTER COLUMN id SET DEFAULT nextval('public.maquina_componentes_id_seq'::regclass);


--
-- Name: maquinas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maquinas ALTER COLUMN id SET DEFAULT nextval('public.maquinas_id_seq'::regclass);


--
-- Name: marcadores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marcadores ALTER COLUMN id SET DEFAULT nextval('public.marcadores_id_seq'::regclass);


--
-- Name: modulos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modulos ALTER COLUMN id SET DEFAULT nextval('public.modulos_id_seq'::regclass);


--
-- Name: movimentacoes_estoque id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimentacoes_estoque ALTER COLUMN id SET DEFAULT nextval('public.movimentacoes_estoque_id_seq'::regclass);


--
-- Name: notas_fiscais id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_fiscais ALTER COLUMN id SET DEFAULT nextval('public.notas_fiscais_id_seq'::regclass);


--
-- Name: notas_fiscais_itens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_fiscais_itens ALTER COLUMN id SET DEFAULT nextval('public.notas_fiscais_itens_id_seq'::regclass);


--
-- Name: notas_fiscais_parcelas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_fiscais_parcelas ALTER COLUMN id SET DEFAULT nextval('public.notas_fiscais_parcelas_id_seq'::regclass);


--
-- Name: ordem_producao_itens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordem_producao_itens ALTER COLUMN id SET DEFAULT nextval('public.ordem_producao_itens_id_seq'::regclass);


--
-- Name: ordens_compra id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordens_compra ALTER COLUMN id SET DEFAULT nextval('public.ordens_compra_id_seq'::regclass);


--
-- Name: ordens_compra_itens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordens_compra_itens ALTER COLUMN id SET DEFAULT nextval('public.ordens_compra_itens_id_seq'::regclass);


--
-- Name: ordens_producao id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordens_producao ALTER COLUMN id SET DEFAULT nextval('public.ordens_producao_id_seq'::regclass);


--
-- Name: ordens_servico id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordens_servico ALTER COLUMN id SET DEFAULT nextval('public.ordens_servico_id_seq'::regclass);


--
-- Name: os_itens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.os_itens ALTER COLUMN id SET DEFAULT nextval('public.os_itens_id_seq'::regclass);


--
-- Name: pedido_venda_itens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_venda_itens ALTER COLUMN id SET DEFAULT nextval('public.pedido_venda_itens_id_seq'::regclass);


--
-- Name: pedidos_venda id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos_venda ALTER COLUMN id SET DEFAULT nextval('public.pedidos_venda_id_seq'::regclass);


--
-- Name: produtos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produtos ALTER COLUMN id SET DEFAULT nextval('public.produtos_id_seq'::regclass);


--
-- Name: proposta_comercial_itens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposta_comercial_itens ALTER COLUMN id SET DEFAULT nextval('public.proposta_comercial_itens_id_seq'::regclass);


--
-- Name: propostas_comerciais id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.propostas_comerciais ALTER COLUMN id SET DEFAULT nextval('public.propostas_comerciais_id_seq'::regclass);


--
-- Name: reservas_estoque id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas_estoque ALTER COLUMN id SET DEFAULT nextval('public.reservas_estoque_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: sefaz_alertas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sefaz_alertas ALTER COLUMN id SET DEFAULT nextval('public.sefaz_alertas_id_seq'::regclass);


--
-- Name: setores_produtividade id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.setores_produtividade ALTER COLUMN id SET DEFAULT nextval('public.setores_produtividade_id_seq'::regclass);


--
-- Name: tags_financeiras id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags_financeiras ALTER COLUMN id SET DEFAULT nextval('public.tags_financeiras_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
e849d971ab29
\.


--
-- Data for Name: apontamentos_produtividade; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.apontamentos_produtividade (id, data_referencia, setor_id, colaborador_nome, colaborador_chave, quantidade, ocorrencia, observacao, criado_por, created_at, updated_at, colaborador_id) FROM stdin;
\.


--
-- Data for Name: auditoria_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditoria_logs (id, usuario, acao, modulo, detalhes, entidade_id, ip_address, created_at) FROM stdin;
1	admin	UPDATE	ESTOQUE	Atualizou produto: BARRA REVESTIDA 19 MM 1,50 MT ROSA (SKU: BR191512)	7612	127.0.0.1	2026-04-29 19:50:24.748823
2	admin	UPDATE	ESTOQUE	Atualizou produto: BARRA REVESTIDA 19 MM 1,50 MT ROSA (SKU: BR191512)	7612	127.0.0.1	2026-04-30 10:35:29.593066
3	admin	PURGE_ALL	ESTOQUE	EXECUTOU PURGA TOTAL: 1840 produtos e todos os históricos relacionados foram removidos.	\N	127.0.0.1	2026-04-30 10:55:16.108485
4	admin	IMPORT	ESTOQUE	Importação de estoque via planilha: produtos_2026-04-29-14-45-27.xlsx. Criados: 1840, Atualizados: 8, Ajustes: 284	\N	127.0.0.1	2026-04-30 10:56:28.323663
5	admin	PURGE_ALL	ESTOQUE	EXECUTOU PURGA TOTAL: 1840 produtos e todos os históricos relacionados foram removidos.	\N	127.0.0.1	2026-04-30 11:00:50.232356
6	admin	IMPORT	ESTOQUE	Importação de estoque via planilha: produtos_2026-04-29-14-45-27.xlsx. Criados: 1840, Atualizados: 8, Ajustes: 284	\N	127.0.0.1	2026-04-30 11:01:35.129352
7	admin	PURGE_ALL	ESTOQUE	EXECUTOU PURGA TOTAL: 1840 produtos e todos os históricos relacionados foram removidos.	\N	127.0.0.1	2026-04-30 11:02:55.91895
8	admin	UPDATE	USUARIOS	Atualizou dados do usuário: Bruno Andres	2	127.0.0.1	2026-05-13 12:59:52.766701
9	admin	CREATE	ESTOQUE	Criou produto: Produto de Teste Frontend (SKU: SKU-FRONT-001)	13091	testclient	2026-06-26 13:24:38.330293
10	admin	CREATE	ESTOQUE	Criou produto: Produto Teste Bateria (SKU: TEST-PROD-999)	13092	127.0.0.1	2026-06-26 13:27:53.394903
11	admin	UPDATE	USUARIOS	Atualizou dados do usuário: Bruno Andres	2	127.0.0.1	2026-06-26 17:50:11.600877
12	admin	IMPORT	ESTOQUE	Importação de estoque via planilha: planilha-olist-final-sku.xlsx. Criados: 1318, Atualizados: 0, Ajustes: 240	\N	127.0.0.1	2026-06-30 18:52:20.411253
13	admin	PURGE_ALL	ESTOQUE	EXECUTOU PURGA TOTAL: 1320 produtos e todos os históricos relacionados foram removidos.	\N	127.0.0.1	2026-06-30 18:53:19.576867
14	admin	CREATE	USUARIOS	Criou novo usuário: CRISTIANE (CRISTIANE LIMA LEITE)	10	127.0.0.1	2026-06-30 18:56:25.110089
15	admin	CREATE	ESTOQUE	Criou produto: Produto de Teste Frontend (SKU: SKU-FRONT-001)	14411	testclient	2026-07-01 10:59:24.104393
16	admin	CREATE	ESTOQUE	Criou produto: Produto Teste Bateria (SKU: TEST-PROD-999)	14412	127.0.0.1	2026-07-14 11:22:44.714355
\.


--
-- Data for Name: categorias_financeiras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categorias_financeiras (id, descricao, grupo, considera_dre, tipo, padrao_venda) FROM stdin;
1	Receitas de Vendas	Receitas Operacionais	Receita Bruta	RECEITA	t
2	Receitas Diversas	Outras Receitas	Outras receitas	RECEITA	f
3	Despesas de Frete e Logística	Despesas de Vendas	Despesas operacionais	DESPESA	f
4	Impostos sobre Vendas	Deduções	Deduções da Receita Bruta	DESPESA	f
5	Fornecedores (CMV/CPV)	Custos	Custo dos Produtos Vendidos	DESPESA	f
6	Despesas Administrativas	Despesas Operacionais	Despesas operacionais	DESPESA	f
7	Despesas Financeiras (Taxas)	Despesas Financeiras	Despesas Financeiras	DESPESA	f
8	Folha de Pagamento	Despesas Operacionais	Despesas operacionais	DESPESA	f
\.


--
-- Data for Name: colaboradores_produtividade; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.colaboradores_produtividade (id, setor_id, nome, nome_chave, ativo, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: comercial_clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comercial_clientes (id, situacao, tipo_pessoa, nome_razao_social, nome_fantasia, cpf_cnpj, inscricao_estadual, telefone, whatsapp, email, cep, endereco, numero, complemento, bairro, cidade, uf, forma_pagamento_padrao, condicao_pagamento, prazo_pagamento_dias, prazo_entrega_padrao_dias, observacoes, created_at, updated_at, cep_entrega, endereco_entrega, numero_entrega, complemento_entrega, bairro_entrega, cidade_entrega, uf_entrega, cep_cobranca, endereco_cobranca, numero_cobranca, complemento_cobranca, bairro_cobranca, uf_cobranca, municipio_cobranca, cnpj_cobranca, inscricao_estadual_cobranca, email_cobranca, representante_id, nome_vendedor_interno, forma_pagamento_id, condicao_pagamento_id, rg, tipo_contato, codigo_externo, contribuinte, inscricao_municipal, codigo_regime_tributario, inscricao_suframa, data_nascimento, status_crm, vendedor_id, limite_credito, vendedor_padrao_id, id_lista_preco) FROM stdin;
5	ATIVO	JURIDICA	Cliente Teste	\N	12345678901	\N	\N	\N	teste@teste.com	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-06-26 17:23:29.578912+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	\N	\N	\N	\N	Cliente	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
6	ATIVO	JURIDICA	Cliente Teste Novo Pedido	\N	00000000000	\N	\N	\N	testepedido@test.com	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-06-26 17:28:22.475654+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	\N	\N	\N	\N	Cliente	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: comercial_condicoes_pagamento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comercial_condicoes_pagamento (id, codigo, descricao, indice_financeiro, base_calculo, numero_parcelas, parcelas_json, ativo, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: comercial_formas_pagamento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comercial_formas_pagamento (id, codigo, descricao, ativo, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: comercial_representantes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comercial_representantes (id, codigo, nome, ativo, created_at, updated_at, comissao_padrao, email, telefone, fantasia, tipo_pessoa, cpf_cnpj, contribuinte, inscricao_estadual, cep, cidade, uf, endereco, bairro, numero, complemento, celular) FROM stdin;
1	1	DIRETO	t	2026-04-30 14:27:10.243702+00	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: configuracoes_expedicao; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.configuracoes_expedicao (id, formato_etiqueta, imprimir_dce, remetente_nome, remetente_documento, remetente_endereco, remetente_cidade, remetente_estado, remetente_cep) FROM stdin;
1	PDF_A4	t						
\.


--
-- Data for Name: configuracoes_produtos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.configuracoes_produtos (id, casas_decimais_quantidade, casas_decimais_preco, somar_peso_pedidos, sku_automatico, base_calculo_custo, cadastro_automatico_compras, exibir_estoque_lista_precos, unidade_medida_padrao, ncm_padrao, origem_padrao) FROM stdin;
1	2	2	t	f	ultimo_custo	f	t	UN	\N	0
\.


--
-- Data for Name: configuracoes_vendas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.configuracoes_vendas (id, desconto_tipo, considerar_taxa_cartao, dias_vencimento_padrao, imprimir_vendedor, imprimir_observacoes, desconto_maximo_sem_aprovacao, exibir_preco_desconto_itens, alerta_endereco_incompleto, alerta_comissao_zerada, visualizar_contas_receber, exibir_marcador_status_pagamento, exibir_detalhes_venda, exibir_dados_adicionais, exibir_transportador) FROM stdin;
1	VALOR	f	30	t	t	10	t	t	t	t	t	SIM	SIM	SIM
\.


--
-- Data for Name: contas_bancarias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contas_bancarias (id, descricao, banco, agencia, conta, saldo_inicial) FROM stdin;
\.


--
-- Data for Name: contas_financeiras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contas_financeiras (id, tipo, status, descricao, valor, data_emissao, data_vencimento, data_pagamento, pedido_id, cliente_id, observacoes, categoria_id, conta_bancaria_id, recorrencia_id, parcela_atual, total_parcelas, tags_csv) FROM stdin;
1	RECEBER	PAGO	01	1102	2026-06-30 17:49:27.094848+00	2026-06-30 00:00:00+00	2026-06-30 14:49:40.038085+00	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: estoque_lotes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estoque_lotes (id, produto_id, codigo_lote, data_fabricacao, data_validade, quantidade_inicial, quantidade_atual, ativo, created_at) FROM stdin;
\.


--
-- Data for Name: etiqueta_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.etiqueta_templates (id, nome, html_template, css_template, largura_mm, altura_mm, padrao, created_at, campos_json, zpl_base) FROM stdin;
1	Teste Automacao	[{"id":1777315029764,"type":"sku","label":"SKU","x":5,"y":5,"w":30,"h":8,"fontSize":12,"bold":true,"align":"flex-start","customText":""},{"id":1777315033155,"type":"name","label":"Nome do Produto","x":20,"y":10.291003676318619,"w":80,"h":12,"fontSize":10,"bold":false,"align":"flex-start","customText":""},{"id":1777315036124,"type":"barcode","label":"Código de Barras","x":21.402122860863095,"y":20.37037037037037,"w":50,"h":18,"fontSize":9,"bold":false,"align":"flex-start","customText":""},{"id":1777315623089,"type":"name","label":"Nome do Produto","x":5,"y":5,"w":80,"h":12,"fontSize":10,"bold":false,"align":"flex-start","customText":""},{"id":1777315624823,"type":"custom","label":"Texto Livre","x":5,"y":5,"w":35,"h":8,"fontSize":11,"bold":false,"align":"center","customText":"Texto Livre"}]		100	40	f	2026-04-27 18:38:45.096189+00	\N	\N
\.


--
-- Data for Name: fechamentos_financeiros; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fechamentos_financeiros (id, data_fechamento, data_registro, usuario_id) FROM stdin;
\.


--
-- Data for Name: ficha_tecnica_itens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ficha_tecnica_itens (id, produto_composto_id, produto_componente_id, quantidade_necessaria) FROM stdin;
\.


--
-- Data for Name: inventario_itens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventario_itens (id, sessao_id, produto_id, quantidade_sistema, quantidade_fisica, diferenca, processado) FROM stdin;
\.


--
-- Data for Name: inventario_sessoes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventario_sessoes (id, status, usuario_abertura, data_abertura, data_fechamento) FROM stdin;
\.


--
-- Data for Name: maquina_componentes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maquina_componentes (id, maquina_id, produto_id, data_instalacao, vida_util_dias) FROM stdin;
\.


--
-- Data for Name: maquinas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maquinas (id, nome, tipo, capacidade, status, created_at, codigo, horas_uso_acumulado, horas_manutencao_preventiva, ultima_manutencao_horas) FROM stdin;
\.


--
-- Data for Name: marcadores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marcadores (id, descricao, cor) FROM stdin;
1	1ª venda	#808080
2	impresso	#10b981
3	falta de mp - aguardando aço	#f59e0b
\.


--
-- Data for Name: modulos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modulos (id, nome, descricao, ativo) FROM stdin;
1	ESTOQUE	Gestão de Produtos, Movimentações e Inventário	t
4	FINANCEIRO	Contas a Pagar/Receber e Fluxo de Caixa	t
3	PRODUCAO	Ordens de Produção e Matéria Prima	t
2	VENDAS	Pedidos de Venda e Clientes	t
\.


--
-- Data for Name: movimentacoes_estoque; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movimentacoes_estoque (id, produto_id, tipo, quantidade, usuario, origem, observacao, created_at, lote_id) FROM stdin;
\.


--
-- Data for Name: nota_fiscal_marcador; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nota_fiscal_marcador (nota_id, marcador_id) FROM stdin;
\.


--
-- Data for Name: notas_fiscais; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notas_fiscais (id, pedido_id, tipo, serie, numero, numero_ecommerce, data_emissao, cliente_id, cliente_nome, cliente_cpf_cnpj, valor_produtos, valor_frete, valor_total, vendedor_id, nome_vendedor, situacao, descricao_situacao, id_forma_frete, id_forma_envio, codigo_rastreamento, url_rastreamento, xml_conteudo, chave_acesso, created_at, natureza_operacao, regime_tributario, finalidade, data_saida, base_icms, valor_icms, base_icms_st, valor_icms_st, valor_servicos, valor_seguro, valor_outras, valor_ipi, valor_issqn, valor_desconto, valor_nota, valor_faturado, frete_por_conta, transportador_nome, transportador_cpf_cnpj, transportador_ie, transportador_endereco, transportador_cidade, transportador_uf, placa, uf_placa, quantidade_volumes, especie_volumes, peso_bruto, peso_liquido, condicao_pagamento, forma_pagamento, meio_pagamento, obs, id_tiny, valor_ibs, valor_cbs, valor_is, tp_emis, codigo_rejeicao, motivo_rejeicao) FROM stdin;
\.


--
-- Data for Name: notas_fiscais_itens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notas_fiscais_itens (id, nota_id, produto_id, codigo, descricao, unidade, ncm, cfop, natureza, quantidade, valor_unitario, valor_total, valor_ibs, valor_cbs, valor_is) FROM stdin;
\.


--
-- Data for Name: notas_fiscais_parcelas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notas_fiscais_parcelas (id, nota_id, dias, data_vencimento, valor, obs, forma_pagamento, meio_pagamento) FROM stdin;
\.


--
-- Data for Name: ordem_producao_itens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ordem_producao_itens (id, ordem_producao_id, produto_componente_id, quantidade_necessaria, custo_unitario) FROM stdin;
\.


--
-- Data for Name: ordens_compra; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ordens_compra (id, fornecedor_id, fornecedor_nome, data_emissao, data_recebimento, status, valor_frete, desconto_valor, valor_total, observacoes) FROM stdin;
\.


--
-- Data for Name: ordens_compra_itens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ordens_compra_itens (id, ordem_id, produto_id, quantidade, preco_unitario) FROM stdin;
\.


--
-- Data for Name: ordens_producao; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ordens_producao (id, produto_id, quantidade_planejada, quantidade_produzida, status, data_inicio, data_fim, created_at, custo_mao_obra, custo_insumos, custo_maquina) FROM stdin;
\.


--
-- Data for Name: ordens_servico; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ordens_servico (id, maquina_id, tipo, status, problema_desc, custo_mao_obra, custo_total, data_abertura, data_fechamento) FROM stdin;
\.


--
-- Data for Name: os_itens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.os_itens (id, os_id, produto_id, quantidade, custo_unitario) FROM stdin;
\.


--
-- Data for Name: pedido_venda_itens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedido_venda_itens (id, pedido_id, produto_id, quantidade, preco_unitario) FROM stdin;
3	3	14411	101	99.5
4	4	14411	1	0
5	4	14412	1	0
6	5	14411	1	0
7	5	14412	1	0
\.


--
-- Data for Name: pedidos_venda; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedidos_venda (id, cliente_nome, data_pedido, status, valor_total, observacoes, tipo, cliente_id, representante_id, vendedor_interno_id, condicao_pagamento_id, valor_frete, desconto_valor, codigo_rastreio, url_rastreio, transportadora, proposta_id, peso_bruto, peso_liquido, volumes, status_separacao, natureza_operacao, codigo_rastreamento, url_rastreamento, vendedor_id, data_prevista) FROM stdin;
3	Cliente Teste	2026-07-13 13:34:58.960954+00	CANCELADO	10049.5		PEDIDO	5	\N	1	\N	0	0	\N	\N	\N	\N	0	0	1	PENDENTE	\N	\N	\N	\N	\N
1	Cliente Teste Novo Pedido	2026-06-26 17:28:22.542291+00	CANCELADO	110.5	Teste automatizado	PEDIDO	6	\N	1	\N	15.5	5	\N	\N	\N	\N	0	0	1	PENDENTE	\N	\N	\N	\N	\N
2	Cliente Teste	2026-06-26 17:45:12.239326+00	CANCELADO	0		COTACAO	5	\N	1	\N	0	0	\N	\N	\N	\N	0	0	1	PENDENTE	\N	\N	\N	\N	\N
4	Cliente Teste	2026-07-15 11:30:15.807264+00	EM_ABERTO	0		PEDIDO	5	\N	1	\N	0	0	\N	\N	\N	\N	0	0	1	PENDENTE	Venda	\N	\N	\N	\N
5	Cliente Teste	2026-07-15 11:30:26.244419+00	EM_ABERTO	0		PEDIDO	5	\N	1	\N	0	0	\N	\N	\N	\N	0	0	1	PENDENTE	Venda	\N	\N	\N	\N
\.


--
-- Data for Name: produtos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.produtos (id, nome, sku, gtin, categoria, unidade_medida, corredor, prateleira, posicao, estoque_minimo, estoque_medio, estoque_maximo, ativo, created_at, updated_at, tipo_produto, origem_icms, ncm, preco_venda, peso_liquido, peso_bruto, tipo_embalagem, largura, altura, comprimento, controlar_estoque, controlar_lotes, dias_preparacao, descricao, marca, markup, n_volumes, unidade_por_caixa, permitir_vendas, linha_produto, garantia, observacoes_internas, codigo_anvisa, motivo_isencao_anvisa, ex_tipi, custo, cod_fornecedor) FROM stdin;
14411	Produto de Teste Frontend	SKU-FRONT-001		METALURGICA	UN	\N	\N		0	0	0	t	2026-07-01 10:59:20.023288+00	2026-07-14 12:39:16.500978+00	COMPRADO	0		0	0	0	Pacote / Caixa	0	0	0	t	f	0		\N	0	1	1	t	\N	\N	\N	\N	\N	\N	0	\N
14412	Produto Teste Bateria	TEST-PROD-999	\N	TESTE	UN	\N	\N	\N	0	0	0	t	2026-07-14 11:22:43.772872+00	2026-07-14 12:39:16.500978+00	COMPRADO	0	\N	0	0	0	Pacote / Caixa	0	0	0	t	f	0	\N	\N	0	1	1	t	\N	\N	\N	\N	\N	\N	0	\N
\.


--
-- Data for Name: proposta_comercial_itens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proposta_comercial_itens (id, proposta_id, produto_id, quantidade, preco_unitario, desconto_percentual, preco_total) FROM stdin;
\.


--
-- Data for Name: propostas_comerciais; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.propostas_comerciais (id, numero, cliente_id, representante_id, vendedor_interno_id, natureza_operacao, lista_preco, data_proposta, prox_contato, validade_dias, status, valor_frete, desconto_valor, valor_total, peso_bruto, peso_liquido, volumes, tags_csv, observacoes) FROM stdin;
\.


--
-- Data for Name: reservas_estoque; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservas_estoque (id, produto_id, pedido_ref, quantidade, status, usuario, created_at) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, nome, permissoes) FROM stdin;
1	ADMIN	dashboard,vendas,clientes,produtos,reservas,inventario,relatorios,gestao_fabrica,pcp,produtividade,manutencao,auditoria,usuarios,configuracoes
2	GERENTE	dashboard,vendas,clientes,produtos,reservas,inventario,relatorios,gestao_fabrica,pcp,produtividade,manutencao
3	OPERADOR	dashboard,produtos,reservas,inventario,gestao_fabrica,pcp
4	COMERCIAL	vendas,clientes,relatorios
\.


--
-- Data for Name: sefaz_alertas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sefaz_alertas (id, tipo, mensagem, data_leitura, fonte, lido) FROM stdin;
1	CRITICAL	Atenção: Nova Nota Técnica 2026.001 publicada. Alteração nos campos de IBS/CBS obrigatória a partir de 01/10.	2026-07-14 18:49:02.991372	Portal Nacional NF-e	f
2	WARNING	Aviso: Ambiente de homologação da SEFAZ/SP passará por manutenção programada neste fim de semana.	2026-07-14 18:49:02.991473	SEFAZ SP	f
3	WARNING	Tabela IBPT atualizada. A tabela vigente vence em 15 dias. Por favor, atualize os NCMs.	2026-07-14 18:49:02.991517	IBPT API	f
\.


--
-- Data for Name: setores_produtividade; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.setores_produtividade (id, nome, nome_chave, meta_diaria, ativo, created_at, updated_at, meta_colaborador_diaria) FROM stdin;
1	Montagem	MONTAGEM	4000	t	2026-05-04 19:09:12.427148+00	2026-05-04 19:09:12.427148+00	500
\.


--
-- Data for Name: tags_financeiras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tags_financeiras (id, descricao, cor) FROM stdin;
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, username, email, hashed_password, nome_completo, role_id, ativo, created_at, permissoes, comissao_percentual) FROM stdin;
9	vendedor	vendedor@venner.com	$pbkdf2-sha256$29000$IkSIca51DqG0NmYsxViLkQ$Y6.RUBnYLf.KoJGLMRNaWXFVqmFDbpCDgiHyLBi4Wzs	Vendedor Teste	4	t	2026-05-11 14:30:09.822434+00	\N	0
2	Bruno Andres	brunoandres@vennerindustria.com.br	$pbkdf2-sha256$29000$FuI8J6S0lhKCUIoxRogxBg$Vi08xAE7syKjqGCjRdICXRUMf87ba6cyo89XufH8Hgo	Bruno Andres	2	t	2026-04-27 11:48:18.439227+00	dashboard,produtos,reservas,inventario,relatorios,gestao_fabrica,pcp,produtividade,manutencao	0
10	CRISTIANE	cristianeleite@vennerindustria.com.br	$pbkdf2-sha256$29000$hvB.7927N4bQujfm3BuDEA$aWv9slSDai3AILoEFbtGtVjNDEH7StWLJojSBtZ9Vyw	CRISTIANE LIMA LEITE	4	t	2026-06-30 18:56:21.978851+00	vendas,produtos	0
1	admin	admin@venner.com.br	$pbkdf2-sha256$29000$ztnb.18rBcC4915rrbXW.g$gzT/u.yTUa3RjAyUQxnS0yI4ZzQng00p7BZPdj7OaQc	Administrador Sistema	1	t	2026-04-27 11:07:00.399081+00	\N	0
\.


--
-- Name: apontamentos_produtividade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.apontamentos_produtividade_id_seq', 1, true);


--
-- Name: auditoria_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auditoria_logs_id_seq', 16, true);


--
-- Name: categorias_financeiras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categorias_financeiras_id_seq', 8, true);


--
-- Name: colaboradores_produtividade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.colaboradores_produtividade_id_seq', 1, false);


--
-- Name: comercial_clientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comercial_clientes_id_seq', 7, true);


--
-- Name: comercial_condicoes_pagamento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comercial_condicoes_pagamento_id_seq', 1, true);


--
-- Name: comercial_formas_pagamento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comercial_formas_pagamento_id_seq', 1, true);


--
-- Name: comercial_representantes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comercial_representantes_id_seq', 2, true);


--
-- Name: configuracoes_expedicao_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.configuracoes_expedicao_id_seq', 1, true);


--
-- Name: configuracoes_produtos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.configuracoes_produtos_id_seq', 1, true);


--
-- Name: configuracoes_vendas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.configuracoes_vendas_id_seq', 1, true);


--
-- Name: contas_bancarias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contas_bancarias_id_seq', 1, false);


--
-- Name: contas_financeiras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contas_financeiras_id_seq', 1, true);


--
-- Name: estoque_lotes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estoque_lotes_id_seq', 1, false);


--
-- Name: etiqueta_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.etiqueta_templates_id_seq', 8, true);


--
-- Name: fechamentos_financeiros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fechamentos_financeiros_id_seq', 1, false);


--
-- Name: ficha_tecnica_itens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ficha_tecnica_itens_id_seq', 4, true);


--
-- Name: inventario_itens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventario_itens_id_seq', 33, true);


--
-- Name: inventario_sessoes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventario_sessoes_id_seq', 15, true);


--
-- Name: maquina_componentes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maquina_componentes_id_seq', 1, false);


--
-- Name: maquinas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maquinas_id_seq', 11, true);


--
-- Name: marcadores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.marcadores_id_seq', 3, true);


--
-- Name: modulos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.modulos_id_seq', 4, true);


--
-- Name: movimentacoes_estoque_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.movimentacoes_estoque_id_seq', 2287, true);


--
-- Name: notas_fiscais_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notas_fiscais_id_seq', 1, false);


--
-- Name: notas_fiscais_itens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notas_fiscais_itens_id_seq', 1, false);


--
-- Name: notas_fiscais_parcelas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notas_fiscais_parcelas_id_seq', 1, false);


--
-- Name: ordem_producao_itens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ordem_producao_itens_id_seq', 4, true);


--
-- Name: ordens_compra_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ordens_compra_id_seq', 1, false);


--
-- Name: ordens_compra_itens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ordens_compra_itens_id_seq', 1, false);


--
-- Name: ordens_producao_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ordens_producao_id_seq', 4, true);


--
-- Name: ordens_servico_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ordens_servico_id_seq', 11, true);


--
-- Name: os_itens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.os_itens_id_seq', 3, true);


--
-- Name: pedido_venda_itens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedido_venda_itens_id_seq', 7, true);


--
-- Name: pedidos_venda_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedidos_venda_id_seq', 5, true);


--
-- Name: produtos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.produtos_id_seq', 14412, true);


--
-- Name: proposta_comercial_itens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.proposta_comercial_itens_id_seq', 1, false);


--
-- Name: propostas_comerciais_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.propostas_comerciais_id_seq', 1, false);


--
-- Name: reservas_estoque_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reservas_estoque_id_seq', 10, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 4, true);


--
-- Name: sefaz_alertas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sefaz_alertas_id_seq', 3, true);


--
-- Name: setores_produtividade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.setores_produtividade_id_seq', 1, true);


--
-- Name: tags_financeiras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tags_financeiras_id_seq', 1, false);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 10, true);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: apontamentos_produtividade apontamentos_produtividade_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.apontamentos_produtividade
    ADD CONSTRAINT apontamentos_produtividade_pkey PRIMARY KEY (id);


--
-- Name: auditoria_logs auditoria_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria_logs
    ADD CONSTRAINT auditoria_logs_pkey PRIMARY KEY (id);


--
-- Name: categorias_financeiras categorias_financeiras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias_financeiras
    ADD CONSTRAINT categorias_financeiras_pkey PRIMARY KEY (id);


--
-- Name: colaboradores_produtividade colaboradores_produtividade_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colaboradores_produtividade
    ADD CONSTRAINT colaboradores_produtividade_pkey PRIMARY KEY (id);


--
-- Name: comercial_clientes comercial_clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comercial_clientes
    ADD CONSTRAINT comercial_clientes_pkey PRIMARY KEY (id);


--
-- Name: comercial_condicoes_pagamento comercial_condicoes_pagamento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comercial_condicoes_pagamento
    ADD CONSTRAINT comercial_condicoes_pagamento_pkey PRIMARY KEY (id);


--
-- Name: comercial_formas_pagamento comercial_formas_pagamento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comercial_formas_pagamento
    ADD CONSTRAINT comercial_formas_pagamento_pkey PRIMARY KEY (id);


--
-- Name: comercial_representantes comercial_representantes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comercial_representantes
    ADD CONSTRAINT comercial_representantes_pkey PRIMARY KEY (id);


--
-- Name: configuracoes_expedicao configuracoes_expedicao_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracoes_expedicao
    ADD CONSTRAINT configuracoes_expedicao_pkey PRIMARY KEY (id);


--
-- Name: configuracoes_produtos configuracoes_produtos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracoes_produtos
    ADD CONSTRAINT configuracoes_produtos_pkey PRIMARY KEY (id);


--
-- Name: configuracoes_vendas configuracoes_vendas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracoes_vendas
    ADD CONSTRAINT configuracoes_vendas_pkey PRIMARY KEY (id);


--
-- Name: contas_bancarias contas_bancarias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contas_bancarias
    ADD CONSTRAINT contas_bancarias_pkey PRIMARY KEY (id);


--
-- Name: contas_financeiras contas_financeiras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contas_financeiras
    ADD CONSTRAINT contas_financeiras_pkey PRIMARY KEY (id);


--
-- Name: estoque_lotes estoque_lotes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estoque_lotes
    ADD CONSTRAINT estoque_lotes_pkey PRIMARY KEY (id);


--
-- Name: etiqueta_templates etiqueta_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etiqueta_templates
    ADD CONSTRAINT etiqueta_templates_pkey PRIMARY KEY (id);


--
-- Name: fechamentos_financeiros fechamentos_financeiros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fechamentos_financeiros
    ADD CONSTRAINT fechamentos_financeiros_pkey PRIMARY KEY (id);


--
-- Name: ficha_tecnica_itens ficha_tecnica_itens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ficha_tecnica_itens
    ADD CONSTRAINT ficha_tecnica_itens_pkey PRIMARY KEY (id);


--
-- Name: inventario_itens inventario_itens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario_itens
    ADD CONSTRAINT inventario_itens_pkey PRIMARY KEY (id);


--
-- Name: inventario_sessoes inventario_sessoes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario_sessoes
    ADD CONSTRAINT inventario_sessoes_pkey PRIMARY KEY (id);


--
-- Name: maquina_componentes maquina_componentes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maquina_componentes
    ADD CONSTRAINT maquina_componentes_pkey PRIMARY KEY (id);


--
-- Name: maquinas maquinas_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maquinas
    ADD CONSTRAINT maquinas_codigo_key UNIQUE (codigo);


--
-- Name: maquinas maquinas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maquinas
    ADD CONSTRAINT maquinas_pkey PRIMARY KEY (id);


--
-- Name: marcadores marcadores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marcadores
    ADD CONSTRAINT marcadores_pkey PRIMARY KEY (id);


--
-- Name: modulos modulos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modulos
    ADD CONSTRAINT modulos_pkey PRIMARY KEY (id);


--
-- Name: movimentacoes_estoque movimentacoes_estoque_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimentacoes_estoque
    ADD CONSTRAINT movimentacoes_estoque_pkey PRIMARY KEY (id);


--
-- Name: notas_fiscais_itens notas_fiscais_itens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_fiscais_itens
    ADD CONSTRAINT notas_fiscais_itens_pkey PRIMARY KEY (id);


--
-- Name: notas_fiscais_parcelas notas_fiscais_parcelas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_fiscais_parcelas
    ADD CONSTRAINT notas_fiscais_parcelas_pkey PRIMARY KEY (id);


--
-- Name: notas_fiscais notas_fiscais_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_fiscais
    ADD CONSTRAINT notas_fiscais_pkey PRIMARY KEY (id);


--
-- Name: ordem_producao_itens ordem_producao_itens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordem_producao_itens
    ADD CONSTRAINT ordem_producao_itens_pkey PRIMARY KEY (id);


--
-- Name: ordens_compra_itens ordens_compra_itens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordens_compra_itens
    ADD CONSTRAINT ordens_compra_itens_pkey PRIMARY KEY (id);


--
-- Name: ordens_compra ordens_compra_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordens_compra
    ADD CONSTRAINT ordens_compra_pkey PRIMARY KEY (id);


--
-- Name: ordens_producao ordens_producao_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordens_producao
    ADD CONSTRAINT ordens_producao_pkey PRIMARY KEY (id);


--
-- Name: ordens_servico ordens_servico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordens_servico
    ADD CONSTRAINT ordens_servico_pkey PRIMARY KEY (id);


--
-- Name: os_itens os_itens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.os_itens
    ADD CONSTRAINT os_itens_pkey PRIMARY KEY (id);


--
-- Name: pedido_venda_itens pedido_venda_itens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_venda_itens
    ADD CONSTRAINT pedido_venda_itens_pkey PRIMARY KEY (id);


--
-- Name: pedidos_venda pedidos_venda_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos_venda
    ADD CONSTRAINT pedidos_venda_pkey PRIMARY KEY (id);


--
-- Name: produtos produtos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produtos
    ADD CONSTRAINT produtos_pkey PRIMARY KEY (id);


--
-- Name: proposta_comercial_itens proposta_comercial_itens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposta_comercial_itens
    ADD CONSTRAINT proposta_comercial_itens_pkey PRIMARY KEY (id);


--
-- Name: propostas_comerciais propostas_comerciais_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.propostas_comerciais
    ADD CONSTRAINT propostas_comerciais_pkey PRIMARY KEY (id);


--
-- Name: reservas_estoque reservas_estoque_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas_estoque
    ADD CONSTRAINT reservas_estoque_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sefaz_alertas sefaz_alertas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sefaz_alertas
    ADD CONSTRAINT sefaz_alertas_pkey PRIMARY KEY (id);


--
-- Name: setores_produtividade setores_produtividade_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.setores_produtividade
    ADD CONSTRAINT setores_produtividade_pkey PRIMARY KEY (id);


--
-- Name: tags_financeiras tags_financeiras_descricao_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags_financeiras
    ADD CONSTRAINT tags_financeiras_descricao_key UNIQUE (descricao);


--
-- Name: tags_financeiras tags_financeiras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags_financeiras
    ADD CONSTRAINT tags_financeiras_pkey PRIMARY KEY (id);


--
-- Name: apontamentos_produtividade uq_apontamento_produtividade_dia_setor_colaborador; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.apontamentos_produtividade
    ADD CONSTRAINT uq_apontamento_produtividade_dia_setor_colaborador UNIQUE (data_referencia, setor_id, colaborador_chave);


--
-- Name: colaboradores_produtividade uq_colaborador_produtividade_setor_nome; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colaboradores_produtividade
    ADD CONSTRAINT uq_colaborador_produtividade_setor_nome UNIQUE (setor_id, nome_chave);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: ix_apontamentos_produtividade_colaborador_chave; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_apontamentos_produtividade_colaborador_chave ON public.apontamentos_produtividade USING btree (colaborador_chave);


--
-- Name: ix_apontamentos_produtividade_colaborador_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_apontamentos_produtividade_colaborador_id ON public.apontamentos_produtividade USING btree (colaborador_id);


--
-- Name: ix_apontamentos_produtividade_data_referencia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_apontamentos_produtividade_data_referencia ON public.apontamentos_produtividade USING btree (data_referencia);


--
-- Name: ix_apontamentos_produtividade_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_apontamentos_produtividade_id ON public.apontamentos_produtividade USING btree (id);


--
-- Name: ix_apontamentos_produtividade_setor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_apontamentos_produtividade_setor_id ON public.apontamentos_produtividade USING btree (setor_id);


--
-- Name: ix_auditoria_logs_acao; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_auditoria_logs_acao ON public.auditoria_logs USING btree (acao);


--
-- Name: ix_auditoria_logs_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_auditoria_logs_id ON public.auditoria_logs USING btree (id);


--
-- Name: ix_auditoria_logs_modulo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_auditoria_logs_modulo ON public.auditoria_logs USING btree (modulo);


--
-- Name: ix_auditoria_logs_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_auditoria_logs_usuario ON public.auditoria_logs USING btree (usuario);


--
-- Name: ix_categorias_financeiras_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_categorias_financeiras_id ON public.categorias_financeiras USING btree (id);


--
-- Name: ix_colaboradores_produtividade_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_colaboradores_produtividade_id ON public.colaboradores_produtividade USING btree (id);


--
-- Name: ix_colaboradores_produtividade_nome_chave; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_colaboradores_produtividade_nome_chave ON public.colaboradores_produtividade USING btree (nome_chave);


--
-- Name: ix_colaboradores_produtividade_setor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_colaboradores_produtividade_setor_id ON public.colaboradores_produtividade USING btree (setor_id);


--
-- Name: ix_comercial_clientes_cidade; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_clientes_cidade ON public.comercial_clientes USING btree (cidade);


--
-- Name: ix_comercial_clientes_cidade_entrega; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_clientes_cidade_entrega ON public.comercial_clientes USING btree (cidade_entrega);


--
-- Name: ix_comercial_clientes_condicao_pagamento_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_clientes_condicao_pagamento_id ON public.comercial_clientes USING btree (condicao_pagamento_id);


--
-- Name: ix_comercial_clientes_cpf_cnpj; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_comercial_clientes_cpf_cnpj ON public.comercial_clientes USING btree (cpf_cnpj);


--
-- Name: ix_comercial_clientes_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_clientes_email ON public.comercial_clientes USING btree (email);


--
-- Name: ix_comercial_clientes_email_cobranca; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_clientes_email_cobranca ON public.comercial_clientes USING btree (email_cobranca);


--
-- Name: ix_comercial_clientes_forma_pagamento_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_clientes_forma_pagamento_id ON public.comercial_clientes USING btree (forma_pagamento_id);


--
-- Name: ix_comercial_clientes_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_clientes_id ON public.comercial_clientes USING btree (id);


--
-- Name: ix_comercial_clientes_municipio_cobranca; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_clientes_municipio_cobranca ON public.comercial_clientes USING btree (municipio_cobranca);


--
-- Name: ix_comercial_clientes_nome_fantasia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_clientes_nome_fantasia ON public.comercial_clientes USING btree (nome_fantasia);


--
-- Name: ix_comercial_clientes_nome_razao_social; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_clientes_nome_razao_social ON public.comercial_clientes USING btree (nome_razao_social);


--
-- Name: ix_comercial_clientes_nome_vendedor_interno; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_clientes_nome_vendedor_interno ON public.comercial_clientes USING btree (nome_vendedor_interno);


--
-- Name: ix_comercial_clientes_representante_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_clientes_representante_id ON public.comercial_clientes USING btree (representante_id);


--
-- Name: ix_comercial_clientes_uf; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_clientes_uf ON public.comercial_clientes USING btree (uf);


--
-- Name: ix_comercial_clientes_uf_cobranca; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_clientes_uf_cobranca ON public.comercial_clientes USING btree (uf_cobranca);


--
-- Name: ix_comercial_clientes_uf_entrega; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_clientes_uf_entrega ON public.comercial_clientes USING btree (uf_entrega);


--
-- Name: ix_comercial_condicoes_pagamento_codigo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_comercial_condicoes_pagamento_codigo ON public.comercial_condicoes_pagamento USING btree (codigo);


--
-- Name: ix_comercial_condicoes_pagamento_descricao; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_condicoes_pagamento_descricao ON public.comercial_condicoes_pagamento USING btree (descricao);


--
-- Name: ix_comercial_condicoes_pagamento_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_condicoes_pagamento_id ON public.comercial_condicoes_pagamento USING btree (id);


--
-- Name: ix_comercial_formas_pagamento_codigo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_comercial_formas_pagamento_codigo ON public.comercial_formas_pagamento USING btree (codigo);


--
-- Name: ix_comercial_formas_pagamento_descricao; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_formas_pagamento_descricao ON public.comercial_formas_pagamento USING btree (descricao);


--
-- Name: ix_comercial_formas_pagamento_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_formas_pagamento_id ON public.comercial_formas_pagamento USING btree (id);


--
-- Name: ix_comercial_representantes_codigo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_representantes_codigo ON public.comercial_representantes USING btree (codigo);


--
-- Name: ix_comercial_representantes_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_representantes_id ON public.comercial_representantes USING btree (id);


--
-- Name: ix_comercial_representantes_nome; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_representantes_nome ON public.comercial_representantes USING btree (nome);


--
-- Name: ix_configuracoes_expedicao_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_configuracoes_expedicao_id ON public.configuracoes_expedicao USING btree (id);


--
-- Name: ix_configuracoes_produtos_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_configuracoes_produtos_id ON public.configuracoes_produtos USING btree (id);


--
-- Name: ix_configuracoes_vendas_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_configuracoes_vendas_id ON public.configuracoes_vendas USING btree (id);


--
-- Name: ix_contas_bancarias_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_contas_bancarias_id ON public.contas_bancarias USING btree (id);


--
-- Name: ix_contas_financeiras_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_contas_financeiras_id ON public.contas_financeiras USING btree (id);


--
-- Name: ix_contas_financeiras_recorrencia_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_contas_financeiras_recorrencia_id ON public.contas_financeiras USING btree (recorrencia_id);


--
-- Name: ix_contas_financeiras_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_contas_financeiras_status ON public.contas_financeiras USING btree (status);


--
-- Name: ix_contas_financeiras_tipo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_contas_financeiras_tipo ON public.contas_financeiras USING btree (tipo);


--
-- Name: ix_estoque_lotes_codigo_lote; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_estoque_lotes_codigo_lote ON public.estoque_lotes USING btree (codigo_lote);


--
-- Name: ix_estoque_lotes_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_estoque_lotes_id ON public.estoque_lotes USING btree (id);


--
-- Name: ix_estoque_lotes_produto_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_estoque_lotes_produto_id ON public.estoque_lotes USING btree (produto_id);


--
-- Name: ix_etiqueta_templates_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_etiqueta_templates_id ON public.etiqueta_templates USING btree (id);


--
-- Name: ix_etiqueta_templates_nome; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_etiqueta_templates_nome ON public.etiqueta_templates USING btree (nome);


--
-- Name: ix_fechamentos_financeiros_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_fechamentos_financeiros_id ON public.fechamentos_financeiros USING btree (id);


--
-- Name: ix_ficha_tecnica_itens_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ficha_tecnica_itens_id ON public.ficha_tecnica_itens USING btree (id);


--
-- Name: ix_inventario_itens_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_inventario_itens_id ON public.inventario_itens USING btree (id);


--
-- Name: ix_inventario_itens_produto_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_inventario_itens_produto_id ON public.inventario_itens USING btree (produto_id);


--
-- Name: ix_inventario_sessoes_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_inventario_sessoes_id ON public.inventario_sessoes USING btree (id);


--
-- Name: ix_maquina_componentes_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_maquina_componentes_id ON public.maquina_componentes USING btree (id);


--
-- Name: ix_maquinas_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_maquinas_id ON public.maquinas USING btree (id);


--
-- Name: ix_maquinas_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_maquinas_status ON public.maquinas USING btree (status);


--
-- Name: ix_marcadores_descricao; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_marcadores_descricao ON public.marcadores USING btree (descricao);


--
-- Name: ix_marcadores_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_marcadores_id ON public.marcadores USING btree (id);


--
-- Name: ix_modulos_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_modulos_id ON public.modulos USING btree (id);


--
-- Name: ix_modulos_nome; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_modulos_nome ON public.modulos USING btree (nome);


--
-- Name: ix_movimentacoes_estoque_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_movimentacoes_estoque_created_at ON public.movimentacoes_estoque USING btree (created_at);


--
-- Name: ix_movimentacoes_estoque_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_movimentacoes_estoque_id ON public.movimentacoes_estoque USING btree (id);


--
-- Name: ix_movimentacoes_estoque_produto_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_movimentacoes_estoque_produto_id ON public.movimentacoes_estoque USING btree (produto_id);


--
-- Name: ix_movimentacoes_estoque_tipo_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_movimentacoes_estoque_tipo_created_at ON public.movimentacoes_estoque USING btree (tipo, created_at);


--
-- Name: ix_notas_fiscais_chave_acesso; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_notas_fiscais_chave_acesso ON public.notas_fiscais USING btree (chave_acesso);


--
-- Name: ix_notas_fiscais_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_notas_fiscais_id ON public.notas_fiscais USING btree (id);


--
-- Name: ix_notas_fiscais_itens_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_notas_fiscais_itens_id ON public.notas_fiscais_itens USING btree (id);


--
-- Name: ix_notas_fiscais_numero; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_notas_fiscais_numero ON public.notas_fiscais USING btree (numero);


--
-- Name: ix_notas_fiscais_parcelas_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_notas_fiscais_parcelas_id ON public.notas_fiscais_parcelas USING btree (id);


--
-- Name: ix_ordem_producao_itens_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ordem_producao_itens_id ON public.ordem_producao_itens USING btree (id);


--
-- Name: ix_ordens_compra_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ordens_compra_id ON public.ordens_compra USING btree (id);


--
-- Name: ix_ordens_compra_itens_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ordens_compra_itens_id ON public.ordens_compra_itens USING btree (id);


--
-- Name: ix_ordens_producao_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ordens_producao_id ON public.ordens_producao USING btree (id);


--
-- Name: ix_ordens_servico_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ordens_servico_id ON public.ordens_servico USING btree (id);


--
-- Name: ix_ordens_servico_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ordens_servico_status ON public.ordens_servico USING btree (status);


--
-- Name: ix_os_itens_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_os_itens_id ON public.os_itens USING btree (id);


--
-- Name: ix_pedido_venda_itens_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_pedido_venda_itens_id ON public.pedido_venda_itens USING btree (id);


--
-- Name: ix_pedidos_venda_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_pedidos_venda_id ON public.pedidos_venda USING btree (id);


--
-- Name: ix_produtos_ativo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_produtos_ativo ON public.produtos USING btree (ativo);


--
-- Name: ix_produtos_categoria; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_produtos_categoria ON public.produtos USING btree (categoria);


--
-- Name: ix_produtos_gtin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_produtos_gtin ON public.produtos USING btree (gtin);


--
-- Name: ix_produtos_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_produtos_id ON public.produtos USING btree (id);


--
-- Name: ix_produtos_marca; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_produtos_marca ON public.produtos USING btree (marca);


--
-- Name: ix_produtos_nome; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_produtos_nome ON public.produtos USING btree (nome);


--
-- Name: ix_produtos_posicao; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_produtos_posicao ON public.produtos USING btree (posicao);


--
-- Name: ix_produtos_sku; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_produtos_sku ON public.produtos USING btree (sku);


--
-- Name: ix_proposta_comercial_itens_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_proposta_comercial_itens_id ON public.proposta_comercial_itens USING btree (id);


--
-- Name: ix_propostas_comerciais_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_propostas_comerciais_id ON public.propostas_comerciais USING btree (id);


--
-- Name: ix_propostas_comerciais_numero; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_propostas_comerciais_numero ON public.propostas_comerciais USING btree (numero);


--
-- Name: ix_reservas_estoque_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_reservas_estoque_id ON public.reservas_estoque USING btree (id);


--
-- Name: ix_reservas_estoque_pedido_ref; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_reservas_estoque_pedido_ref ON public.reservas_estoque USING btree (pedido_ref);


--
-- Name: ix_reservas_estoque_produto_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_reservas_estoque_produto_id ON public.reservas_estoque USING btree (produto_id);


--
-- Name: ix_reservas_estoque_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_reservas_estoque_status ON public.reservas_estoque USING btree (status);


--
-- Name: ix_roles_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_roles_id ON public.roles USING btree (id);


--
-- Name: ix_roles_nome; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_roles_nome ON public.roles USING btree (nome);


--
-- Name: ix_sefaz_alertas_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sefaz_alertas_id ON public.sefaz_alertas USING btree (id);


--
-- Name: ix_setores_produtividade_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_setores_produtividade_id ON public.setores_produtividade USING btree (id);


--
-- Name: ix_setores_produtividade_nome_chave; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_setores_produtividade_nome_chave ON public.setores_produtividade USING btree (nome_chave);


--
-- Name: ix_tags_financeiras_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_tags_financeiras_id ON public.tags_financeiras USING btree (id);


--
-- Name: ix_usuarios_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_usuarios_email ON public.usuarios USING btree (email);


--
-- Name: ix_usuarios_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_usuarios_id ON public.usuarios USING btree (id);


--
-- Name: ix_usuarios_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_usuarios_username ON public.usuarios USING btree (username);


--
-- Name: apontamentos_produtividade apontamentos_produtividade_colaborador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.apontamentos_produtividade
    ADD CONSTRAINT apontamentos_produtividade_colaborador_id_fkey FOREIGN KEY (colaborador_id) REFERENCES public.colaboradores_produtividade(id);


--
-- Name: apontamentos_produtividade apontamentos_produtividade_setor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.apontamentos_produtividade
    ADD CONSTRAINT apontamentos_produtividade_setor_id_fkey FOREIGN KEY (setor_id) REFERENCES public.setores_produtividade(id);


--
-- Name: colaboradores_produtividade colaboradores_produtividade_setor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colaboradores_produtividade
    ADD CONSTRAINT colaboradores_produtividade_setor_id_fkey FOREIGN KEY (setor_id) REFERENCES public.setores_produtividade(id);


--
-- Name: contas_financeiras contas_financeiras_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contas_financeiras
    ADD CONSTRAINT contas_financeiras_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias_financeiras(id);


--
-- Name: contas_financeiras contas_financeiras_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contas_financeiras
    ADD CONSTRAINT contas_financeiras_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.comercial_clientes(id);


--
-- Name: contas_financeiras contas_financeiras_conta_bancaria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contas_financeiras
    ADD CONSTRAINT contas_financeiras_conta_bancaria_id_fkey FOREIGN KEY (conta_bancaria_id) REFERENCES public.contas_bancarias(id);


--
-- Name: contas_financeiras contas_financeiras_pedido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contas_financeiras
    ADD CONSTRAINT contas_financeiras_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos_venda(id);


--
-- Name: estoque_lotes estoque_lotes_produto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estoque_lotes
    ADD CONSTRAINT estoque_lotes_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id);


--
-- Name: fechamentos_financeiros fechamentos_financeiros_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fechamentos_financeiros
    ADD CONSTRAINT fechamentos_financeiros_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: ficha_tecnica_itens ficha_tecnica_itens_produto_componente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ficha_tecnica_itens
    ADD CONSTRAINT ficha_tecnica_itens_produto_componente_id_fkey FOREIGN KEY (produto_componente_id) REFERENCES public.produtos(id);


--
-- Name: ficha_tecnica_itens ficha_tecnica_itens_produto_composto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ficha_tecnica_itens
    ADD CONSTRAINT ficha_tecnica_itens_produto_composto_id_fkey FOREIGN KEY (produto_composto_id) REFERENCES public.produtos(id);


--
-- Name: inventario_itens inventario_itens_produto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario_itens
    ADD CONSTRAINT inventario_itens_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id);


--
-- Name: inventario_itens inventario_itens_sessao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario_itens
    ADD CONSTRAINT inventario_itens_sessao_id_fkey FOREIGN KEY (sessao_id) REFERENCES public.inventario_sessoes(id);


--
-- Name: maquina_componentes maquina_componentes_maquina_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maquina_componentes
    ADD CONSTRAINT maquina_componentes_maquina_id_fkey FOREIGN KEY (maquina_id) REFERENCES public.maquinas(id);


--
-- Name: maquina_componentes maquina_componentes_produto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maquina_componentes
    ADD CONSTRAINT maquina_componentes_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id);


--
-- Name: movimentacoes_estoque movimentacoes_estoque_lote_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimentacoes_estoque
    ADD CONSTRAINT movimentacoes_estoque_lote_id_fkey FOREIGN KEY (lote_id) REFERENCES public.estoque_lotes(id);


--
-- Name: movimentacoes_estoque movimentacoes_estoque_produto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimentacoes_estoque
    ADD CONSTRAINT movimentacoes_estoque_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id);


--
-- Name: nota_fiscal_marcador nota_fiscal_marcador_marcador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_fiscal_marcador
    ADD CONSTRAINT nota_fiscal_marcador_marcador_id_fkey FOREIGN KEY (marcador_id) REFERENCES public.marcadores(id);


--
-- Name: nota_fiscal_marcador nota_fiscal_marcador_nota_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_fiscal_marcador
    ADD CONSTRAINT nota_fiscal_marcador_nota_id_fkey FOREIGN KEY (nota_id) REFERENCES public.notas_fiscais(id);


--
-- Name: notas_fiscais notas_fiscais_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_fiscais
    ADD CONSTRAINT notas_fiscais_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.comercial_clientes(id);


--
-- Name: notas_fiscais_itens notas_fiscais_itens_nota_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_fiscais_itens
    ADD CONSTRAINT notas_fiscais_itens_nota_id_fkey FOREIGN KEY (nota_id) REFERENCES public.notas_fiscais(id);


--
-- Name: notas_fiscais_itens notas_fiscais_itens_produto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_fiscais_itens
    ADD CONSTRAINT notas_fiscais_itens_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id);


--
-- Name: notas_fiscais_parcelas notas_fiscais_parcelas_nota_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_fiscais_parcelas
    ADD CONSTRAINT notas_fiscais_parcelas_nota_id_fkey FOREIGN KEY (nota_id) REFERENCES public.notas_fiscais(id);


--
-- Name: notas_fiscais notas_fiscais_pedido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_fiscais
    ADD CONSTRAINT notas_fiscais_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos_venda(id);


--
-- Name: notas_fiscais notas_fiscais_vendedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_fiscais
    ADD CONSTRAINT notas_fiscais_vendedor_id_fkey FOREIGN KEY (vendedor_id) REFERENCES public.comercial_representantes(id);


--
-- Name: ordem_producao_itens ordem_producao_itens_ordem_producao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordem_producao_itens
    ADD CONSTRAINT ordem_producao_itens_ordem_producao_id_fkey FOREIGN KEY (ordem_producao_id) REFERENCES public.ordens_producao(id);


--
-- Name: ordem_producao_itens ordem_producao_itens_produto_componente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordem_producao_itens
    ADD CONSTRAINT ordem_producao_itens_produto_componente_id_fkey FOREIGN KEY (produto_componente_id) REFERENCES public.produtos(id);


--
-- Name: ordens_compra ordens_compra_fornecedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordens_compra
    ADD CONSTRAINT ordens_compra_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.comercial_clientes(id);


--
-- Name: ordens_compra_itens ordens_compra_itens_ordem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordens_compra_itens
    ADD CONSTRAINT ordens_compra_itens_ordem_id_fkey FOREIGN KEY (ordem_id) REFERENCES public.ordens_compra(id);


--
-- Name: ordens_compra_itens ordens_compra_itens_produto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordens_compra_itens
    ADD CONSTRAINT ordens_compra_itens_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id);


--
-- Name: ordens_producao ordens_producao_produto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordens_producao
    ADD CONSTRAINT ordens_producao_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id);


--
-- Name: ordens_servico ordens_servico_maquina_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordens_servico
    ADD CONSTRAINT ordens_servico_maquina_id_fkey FOREIGN KEY (maquina_id) REFERENCES public.maquinas(id);


--
-- Name: os_itens os_itens_os_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.os_itens
    ADD CONSTRAINT os_itens_os_id_fkey FOREIGN KEY (os_id) REFERENCES public.ordens_servico(id);


--
-- Name: os_itens os_itens_produto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.os_itens
    ADD CONSTRAINT os_itens_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id);


--
-- Name: pedido_venda_itens pedido_venda_itens_pedido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_venda_itens
    ADD CONSTRAINT pedido_venda_itens_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos_venda(id);


--
-- Name: pedido_venda_itens pedido_venda_itens_produto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_venda_itens
    ADD CONSTRAINT pedido_venda_itens_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id);


--
-- Name: pedidos_venda pedidos_venda_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos_venda
    ADD CONSTRAINT pedidos_venda_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.comercial_clientes(id);


--
-- Name: pedidos_venda pedidos_venda_condicao_pagamento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos_venda
    ADD CONSTRAINT pedidos_venda_condicao_pagamento_id_fkey FOREIGN KEY (condicao_pagamento_id) REFERENCES public.comercial_condicoes_pagamento(id);


--
-- Name: pedidos_venda pedidos_venda_proposta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos_venda
    ADD CONSTRAINT pedidos_venda_proposta_id_fkey FOREIGN KEY (proposta_id) REFERENCES public.propostas_comerciais(id);


--
-- Name: pedidos_venda pedidos_venda_representante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos_venda
    ADD CONSTRAINT pedidos_venda_representante_id_fkey FOREIGN KEY (representante_id) REFERENCES public.comercial_representantes(id);


--
-- Name: pedidos_venda pedidos_venda_vendedor_interno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos_venda
    ADD CONSTRAINT pedidos_venda_vendedor_interno_id_fkey FOREIGN KEY (vendedor_interno_id) REFERENCES public.usuarios(id);


--
-- Name: proposta_comercial_itens proposta_comercial_itens_produto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposta_comercial_itens
    ADD CONSTRAINT proposta_comercial_itens_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id);


--
-- Name: proposta_comercial_itens proposta_comercial_itens_proposta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposta_comercial_itens
    ADD CONSTRAINT proposta_comercial_itens_proposta_id_fkey FOREIGN KEY (proposta_id) REFERENCES public.propostas_comerciais(id);


--
-- Name: propostas_comerciais propostas_comerciais_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.propostas_comerciais
    ADD CONSTRAINT propostas_comerciais_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.comercial_clientes(id);


--
-- Name: propostas_comerciais propostas_comerciais_representante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.propostas_comerciais
    ADD CONSTRAINT propostas_comerciais_representante_id_fkey FOREIGN KEY (representante_id) REFERENCES public.comercial_representantes(id);


--
-- Name: propostas_comerciais propostas_comerciais_vendedor_interno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.propostas_comerciais
    ADD CONSTRAINT propostas_comerciais_vendedor_interno_id_fkey FOREIGN KEY (vendedor_interno_id) REFERENCES public.usuarios(id);


--
-- Name: reservas_estoque reservas_estoque_produto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas_estoque
    ADD CONSTRAINT reservas_estoque_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id);


--
-- Name: usuarios usuarios_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- PostgreSQL database dump complete
--

\unrestrict DBgfareXSpFgZ9JlgDfd51UizCJAOUcuEmZ1r0YWBirGmEJHYq69jv1DXN73qXP

