--
-- PostgreSQL database dump
--

\restrict SqSW2tsAuh8Djb35UPV53onUx9my34grdILGKU4CKpmEb1diXYd4h1zkpguylfO

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
-- Name: clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes (
    id integer NOT NULL,
    nome character varying,
    cpf_cnpj character varying,
    email character varying,
    telefone character varying,
    endereco character varying,
    cidade character varying,
    estado character varying,
    ativo boolean,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.clientes OWNER TO postgres;

--
-- Name: clientes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clientes_id_seq OWNER TO postgres;

--
-- Name: clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clientes_id_seq OWNED BY public.clientes.id;


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
    rg character varying
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
    codigo integer NOT NULL,
    nome character varying NOT NULL,
    ativo boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    comissao_padrao integer DEFAULT 0,
    email character varying,
    telefone character varying
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
    created_at timestamp with time zone DEFAULT now()
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
    created_at timestamp with time zone DEFAULT now()
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
    tipo character varying DEFAULT 'PEDIDO'::character varying
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
    descricao character varying
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
    meta_colaborador_diaria double precision DEFAULT 0
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
    permissoes text
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
-- Name: clientes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes ALTER COLUMN id SET DEFAULT nextval('public.clientes_id_seq'::regclass);


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
-- Name: estoque_lotes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estoque_lotes ALTER COLUMN id SET DEFAULT nextval('public.estoque_lotes_id_seq'::regclass);


--
-- Name: etiqueta_templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etiqueta_templates ALTER COLUMN id SET DEFAULT nextval('public.etiqueta_templates_id_seq'::regclass);


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
-- Name: modulos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modulos ALTER COLUMN id SET DEFAULT nextval('public.modulos_id_seq'::regclass);


--
-- Name: movimentacoes_estoque id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimentacoes_estoque ALTER COLUMN id SET DEFAULT nextval('public.movimentacoes_estoque_id_seq'::regclass);


--
-- Name: ordem_producao_itens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordem_producao_itens ALTER COLUMN id SET DEFAULT nextval('public.ordem_producao_itens_id_seq'::regclass);


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
-- Name: reservas_estoque id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas_estoque ALTER COLUMN id SET DEFAULT nextval('public.reservas_estoque_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: setores_produtividade id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.setores_produtividade ALTER COLUMN id SET DEFAULT nextval('public.setores_produtividade_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
72c3f6a57101
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
\.


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clientes (id, nome, cpf_cnpj, email, telefone, endereco, cidade, estado, ativo, created_at) FROM stdin;
\.


--
-- Data for Name: colaboradores_produtividade; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.colaboradores_produtividade (id, setor_id, nome, nome_chave, ativo, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: comercial_clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comercial_clientes (id, situacao, tipo_pessoa, nome_razao_social, nome_fantasia, cpf_cnpj, inscricao_estadual, telefone, whatsapp, email, cep, endereco, numero, complemento, bairro, cidade, uf, forma_pagamento_padrao, condicao_pagamento, prazo_pagamento_dias, prazo_entrega_padrao_dias, observacoes, created_at, updated_at, cep_entrega, endereco_entrega, numero_entrega, complemento_entrega, bairro_entrega, cidade_entrega, uf_entrega, cep_cobranca, endereco_cobranca, numero_cobranca, complemento_cobranca, bairro_cobranca, uf_cobranca, municipio_cobranca, cnpj_cobranca, inscricao_estadual_cobranca, email_cobranca, representante_id, nome_vendedor_interno, forma_pagamento_id, condicao_pagamento_id, rg) FROM stdin;
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

COPY public.comercial_representantes (id, codigo, nome, ativo, created_at, updated_at, comissao_padrao, email, telefone) FROM stdin;
1	1	DIRETO	t	2026-04-30 14:27:10.243702+00	\N	0	\N	\N
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

COPY public.maquinas (id, nome, tipo, capacidade, status, created_at) FROM stdin;
\.


--
-- Data for Name: modulos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modulos (id, nome, descricao, ativo) FROM stdin;
4	FINANCEIRO	Contas a Pagar/Receber e Fluxo de Caixa	f
1	ESTOQUE	Gestão de Produtos, Movimentações e Inventário	t
2	VENDAS	Pedidos de Venda e Clientes	f
3	PRODUCAO	Ordens de Produção e Matéria Prima	f
\.


--
-- Data for Name: movimentacoes_estoque; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movimentacoes_estoque (id, produto_id, tipo, quantidade, usuario, origem, observacao, created_at) FROM stdin;
\.


--
-- Data for Name: ordem_producao_itens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ordem_producao_itens (id, ordem_producao_id, produto_componente_id, quantidade_necessaria, custo_unitario) FROM stdin;
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
\.


--
-- Data for Name: pedidos_venda; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedidos_venda (id, cliente_nome, data_pedido, status, valor_total, observacoes, tipo) FROM stdin;
\.


--
-- Data for Name: produtos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.produtos (id, nome, sku, gtin, categoria, unidade_medida, corredor, prateleira, posicao, estoque_minimo, estoque_medio, estoque_maximo, ativo, created_at, updated_at, tipo_produto, origem_icms, ncm, preco_venda, peso_liquido, peso_bruto, tipo_embalagem, largura, altura, comprimento, controlar_estoque, controlar_lotes, dias_preparacao, descricao) FROM stdin;
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
-- Data for Name: setores_produtividade; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.setores_produtividade (id, nome, nome_chave, meta_diaria, ativo, created_at, updated_at, meta_colaborador_diaria) FROM stdin;
1	Montagem	MONTAGEM	4000	t	2026-05-04 19:09:12.427148+00	2026-05-04 19:09:12.427148+00	500
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, username, email, hashed_password, nome_completo, role_id, ativo, created_at, permissoes) FROM stdin;
1	admin	admin@venner.com.br	$pbkdf2-sha256$29000$mTMmxPifE0IoRQhBCKG0Vg$YTy2OHLdC8zUSozM4RM2gqHv4urEI.RPBYqg087FPGs	Administrador Sistema	1	t	2026-04-27 11:07:00.399081+00	\N
2	Bruno Andres	brunoandres@vennerindustria.com.br	$pbkdf2-sha256$29000$FuI8J6S0lhKCUIoxRogxBg$Vi08xAE7syKjqGCjRdICXRUMf87ba6cyo89XufH8Hgo	Bruno Andres	2	t	2026-04-27 11:48:18.439227+00	\N
9	vendedor	vendedor@venner.com	$pbkdf2-sha256$29000$IkSIca51DqG0NmYsxViLkQ$Y6.RUBnYLf.KoJGLMRNaWXFVqmFDbpCDgiHyLBi4Wzs	Vendedor Teste	4	t	2026-05-11 14:30:09.822434+00	\N
\.


--
-- Name: apontamentos_produtividade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.apontamentos_produtividade_id_seq', 1, true);


--
-- Name: auditoria_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auditoria_logs_id_seq', 8, true);


--
-- Name: clientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clientes_id_seq', 1, false);


--
-- Name: colaboradores_produtividade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.colaboradores_produtividade_id_seq', 1, false);


--
-- Name: comercial_clientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comercial_clientes_id_seq', 4, true);


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
-- Name: estoque_lotes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estoque_lotes_id_seq', 1, false);


--
-- Name: etiqueta_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.etiqueta_templates_id_seq', 8, true);


--
-- Name: ficha_tecnica_itens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ficha_tecnica_itens_id_seq', 4, true);


--
-- Name: inventario_itens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventario_itens_id_seq', 31, true);


--
-- Name: inventario_sessoes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventario_sessoes_id_seq', 14, true);


--
-- Name: maquina_componentes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maquina_componentes_id_seq', 1, false);


--
-- Name: maquinas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maquinas_id_seq', 11, true);


--
-- Name: modulos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.modulos_id_seq', 4, true);


--
-- Name: movimentacoes_estoque_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.movimentacoes_estoque_id_seq', 2047, true);


--
-- Name: ordem_producao_itens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ordem_producao_itens_id_seq', 4, true);


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

SELECT pg_catalog.setval('public.pedido_venda_itens_id_seq', 1, false);


--
-- Name: pedidos_venda_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedidos_venda_id_seq', 1, false);


--
-- Name: produtos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.produtos_id_seq', 13090, true);


--
-- Name: reservas_estoque_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reservas_estoque_id_seq', 10, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 4, true);


--
-- Name: setores_produtividade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.setores_produtividade_id_seq', 1, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 9, true);


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
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


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
-- Name: maquinas maquinas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maquinas
    ADD CONSTRAINT maquinas_pkey PRIMARY KEY (id);


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
-- Name: ordem_producao_itens ordem_producao_itens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordem_producao_itens
    ADD CONSTRAINT ordem_producao_itens_pkey PRIMARY KEY (id);


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
-- Name: setores_produtividade setores_produtividade_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.setores_produtividade
    ADD CONSTRAINT setores_produtividade_pkey PRIMARY KEY (id);


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
-- Name: ix_clientes_cpf_cnpj; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_clientes_cpf_cnpj ON public.clientes USING btree (cpf_cnpj);


--
-- Name: ix_clientes_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_clientes_id ON public.clientes USING btree (id);


--
-- Name: ix_clientes_nome; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_clientes_nome ON public.clientes USING btree (nome);


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
-- Name: ix_comercial_clientes_cpf_cnpj; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_comercial_clientes_cpf_cnpj ON public.comercial_clientes USING btree (cpf_cnpj);


--
-- Name: ix_comercial_clientes_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_clientes_email ON public.comercial_clientes USING btree (email);


--
-- Name: ix_comercial_clientes_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_clientes_id ON public.comercial_clientes USING btree (id);


--
-- Name: ix_comercial_clientes_nome_fantasia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_clientes_nome_fantasia ON public.comercial_clientes USING btree (nome_fantasia);


--
-- Name: ix_comercial_clientes_nome_razao_social; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_clientes_nome_razao_social ON public.comercial_clientes USING btree (nome_razao_social);


--
-- Name: ix_comercial_clientes_uf; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_clientes_uf ON public.comercial_clientes USING btree (uf);


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

CREATE UNIQUE INDEX ix_comercial_representantes_codigo ON public.comercial_representantes USING btree (codigo);


--
-- Name: ix_comercial_representantes_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_representantes_id ON public.comercial_representantes USING btree (id);


--
-- Name: ix_comercial_representantes_nome; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comercial_representantes_nome ON public.comercial_representantes USING btree (nome);


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
-- Name: ix_ordem_producao_itens_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ordem_producao_itens_id ON public.ordem_producao_itens USING btree (id);


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
-- Name: ix_setores_produtividade_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_setores_produtividade_id ON public.setores_produtividade USING btree (id);


--
-- Name: ix_setores_produtividade_nome_chave; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_setores_produtividade_nome_chave ON public.setores_produtividade USING btree (nome_chave);


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
-- Name: estoque_lotes estoque_lotes_produto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estoque_lotes
    ADD CONSTRAINT estoque_lotes_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id);


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
-- Name: movimentacoes_estoque movimentacoes_estoque_produto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimentacoes_estoque
    ADD CONSTRAINT movimentacoes_estoque_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id);


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

\unrestrict SqSW2tsAuh8Djb35UPV53onUx9my34grdILGKU4CKpmEb1diXYd4h1zkpguylfO

