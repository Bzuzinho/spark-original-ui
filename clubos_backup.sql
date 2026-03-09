--
-- PostgreSQL database dump
--

\restrict D6dk2BSovRVthyCmRHOZIdZzNNpGUl0FVin0oL3SxFLwWfd9CvoNBZx0Dhq6S8Q

-- Dumped from database version 17.8 (6108b59)
-- Dumped by pg_dump version 17.9 (Ubuntu 17.9-1.pgdg24.04+1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: age_groups; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.age_groups (
    id uuid NOT NULL,
    nome character varying(255) NOT NULL,
    descricao text,
    idade_minima integer,
    idade_maxima integer,
    ano_minimo integer,
    ano_maximo integer,
    sexo character varying(255),
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.age_groups OWNER TO neondb_owner;

--
-- Name: athlete_sports_data; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.athlete_sports_data (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    num_federacao character varying(255),
    cartao_federacao character varying(255),
    numero_pmb character varying(255),
    data_inscricao date,
    inscricao_path character varying(255),
    escalao_id uuid,
    data_atestado_medico date,
    arquivo_atestado_medico json,
    informacoes_medicas text,
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.athlete_sports_data OWNER TO neondb_owner;

--
-- Name: automated_communications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.automated_communications (
    id uuid NOT NULL,
    nome character varying(255) NOT NULL,
    tipo_trigger character varying(50) NOT NULL,
    tipo_comunicacao character varying(30) DEFAULT 'email'::character varying NOT NULL,
    assunto character varying(255) NOT NULL,
    template_mensagem text NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    condicoes json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.automated_communications OWNER TO neondb_owner;

--
-- Name: bank_statements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.bank_statements (
    id uuid NOT NULL,
    conta character varying(255),
    data_movimento date NOT NULL,
    descricao character varying(255) NOT NULL,
    valor numeric(10,2) NOT NULL,
    saldo numeric(10,2),
    referencia character varying(255),
    centro_custo_id uuid,
    conciliado boolean DEFAULT false NOT NULL,
    lancamento_id uuid,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    ficheiro_id character varying(255)
);


ALTER TABLE public.bank_statements OWNER TO neondb_owner;

--
-- Name: cache; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache OWNER TO neondb_owner;

--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO neondb_owner;

--
-- Name: call_ups; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.call_ups (
    id uuid NOT NULL,
    event_id uuid NOT NULL,
    team_id uuid NOT NULL,
    called_up_athletes json NOT NULL,
    attendances json,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.call_ups OWNER TO neondb_owner;

--
-- Name: catalogo_fatura_itens; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.catalogo_fatura_itens (
    id uuid NOT NULL,
    descricao character varying(255) NOT NULL,
    valor_unitario numeric(10,2) NOT NULL,
    imposto_percentual numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    tipo character varying(30),
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.catalogo_fatura_itens OWNER TO neondb_owner;

--
-- Name: centro_custo_user; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.centro_custo_user (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    centro_custo_id uuid NOT NULL,
    peso numeric(6,2) DEFAULT '1'::numeric NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.centro_custo_user OWNER TO neondb_owner;

--
-- Name: club_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.club_settings (
    id bigint NOT NULL,
    nome_clube character varying(255) NOT NULL,
    sigla character varying(255),
    morada text,
    codigo_postal character varying(255),
    localidade character varying(255),
    telefone character varying(255),
    email character varying(255),
    website character varying(255),
    nif character varying(255),
    logo_url text,
    horario_funcionamento jsonb,
    redes_sociais jsonb,
    iban text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.club_settings OWNER TO neondb_owner;

--
-- Name: club_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.club_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.club_settings_id_seq OWNER TO neondb_owner;

--
-- Name: club_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.club_settings_id_seq OWNED BY public.club_settings.id;


--
-- Name: communications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.communications (
    id uuid NOT NULL,
    assunto character varying(255) NOT NULL,
    mensagem text NOT NULL,
    tipo character varying(255) DEFAULT 'email'::character varying NOT NULL,
    destinatarios json NOT NULL,
    estado character varying(255) DEFAULT 'rascunho'::character varying NOT NULL,
    agendado_para timestamp(0) without time zone,
    enviado_em timestamp(0) without time zone,
    total_enviados integer DEFAULT 0 NOT NULL,
    total_falhados integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT communications_estado_check CHECK (((estado)::text = ANY ((ARRAY['rascunho'::character varying, 'agendada'::character varying, 'enviada'::character varying, 'falhou'::character varying])::text[]))),
    CONSTRAINT communications_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['email'::character varying, 'sms'::character varying, 'notificacao'::character varying, 'aviso'::character varying])::text[])))
);


ALTER TABLE public.communications OWNER TO neondb_owner;

--
-- Name: competition_registrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.competition_registrations (
    id uuid NOT NULL,
    prova_id uuid NOT NULL,
    user_id uuid NOT NULL,
    estado character varying(30) DEFAULT 'inscrito'::character varying NOT NULL,
    valor_inscricao numeric(10,2),
    fatura_id uuid,
    movimento_id uuid,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.competition_registrations OWNER TO neondb_owner;

--
-- Name: competitions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.competitions (
    id uuid NOT NULL,
    nome character varying(255) NOT NULL,
    local character varying(255) NOT NULL,
    data_inicio date NOT NULL,
    data_fim date,
    tipo character varying(30) NOT NULL,
    evento_id uuid,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.competitions OWNER TO neondb_owner;

--
-- Name: convocation_athletes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.convocation_athletes (
    convocatoria_grupo_id uuid NOT NULL,
    atleta_id uuid NOT NULL,
    provas json NOT NULL,
    presente boolean DEFAULT false NOT NULL,
    confirmado boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    estafetas integer DEFAULT 0
);


ALTER TABLE public.convocation_athletes OWNER TO neondb_owner;

--
-- Name: convocation_groups; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.convocation_groups (
    id uuid NOT NULL,
    evento_id uuid NOT NULL,
    data_criacao timestamp(0) without time zone NOT NULL,
    criado_por uuid NOT NULL,
    atletas_ids json NOT NULL,
    hora_encontro time(0) without time zone,
    local_encontro character varying(255),
    observacoes text,
    tipo_custo character varying(30) NOT NULL,
    valor_por_salto numeric(10,2),
    valor_por_estafeta numeric(10,2),
    valor_inscricao_unitaria numeric(10,2),
    valor_inscricao_calculado numeric(10,2),
    movimento_id uuid,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    centro_custo_id character varying(255)
);


ALTER TABLE public.convocation_groups OWNER TO neondb_owner;

--
-- Name: convocation_movement_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.convocation_movement_items (
    id uuid NOT NULL,
    movimento_convocatoria_id uuid NOT NULL,
    descricao character varying(255) NOT NULL,
    valor numeric(10,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.convocation_movement_items OWNER TO neondb_owner;

--
-- Name: convocation_movements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.convocation_movements (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    convocatoria_grupo_id uuid NOT NULL,
    evento_id uuid NOT NULL,
    evento_nome character varying(255) NOT NULL,
    tipo character varying(255) DEFAULT 'convocatoria'::character varying NOT NULL,
    data_emissao date NOT NULL,
    valor numeric(10,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.convocation_movements OWNER TO neondb_owner;

--
-- Name: cost_centers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.cost_centers (
    id uuid NOT NULL,
    codigo character varying(255) NOT NULL,
    nome character varying(255) NOT NULL,
    descricao text,
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    tipo character varying(255),
    orcamento numeric(12,2)
);


ALTER TABLE public.cost_centers OWNER TO neondb_owner;

--
-- Name: dados_financeiros; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.dados_financeiros (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    mensalidade_id uuid,
    conta_corrente_manual numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.dados_financeiros OWNER TO neondb_owner;

--
-- Name: event_age_group; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.event_age_group (
    event_id uuid NOT NULL,
    age_group_id uuid NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.event_age_group OWNER TO neondb_owner;

--
-- Name: event_attendances; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.event_attendances (
    id uuid NOT NULL,
    evento_id uuid NOT NULL,
    user_id uuid NOT NULL,
    estado character varying(30) NOT NULL,
    hora_chegada time(0) without time zone,
    observacoes text,
    registado_por uuid NOT NULL,
    registado_em timestamp(0) without time zone NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    provas json
);


ALTER TABLE public.event_attendances OWNER TO neondb_owner;

--
-- Name: event_convocations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.event_convocations (
    id uuid NOT NULL,
    evento_id uuid NOT NULL,
    user_id uuid NOT NULL,
    data_convocatoria date NOT NULL,
    estado_confirmacao character varying(30) DEFAULT 'pendente'::character varying NOT NULL,
    data_resposta timestamp(0) without time zone,
    justificacao text,
    observacoes text,
    transporte_clube boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.event_convocations OWNER TO neondb_owner;

--
-- Name: event_participants; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.event_participants (
    id uuid NOT NULL,
    event_id uuid NOT NULL,
    user_id uuid NOT NULL,
    status character varying(30) DEFAULT 'confirmado'::character varying NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.event_participants OWNER TO neondb_owner;

--
-- Name: event_results; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.event_results (
    id uuid NOT NULL,
    evento_id uuid NOT NULL,
    user_id uuid NOT NULL,
    prova character varying(255) NOT NULL,
    tempo character varying(255),
    classificacao integer,
    piscina character varying(255),
    age_group_snapshot_id uuid,
    observacoes text,
    epoca character varying(255),
    registado_por uuid NOT NULL,
    registado_em timestamp(0) without time zone NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.event_results OWNER TO neondb_owner;

--
-- Name: event_type_configs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.event_type_configs (
    id uuid NOT NULL,
    nome character varying(255) NOT NULL,
    cor character varying(20) NOT NULL,
    icon character varying(50) NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    gera_taxa boolean DEFAULT false NOT NULL,
    requer_convocatoria boolean DEFAULT false NOT NULL,
    requer_transporte boolean DEFAULT false NOT NULL,
    visibilidade_default character varying(20) DEFAULT 'publico'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.event_type_configs OWNER TO neondb_owner;

--
-- Name: event_types; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.event_types (
    id uuid NOT NULL,
    nome character varying(255) NOT NULL,
    descricao text,
    categoria character varying(255),
    cor character varying(255),
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    icon character varying(255),
    visibilidade_default character varying(20) DEFAULT 'publico'::character varying NOT NULL,
    gera_taxa boolean DEFAULT false NOT NULL,
    permite_convocatoria boolean DEFAULT false NOT NULL,
    requer_transporte boolean DEFAULT false NOT NULL,
    gera_presencas boolean DEFAULT false NOT NULL
);


ALTER TABLE public.event_types OWNER TO neondb_owner;

--
-- Name: events; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.events (
    id uuid NOT NULL,
    titulo character varying(255) NOT NULL,
    descricao text NOT NULL,
    data_inicio date NOT NULL,
    hora_inicio time(0) without time zone,
    data_fim date,
    hora_fim time(0) without time zone,
    local character varying(255),
    local_detalhes text,
    tipo character varying(50) NOT NULL,
    tipo_config_id uuid,
    tipo_piscina character varying(30),
    visibilidade character varying(20) DEFAULT 'publico'::character varying NOT NULL,
    transporte_necessario boolean DEFAULT false NOT NULL,
    transporte_detalhes text,
    hora_partida time(0) without time zone,
    local_partida character varying(255),
    taxa_inscricao numeric(10,2),
    custo_inscricao_por_prova numeric(10,2),
    custo_inscricao_por_salto numeric(10,2),
    custo_inscricao_estafeta numeric(10,2),
    centro_custo_id uuid,
    observacoes text,
    convocatoria_ficheiro character varying(255),
    regulamento_ficheiro character varying(255),
    estado character varying(30) DEFAULT 'rascunho'::character varying NOT NULL,
    criado_por uuid NOT NULL,
    recorrente boolean DEFAULT false NOT NULL,
    recorrencia_data_inicio date,
    recorrencia_data_fim date,
    recorrencia_dias_semana json,
    evento_pai_id uuid,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.events OWNER TO neondb_owner;

--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO neondb_owner;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.failed_jobs_id_seq OWNER TO neondb_owner;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: financial_categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.financial_categories (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(30) NOT NULL,
    color character varying(255),
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.financial_categories OWNER TO neondb_owner;

--
-- Name: financial_entries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.financial_entries (
    id uuid NOT NULL,
    data date NOT NULL,
    tipo character varying(30) NOT NULL,
    categoria character varying(255),
    descricao character varying(255) NOT NULL,
    valor numeric(10,2) NOT NULL,
    centro_custo_id uuid,
    user_id uuid,
    fatura_id uuid,
    metodo_pagamento character varying(255),
    comprovativo character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    origem_tipo character varying(30),
    origem_id uuid,
    documento_ref character varying(255)
);


ALTER TABLE public.financial_entries OWNER TO neondb_owner;

--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.invoice_items (
    id uuid NOT NULL,
    fatura_id uuid NOT NULL,
    descricao character varying(255) NOT NULL,
    valor_unitario numeric(10,2) NOT NULL,
    quantidade integer DEFAULT 1 NOT NULL,
    imposto_percentual numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    total_linha numeric(10,2) NOT NULL,
    produto_id uuid,
    centro_custo_id uuid,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.invoice_items OWNER TO neondb_owner;

--
-- Name: invoice_types; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.invoice_types (
    id uuid NOT NULL,
    codigo character varying(255) NOT NULL,
    nome character varying(255) NOT NULL,
    descricao character varying(255),
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.invoice_types OWNER TO neondb_owner;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.invoices (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    data_fatura date NOT NULL,
    mes character varying(20),
    data_emissao date NOT NULL,
    data_vencimento date NOT NULL,
    valor_total numeric(10,2) NOT NULL,
    estado_pagamento character varying(30) DEFAULT 'pendente'::character varying NOT NULL,
    numero_recibo character varying(255),
    referencia_pagamento character varying(255),
    centro_custo_id uuid,
    tipo character varying(30) NOT NULL,
    observacoes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    oculta boolean DEFAULT false NOT NULL,
    origem_tipo character varying(30),
    origem_id uuid
);


ALTER TABLE public.invoices OWNER TO neondb_owner;

--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


ALTER TABLE public.job_batches OWNER TO neondb_owner;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO neondb_owner;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO neondb_owner;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: macrocycles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.macrocycles (
    id uuid NOT NULL,
    epoca_id uuid NOT NULL,
    nome character varying(255) NOT NULL,
    tipo character varying(50) NOT NULL,
    data_inicio date NOT NULL,
    data_fim date NOT NULL,
    escalao character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.macrocycles OWNER TO neondb_owner;

--
-- Name: mapa_conciliacao; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.mapa_conciliacao (
    id uuid NOT NULL,
    extrato_id uuid NOT NULL,
    lancamento_id uuid NOT NULL,
    status character varying(20) DEFAULT 'sugerido'::character varying NOT NULL,
    regra_usada text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    fatura_id uuid,
    movimento_id uuid,
    estado_fatura_anterior character varying(20),
    estado_movimento_anterior character varying(20),
    valor_conciliado numeric(12,2)
);


ALTER TABLE public.mapa_conciliacao OWNER TO neondb_owner;

--
-- Name: marketing_campaigns; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.marketing_campaigns (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    type character varying(50) NOT NULL,
    start_date date NOT NULL,
    end_date date,
    status character varying(30) DEFAULT 'planned'::character varying NOT NULL,
    budget numeric(10,2),
    estimated_reach integer,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.marketing_campaigns OWNER TO neondb_owner;

--
-- Name: membership_fees; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.membership_fees (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    status character varying(30) DEFAULT 'pending'::character varying NOT NULL,
    payment_date date,
    transaction_id uuid,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.membership_fees OWNER TO neondb_owner;

--
-- Name: mesocycles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.mesocycles (
    id uuid NOT NULL,
    macrociclo_id uuid NOT NULL,
    nome character varying(255) NOT NULL,
    foco character varying(255) NOT NULL,
    data_inicio date NOT NULL,
    data_fim date NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.mesocycles OWNER TO neondb_owner;

--
-- Name: microcycles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.microcycles (
    id uuid NOT NULL,
    mesociclo_id uuid NOT NULL,
    semana character varying(255) NOT NULL,
    volume_previsto integer,
    notas text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.microcycles OWNER TO neondb_owner;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO neondb_owner;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO neondb_owner;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: monthly_fees; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.monthly_fees (
    id uuid NOT NULL,
    designacao character varying(255) NOT NULL,
    valor numeric(10,2) NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    age_group_id uuid
);


ALTER TABLE public.monthly_fees OWNER TO neondb_owner;

--
-- Name: movement_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.movement_items (
    id uuid NOT NULL,
    movimento_id uuid NOT NULL,
    descricao character varying(255) NOT NULL,
    valor_unitario numeric(10,2) NOT NULL,
    quantidade integer DEFAULT 1 NOT NULL,
    imposto_percentual numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    total_linha numeric(10,2) NOT NULL,
    produto_id uuid,
    centro_custo_id uuid,
    fatura_id uuid,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.movement_items OWNER TO neondb_owner;

--
-- Name: movements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.movements (
    id uuid NOT NULL,
    user_id uuid,
    nome_manual character varying(255),
    nif_manual character varying(255),
    morada_manual text,
    classificacao character varying(30) NOT NULL,
    data_emissao date NOT NULL,
    data_vencimento date NOT NULL,
    valor_total numeric(10,2) NOT NULL,
    estado_pagamento character varying(30) DEFAULT 'pendente'::character varying NOT NULL,
    numero_recibo character varying(255),
    referencia_pagamento character varying(255),
    centro_custo_id uuid,
    tipo character varying(30) NOT NULL,
    observacoes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    origem_tipo character varying(30),
    origem_id uuid,
    metodo_pagamento character varying(255),
    comprovativo character varying(255),
    documento_original character varying(255)
);


ALTER TABLE public.movements OWNER TO neondb_owner;

--
-- Name: news_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.news_items (
    id uuid NOT NULL,
    titulo character varying(255) NOT NULL,
    conteudo text NOT NULL,
    imagem character varying(255),
    destaque boolean DEFAULT false NOT NULL,
    autor uuid NOT NULL,
    data_publicacao timestamp(0) without time zone NOT NULL,
    categorias json NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.news_items OWNER TO neondb_owner;

--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notification_preferences (
    id uuid NOT NULL,
    email_notificacoes boolean DEFAULT true NOT NULL,
    alertas_pagamento boolean DEFAULT true NOT NULL,
    alertas_atividade boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.notification_preferences OWNER TO neondb_owner;

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO neondb_owner;

--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name text NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.personal_access_tokens OWNER TO neondb_owner;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_access_tokens_id_seq OWNER TO neondb_owner;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: presences; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.presences (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    data date NOT NULL,
    treino_id uuid,
    tipo character varying(30) NOT NULL,
    justificacao text,
    presente boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    escalao_id uuid,
    status character varying(50) DEFAULT 'ausente'::character varying NOT NULL,
    distancia_realizada_m integer,
    classificacao character varying(50),
    notas text
);


ALTER TABLE public.presences OWNER TO neondb_owner;

--
-- Name: COLUMN presences.status; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.presences.status IS 'presente, ausente, justificado, atestado_medico, outro';


--
-- Name: COLUMN presences.classificacao; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.presences.classificacao IS 'classificação de desempenho';


--
-- Name: products; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.products (
    id uuid NOT NULL,
    nome character varying(255) NOT NULL,
    descricao text,
    codigo character varying(255) NOT NULL,
    categoria character varying(255),
    preco numeric(10,2) NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    stock_minimo integer DEFAULT 0 NOT NULL,
    imagem character varying(255),
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.products OWNER TO neondb_owner;

--
-- Name: prova_tipos; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.prova_tipos (
    id uuid NOT NULL,
    nome character varying(255) NOT NULL,
    distancia integer NOT NULL,
    unidade character varying(20) NOT NULL,
    modalidade character varying(255) NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.prova_tipos OWNER TO neondb_owner;

--
-- Name: provas; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.provas (
    id uuid NOT NULL,
    competicao_id uuid,
    estilo character varying(30) NOT NULL,
    distancia_m integer NOT NULL,
    genero character varying(20) NOT NULL,
    escalao_id uuid,
    ordem_prova integer,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.provas OWNER TO neondb_owner;

--
-- Name: result_provas; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.result_provas (
    id uuid NOT NULL,
    atleta_id uuid NOT NULL,
    evento_id uuid,
    evento_nome character varying(255),
    prova character varying(255) NOT NULL,
    local character varying(255) NOT NULL,
    data date NOT NULL,
    piscina character varying(30) NOT NULL,
    tempo_final character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.result_provas OWNER TO neondb_owner;

--
-- Name: result_splits; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.result_splits (
    id uuid NOT NULL,
    resultado_id uuid NOT NULL,
    distancia_parcial_m integer NOT NULL,
    tempo_parcial numeric(10,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.result_splits OWNER TO neondb_owner;

--
-- Name: results; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.results (
    id uuid NOT NULL,
    prova_id uuid NOT NULL,
    user_id uuid NOT NULL,
    tempo_oficial numeric(10,2) NOT NULL,
    posicao integer,
    pontos_fina integer,
    desclassificado boolean DEFAULT false NOT NULL,
    observacoes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.results OWNER TO neondb_owner;

--
-- Name: sales; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sales (
    id uuid NOT NULL,
    produto_id uuid NOT NULL,
    quantidade integer NOT NULL,
    preco_unitario numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    cliente_id uuid,
    vendedor_id uuid NOT NULL,
    data timestamp(0) without time zone NOT NULL,
    metodo_pagamento character varying(30) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.sales OWNER TO neondb_owner;

--
-- Name: seasons; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.seasons (
    id uuid NOT NULL,
    nome character varying(255) NOT NULL,
    ano_temporada character varying(20) NOT NULL,
    data_inicio date NOT NULL,
    data_fim date NOT NULL,
    tipo character varying(30) NOT NULL,
    estado character varying(30) NOT NULL,
    piscina_principal character varying(30),
    escaloes_abrangidos json,
    descricao text,
    provas_alvo json,
    volume_total_previsto integer,
    volume_medio_semanal integer,
    num_semanas_previsto integer,
    num_competicoes_previstas integer,
    objetivos_performance text,
    objetivos_tecnicos text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.seasons OWNER TO neondb_owner;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id uuid,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- Name: sponsors; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sponsors (
    id uuid NOT NULL,
    nome character varying(255) NOT NULL,
    descricao text,
    logo character varying(255),
    website character varying(255),
    contacto character varying(255),
    email character varying(255),
    tipo character varying(255) DEFAULT 'secundario'::character varying NOT NULL,
    valor_anual numeric(10,2),
    data_inicio date NOT NULL,
    data_fim date,
    estado character varying(255) DEFAULT 'ativo'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT sponsors_estado_check CHECK (((estado)::text = ANY ((ARRAY['ativo'::character varying, 'inativo'::character varying, 'expirado'::character varying])::text[]))),
    CONSTRAINT sponsors_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['principal'::character varying, 'secundario'::character varying, 'apoio'::character varying])::text[])))
);


ALTER TABLE public.sponsors OWNER TO neondb_owner;

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.suppliers (
    id uuid NOT NULL,
    nome character varying(255) NOT NULL,
    nif character varying(30),
    email character varying(255),
    telefone character varying(30),
    morada character varying(255),
    categoria character varying(255),
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.suppliers OWNER TO neondb_owner;

--
-- Name: team_members; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.team_members (
    id uuid NOT NULL,
    team_id uuid NOT NULL,
    user_id uuid NOT NULL,
    "position" character varying(255),
    jersey_number integer,
    join_date date NOT NULL,
    leave_date date,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.team_members OWNER TO neondb_owner;

--
-- Name: teams; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.teams (
    id uuid NOT NULL,
    nome character varying(255) NOT NULL,
    escalao character varying(255),
    treinador_id uuid,
    ano_fundacao integer,
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.teams OWNER TO neondb_owner;

--
-- Name: training_athletes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.training_athletes (
    id uuid NOT NULL,
    treino_id uuid NOT NULL,
    user_id uuid NOT NULL,
    presente boolean DEFAULT false NOT NULL,
    estado character varying(30),
    volume_real_m integer,
    rpe integer,
    observacoes_tecnicas text,
    registado_por uuid,
    registado_em timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.training_athletes OWNER TO neondb_owner;

--
-- Name: training_series; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.training_series (
    id uuid NOT NULL,
    treino_id uuid NOT NULL,
    ordem integer NOT NULL,
    descricao_texto text NOT NULL,
    distancia_total_m integer NOT NULL,
    zona_intensidade character varying(10),
    estilo character varying(30),
    repeticoes integer,
    intervalo character varying(255),
    observacoes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.training_series OWNER TO neondb_owner;

--
-- Name: training_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.training_sessions (
    id uuid NOT NULL,
    equipa_id uuid,
    data_hora timestamp(0) without time zone NOT NULL,
    duracao_minutos integer DEFAULT 60 NOT NULL,
    local character varying(255),
    objetivos text,
    estado character varying(30) DEFAULT 'scheduled'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.training_sessions OWNER TO neondb_owner;

--
-- Name: trainings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.trainings (
    id uuid NOT NULL,
    numero_treino character varying(255),
    data date NOT NULL,
    hora_inicio time(0) without time zone,
    hora_fim time(0) without time zone,
    local character varying(255),
    epoca_id uuid,
    microciclo_id uuid,
    grupo_escalao_id uuid,
    escaloes json,
    tipo_treino character varying(30) NOT NULL,
    volume_planeado_m integer,
    notas_gerais text,
    descricao_treino text,
    criado_por uuid,
    evento_id uuid,
    atualizado_em timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.trainings OWNER TO neondb_owner;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.transactions (
    id uuid NOT NULL,
    user_id uuid,
    category_id uuid,
    descricao character varying(255) NOT NULL,
    valor numeric(10,2) NOT NULL,
    tipo character varying(30) NOT NULL,
    data date NOT NULL,
    metodo_pagamento character varying(30),
    recibo character varying(255),
    estado character varying(30) DEFAULT 'pending'::character varying NOT NULL,
    observacoes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.transactions OWNER TO neondb_owner;

--
-- Name: user_documents; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_documents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    type character varying(50) NOT NULL,
    name character varying(255),
    file_path character varying(255) NOT NULL,
    expiry_date date,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.user_documents OWNER TO neondb_owner;

--
-- Name: user_guardian; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_guardian (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    guardian_id uuid NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.user_guardian OWNER TO neondb_owner;

--
-- Name: user_relationships; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_relationships (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    related_user_id uuid NOT NULL,
    type character varying(50) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.user_relationships OWNER TO neondb_owner;

--
-- Name: user_type_permissions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_type_permissions (
    id uuid NOT NULL,
    user_type_id uuid NOT NULL,
    modulo character varying(255) NOT NULL,
    pode_ver boolean DEFAULT true NOT NULL,
    pode_editar boolean DEFAULT false NOT NULL,
    pode_eliminar boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    submodulo character varying(100),
    separador character varying(100),
    campo character varying(100),
    pode_criar boolean DEFAULT false NOT NULL
);


ALTER TABLE public.user_type_permissions OWNER TO neondb_owner;

--
-- Name: user_types; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_types (
    id uuid NOT NULL,
    nome character varying(255) NOT NULL,
    descricao text,
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.user_types OWNER TO neondb_owner;

--
-- Name: user_user_type; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_user_type (
    user_id uuid NOT NULL,
    user_type_id uuid NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.user_user_type OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    numero_socio character varying(255),
    nome_completo character varying(255),
    perfil character varying(255) DEFAULT 'user'::character varying NOT NULL,
    tipo_membro json,
    estado character varying(255) DEFAULT 'ativo'::character varying NOT NULL,
    data_nascimento date,
    menor boolean DEFAULT false NOT NULL,
    sexo character varying(255),
    escalao json,
    rgpd boolean DEFAULT false NOT NULL,
    consentimento boolean DEFAULT false NOT NULL,
    afiliacao boolean DEFAULT false NOT NULL,
    declaracao_de_transporte boolean DEFAULT false NOT NULL,
    ativo_desportivo boolean DEFAULT false NOT NULL,
    morada text,
    codigo_postal character varying(255),
    localidade character varying(255),
    telefone character varying(255),
    telemovel character varying(255),
    nif character varying(255),
    numero_cartao_cidadao character varying(255),
    validade_cartao_cidadao date,
    numero_utente character varying(255),
    contacto_emergencia_nome character varying(255),
    contacto_emergencia_telefone character varying(255),
    contacto_emergencia_relacao character varying(255),
    foto_perfil character varying(255),
    cc character varying(255),
    nacionalidade character varying(255),
    estado_civil character varying(255),
    ocupacao character varying(255),
    empresa character varying(255),
    escola character varying(255),
    numero_irmaos integer,
    contacto character varying(255),
    email_secundario character varying(255),
    encarregado_educacao json,
    educandos json,
    contacto_telefonico character varying(255),
    tipo_mensalidade character varying(255),
    conta_corrente numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    centro_custo json,
    num_federacao character varying(255),
    cartao_federacao character varying(255),
    numero_pmb character varying(255),
    data_inscricao date,
    inscricao character varying(255),
    data_atestado_medico date,
    arquivo_atestado_medico json,
    informacoes_medicas text,
    data_rgpd date,
    arquivo_rgpd character varying(255),
    data_consentimento date,
    arquivo_consentimento character varying(255),
    data_afiliacao date,
    arquivo_afiliacao character varying(255),
    declaracao_transporte character varying(255),
    email_utilizador character varying(255),
    senha character varying(255)
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: club_settings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.club_settings ALTER COLUMN id SET DEFAULT nextval('public.club_settings_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Data for Name: age_groups; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.age_groups (id, nome, descricao, idade_minima, idade_maxima, ano_minimo, ano_maximo, sexo, ativo, created_at, updated_at) FROM stdin;
a12853e3-147d-48ee-b1dd-a9a014d73457	Cadetes	\N	6	11	\N	\N	\N	t	2026-02-24 15:09:41	2026-02-24 15:09:41
a12853e4-0ee1-4da6-8081-aa95e74dfe1b	Senior	\N	18	24	\N	\N	\N	t	2026-02-24 15:09:42	2026-02-24 15:09:42
a12853e4-4d0a-43a4-8883-858eb79c08a1	Master	\N	25	99	\N	\N	\N	t	2026-02-24 15:09:42	2026-02-24 15:09:42
a12853e3-542b-4af3-81d9-aa48747b2c4d	Infantis	\N	12	13	\N	\N	\N	t	2026-02-24 15:09:41	2026-02-24 15:36:53
a12853e3-926b-48d1-85a1-e7147c685436	Juvenis	\N	14	15	\N	\N	\N	t	2026-02-24 15:09:41	2026-02-24 15:37:07
a12853e3-d0ab-41fa-af30-ee1ebb2e9863	Juniores	\N	16	17	\N	\N	\N	t	2026-02-24 15:09:42	2026-02-24 15:37:18
\.


--
-- Data for Name: athlete_sports_data; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.athlete_sports_data (id, user_id, num_federacao, cartao_federacao, numero_pmb, data_inscricao, inscricao_path, escalao_id, data_atestado_medico, arquivo_atestado_medico, informacoes_medicas, ativo, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: automated_communications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.automated_communications (id, nome, tipo_trigger, tipo_comunicacao, assunto, template_mensagem, ativo, condicoes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: bank_statements; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.bank_statements (id, conta, data_movimento, descricao, valor, saldo, referencia, centro_custo_id, conciliado, lancamento_id, created_at, updated_at, ficheiro_id) FROM stdin;
a134988b-012a-4581-86d5-99e809c34972	\N	2025-09-01	TRF CR SEPA+ 0001249 DE DAVID FELICIANO MARQU S	30.00	30.00	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:31:36	2026-03-02 17:31:36	Extractos10525089.xls.xlsx
a134988b-20a2-4e1d-94d2-076adae85e54	\N	2025-09-01	TRF SEPA+ INST 1250 DE ZITA ALEXANDRA RODRIGUES DO COITO	65.00	95.00	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:31:36	2026-03-02 17:31:36	Extractos10525089.xls.xlsx
a134988b-3fd0-4961-8d9a-828a5fea53ba	\N	2025-09-02	TRF SEPA+ INST 1251 DE FILIPE COSTA DA SILVA	30.00	125.00	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:31:36	2026-03-02 17:31:36	Extractos10525089.xls.xlsx
a134988b-5ee2-449d-997e-ae7cdea8ce5e	\N	2025-09-03	TRF SEPA+ INST 1252 DE LUIS MIGUEL FIALHO DA COSTA	35.00	160.00	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:31:36	2026-03-02 17:31:36	Extractos10525089.xls.xlsx
a134988b-7e15-4962-8a30-900df82d9c56	\N	2025-09-04	TRF SEPA+ INST 1253 DE LUCIANA SANTOS FERREIRA	30.00	190.00	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:31:36	2026-03-02 17:31:36	Extractos10525089.xls.xlsx
a134988b-9d2a-4bd4-b483-6309ce7d7d5c	\N	2025-09-05	TRF SEPA+ INST 1256 DE LUCIANA SANTOS FERREIRA	20.00	210.00	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:31:36	2026-03-02 17:31:36	Extractos10525089.xls.xlsx
a134988b-bc88-472a-b1f2-2acf0e1384f9	\N	2025-09-05	TRF CR INTRAB 19 DE RUI PEDRO COUTINHO SUBTIL	50.00	260.00	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:31:36	2026-03-02 17:31:36	Extractos10525089.xls.xlsx
a134988b-dbcd-4d5e-9c2f-eec5040a6c21	\N	2025-09-05	TRF SEPA+ INST 1255 DE DUMITRU CAINAC	105.00	365.00	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:31:36	2026-03-02 17:31:36	Extractos10525089.xls.xlsx
a134988b-fadf-49df-bbe6-0403f5267160	\N	2025-09-05	TRF SEPA+ INST 1254 DE ZITA ALEXANDRA RODRIGUES DO COITO	40.00	405.00	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:31:36	2026-03-02 17:31:36	Extractos10525089.xls.xlsx
a134988c-1a12-4af5-9c30-a039e199a048	\N	2025-09-05	IMPOSTO DE SELO AGO 2025	-0.32	404.68	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:31:36	2026-03-02 17:31:36	Extractos10525089.xls.xlsx
a134988c-392a-4c13-a6cf-ce1f8bf04cf3	\N	2025-09-05	MANUTENCAO DE CONTA VALOR NEGOCIOS AGO 2025	-7.99	396.69	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:31:36	2026-03-02 17:31:36	Extractos10525089.xls.xlsx
a134988c-585e-4d3c-b146-448536761311	\N	2025-09-08	TRF SEPA+ INST 1257 DE ANGELO DINIS CRUZ LOURENCO	55.00	451.69	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:31:37	2026-03-02 17:31:37	Extractos10525089.xls.xlsx
a134988c-7773-49e0-83d0-7a14cabcd9a3	\N	2025-09-08	TRF SEPA+ INST 1258 DE LUIS MIGUEL FIALHO DA COSTA	20.00	471.69	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:31:37	2026-03-02 17:31:37	Extractos10525089.xls.xlsx
a134988c-96a8-442d-93c1-223772fc228e	\N	2025-09-08	TRF SEPA+ INST 1259 DE PATRICIA M P SILVA	20.00	491.69	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:31:37	2026-03-02 17:31:37	Extractos10525089.xls.xlsx
a134988c-b5da-4231-8a5e-91b5c47d414a	\N	2025-09-09	TRF CR SEPA+ 0001260 DE GONCALO COSTA CORDEIRO	50.00	541.69	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:31:37	2026-03-02 17:31:37	Extractos10525089.xls.xlsx
a134988c-d4fa-41cc-98c0-4dc96af3378c	\N	2025-09-09	TRF CR SEPA+ 0001261 DE HUGO RAFAEL PACIENCIA	25.00	566.69	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:31:37	2026-03-02 17:31:37	Extractos10525089.xls.xlsx
a134988c-f439-497f-9540-cc1bd524ea9d	\N	2025-09-09	TRF SEPA+ INST 1262 DE ANA MARIA DA SILVA HENRIQUES	35.00	601.69	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:31:37	2026-03-02 17:31:37	Extractos10525089.xls.xlsx
a134988d-135f-46e9-baf0-a15e956ff14d	\N	2025-09-10	TRF CR INTRAB 431 DE SUSETE MARIA LINDO MORGADO	51.50	653.19	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:31:37	2026-03-02 17:31:37	Extractos10525089.xls.xlsx
a134988d-32a0-443e-9d05-80a336b0557e	\N	2025-09-10	TRF CR INTRAB 432 DE SUSETE MARIA LINDO MORGADO	47.00	700.19	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:31:37	2026-03-02 17:31:37	Extractos10525089.xls.xlsx
a134988d-51ea-4f16-ad10-11211a2fd2e9	\N	2025-09-10	TRF CR INTRAB 433 DE SUSETE MARIA LINDO MORGADO	47.00	747.19	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:31:37	2026-03-02 17:31:37	Extractos10525089.xls.xlsx
a134988d-70f4-4432-b0e3-8e341be84204	\N	2025-09-10	TRF SEPA+ INST 1263 DE FABIO PEDRO FERREIRA	50.00	797.19	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:31:37	2026-03-02 17:31:37	Extractos10525089.xls.xlsx
a134988d-90a3-427f-ad8c-1e9fb39ccff4	\N	2025-09-10	TRF SEPA+ INST 1264 DE VOLODYMYR STARYNSKYY	50.00	847.19	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:31:37	2026-03-02 17:31:37	Extractos10525089.xls.xlsx
a134988d-afc4-4734-9ff5-8fbf60f8ab70	\N	2025-09-15	TRF SEPA+ INST 1265 DE EUNICE ALEXANDRA FERREIRA ROXO	65.00	912.19	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:31:37	2026-03-02 17:31:37	Extractos10525089.xls.xlsx
a134988d-ceeb-41b8-94e3-b8ed93f31511	\N	2025-09-15	TRF SEPA+ INST 1266 DE JOSE MANUEL ALMEIDA GUERRA GUIMARAES	50.00	962.19	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:31:38	2026-03-02 17:31:38	Extractos10525089.xls.xlsx
a1349ef2-b29a-47b3-88e9-bec8fa79475a	\N	2025-09-16	TRF SEPA+ INST 1267 DE ANA FILIPA SALVADOR MAGALHAES	50.00	50.00	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:49:30	2026-03-02 17:49:30	Extractos10563541.xls.xlsx
a1349ef2-df8b-41b4-9fdc-7f9e65f57867	\N	2025-09-16	TRF CR INTRAB 223 DE INES DA SILVA GUERRA FIGUEIREDO	30.00	80.00	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:49:30	2026-03-02 17:49:30	Extractos10563541.xls.xlsx
a1349ef3-0161-481b-bd08-7719b888a0f7	\N	2025-09-17	TRF CR SEPA+ 0001268 DE DRA. RITA ALEXANDRA SANTOS FERR	50.00	130.00	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:49:30	2026-03-02 17:49:30	Extractos10563541.xls.xlsx
a1349ef3-2005-44c7-88e8-4f1733a96687	\N	2025-09-17	TRF CR SEPA+ 0001269 DE Catarina Isabel QuitÚrio Ferreira Ai	50.00	180.00	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:49:31	2026-03-02 17:49:31	Extractos10563541.xls.xlsx
a1349ef3-3ef7-4ddf-940a-de17f50a4a45	\N	2025-09-18	TRF CR INTRAB 339 DE DRA ANA LUISA SILVA RODRIGUES	42.50	222.50	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:49:31	2026-03-02 17:49:31	Extractos10563541.xls.xlsx
a1349ef3-5da8-4e2d-a8fa-8b24989ab966	\N	2025-09-18	TRF CR INTRAB 340 DE DRA ANA LUISA SILVA RODRIGUES	51.50	274.00	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:49:31	2026-03-02 17:49:31	Extractos10563541.xls.xlsx
a1349ef3-7c62-446d-8656-aaf8277e36db	\N	2025-09-18	TRF CR INTRAB 341 DE DRA ANA LUISA SILVA RODRIGUES	47.00	321.00	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:49:31	2026-03-02 17:49:31	Extractos10563541.xls.xlsx
a1349ef3-9b07-4006-881d-28c77a7fb336	\N	2025-09-18	TRF SEPA+ INST 1270 DE ANA MARIA DA SILVA HENRIQUES	20.00	341.00	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:49:31	2026-03-02 17:49:31	Extractos10563541.xls.xlsx
a1349ef3-b9a6-472c-8968-01db7027819f	\N	2025-09-19	PAGSERV WINTOUCH SISTEMAS DE INFORMACAO LDA 696096489	-133.84	207.16	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:49:31	2026-03-02 17:49:31	Extractos10563541.xls.xlsx
a1349ef3-d865-4b0c-b5f0-2db5f299267b	\N	2025-09-22	TRF CR INTRAB 198 DE PEDRO GONZAGA	95.00	302.16	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:49:31	2026-03-02 17:49:31	Extractos10563541.xls.xlsx
a1349ef3-f74c-4fa9-b9e1-23ec698bc162	\N	2025-09-24	TRF SEPA+ INST 1271 DE CATARINA LOPES SERRAZINA	45.00	347.16	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:49:31	2026-03-02 17:49:31	Extractos10563541.xls.xlsx
a1349ef4-15f3-41d1-8276-7b629f599044	\N	2025-09-25	TRF CR SEPA+ 1272 P/ PT50000700000019741352823 A.N.D.L.-ASS	-50.40	296.76	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:49:31	2026-03-02 17:49:31	Extractos10563541.xls.xlsx
a1349ef4-3488-4730-9a55-fa461c1e1f0d	\N	2025-09-25	TRF SEPA+ INST 1273 DE TIAGO ANDRE PAVOEIRO LOPES	40.00	336.76	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:49:31	2026-03-02 17:49:31	Extractos10563541.xls.xlsx
a1349ef4-531d-4dff-badf-bbda8680911c	\N	2025-09-29	TRF CR INTRAB 152 DE RICARDO JORGE VITORINO FERREIRA	72.00	408.76	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:49:31	2026-03-02 17:49:31	Extractos10563541.xls.xlsx
a1349ef4-746f-4d4c-ac4a-bc92af37754b	\N	2025-09-29	TRF SEPA+ INST 1274 DE ANTONIO MIGUEL CUNHA MATEUS DA FONSEC	50.00	458.76	\N	a12862b5-1e93-4153-aca9-bcf8295201e6	f	\N	2026-03-02 17:49:31	2026-03-02 17:49:31	Extractos10563541.xls.xlsx
\.


--
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.cache (key, value, expiration) FROM stdin;
\.


--
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- Data for Name: call_ups; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.call_ups (id, event_id, team_id, called_up_athletes, attendances, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: catalogo_fatura_itens; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.catalogo_fatura_itens (id, descricao, valor_unitario, imposto_percentual, tipo, ativo, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: centro_custo_user; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.centro_custo_user (id, user_id, centro_custo_id, peso, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: club_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.club_settings (id, nome_clube, sigla, morada, codigo_postal, localidade, telefone, email, website, nif, logo_url, horario_funcionamento, redes_sociais, iban, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: communications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.communications (id, assunto, mensagem, tipo, destinatarios, estado, agendado_para, enviado_em, total_enviados, total_falhados, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: competition_registrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.competition_registrations (id, prova_id, user_id, estado, valor_inscricao, fatura_id, movimento_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: competitions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.competitions (id, nome, local, data_inicio, data_fim, tipo, evento_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: convocation_athletes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.convocation_athletes (convocatoria_grupo_id, atleta_id, provas, presente, confirmado, created_at, updated_at, estafetas) FROM stdin;
\.


--
-- Data for Name: convocation_groups; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.convocation_groups (id, evento_id, data_criacao, criado_por, atletas_ids, hora_encontro, local_encontro, observacoes, tipo_custo, valor_por_salto, valor_por_estafeta, valor_inscricao_unitaria, valor_inscricao_calculado, movimento_id, created_at, updated_at, centro_custo_id) FROM stdin;
c324ab64-6806-4e33-8759-21667abb4ace	a1363212-74f4-4f30-a331-c17f524088af	2026-03-05 16:00:02	a1284fe5-d152-4701-8b68-6ebbd28496de	["a12df0b0-e7b4-4df2-ae78-c09bc21f9cf1","a13bf74c-0bbe-4cbc-8679-428e8ac29a44"]	08:00:00	Benedita	\N	por_salto	\N	\N	\N	8.00	a13c6b9c-5290-4b06-aade-255f3b3808b2	2026-03-05 16:00:03	2026-03-06 14:52:35	a12862b4-24f8-41dc-9eff-a41872a3d053
\.


--
-- Data for Name: convocation_movement_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.convocation_movement_items (id, movimento_convocatoria_id, descricao, valor, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: convocation_movements; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.convocation_movements (id, user_id, convocatoria_grupo_id, evento_id, evento_nome, tipo, data_emissao, valor, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cost_centers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.cost_centers (id, codigo, nome, descricao, ativo, created_at, updated_at, tipo, orcamento) FROM stdin;
a12862b3-e35b-4cfd-a29f-37dd7d957e73	CC-MASTER	Master	Masters	t	2026-02-24 15:51:07	2026-02-24 15:51:07	equipa	\N
a12862b4-24f8-41dc-9eff-a41872a3d053	CC-CADETES	Cadetes	Cadetes	t	2026-02-24 15:51:07	2026-02-24 15:51:07	equipa	\N
a12862b4-6369-46d0-8389-ba1c458a2bef	CC-INFANTIS	Infantis	Infantis	t	2026-02-24 15:51:07	2026-02-24 15:51:07	equipa	\N
a12862b4-a1b5-47ae-b077-39500c06d48c	CC-JUVENIS	Juvenis	Juvenis	t	2026-02-24 15:51:07	2026-02-24 15:51:07	equipa	\N
a12862b4-e014-4052-a6b3-07934cfa65b9	CC-SENIORES	Seniores	Seniores	t	2026-02-24 15:51:07	2026-02-24 15:51:07	equipa	\N
a12862b5-1e93-4153-aca9-bcf8295201e6	CC-BSCNGERAL	BSCN - Geral	Geral	t	2026-02-24 15:51:08	2026-02-24 15:51:08	departamento	\N
\.


--
-- Data for Name: dados_financeiros; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.dados_financeiros (id, user_id, mensalidade_id, conta_corrente_manual, created_at, updated_at) FROM stdin;
a12df0b1-2916-4ccf-bc6c-d68064ff0a3f	a12df0b0-e7b4-4df2-ae78-c09bc21f9cf1	a12860db-c6c0-4ac2-b3a5-330e5290176b	0.00	2026-02-27 10:07:17	2026-02-27 10:07:17
a12df159-b496-46a6-83f8-2ab67fcd3979	a12df159-77ae-414f-ba57-52580bb5f63f	a12860db-4a33-42ef-9bdd-45b1b122989c	0.00	2026-02-27 10:09:07	2026-02-27 10:09:07
a12df226-1825-4e50-85ff-3755c47797c3	a12df225-db2d-43fd-955f-0e4e3b0d1269	a12860db-4a33-42ef-9bdd-45b1b122989c	0.00	2026-02-27 10:11:21	2026-02-27 10:11:21
a13478c1-a520-48c4-aa8a-6c0d12d6627f	a1284fe5-d152-4701-8b68-6ebbd28496de	\N	0.00	2026-03-02 16:02:43	2026-03-02 16:02:43
a13bf74c-4b7f-4484-837f-f1567c424138	a13bf74c-0bbe-4cbc-8679-428e8ac29a44	a12860db-c6c0-4ac2-b3a5-330e5290176b	0.00	2026-03-06 09:27:21	2026-03-06 09:27:21
a13c3bae-f2bd-4182-923c-53efb4b7b5f7	a13bfff7-9a81-4e3f-94e2-5d6231a7f9bb	\N	0.00	2026-03-06 12:38:34	2026-03-06 12:38:34
\.


--
-- Data for Name: event_age_group; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.event_age_group (event_id, age_group_id, created_at, updated_at) FROM stdin;
a12df37a-9432-4a09-a901-597be3054a4a	a12853e4-4d0a-43a4-8883-858eb79c08a1	2026-02-27 10:15:05	2026-02-27 10:15:05
a12df4bb-a9ed-44aa-b2d5-27b92be2aa94	a12853e3-926b-48d1-85a1-e7147c685436	2026-02-27 10:18:35	2026-02-27 10:18:35
a12df4bb-a9ed-44aa-b2d5-27b92be2aa94	a12853e3-d0ab-41fa-af30-ee1ebb2e9863	2026-02-27 10:18:35	2026-02-27 10:18:35
a12df4bb-a9ed-44aa-b2d5-27b92be2aa94	a12853e4-0ee1-4da6-8081-aa95e74dfe1b	2026-02-27 10:18:35	2026-02-27 10:18:35
a12df4bb-a9ed-44aa-b2d5-27b92be2aa94	a12853e4-4d0a-43a4-8883-858eb79c08a1	2026-02-27 10:18:35	2026-02-27 10:18:35
a1363212-74f4-4f30-a331-c17f524088af	a12853e3-147d-48ee-b1dd-a9a014d73457	2026-03-03 12:36:43	2026-03-03 12:36:43
\.


--
-- Data for Name: event_attendances; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.event_attendances (id, evento_id, user_id, estado, hora_chegada, observacoes, registado_por, registado_em, created_at, updated_at, provas) FROM stdin;
a12df4bc-b9bf-4617-a8a4-e741010bcdd2	a12df4bb-a9ed-44aa-b2d5-27b92be2aa94	a12df159-77ae-414f-ba57-52580bb5f63f	presente	\N	Adicionado automaticamente	a1284fe5-d152-4701-8b68-6ebbd28496de	2026-02-27 10:18:36	2026-02-27 10:18:36	2026-02-27 11:03:03	\N
a12df4bc-da0e-48db-b873-a8b9c7771b39	a12df4bb-a9ed-44aa-b2d5-27b92be2aa94	a12df225-db2d-43fd-955f-0e4e3b0d1269	presente	\N	Adicionado automaticamente	a1284fe5-d152-4701-8b68-6ebbd28496de	2026-02-27 10:18:36	2026-02-27 10:18:36	2026-02-27 11:03:39	\N
a13bf0d3-1192-472e-89bc-4151a2166a51	a1363212-74f4-4f30-a331-c17f524088af	a12df0b0-e7b4-4df2-ae78-c09bc21f9cf1	pendente	\N	\N	a1284fe5-d152-4701-8b68-6ebbd28496de	2026-03-06 14:52:32	2026-03-06 09:09:15	2026-03-06 14:52:32	["a1285ca4-723d-4b7c-a5b8-228b6bf59090","a1285ca6-1d37-448b-ad84-40f638aa0d3d"]
a13c3c5a-6146-44bc-97f8-b32993e2ed4e	a1363212-74f4-4f30-a331-c17f524088af	a13bf74c-0bbe-4cbc-8679-428e8ac29a44	pendente	\N	\N	a1284fe5-d152-4701-8b68-6ebbd28496de	2026-03-06 14:52:33	2026-03-06 12:40:26	2026-03-06 14:52:33	["a1285ca4-b152-4140-875f-f3ba4decc24c","a1285ca4-edb9-4759-9fc3-94a7e981e18a"]
\.


--
-- Data for Name: event_convocations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.event_convocations (id, evento_id, user_id, data_convocatoria, estado_confirmacao, data_resposta, justificacao, observacoes, transporte_clube, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: event_participants; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.event_participants (id, event_id, user_id, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: event_results; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.event_results (id, evento_id, user_id, prova, tempo, classificacao, piscina, age_group_snapshot_id, observacoes, epoca, registado_por, registado_em, created_at, updated_at) FROM stdin;
a12df62f-564b-4784-90bf-646a65a199e9	a12df37a-9432-4a09-a901-597be3054a4a	a12df0b0-e7b4-4df2-ae78-c09bc21f9cf1	100 Livres	01:00,25	1	25m	a12853e3-147d-48ee-b1dd-a9a014d73457	\N	2025/2026	a1284fe5-d152-4701-8b68-6ebbd28496de	2026-02-27 10:22:38	2026-02-27 10:22:39	2026-02-27 10:22:39
\.


--
-- Data for Name: event_type_configs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.event_type_configs (id, nome, cor, icon, ativo, gera_taxa, requer_convocatoria, requer_transporte, visibilidade_default, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: event_types; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.event_types (id, nome, descricao, categoria, cor, ativo, created_at, updated_at, icon, visibilidade_default, gera_taxa, permite_convocatoria, requer_transporte, gera_presencas) FROM stdin;
a128651f-aed2-4c03-9d91-1f4f642a63da	Estágio	Estágio/concentração desportiva	evento	#4dabf7	t	2026-02-24 15:57:53	2026-02-24 16:39:33	dumbbell	restrito	t	t	t	t
a1286520-2880-4511-845c-10f957e70f0a	Treino	Sessão de treino	treino	#51cf66	t	2026-02-24 15:57:53	2026-02-24 16:39:33	swimmer	privado	f	t	f	t
a128651f-ebae-4175-baf3-df5d9263bed0	Reunião	Reunião geral	Evento	#ffd43b	t	2026-02-24 15:57:53	2026-02-24 16:45:04	users	restrito	f	f	f	f
a128651f-6ff9-4a96-a4fd-13b7b9335f67	Prova	Prova desportiva oficial	prova	#ff6b6b	t	2026-02-24 15:57:53	2026-03-03 12:34:40	medal	publico	t	t	t	t
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.events (id, titulo, descricao, data_inicio, hora_inicio, data_fim, hora_fim, local, local_detalhes, tipo, tipo_config_id, tipo_piscina, visibilidade, transporte_necessario, transporte_detalhes, hora_partida, local_partida, taxa_inscricao, custo_inscricao_por_prova, custo_inscricao_por_salto, custo_inscricao_estafeta, centro_custo_id, observacoes, convocatoria_ficheiro, regulamento_ficheiro, estado, criado_por, recorrente, recorrencia_data_inicio, recorrencia_data_fim, recorrencia_dias_semana, evento_pai_id, created_at, updated_at) FROM stdin;
a12df37a-9432-4a09-a901-597be3054a4a	Prova teste Master	Prova teste Master	2026-03-05	09:00:00	2026-03-05	18:00:00	Benedita	Benedita	prova	\N	piscina_25m	publico	f	\N	\N	\N	8.00	\N	\N	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	\N	\N	\N	agendado	a1284fe5-d152-4701-8b68-6ebbd28496de	f	\N	\N	[]	\N	2026-02-27 10:15:04	2026-02-27 10:15:04
a12df4bb-a9ed-44aa-b2d5-27b92be2aa94	Treino teste	Treino Teste	2026-03-03	06:00:00	2026-03-03	08:00:00	Benedita	\N	treino	\N	\N	publico	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	agendado	a1284fe5-d152-4701-8b68-6ebbd28496de	f	\N	\N	[]	\N	2026-02-27 10:18:35	2026-02-27 10:18:35
a1363212-74f4-4f30-a331-c17f524088af	Prova Cadetes teste	Prova teste	2026-03-09	09:00:00	2026-03-09	18:00:00	Benedita	\N	prova	\N	piscina_25m	publico	f	\N	\N	\N	8.00	\N	\N	\N	a12862b4-24f8-41dc-9eff-a41872a3d053	\N	\N	\N	agendado	a1284fe5-d152-4701-8b68-6ebbd28496de	f	\N	\N	[]	\N	2026-03-03 12:36:43	2026-03-03 12:36:43
\.


--
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- Data for Name: financial_categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.financial_categories (id, name, type, color, active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: financial_entries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.financial_entries (id, data, tipo, categoria, descricao, valor, centro_custo_id, user_id, fatura_id, metodo_pagamento, comprovativo, created_at, updated_at, origem_tipo, origem_id, documento_ref) FROM stdin;
\.


--
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.invoice_items (id, fatura_id, descricao, valor_unitario, quantidade, imposto_percentual, total_linha, produto_id, centro_custo_id, created_at, updated_at) FROM stdin;
a13485ba-5a35-4c26-9445-6d13cd6a71ce	a13485ba-385b-4cf5-b18c-81db33d549e0	Master 2x	25.00	1	0.00	25.00	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	2026-03-02 16:38:59	2026-03-02 16:38:59
a13485bc-64ce-4344-96b2-14891204a190	a13485bc-4619-408c-b746-8e348c8c2955	Master 2x	25.00	1	0.00	25.00	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	2026-03-02 16:39:00	2026-03-02 16:39:00
a13485be-6e2e-42a2-805e-f9957608306b	a13485be-4f89-4bfb-865e-2c8919af928f	Master 2x	25.00	1	0.00	25.00	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	2026-03-02 16:39:02	2026-03-02 16:39:02
a13485c0-8976-49b3-8c4f-5d606a9cef42	a13485c0-6a67-4d45-b41c-18a010ef2677	Master 2x	25.00	1	0.00	25.00	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	2026-03-02 16:39:03	2026-03-02 16:39:03
a13485c2-94d0-4a72-9ead-a6e9fbd4ed20	a13485c2-75fe-4e32-a3e4-4b80ebeea323	Master 2x	25.00	1	0.00	25.00	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	2026-03-02 16:39:04	2026-03-02 16:39:04
a13485c4-c780-4f1e-8ee4-a70539348ac6	a13485c4-a86f-48ec-a9c6-b4b4d462ac8c	Master 2x	25.00	1	0.00	25.00	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	2026-03-02 16:39:06	2026-03-02 16:39:06
a13485c6-cfec-4264-a7a3-89d1a3045db9	a13485c6-b141-4ce7-bd1a-61717621d2bf	Master 2x	25.00	1	0.00	25.00	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	2026-03-02 16:39:07	2026-03-02 16:39:07
a13485c8-de98-4eae-b8cb-a4f2446da95d	a13485c8-bf6f-458e-ad47-76ac372d82cc	Cadetes	30.00	1	0.00	30.00	\N	a12862b4-24f8-41dc-9eff-a41872a3d053	2026-03-02 16:39:09	2026-03-02 16:39:09
a13485ca-eb10-48c4-9d04-3a44c899712a	a13485ca-cc57-41c5-81b2-1a7f2b85ba27	Cadetes	30.00	1	0.00	30.00	\N	a12862b4-24f8-41dc-9eff-a41872a3d053	2026-03-02 16:39:10	2026-03-02 16:39:10
a13485cd-0fc9-4ab8-ad3b-9ed2e110f5cd	a13485cc-f04f-4e8f-825d-5a0c484952b4	Cadetes	30.00	1	0.00	30.00	\N	a12862b4-24f8-41dc-9eff-a41872a3d053	2026-03-02 16:39:11	2026-03-02 16:39:11
a13485cf-1e8c-42ea-8cf8-a196fbc6e724	a13485ce-ffd2-4db5-afca-a07595523fc2	Cadetes	30.00	1	0.00	30.00	\N	a12862b4-24f8-41dc-9eff-a41872a3d053	2026-03-02 16:39:13	2026-03-02 16:39:13
a13485d1-2cf2-4084-be3a-5af051d84741	a13485d1-0dfb-4fb2-a39c-51aac6fc3ca4	Cadetes	30.00	1	0.00	30.00	\N	a12862b4-24f8-41dc-9eff-a41872a3d053	2026-03-02 16:39:14	2026-03-02 16:39:14
a13485d3-3d1a-4e19-a91e-6663793a6ecc	a13485d3-1e68-43e0-906d-9c6656659652	Cadetes	30.00	1	0.00	30.00	\N	a12862b4-24f8-41dc-9eff-a41872a3d053	2026-03-02 16:39:15	2026-03-02 16:39:15
a13485d5-44ba-4eb1-b252-cfe7bb330b12	a13485d5-2613-46bb-bbd5-8522ff1b9d4c	Cadetes	30.00	1	0.00	30.00	\N	a12862b4-24f8-41dc-9eff-a41872a3d053	2026-03-02 16:39:17	2026-03-02 16:39:17
a13485d7-6347-4901-94e5-1b71ea3824b2	a13485d7-448e-4e33-b074-337b2ec008b3	Master 2x	25.00	1	0.00	25.00	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	2026-03-02 16:39:18	2026-03-02 16:39:18
a13485d9-7b96-466c-9071-3c21a2eee0d3	a13485d9-5c89-48da-8350-ca3b6cbe5ac5	Master 2x	25.00	1	0.00	25.00	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	2026-03-02 16:39:19	2026-03-02 16:39:19
a13485db-935b-4309-9271-3da5a8f84b55	a13485db-73e9-4c8a-ac52-e16da6c0dacc	Master 2x	25.00	1	0.00	25.00	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	2026-03-02 16:39:21	2026-03-02 16:39:21
a13485dd-a319-4361-a67c-c1a3e58258c6	a13485dd-848c-48f1-b5b8-d6fec6375ed7	Master 2x	25.00	1	0.00	25.00	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	2026-03-02 16:39:22	2026-03-02 16:39:22
a13485df-ab28-40d1-81c1-c2eb535346ad	a13485df-8c91-4958-ac0f-152b6f33b1f8	Master 2x	25.00	1	0.00	25.00	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	2026-03-02 16:39:23	2026-03-02 16:39:23
a13485e1-b6c8-453a-ad8b-0a188aef3191	a13485e1-9804-4544-a4d9-896771270c0e	Master 2x	25.00	1	0.00	25.00	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	2026-03-02 16:39:25	2026-03-02 16:39:25
a13485e3-c473-450e-bde1-28fb2f2bd46f	a13485e3-a542-4c85-99d6-2a14f711f2ad	Master 2x	25.00	1	0.00	25.00	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	2026-03-02 16:39:26	2026-03-02 16:39:26
\.


--
-- Data for Name: invoice_types; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.invoice_types (id, codigo, nome, descricao, ativo, created_at, updated_at) FROM stdin;
926aa4c6-fc8f-458d-b20e-b51d3a0812c0	mensalidade	Mensalidade	Fatura mensal de inscricao	t	2026-02-24 14:46:09	2026-02-24 14:46:09
f1abdd21-dacc-4c53-8c6d-10e2a0702dd8	inscricao	Inscricao	Fatura de inscricao	t	2026-02-24 14:46:09	2026-02-24 14:46:09
7ff0f463-e2d0-4828-9f71-9f4d46f17f8a	material	Material	Venda de material	t	2026-02-24 14:46:09	2026-02-24 14:46:09
78aac1a9-d2ce-40e5-9f88-2568b89e1c7a	servico	Servico	Prestacao de servicos	t	2026-02-24 14:46:09	2026-02-24 14:46:09
035aaa86-f573-47ca-beb4-8c5bf159f289	outro	Outro	\N	t	2026-02-24 14:46:09	2026-02-24 14:46:09
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.invoices (id, user_id, data_fatura, mes, data_emissao, data_vencimento, valor_total, estado_pagamento, numero_recibo, referencia_pagamento, centro_custo_id, tipo, observacoes, created_at, updated_at, oculta, origem_tipo, origem_id) FROM stdin;
a13485ba-385b-4cf5-b18c-81db33d549e0	a12df225-db2d-43fd-955f-0e4e3b0d1269	2026-01-01	2026-01	2026-01-01	2026-01-13	25.00	pendente	\N	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	mensalidade	\N	2026-03-02 16:38:59	2026-03-02 16:38:59	f	\N	\N
a13485bc-4619-408c-b746-8e348c8c2955	a12df225-db2d-43fd-955f-0e4e3b0d1269	2026-02-01	2026-02	2026-02-01	2026-02-11	25.00	pendente	\N	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	mensalidade	\N	2026-03-02 16:39:00	2026-03-02 16:39:00	f	\N	\N
a13485be-4f89-4bfb-865e-2c8919af928f	a12df225-db2d-43fd-955f-0e4e3b0d1269	2026-03-01	2026-03	2026-03-01	2026-03-11	25.00	pendente	\N	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	mensalidade	\N	2026-03-02 16:39:02	2026-03-02 16:39:02	f	\N	\N
a13485c0-6a67-4d45-b41c-18a010ef2677	a12df225-db2d-43fd-955f-0e4e3b0d1269	2026-04-01	2026-04	2026-04-01	2026-04-13	25.00	pendente	\N	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	mensalidade	\N	2026-03-02 16:39:03	2026-03-02 16:39:03	t	\N	\N
a13485c2-75fe-4e32-a3e4-4b80ebeea323	a12df225-db2d-43fd-955f-0e4e3b0d1269	2026-05-01	2026-05	2026-05-01	2026-05-13	25.00	pendente	\N	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	mensalidade	\N	2026-03-02 16:39:04	2026-03-02 16:39:04	t	\N	\N
a13485c4-a86f-48ec-a9c6-b4b4d462ac8c	a12df225-db2d-43fd-955f-0e4e3b0d1269	2026-06-01	2026-06	2026-06-01	2026-06-11	25.00	pendente	\N	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	mensalidade	\N	2026-03-02 16:39:06	2026-03-02 16:39:06	t	\N	\N
a13485c6-b141-4ce7-bd1a-61717621d2bf	a12df225-db2d-43fd-955f-0e4e3b0d1269	2026-07-01	2026-07	2026-07-01	2026-07-13	25.00	pendente	\N	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	mensalidade	\N	2026-03-02 16:39:07	2026-03-02 16:39:07	t	\N	\N
a13485c8-bf6f-458e-ad47-76ac372d82cc	a12df0b0-e7b4-4df2-ae78-c09bc21f9cf1	2026-01-01	2026-01	2026-01-01	2026-01-13	30.00	pendente	\N	\N	a12862b4-24f8-41dc-9eff-a41872a3d053	mensalidade	\N	2026-03-02 16:39:08	2026-03-02 16:39:08	f	\N	\N
a13485ca-cc57-41c5-81b2-1a7f2b85ba27	a12df0b0-e7b4-4df2-ae78-c09bc21f9cf1	2026-02-01	2026-02	2026-02-01	2026-02-11	30.00	pendente	\N	\N	a12862b4-24f8-41dc-9eff-a41872a3d053	mensalidade	\N	2026-03-02 16:39:10	2026-03-02 16:39:10	f	\N	\N
a13485cc-f04f-4e8f-825d-5a0c484952b4	a12df0b0-e7b4-4df2-ae78-c09bc21f9cf1	2026-03-01	2026-03	2026-03-01	2026-03-11	30.00	pendente	\N	\N	a12862b4-24f8-41dc-9eff-a41872a3d053	mensalidade	\N	2026-03-02 16:39:11	2026-03-02 16:39:11	f	\N	\N
a13485ce-ffd2-4db5-afca-a07595523fc2	a12df0b0-e7b4-4df2-ae78-c09bc21f9cf1	2026-04-01	2026-04	2026-04-01	2026-04-13	30.00	pendente	\N	\N	a12862b4-24f8-41dc-9eff-a41872a3d053	mensalidade	\N	2026-03-02 16:39:13	2026-03-02 16:39:13	t	\N	\N
a13485d1-0dfb-4fb2-a39c-51aac6fc3ca4	a12df0b0-e7b4-4df2-ae78-c09bc21f9cf1	2026-05-01	2026-05	2026-05-01	2026-05-13	30.00	pendente	\N	\N	a12862b4-24f8-41dc-9eff-a41872a3d053	mensalidade	\N	2026-03-02 16:39:14	2026-03-02 16:39:14	t	\N	\N
a13485d3-1e68-43e0-906d-9c6656659652	a12df0b0-e7b4-4df2-ae78-c09bc21f9cf1	2026-06-01	2026-06	2026-06-01	2026-06-11	30.00	pendente	\N	\N	a12862b4-24f8-41dc-9eff-a41872a3d053	mensalidade	\N	2026-03-02 16:39:15	2026-03-02 16:39:15	t	\N	\N
a13485d5-2613-46bb-bbd5-8522ff1b9d4c	a12df0b0-e7b4-4df2-ae78-c09bc21f9cf1	2026-07-01	2026-07	2026-07-01	2026-07-13	30.00	pendente	\N	\N	a12862b4-24f8-41dc-9eff-a41872a3d053	mensalidade	\N	2026-03-02 16:39:17	2026-03-02 16:39:17	t	\N	\N
a13485d7-448e-4e33-b074-337b2ec008b3	a12df159-77ae-414f-ba57-52580bb5f63f	2026-01-01	2026-01	2026-01-01	2026-01-13	25.00	pendente	\N	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	mensalidade	\N	2026-03-02 16:39:18	2026-03-02 16:39:18	f	\N	\N
a13485d9-5c89-48da-8350-ca3b6cbe5ac5	a12df159-77ae-414f-ba57-52580bb5f63f	2026-02-01	2026-02	2026-02-01	2026-02-11	25.00	pendente	\N	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	mensalidade	\N	2026-03-02 16:39:19	2026-03-02 16:39:19	f	\N	\N
a13485db-73e9-4c8a-ac52-e16da6c0dacc	a12df159-77ae-414f-ba57-52580bb5f63f	2026-03-01	2026-03	2026-03-01	2026-03-11	25.00	pendente	\N	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	mensalidade	\N	2026-03-02 16:39:21	2026-03-02 16:39:21	f	\N	\N
a13485dd-848c-48f1-b5b8-d6fec6375ed7	a12df159-77ae-414f-ba57-52580bb5f63f	2026-04-01	2026-04	2026-04-01	2026-04-13	25.00	pendente	\N	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	mensalidade	\N	2026-03-02 16:39:22	2026-03-02 16:39:22	t	\N	\N
a13485df-8c91-4958-ac0f-152b6f33b1f8	a12df159-77ae-414f-ba57-52580bb5f63f	2026-05-01	2026-05	2026-05-01	2026-05-13	25.00	pendente	\N	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	mensalidade	\N	2026-03-02 16:39:23	2026-03-02 16:39:23	t	\N	\N
a13485e1-9804-4544-a4d9-896771270c0e	a12df159-77ae-414f-ba57-52580bb5f63f	2026-06-01	2026-06	2026-06-01	2026-06-11	25.00	pendente	\N	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	mensalidade	\N	2026-03-02 16:39:25	2026-03-02 16:39:25	t	\N	\N
a13485e3-a542-4c85-99d6-2a14f711f2ad	a12df159-77ae-414f-ba57-52580bb5f63f	2026-07-01	2026-07	2026-07-01	2026-07-13	25.00	pendente	\N	\N	a12862b3-e35b-4cfd-a29f-37dd7d957e73	mensalidade	\N	2026-03-02 16:39:26	2026-03-02 16:39:26	t	\N	\N
\.


--
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
\.


--
-- Data for Name: macrocycles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.macrocycles (id, epoca_id, nome, tipo, data_inicio, data_fim, escalao, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mapa_conciliacao; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.mapa_conciliacao (id, extrato_id, lancamento_id, status, regra_usada, created_at, updated_at, fatura_id, movimento_id, estado_fatura_anterior, estado_movimento_anterior, valor_conciliado) FROM stdin;
\.


--
-- Data for Name: marketing_campaigns; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.marketing_campaigns (id, name, description, type, start_date, end_date, status, budget, estimated_reach, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: membership_fees; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.membership_fees (id, user_id, month, year, amount, status, payment_date, transaction_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mesocycles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.mesocycles (id, macrociclo_id, nome, foco, data_inicio, data_fim, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: microcycles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.microcycles (id, mesociclo_id, semana, volume_previsto, notas, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2026_01_29_163055_add_spark_fields_to_users_table	1
5	2026_01_29_163144_create_age_groups_table	1
6	2026_01_29_163144_create_user_types_table	1
7	2026_01_29_163145_create_club_settings_table	1
8	2026_01_29_163145_create_cost_centers_table	1
9	2026_01_29_163145_create_event_types_table	1
10	2026_01_29_163654_create_personal_access_tokens_table	1
11	2026_01_30_150000_extend_users_table_complete	1
12	2026_01_30_150001_create_event_type_configs_table	1
14	2026_01_30_150002_create_events_table	2
15	2026_01_30_150003_1_create_event_age_group_pivot_table	2
16	2026_01_30_150003_create_event_convocations_table	2
17	2026_01_30_150004_create_convocation_groups_table	2
18	2026_01_30_150005_create_convocation_athletes_table	2
19	2026_01_30_150006_create_event_attendances_table	2
20	2026_01_30_150007_create_event_results_table	3
21	2026_01_30_150008_create_result_provas_table	3
22	2026_01_30_150009_create_seasons_table	3
23	2026_01_30_150010_create_macrocycles_table	3
24	2026_01_30_150011_create_mesocycles_table	3
25	2026_01_30_150012_create_microcycles_table	3
26	2026_01_30_150013_create_trainings_table	3
27	2026_01_30_150014_create_training_series_table	3
28	2026_01_30_150015_create_training_athletes_table	3
29	2026_01_30_150016_create_athlete_sports_data_table	3
30	2026_01_30_150017_create_presences_table	3
31	2026_01_30_150018_create_competitions_table	3
32	2026_01_30_150019_create_provas_table	3
33	2026_01_30_150020_create_competition_registrations_table	3
34	2026_01_30_150021_create_results_table	3
35	2026_01_30_150022_create_result_splits_table	3
36	2026_01_30_150023_create_monthly_fees_table	3
37	2026_01_30_150024_create_invoices_table	3
38	2026_01_30_150025_create_invoice_items_table	3
39	2026_01_30_150026_create_movements_table	3
40	2026_01_30_150027_create_movement_items_table	3
41	2026_01_30_150028_create_convocation_movements_table	3
42	2026_01_30_150029_create_convocation_movement_items_table	3
43	2026_01_30_150030_create_financial_entries_table	3
44	2026_01_30_150031_create_bank_statements_table	3
45	2026_01_30_150032_create_products_table	3
46	2026_01_30_150033_create_sales_table	3
47	2026_01_30_150034_create_sponsors_table	3
48	2026_01_30_150035_create_news_items_table	3
49	2026_01_30_150036_create_communications_table	3
50	2026_01_30_150037_create_automated_communications_table	3
51	2026_02_01_000000_create_marketing_campaigns_table	3
52	2026_02_01_020000_create_financial_categories_table	3
53	2026_02_01_020001_create_transactions_table	3
54	2026_02_01_020002_create_membership_fees_table	3
55	2026_02_01_023200_create_teams_table	3
56	2026_02_01_023201_create_team_members_table	3
57	2026_02_01_023202_create_training_sessions_table	3
58	2026_02_01_023203_create_call_ups_table	3
59	2026_02_01_024146_create_user_documents_table	3
60	2026_02_01_024147_create_user_relationships_table	3
61	2026_02_02_170430_create_user_user_type_pivot_table	3
62	2026_02_02_170506_create_event_participants_pivot_table	3
63	2026_02_04_000001_normalize_transactions_to_portuguese	3
64	2026_02_04_000002_normalize_teams_to_portuguese	3
65	2026_02_04_000003_normalize_training_sessions_to_portuguese	3
66	2026_02_04_000004_normalize_user_types_to_portuguese	3
67	2026_02_04_000005_normalize_age_groups_to_portuguese	3
68	2026_02_04_000006_normalize_event_types_to_portuguese	3
69	2026_02_04_000007_normalize_cost_centers_to_portuguese	3
70	2026_02_04_120000_create_user_guardian_pivot_table	3
71	2026_02_04_174306_create_user_types_table	3
72	2026_02_05_000001_create_suppliers_table	3
73	2026_02_05_000002_create_user_type_permissions_table	3
74	2026_02_05_000003_create_notification_preferences_table	3
75	2026_02_05_000004_create_prova_tipos_table	3
76	2026_02_05_000005_add_age_group_to_monthly_fees_table	3
77	2026_02_05_000006_add_fields_to_cost_centers_table	3
78	2026_02_06_000001_add_scope_fields_to_user_type_permissions_table	3
79	2026_02_09_120000_add_financeiro_origem_fields	3
80	2026_02_09_130000_create_invoice_types_table	3
81	2026_02_11_000001_create_dados_financeiros_table	3
82	2026_02_11_000002_create_centro_custo_user_table	3
83	2026_02_11_000003_create_catalogo_fatura_itens_table	3
84	2026_02_11_000004_create_mapa_conciliacao_table	3
85	2026_02_11_000005_add_financial_columns_to_invoices	3
86	2026_02_11_000006_add_financial_columns_to_financial_entries	3
87	2026_02_11_000007_add_ficheiro_to_bank_statements	3
88	2026_02_11_000008_add_payment_fields_to_movements	3
89	2026_02_11_000009_add_documento_original_to_movements	3
90	2026_02_12_000001_add_fields_to_mapa_conciliacao_table	3
91	2026_02_12_000002_normalize_events_to_portuguese	3
92	2026_02_20_000010_add_estafetas_to_convocation_athletes_table	3
93	2026_02_23_114513_add_centro_custo_to_convocation_groups	3
94	2026_02_24_000001_make_competicao_id_nullable_in_provas	4
95	2026_02_24_000002_add_configuration_fields_to_event_types_table	5
96	2026_02_24_000003_rename_requer_convocatoria_to_permite_convocatoria	6
97	2026_03_05_000000_add_provas_to_event_attendances	7
98	2026_03_06_000001_enhance_presences_table_for_desportivo	8
\.


--
-- Data for Name: monthly_fees; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.monthly_fees (id, designacao, valor, ativo, created_at, updated_at, age_group_id) FROM stdin;
a12860db-0800-40d8-96f3-afc8a05052b2	Master 3x	30.00	t	2026-02-24 15:45:57	2026-02-24 15:45:57	a12853e4-4d0a-43a4-8883-858eb79c08a1
a12860db-4a33-42ef-9bdd-45b1b122989c	Master 2x	25.00	t	2026-02-24 15:45:57	2026-02-24 15:45:57	a12853e4-4d0a-43a4-8883-858eb79c08a1
a12860db-86a3-468a-b040-ce60fc4b4aa3	Master >3x	35.00	t	2026-02-24 15:45:57	2026-02-24 15:45:57	a12853e4-4d0a-43a4-8883-858eb79c08a1
a12860db-c6c0-4ac2-b3a5-330e5290176b	Cadetes	30.00	t	2026-02-24 15:45:57	2026-02-24 15:45:57	a12853e3-147d-48ee-b1dd-a9a014d73457
a12860dc-0675-4ba7-996d-af08f82bfb6c	Cadete 2x	25.00	t	2026-02-24 15:45:57	2026-02-24 15:45:57	a12853e3-147d-48ee-b1dd-a9a014d73457
a12860dc-42f9-47aa-ba24-3f368e4d66a6	Infantil	35.00	t	2026-02-24 15:45:58	2026-02-24 15:45:58	a12853e3-542b-4af3-81d9-aa48747b2c4d
a12860dc-7f62-4094-a490-6d8683bd771a	Juvenil	35.00	t	2026-02-24 15:45:58	2026-02-24 15:45:58	a12853e3-926b-48d1-85a1-e7147c685436
a12860dc-bbd6-4459-9551-705188067986	Juniores	35.00	t	2026-02-24 15:45:58	2026-02-24 15:45:58	a12853e3-d0ab-41fa-af30-ee1ebb2e9863
a12860dc-fa6f-400a-9b87-65493da0a6ac	Senior	35.00	t	2026-02-24 15:45:58	2026-02-24 15:45:58	a12853e4-0ee1-4da6-8081-aa95e74dfe1b
\.


--
-- Data for Name: movement_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.movement_items (id, movimento_id, descricao, valor_unitario, quantidade, imposto_percentual, total_linha, produto_id, centro_custo_id, fatura_id, created_at, updated_at) FROM stdin;
a13c6b9c-74a0-48dc-8055-b6ac78d7a471	a13c6b9c-5290-4b06-aade-255f3b3808b2	Atleta Teste 1 - Prova Cadetes teste	8.00	1	0.00	8.00	\N	a12862b4-24f8-41dc-9eff-a41872a3d053	\N	2026-03-06 14:52:35	2026-03-06 14:52:35
a13c6b9c-9491-436c-84d6-7f47d31f2981	a13c6b9c-5290-4b06-aade-255f3b3808b2	Atleta teste 4 - Prova Cadetes teste	8.00	1	0.00	8.00	\N	a12862b4-24f8-41dc-9eff-a41872a3d053	\N	2026-03-06 14:52:35	2026-03-06 14:52:35
\.


--
-- Data for Name: movements; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.movements (id, user_id, nome_manual, nif_manual, morada_manual, classificacao, data_emissao, data_vencimento, valor_total, estado_pagamento, numero_recibo, referencia_pagamento, centro_custo_id, tipo, observacoes, created_at, updated_at, origem_tipo, origem_id, metodo_pagamento, comprovativo, documento_original) FROM stdin;
a13c6b9c-5290-4b06-aade-255f3b3808b2	\N	Convocatoria Prova Cadetes teste	\N	\N	despesa	2026-03-05	2026-03-09	-16.00	pendente	\N	\N	a12862b4-24f8-41dc-9eff-a41872a3d053	inscricao	Convocatoria (2 atletas)	2026-03-06 14:52:35	2026-03-06 14:52:35	evento	a1363212-74f4-4f30-a331-c17f524088af	\N	\N	\N
\.


--
-- Data for Name: news_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.news_items (id, titulo, conteudo, imagem, destaque, autor, data_publicacao, categorias, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notification_preferences; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notification_preferences (id, email_notificacoes, alertas_pagamento, alertas_atividade, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: presences; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.presences (id, user_id, data, treino_id, tipo, justificacao, presente, created_at, updated_at, escalao_id, status, distancia_realizada_m, classificacao, notas) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.products (id, nome, descricao, codigo, categoria, preco, stock, stock_minimo, imagem, ativo, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: prova_tipos; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.prova_tipos (id, nome, distancia, unidade, modalidade, ativo, created_at, updated_at) FROM stdin;
a1285ca4-723d-4b7c-a5b8-228b6bf59090	50 Livres	50	m	Natação	t	2026-02-24 15:34:10	2026-02-24 15:34:10
a1285ca4-b152-4140-875f-f3ba4decc24c	100 Livres	100	m	Natação	t	2026-02-24 15:34:10	2026-02-24 15:34:10
a1285ca4-edb9-4759-9fc3-94a7e981e18a	200 Livres	200	m	Natação	t	2026-02-24 15:34:10	2026-02-24 15:34:10
a1285ca5-2a3f-4303-9a7f-163016e7281b	400 Livres	400	m	Natação	t	2026-02-24 15:34:10	2026-02-24 15:34:10
a1285ca5-66f3-4d90-90a7-df2f828e5433	800 Livres	800	m	Natação	t	2026-02-24 15:34:11	2026-02-24 15:34:11
a1285ca5-a3be-4f98-b820-d75ead3c656e	1500 Livres	1500	m	Natação	t	2026-02-24 15:34:11	2026-02-24 15:34:11
a1285ca5-e0b4-467b-b487-da16f8206cec	50 Costas	50	m	Natação	t	2026-02-24 15:34:11	2026-02-24 15:34:11
a1285ca6-1d37-448b-ad84-40f638aa0d3d	100 Costas	100	m	Natação	t	2026-02-24 15:34:11	2026-02-24 15:34:11
a1285ca6-59bf-4982-9ae6-f66e31aac288	200 Costas	200	m	Natação	t	2026-02-24 15:34:11	2026-02-24 15:34:11
a1285ca6-9645-4bb4-ad0e-4f6bd87114f1	50 Bruços	50	m	Natação	t	2026-02-24 15:34:11	2026-02-24 15:34:11
a1285ca6-d2ea-4b09-8740-1a164dac3761	100 Bruços	100	m	Natação	t	2026-02-24 15:34:12	2026-02-24 15:34:12
a1285ca7-0f9d-476c-a204-1ef98b475d36	200 Bruços	200	m	Natação	t	2026-02-24 15:34:12	2026-02-24 15:34:12
a1285ca7-4ca3-4f08-b175-44a4aa7e5c43	50 Mariposa	50	m	Natação	t	2026-02-24 15:34:12	2026-02-24 15:34:12
a1285ca7-8927-4737-aa56-2bc1013c0770	100 Mariposa	100	m	Natação	t	2026-02-24 15:34:12	2026-02-24 15:34:12
a1285ca7-c5c8-4494-a500-6e6f0ffd2845	200 Mariposa	200	m	Natação	t	2026-02-24 15:34:12	2026-02-24 15:34:12
a1285ca8-0252-406d-afc3-e4655620a585	100 Estilos	100	m	Natação (Piscina Curta)	t	2026-02-24 15:34:12	2026-02-24 15:34:12
a1285ca8-3f18-49c8-882a-22dbd788279c	200 Estilos	200	m	Natação	t	2026-02-24 15:34:12	2026-02-24 15:34:12
a1285ca8-7b98-497d-b2c6-154f25719498	400 Estilos	400	m	Natação	t	2026-02-24 15:34:13	2026-02-24 15:34:13
a1285ca8-bb34-4e61-ae9d-47a5d1420485	4x50 Livres	200	m	Natação (Piscina Curta)	t	2026-02-24 15:34:13	2026-02-24 15:34:13
a1285ca8-f7d0-45e6-ae96-c007e25b0272	4x100 Livres	400	m	Natação	t	2026-02-24 15:34:13	2026-02-24 15:34:13
a1285ca9-349a-4318-ac59-8278ede594ce	4x200 Livres	800	m	Natação	t	2026-02-24 15:34:13	2026-02-24 15:34:13
a1285ca9-7117-4255-aa33-c8c9c26a9422	4x50 Estilos	200	m	Natação (Piscina Curta)	t	2026-02-24 15:34:13	2026-02-24 15:34:13
a1285ca9-adaa-4641-9be5-1e383e9f2d8e	4x100 Estilos	400	m	Natação	t	2026-02-24 15:34:13	2026-02-24 15:34:13
a1285ca9-ea26-4f97-9a4f-c326a41320fe	4x100 Livres Mista	400	m	Natação	t	2026-02-24 15:34:14	2026-02-24 15:34:14
a1285caa-26bc-4acb-b864-85316d1f84ca	4x100 Estilos Mista	400	m	Natação	t	2026-02-24 15:34:14	2026-02-24 15:34:14
a1285caa-6333-47f4-af51-770926cb6657	4x50 Livres Mista	200	m	Natação (Piscina Curta)	t	2026-02-24 15:34:14	2026-02-24 15:34:14
a1285caa-9fb4-4bdc-a950-5d093d1a4526	4x50 Estilos Mista	200	m	Natação (Piscina Curta)	t	2026-02-24 15:34:14	2026-02-24 15:34:14
\.


--
-- Data for Name: provas; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.provas (id, competicao_id, estilo, distancia_m, genero, escalao_id, ordem_prova, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: result_provas; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.result_provas (id, atleta_id, evento_id, evento_nome, prova, local, data, piscina, tempo_final, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: result_splits; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.result_splits (id, resultado_id, distancia_parcial_m, tempo_parcial, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: results; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.results (id, prova_id, user_id, tempo_oficial, posicao, pontos_fina, desclassificado, observacoes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sales (id, produto_id, quantidade, preco_unitario, total, cliente_id, vendedor_id, data, metodo_pagamento, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: seasons; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.seasons (id, nome, ano_temporada, data_inicio, data_fim, tipo, estado, piscina_principal, escaloes_abrangidos, descricao, provas_alvo, volume_total_previsto, volume_medio_semanal, num_semanas_previsto, num_competicoes_previstas, objetivos_performance, objetivos_tecnicos, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
\.


--
-- Data for Name: sponsors; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sponsors (id, nome, descricao, logo, website, contacto, email, tipo, valor_anual, data_inicio, data_fim, estado, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.suppliers (id, nome, nif, email, telefone, morada, categoria, ativo, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.team_members (id, team_id, user_id, "position", jersey_number, join_date, leave_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.teams (id, nome, escalao, treinador_id, ano_fundacao, ativo, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: training_athletes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.training_athletes (id, treino_id, user_id, presente, estado, volume_real_m, rpe, observacoes_tecnicas, registado_por, registado_em, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: training_series; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.training_series (id, treino_id, ordem, descricao_texto, distancia_total_m, zona_intensidade, estilo, repeticoes, intervalo, observacoes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: training_sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.training_sessions (id, equipa_id, data_hora, duracao_minutos, local, objetivos, estado, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: trainings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.trainings (id, numero_treino, data, hora_inicio, hora_fim, local, epoca_id, microciclo_id, grupo_escalao_id, escaloes, tipo_treino, volume_planeado_m, notas_gerais, descricao_treino, criado_por, evento_id, atualizado_em, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.transactions (id, user_id, category_id, descricao, valor, tipo, data, metodo_pagamento, recibo, estado, observacoes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_documents; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_documents (id, user_id, type, name, file_path, expiry_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_guardian; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_guardian (id, user_id, guardian_id, created_at, updated_at) FROM stdin;
a12df226-74c9-4b71-be7b-ebc0b1ef4335	a12df0b0-e7b4-4df2-ae78-c09bc21f9cf1	a12df225-db2d-43fd-955f-0e4e3b0d1269	2026-02-27 10:11:22	2026-02-27 10:11:22
a13bf74c-a661-4af4-bdf8-2dfefa8e014f	a13bf74c-0bbe-4cbc-8679-428e8ac29a44	a12df225-db2d-43fd-955f-0e4e3b0d1269	2026-03-06 09:27:21	2026-03-06 09:27:21
a13bfff7-fdd3-4531-9ddd-eff5194b9c95	a12df0b0-e7b4-4df2-ae78-c09bc21f9cf1	a13bfff7-9a81-4e3f-94e2-5d6231a7f9bb	2026-03-06 09:51:35	2026-03-06 09:51:35
\.


--
-- Data for Name: user_relationships; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_relationships (id, user_id, related_user_id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_type_permissions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_type_permissions (id, user_type_id, modulo, pode_ver, pode_editar, pode_eliminar, created_at, updated_at, submodulo, separador, campo, pode_criar) FROM stdin;
\.


--
-- Data for Name: user_types; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_types (id, nome, descricao, ativo, created_at, updated_at) FROM stdin;
a1285570-4485-48ee-b27d-21d81f8518b0	Atleta	Atleta	t	2026-02-24 15:14:01	2026-02-24 15:14:01
a1285570-84d0-4e52-a786-ba81607deffb	Treinador	Treinador	t	2026-02-24 15:14:02	2026-02-24 15:14:02
a1285570-c148-40ff-b624-adbec0b57ab1	Encarregado de Educação	Encarregado de Educação	t	2026-02-24 15:14:02	2026-02-24 15:14:02
a1285570-fdf1-47f6-bf85-077bc14aa582	Dirigente	Dirigente	t	2026-02-24 15:14:02	2026-02-24 15:14:02
a1285571-3a88-4272-bc8f-61d94dd3f9b0	Sócio	Sócio	t	2026-02-24 15:14:02	2026-02-24 15:14:02
\.


--
-- Data for Name: user_user_type; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_user_type (user_id, user_type_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, numero_socio, nome_completo, perfil, tipo_membro, estado, data_nascimento, menor, sexo, escalao, rgpd, consentimento, afiliacao, declaracao_de_transporte, ativo_desportivo, morada, codigo_postal, localidade, telefone, telemovel, nif, numero_cartao_cidadao, validade_cartao_cidadao, numero_utente, contacto_emergencia_nome, contacto_emergencia_telefone, contacto_emergencia_relacao, foto_perfil, cc, nacionalidade, estado_civil, ocupacao, empresa, escola, numero_irmaos, contacto, email_secundario, encarregado_educacao, educandos, contacto_telefonico, tipo_mensalidade, conta_corrente, centro_custo, num_federacao, cartao_federacao, numero_pmb, data_inscricao, inscricao, data_atestado_medico, arquivo_atestado_medico, informacoes_medicas, data_rgpd, arquivo_rgpd, data_consentimento, arquivo_consentimento, data_afiliacao, arquivo_afiliacao, declaracao_transporte, email_utilizador, senha) FROM stdin;
a13bfff7-9a81-4e3f-94e2-5d6231a7f9bb	Atleta EE teste 5	member+2d038106-7fa5-4e40-ba02-8853ab276ca2@local.test	\N	$2y$12$7dWu/avculraF5AKSln7uOk5iZiOTDehZGuy0Ytl8R9D078mowUjy	\N	2026-03-06 09:51:35	2026-03-06 12:38:34	2026-0005	Atleta EE teste 5	encarregado	["encarregado_educacao"]	ativo	1980-01-01	f	masculino	[]	f	f	f	f	f	Teste	2475-125	Benedita	\N	\N	123456789	\N	\N	\N	\N	\N	\N	\N	\N	Portuguesa	casado	\N	\N	\N	\N	\N	\N	[]	["a13bf74c-0bbe-4cbc-8679-428e8ac29a44"]	\N	\N	0.00	["a12862b5-1e93-4153-aca9-bcf8295201e6"]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	member+2d038106-7fa5-4e40-ba02-8853ab276ca2@local.test	\N
a1284fe5-d152-4701-8b68-6ebbd28496de	Administrador	admin@bscn.pt	\N	$2y$12$apyHO/TZN6fe6l/AkDBIAONk6jwEAHV.UBtioBem1aFWJ0DuT4FlW	\N	2026-02-24 14:58:32	2026-03-02 16:02:43	2026-0000	Administrador	admin	[]	ativo	1900-01-01	f	masculino	[]	f	f	f	f	f	Rua das Piscinas	2457-207	\N	\N	\N	111111111	\N	\N	\N	\N	\N	\N	members/photos/0da77269-2d66-4f7f-b27c-b5f7c32f5e1f.png	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	[]	\N	\N	0.00	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	admin@bscn.pt	\N
a12df159-77ae-414f-ba57-52580bb5f63f	Atleta teste 2	atletateste2@bscn.pt	\N	$2y$12$xyC3n.6u/d1lP3ejxSNsc.cM/PiNdTsFRx93a6o8eyGldyy6/THBq	\N	2026-02-27 10:09:07	2026-03-02 16:37:28	2026-0002	Atleta teste 2	atleta	["atleta"]	ativo	1980-01-01	f	masculino	["a12853e4-4d0a-43a4-8883-858eb79c08a1"]	f	f	f	f	t	Rua Teste	2475-125	Benedita	\N	\N	123456789	\N	\N	\N	\N	\N	\N	\N	11111111	Portuguesa	casado	\N	\N	\N	\N	\N	\N	[]	[]	\N	a12860db-4a33-42ef-9bdd-45b1b122989c	0.00	["a12862b3-e35b-4cfd-a29f-37dd7d957e73"]	\N	\N	\N	2026-01-01	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	atletateste2@bscn.pt	\N
a12df225-db2d-43fd-955f-0e4e3b0d1269	Atleta EE teste 3	atletaeeteste3@bscn.pt	\N	$2y$12$sfHyv.5cM.25EcuQIWrOu.jEPqjHmLYrp2zVDIINVHI5SakOy3B4.	\N	2026-02-27 10:11:21	2026-03-02 16:38:08	2026-0003	Atleta EE teste 3	encarregado	["atleta","encarregado_educacao"]	ativo	1982-01-01	f	masculino	["a12853e4-4d0a-43a4-8883-858eb79c08a1"]	f	f	f	f	t	Rua teste	2475-125	Benedita	\N	\N	123456789	\N	\N	\N	\N	\N	\N	members/photos/f0ef98a8-1159-41f1-82d1-73cb11fa969a.jpeg	11111111	Portuguesa	casado	\N	\N	\N	\N	\N	\N	[]	["a12df0b0-e7b4-4df2-ae78-c09bc21f9cf1"]	\N	a12860db-4a33-42ef-9bdd-45b1b122989c	0.00	["a12862b3-e35b-4cfd-a29f-37dd7d957e73"]	\N	\N	\N	2026-01-01	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	atletaeeteste3@bscn.pt	\N
a12df0b0-e7b4-4df2-ae78-c09bc21f9cf1	Atleta Teste 1	member+70064934-938d-4010-9cea-c16fde22958f@local.test	\N	$2y$12$fPqFCbiJShHAL4yz2qt5Q.n2jjjoivQfKYDu8m6nmoVJHgHTG9LzW	\N	2026-02-27 10:07:17	2026-03-05 17:17:20	2026-0001	Atleta Teste 1	atleta	["atleta"]	ativo	2017-01-01	t	masculino	["a12853e3-147d-48ee-b1dd-a9a014d73457"]	f	f	f	f	t	Rua Teste	2475-125	Benedita	\N	\N	123456789	\N	\N	\N	\N	\N	\N	members/photos/a98f9ac3-d65a-455c-b591-e4b76b9d6fc8.png	11111111	Portuguesa	solteiro	\N	\N	\N	\N	\N	\N	["a12df225-db2d-43fd-955f-0e4e3b0d1269"]	[]	\N	a12860db-c6c0-4ac2-b3a5-330e5290176b	0.00	["a12862b4-24f8-41dc-9eff-a41872a3d053"]	\N	\N	\N	2026-01-01	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	member+70064934f@local.test	\N
a13bf74c-0bbe-4cbc-8679-428e8ac29a44	Atleta teste 4	member+7daed80f-b7c3-4416-8a07-1707f101ef1f@local.test	\N	$2y$12$U6v5aB4h..G/GHe.xnKWQOMMIoQsOOWEJ0w28GuF/v1yjwo67QoAu	\N	2026-03-06 09:27:20	2026-03-06 09:27:20	2026-0004	Atleta teste 4	atleta	["atleta"]	ativo	2017-01-01	t	feminino	["a12853e3-147d-48ee-b1dd-a9a014d73457"]	f	f	f	f	t	Teste	2475-125	Benedita	\N	\N	123456789	\N	\N	\N	\N	\N	\N	\N	\N	Portuguesa	solteiro	\N	\N	\N	\N	\N	\N	["a12df225-db2d-43fd-955f-0e4e3b0d1269"]	\N	\N	a12860db-c6c0-4ac2-b3a5-330e5290176b	0.00	["a12862b4-24f8-41dc-9eff-a41872a3d053"]	\N	\N	\N	2026-03-01	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Name: club_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.club_settings_id_seq', 1, false);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.migrations_id_seq', 98, true);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 1, false);


--
-- Name: age_groups age_groups_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.age_groups
    ADD CONSTRAINT age_groups_name_unique UNIQUE (nome);


--
-- Name: age_groups age_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.age_groups
    ADD CONSTRAINT age_groups_pkey PRIMARY KEY (id);


--
-- Name: athlete_sports_data athlete_sports_data_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.athlete_sports_data
    ADD CONSTRAINT athlete_sports_data_pkey PRIMARY KEY (id);


--
-- Name: athlete_sports_data athlete_sports_data_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.athlete_sports_data
    ADD CONSTRAINT athlete_sports_data_user_id_unique UNIQUE (user_id);


--
-- Name: automated_communications automated_communications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.automated_communications
    ADD CONSTRAINT automated_communications_pkey PRIMARY KEY (id);


--
-- Name: bank_statements bank_statements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bank_statements
    ADD CONSTRAINT bank_statements_pkey PRIMARY KEY (id);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: call_ups call_ups_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.call_ups
    ADD CONSTRAINT call_ups_pkey PRIMARY KEY (id);


--
-- Name: catalogo_fatura_itens catalogo_fatura_itens_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.catalogo_fatura_itens
    ADD CONSTRAINT catalogo_fatura_itens_pkey PRIMARY KEY (id);


--
-- Name: centro_custo_user centro_custo_user_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.centro_custo_user
    ADD CONSTRAINT centro_custo_user_pkey PRIMARY KEY (id);


--
-- Name: centro_custo_user centro_custo_user_user_id_centro_custo_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.centro_custo_user
    ADD CONSTRAINT centro_custo_user_user_id_centro_custo_id_unique UNIQUE (user_id, centro_custo_id);


--
-- Name: club_settings club_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.club_settings
    ADD CONSTRAINT club_settings_pkey PRIMARY KEY (id);


--
-- Name: communications communications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT communications_pkey PRIMARY KEY (id);


--
-- Name: competition_registrations competition_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.competition_registrations
    ADD CONSTRAINT competition_registrations_pkey PRIMARY KEY (id);


--
-- Name: competitions competitions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.competitions
    ADD CONSTRAINT competitions_pkey PRIMARY KEY (id);


--
-- Name: convocation_athletes convocation_athletes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.convocation_athletes
    ADD CONSTRAINT convocation_athletes_pkey PRIMARY KEY (convocatoria_grupo_id, atleta_id);


--
-- Name: convocation_groups convocation_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.convocation_groups
    ADD CONSTRAINT convocation_groups_pkey PRIMARY KEY (id);


--
-- Name: convocation_movement_items convocation_movement_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.convocation_movement_items
    ADD CONSTRAINT convocation_movement_items_pkey PRIMARY KEY (id);


--
-- Name: convocation_movements convocation_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.convocation_movements
    ADD CONSTRAINT convocation_movements_pkey PRIMARY KEY (id);


--
-- Name: cost_centers cost_centers_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cost_centers
    ADD CONSTRAINT cost_centers_code_unique UNIQUE (codigo);


--
-- Name: cost_centers cost_centers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cost_centers
    ADD CONSTRAINT cost_centers_pkey PRIMARY KEY (id);


--
-- Name: dados_financeiros dados_financeiros_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dados_financeiros
    ADD CONSTRAINT dados_financeiros_pkey PRIMARY KEY (id);


--
-- Name: dados_financeiros dados_financeiros_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dados_financeiros
    ADD CONSTRAINT dados_financeiros_user_id_unique UNIQUE (user_id);


--
-- Name: event_age_group event_age_group_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_age_group
    ADD CONSTRAINT event_age_group_pkey PRIMARY KEY (event_id, age_group_id);


--
-- Name: event_attendances event_attendances_evento_id_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_attendances
    ADD CONSTRAINT event_attendances_evento_id_user_id_unique UNIQUE (evento_id, user_id);


--
-- Name: event_attendances event_attendances_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_attendances
    ADD CONSTRAINT event_attendances_pkey PRIMARY KEY (id);


--
-- Name: event_convocations event_convocations_evento_id_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_convocations
    ADD CONSTRAINT event_convocations_evento_id_user_id_unique UNIQUE (evento_id, user_id);


--
-- Name: event_convocations event_convocations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_convocations
    ADD CONSTRAINT event_convocations_pkey PRIMARY KEY (id);


--
-- Name: event_participants event_participants_event_id_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_participants
    ADD CONSTRAINT event_participants_event_id_user_id_unique UNIQUE (event_id, user_id);


--
-- Name: event_participants event_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_participants
    ADD CONSTRAINT event_participants_pkey PRIMARY KEY (id);


--
-- Name: event_results event_results_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_results
    ADD CONSTRAINT event_results_pkey PRIMARY KEY (id);


--
-- Name: event_type_configs event_type_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_type_configs
    ADD CONSTRAINT event_type_configs_pkey PRIMARY KEY (id);


--
-- Name: event_types event_types_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_types
    ADD CONSTRAINT event_types_name_unique UNIQUE (nome);


--
-- Name: event_types event_types_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_types
    ADD CONSTRAINT event_types_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: financial_categories financial_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.financial_categories
    ADD CONSTRAINT financial_categories_pkey PRIMARY KEY (id);


--
-- Name: financial_entries financial_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.financial_entries
    ADD CONSTRAINT financial_entries_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoice_types invoice_types_codigo_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoice_types
    ADD CONSTRAINT invoice_types_codigo_unique UNIQUE (codigo);


--
-- Name: invoice_types invoice_types_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoice_types
    ADD CONSTRAINT invoice_types_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: macrocycles macrocycles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.macrocycles
    ADD CONSTRAINT macrocycles_pkey PRIMARY KEY (id);


--
-- Name: mapa_conciliacao mapa_conciliacao_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.mapa_conciliacao
    ADD CONSTRAINT mapa_conciliacao_pkey PRIMARY KEY (id);


--
-- Name: marketing_campaigns marketing_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.marketing_campaigns
    ADD CONSTRAINT marketing_campaigns_pkey PRIMARY KEY (id);


--
-- Name: membership_fees membership_fees_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.membership_fees
    ADD CONSTRAINT membership_fees_pkey PRIMARY KEY (id);


--
-- Name: membership_fees membership_fees_user_id_month_year_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.membership_fees
    ADD CONSTRAINT membership_fees_user_id_month_year_unique UNIQUE (user_id, month, year);


--
-- Name: mesocycles mesocycles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.mesocycles
    ADD CONSTRAINT mesocycles_pkey PRIMARY KEY (id);


--
-- Name: microcycles microcycles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.microcycles
    ADD CONSTRAINT microcycles_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: monthly_fees monthly_fees_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.monthly_fees
    ADD CONSTRAINT monthly_fees_pkey PRIMARY KEY (id);


--
-- Name: movement_items movement_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.movement_items
    ADD CONSTRAINT movement_items_pkey PRIMARY KEY (id);


--
-- Name: movements movements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.movements
    ADD CONSTRAINT movements_pkey PRIMARY KEY (id);


--
-- Name: news_items news_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.news_items
    ADD CONSTRAINT news_items_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- Name: presences presences_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.presences
    ADD CONSTRAINT presences_pkey PRIMARY KEY (id);


--
-- Name: products products_codigo_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_codigo_unique UNIQUE (codigo);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: prova_tipos prova_tipos_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prova_tipos
    ADD CONSTRAINT prova_tipos_pkey PRIMARY KEY (id);


--
-- Name: provas provas_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.provas
    ADD CONSTRAINT provas_pkey PRIMARY KEY (id);


--
-- Name: result_provas result_provas_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.result_provas
    ADD CONSTRAINT result_provas_pkey PRIMARY KEY (id);


--
-- Name: result_splits result_splits_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.result_splits
    ADD CONSTRAINT result_splits_pkey PRIMARY KEY (id);


--
-- Name: results results_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: seasons seasons_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.seasons
    ADD CONSTRAINT seasons_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sponsors sponsors_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sponsors
    ADD CONSTRAINT sponsors_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_team_id_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_user_id_unique UNIQUE (team_id, user_id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: training_athletes training_athletes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_athletes
    ADD CONSTRAINT training_athletes_pkey PRIMARY KEY (id);


--
-- Name: training_athletes training_athletes_treino_id_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_athletes
    ADD CONSTRAINT training_athletes_treino_id_user_id_unique UNIQUE (treino_id, user_id);


--
-- Name: training_series training_series_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_series
    ADD CONSTRAINT training_series_pkey PRIMARY KEY (id);


--
-- Name: training_sessions training_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_sessions
    ADD CONSTRAINT training_sessions_pkey PRIMARY KEY (id);


--
-- Name: trainings trainings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.trainings
    ADD CONSTRAINT trainings_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: user_documents user_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_documents
    ADD CONSTRAINT user_documents_pkey PRIMARY KEY (id);


--
-- Name: user_guardian user_guardian_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_guardian
    ADD CONSTRAINT user_guardian_pkey PRIMARY KEY (id);


--
-- Name: user_guardian user_guardian_user_id_guardian_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_guardian
    ADD CONSTRAINT user_guardian_user_id_guardian_id_unique UNIQUE (user_id, guardian_id);


--
-- Name: user_relationships user_relationships_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_relationships
    ADD CONSTRAINT user_relationships_pkey PRIMARY KEY (id);


--
-- Name: user_relationships user_relationships_user_id_related_user_id_type_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_relationships
    ADD CONSTRAINT user_relationships_user_id_related_user_id_type_unique UNIQUE (user_id, related_user_id, type);


--
-- Name: user_type_permissions user_type_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_type_permissions
    ADD CONSTRAINT user_type_permissions_pkey PRIMARY KEY (id);


--
-- Name: user_types user_types_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_types
    ADD CONSTRAINT user_types_name_unique UNIQUE (nome);


--
-- Name: user_types user_types_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_types
    ADD CONSTRAINT user_types_pkey PRIMARY KEY (id);


--
-- Name: user_user_type user_user_type_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_user_type
    ADD CONSTRAINT user_user_type_pkey PRIMARY KEY (user_id, user_type_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_numero_socio_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_numero_socio_unique UNIQUE (numero_socio);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: age_groups_active_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX age_groups_active_index ON public.age_groups USING btree (ativo);


--
-- Name: age_groups_min_age_max_age_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX age_groups_min_age_max_age_index ON public.age_groups USING btree (idade_minima, idade_maxima);


--
-- Name: athlete_sports_data_ativo_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX athlete_sports_data_ativo_index ON public.athlete_sports_data USING btree (ativo);


--
-- Name: athlete_sports_data_num_federacao_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX athlete_sports_data_num_federacao_index ON public.athlete_sports_data USING btree (num_federacao);


--
-- Name: athlete_sports_data_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX athlete_sports_data_user_id_index ON public.athlete_sports_data USING btree (user_id);


--
-- Name: automated_communications_ativo_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX automated_communications_ativo_index ON public.automated_communications USING btree (ativo);


--
-- Name: automated_communications_tipo_trigger_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX automated_communications_tipo_trigger_index ON public.automated_communications USING btree (tipo_trigger);


--
-- Name: bank_statements_conciliado_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX bank_statements_conciliado_index ON public.bank_statements USING btree (conciliado);


--
-- Name: bank_statements_data_movimento_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX bank_statements_data_movimento_index ON public.bank_statements USING btree (data_movimento);


--
-- Name: bank_statements_lancamento_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX bank_statements_lancamento_id_index ON public.bank_statements USING btree (lancamento_id);


--
-- Name: call_ups_event_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX call_ups_event_id_index ON public.call_ups USING btree (event_id);


--
-- Name: call_ups_team_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX call_ups_team_id_index ON public.call_ups USING btree (team_id);


--
-- Name: catalogo_fatura_itens_ativo_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX catalogo_fatura_itens_ativo_index ON public.catalogo_fatura_itens USING btree (ativo);


--
-- Name: catalogo_fatura_itens_tipo_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX catalogo_fatura_itens_tipo_index ON public.catalogo_fatura_itens USING btree (tipo);


--
-- Name: communications_agendado_para_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX communications_agendado_para_index ON public.communications USING btree (agendado_para);


--
-- Name: communications_enviado_em_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX communications_enviado_em_index ON public.communications USING btree (enviado_em);


--
-- Name: communications_estado_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX communications_estado_index ON public.communications USING btree (estado);


--
-- Name: communications_tipo_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX communications_tipo_index ON public.communications USING btree (tipo);


--
-- Name: competition_registrations_estado_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX competition_registrations_estado_index ON public.competition_registrations USING btree (estado);


--
-- Name: competition_registrations_prova_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX competition_registrations_prova_id_index ON public.competition_registrations USING btree (prova_id);


--
-- Name: competition_registrations_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX competition_registrations_user_id_index ON public.competition_registrations USING btree (user_id);


--
-- Name: competitions_data_inicio_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX competitions_data_inicio_index ON public.competitions USING btree (data_inicio);


--
-- Name: competitions_evento_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX competitions_evento_id_index ON public.competitions USING btree (evento_id);


--
-- Name: competitions_tipo_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX competitions_tipo_index ON public.competitions USING btree (tipo);


--
-- Name: conv_mov_items_mov_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX conv_mov_items_mov_id_index ON public.convocation_movement_items USING btree (movimento_convocatoria_id);


--
-- Name: convocation_athletes_atleta_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX convocation_athletes_atleta_id_index ON public.convocation_athletes USING btree (atleta_id);


--
-- Name: convocation_groups_criado_por_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX convocation_groups_criado_por_index ON public.convocation_groups USING btree (criado_por);


--
-- Name: convocation_groups_evento_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX convocation_groups_evento_id_index ON public.convocation_groups USING btree (evento_id);


--
-- Name: convocation_movements_convocatoria_grupo_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX convocation_movements_convocatoria_grupo_id_index ON public.convocation_movements USING btree (convocatoria_grupo_id);


--
-- Name: convocation_movements_data_emissao_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX convocation_movements_data_emissao_index ON public.convocation_movements USING btree (data_emissao);


--
-- Name: convocation_movements_evento_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX convocation_movements_evento_id_index ON public.convocation_movements USING btree (evento_id);


--
-- Name: convocation_movements_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX convocation_movements_user_id_index ON public.convocation_movements USING btree (user_id);


--
-- Name: cost_centers_active_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX cost_centers_active_index ON public.cost_centers USING btree (ativo);


--
-- Name: cost_centers_code_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX cost_centers_code_index ON public.cost_centers USING btree (codigo);


--
-- Name: dados_financeiros_mensalidade_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX dados_financeiros_mensalidade_id_index ON public.dados_financeiros USING btree (mensalidade_id);


--
-- Name: event_attendances_estado_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX event_attendances_estado_index ON public.event_attendances USING btree (estado);


--
-- Name: event_attendances_evento_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX event_attendances_evento_id_index ON public.event_attendances USING btree (evento_id);


--
-- Name: event_attendances_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX event_attendances_user_id_index ON public.event_attendances USING btree (user_id);


--
-- Name: event_convocations_estado_confirmacao_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX event_convocations_estado_confirmacao_index ON public.event_convocations USING btree (estado_confirmacao);


--
-- Name: event_convocations_evento_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX event_convocations_evento_id_index ON public.event_convocations USING btree (evento_id);


--
-- Name: event_convocations_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX event_convocations_user_id_index ON public.event_convocations USING btree (user_id);


--
-- Name: event_participants_event_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX event_participants_event_id_index ON public.event_participants USING btree (event_id);


--
-- Name: event_participants_status_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX event_participants_status_index ON public.event_participants USING btree (status);


--
-- Name: event_participants_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX event_participants_user_id_index ON public.event_participants USING btree (user_id);


--
-- Name: event_results_age_group_snapshot_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX event_results_age_group_snapshot_id_index ON public.event_results USING btree (age_group_snapshot_id);


--
-- Name: event_results_epoca_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX event_results_epoca_index ON public.event_results USING btree (epoca);


--
-- Name: event_results_evento_id_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX event_results_evento_id_user_id_index ON public.event_results USING btree (evento_id, user_id);


--
-- Name: event_results_prova_piscina_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX event_results_prova_piscina_index ON public.event_results USING btree (prova, piscina);


--
-- Name: event_type_configs_ativo_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX event_type_configs_ativo_index ON public.event_type_configs USING btree (ativo);


--
-- Name: event_types_active_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX event_types_active_index ON public.event_types USING btree (ativo);


--
-- Name: event_types_category_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX event_types_category_index ON public.event_types USING btree (categoria);


--
-- Name: events_criado_por_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX events_criado_por_index ON public.events USING btree (criado_por);


--
-- Name: events_data_inicio_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX events_data_inicio_index ON public.events USING btree (data_inicio);


--
-- Name: events_estado_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX events_estado_index ON public.events USING btree (estado);


--
-- Name: events_evento_pai_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX events_evento_pai_id_index ON public.events USING btree (evento_pai_id);


--
-- Name: events_tipo_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX events_tipo_index ON public.events USING btree (tipo);


--
-- Name: events_visibilidade_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX events_visibilidade_index ON public.events USING btree (visibilidade);


--
-- Name: financial_categories_active_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX financial_categories_active_index ON public.financial_categories USING btree (active);


--
-- Name: financial_categories_type_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX financial_categories_type_index ON public.financial_categories USING btree (type);


--
-- Name: financial_entries_centro_custo_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX financial_entries_centro_custo_id_index ON public.financial_entries USING btree (centro_custo_id);


--
-- Name: financial_entries_data_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX financial_entries_data_index ON public.financial_entries USING btree (data);


--
-- Name: financial_entries_tipo_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX financial_entries_tipo_index ON public.financial_entries USING btree (tipo);


--
-- Name: financial_entries_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX financial_entries_user_id_index ON public.financial_entries USING btree (user_id);


--
-- Name: invoice_items_fatura_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX invoice_items_fatura_id_index ON public.invoice_items USING btree (fatura_id);


--
-- Name: invoice_items_produto_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX invoice_items_produto_id_index ON public.invoice_items USING btree (produto_id);


--
-- Name: invoices_data_fatura_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX invoices_data_fatura_index ON public.invoices USING btree (data_fatura);


--
-- Name: invoices_estado_pagamento_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX invoices_estado_pagamento_index ON public.invoices USING btree (estado_pagamento);


--
-- Name: invoices_tipo_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX invoices_tipo_index ON public.invoices USING btree (tipo);


--
-- Name: invoices_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX invoices_user_id_index ON public.invoices USING btree (user_id);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: macrocycles_data_inicio_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX macrocycles_data_inicio_index ON public.macrocycles USING btree (data_inicio);


--
-- Name: macrocycles_epoca_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX macrocycles_epoca_id_index ON public.macrocycles USING btree (epoca_id);


--
-- Name: macrocycles_tipo_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX macrocycles_tipo_index ON public.macrocycles USING btree (tipo);


--
-- Name: mapa_conciliacao_extrato_id_lancamento_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX mapa_conciliacao_extrato_id_lancamento_id_index ON public.mapa_conciliacao USING btree (extrato_id, lancamento_id);


--
-- Name: mapa_conciliacao_fatura_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX mapa_conciliacao_fatura_id_index ON public.mapa_conciliacao USING btree (fatura_id);


--
-- Name: mapa_conciliacao_movimento_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX mapa_conciliacao_movimento_id_index ON public.mapa_conciliacao USING btree (movimento_id);


--
-- Name: mapa_conciliacao_status_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX mapa_conciliacao_status_index ON public.mapa_conciliacao USING btree (status);


--
-- Name: marketing_campaigns_status_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX marketing_campaigns_status_index ON public.marketing_campaigns USING btree (status);


--
-- Name: marketing_campaigns_type_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX marketing_campaigns_type_index ON public.marketing_campaigns USING btree (type);


--
-- Name: membership_fees_month_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX membership_fees_month_index ON public.membership_fees USING btree (month);


--
-- Name: membership_fees_status_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX membership_fees_status_index ON public.membership_fees USING btree (status);


--
-- Name: membership_fees_year_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX membership_fees_year_index ON public.membership_fees USING btree (year);


--
-- Name: mesocycles_data_inicio_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX mesocycles_data_inicio_index ON public.mesocycles USING btree (data_inicio);


--
-- Name: mesocycles_macrociclo_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX mesocycles_macrociclo_id_index ON public.mesocycles USING btree (macrociclo_id);


--
-- Name: microcycles_mesociclo_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX microcycles_mesociclo_id_index ON public.microcycles USING btree (mesociclo_id);


--
-- Name: monthly_fees_age_group_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX monthly_fees_age_group_id_index ON public.monthly_fees USING btree (age_group_id);


--
-- Name: monthly_fees_ativo_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX monthly_fees_ativo_index ON public.monthly_fees USING btree (ativo);


--
-- Name: movement_items_movimento_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX movement_items_movimento_id_index ON public.movement_items USING btree (movimento_id);


--
-- Name: movement_items_produto_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX movement_items_produto_id_index ON public.movement_items USING btree (produto_id);


--
-- Name: movements_classificacao_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX movements_classificacao_index ON public.movements USING btree (classificacao);


--
-- Name: movements_data_emissao_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX movements_data_emissao_index ON public.movements USING btree (data_emissao);


--
-- Name: movements_estado_pagamento_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX movements_estado_pagamento_index ON public.movements USING btree (estado_pagamento);


--
-- Name: movements_tipo_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX movements_tipo_index ON public.movements USING btree (tipo);


--
-- Name: movements_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX movements_user_id_index ON public.movements USING btree (user_id);


--
-- Name: news_items_autor_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX news_items_autor_index ON public.news_items USING btree (autor);


--
-- Name: news_items_data_publicacao_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX news_items_data_publicacao_index ON public.news_items USING btree (data_publicacao);


--
-- Name: news_items_destaque_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX news_items_destaque_index ON public.news_items USING btree (destaque);


--
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: presences_data_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX presences_data_index ON public.presences USING btree (data);


--
-- Name: presences_presente_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX presences_presente_index ON public.presences USING btree (presente);


--
-- Name: presences_tipo_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX presences_tipo_index ON public.presences USING btree (tipo);


--
-- Name: presences_treino_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX presences_treino_id_index ON public.presences USING btree (treino_id);


--
-- Name: presences_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX presences_user_id_index ON public.presences USING btree (user_id);


--
-- Name: products_ativo_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX products_ativo_index ON public.products USING btree (ativo);


--
-- Name: products_categoria_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX products_categoria_index ON public.products USING btree (categoria);


--
-- Name: prova_tipos_modalidade_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX prova_tipos_modalidade_index ON public.prova_tipos USING btree (modalidade);


--
-- Name: prova_tipos_nome_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX prova_tipos_nome_index ON public.prova_tipos USING btree (nome);


--
-- Name: provas_competicao_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX provas_competicao_id_index ON public.provas USING btree (competicao_id);


--
-- Name: provas_distancia_m_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX provas_distancia_m_index ON public.provas USING btree (distancia_m);


--
-- Name: provas_estilo_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX provas_estilo_index ON public.provas USING btree (estilo);


--
-- Name: result_provas_atleta_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX result_provas_atleta_id_index ON public.result_provas USING btree (atleta_id);


--
-- Name: result_provas_data_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX result_provas_data_index ON public.result_provas USING btree (data);


--
-- Name: result_provas_evento_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX result_provas_evento_id_index ON public.result_provas USING btree (evento_id);


--
-- Name: result_provas_prova_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX result_provas_prova_index ON public.result_provas USING btree (prova);


--
-- Name: result_splits_resultado_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX result_splits_resultado_id_index ON public.result_splits USING btree (resultado_id);


--
-- Name: results_prova_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX results_prova_id_index ON public.results USING btree (prova_id);


--
-- Name: results_tempo_oficial_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX results_tempo_oficial_index ON public.results USING btree (tempo_oficial);


--
-- Name: results_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX results_user_id_index ON public.results USING btree (user_id);


--
-- Name: sales_cliente_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX sales_cliente_id_index ON public.sales USING btree (cliente_id);


--
-- Name: sales_data_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX sales_data_index ON public.sales USING btree (data);


--
-- Name: sales_produto_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX sales_produto_id_index ON public.sales USING btree (produto_id);


--
-- Name: sales_vendedor_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX sales_vendedor_id_index ON public.sales USING btree (vendedor_id);


--
-- Name: seasons_ano_temporada_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX seasons_ano_temporada_index ON public.seasons USING btree (ano_temporada);


--
-- Name: seasons_data_inicio_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX seasons_data_inicio_index ON public.seasons USING btree (data_inicio);


--
-- Name: seasons_estado_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX seasons_estado_index ON public.seasons USING btree (estado);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: sponsors_estado_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX sponsors_estado_index ON public.sponsors USING btree (estado);


--
-- Name: sponsors_tipo_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX sponsors_tipo_index ON public.sponsors USING btree (tipo);


--
-- Name: suppliers_ativo_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX suppliers_ativo_index ON public.suppliers USING btree (ativo);


--
-- Name: suppliers_nif_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX suppliers_nif_index ON public.suppliers USING btree (nif);


--
-- Name: suppliers_nome_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX suppliers_nome_index ON public.suppliers USING btree (nome);


--
-- Name: team_members_team_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX team_members_team_id_index ON public.team_members USING btree (team_id);


--
-- Name: team_members_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX team_members_user_id_index ON public.team_members USING btree (user_id);


--
-- Name: teams_active_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX teams_active_index ON public.teams USING btree (ativo);


--
-- Name: teams_age_group_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX teams_age_group_index ON public.teams USING btree (escalao);


--
-- Name: training_athletes_presente_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX training_athletes_presente_index ON public.training_athletes USING btree (presente);


--
-- Name: training_athletes_treino_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX training_athletes_treino_id_index ON public.training_athletes USING btree (treino_id);


--
-- Name: training_athletes_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX training_athletes_user_id_index ON public.training_athletes USING btree (user_id);


--
-- Name: training_series_ordem_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX training_series_ordem_index ON public.training_series USING btree (ordem);


--
-- Name: training_series_treino_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX training_series_treino_id_index ON public.training_series USING btree (treino_id);


--
-- Name: training_sessions_datetime_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX training_sessions_datetime_index ON public.training_sessions USING btree (data_hora);


--
-- Name: training_sessions_status_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX training_sessions_status_index ON public.training_sessions USING btree (estado);


--
-- Name: training_sessions_team_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX training_sessions_team_id_index ON public.training_sessions USING btree (equipa_id);


--
-- Name: trainings_data_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX trainings_data_index ON public.trainings USING btree (data);


--
-- Name: trainings_epoca_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX trainings_epoca_id_index ON public.trainings USING btree (epoca_id);


--
-- Name: trainings_microciclo_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX trainings_microciclo_id_index ON public.trainings USING btree (microciclo_id);


--
-- Name: trainings_tipo_treino_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX trainings_tipo_treino_index ON public.trainings USING btree (tipo_treino);


--
-- Name: transactions_category_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX transactions_category_id_index ON public.transactions USING btree (category_id);


--
-- Name: transactions_date_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX transactions_date_index ON public.transactions USING btree (data);


--
-- Name: transactions_status_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX transactions_status_index ON public.transactions USING btree (estado);


--
-- Name: transactions_type_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX transactions_type_index ON public.transactions USING btree (tipo);


--
-- Name: transactions_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX transactions_user_id_index ON public.transactions USING btree (user_id);


--
-- Name: user_documents_type_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX user_documents_type_index ON public.user_documents USING btree (type);


--
-- Name: user_documents_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX user_documents_user_id_index ON public.user_documents USING btree (user_id);


--
-- Name: user_guardian_guardian_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX user_guardian_guardian_id_index ON public.user_guardian USING btree (guardian_id);


--
-- Name: user_guardian_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX user_guardian_user_id_index ON public.user_guardian USING btree (user_id);


--
-- Name: user_relationships_related_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX user_relationships_related_user_id_index ON public.user_relationships USING btree (related_user_id);


--
-- Name: user_relationships_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX user_relationships_user_id_index ON public.user_relationships USING btree (user_id);


--
-- Name: user_type_permissions_scope_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX user_type_permissions_scope_idx ON public.user_type_permissions USING btree (user_type_id, modulo, submodulo, separador, campo);


--
-- Name: user_type_permissions_user_type_id_modulo_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX user_type_permissions_user_type_id_modulo_index ON public.user_type_permissions USING btree (user_type_id, modulo);


--
-- Name: user_types_active_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX user_types_active_index ON public.user_types USING btree (ativo);


--
-- Name: user_user_type_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX user_user_type_user_id_index ON public.user_user_type USING btree (user_id);


--
-- Name: user_user_type_user_type_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX user_user_type_user_type_id_index ON public.user_user_type USING btree (user_type_id);


--
-- Name: users_ativo_desportivo_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX users_ativo_desportivo_index ON public.users USING btree (ativo_desportivo);


--
-- Name: users_estado_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX users_estado_index ON public.users USING btree (estado);


--
-- Name: users_num_federacao_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX users_num_federacao_index ON public.users USING btree (num_federacao);


--
-- Name: users_numero_socio_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX users_numero_socio_index ON public.users USING btree (numero_socio);


--
-- Name: users_perfil_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX users_perfil_index ON public.users USING btree (perfil);


--
-- Name: users_tipo_mensalidade_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX users_tipo_mensalidade_index ON public.users USING btree (tipo_mensalidade);


--
-- Name: athlete_sports_data athlete_sports_data_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.athlete_sports_data
    ADD CONSTRAINT athlete_sports_data_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: bank_statements bank_statements_centro_custo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bank_statements
    ADD CONSTRAINT bank_statements_centro_custo_id_foreign FOREIGN KEY (centro_custo_id) REFERENCES public.cost_centers(id) ON DELETE SET NULL;


--
-- Name: bank_statements bank_statements_lancamento_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bank_statements
    ADD CONSTRAINT bank_statements_lancamento_id_foreign FOREIGN KEY (lancamento_id) REFERENCES public.financial_entries(id) ON DELETE SET NULL;


--
-- Name: call_ups call_ups_event_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.call_ups
    ADD CONSTRAINT call_ups_event_id_foreign FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: call_ups call_ups_team_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.call_ups
    ADD CONSTRAINT call_ups_team_id_foreign FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: centro_custo_user centro_custo_user_centro_custo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.centro_custo_user
    ADD CONSTRAINT centro_custo_user_centro_custo_id_foreign FOREIGN KEY (centro_custo_id) REFERENCES public.cost_centers(id) ON DELETE CASCADE;


--
-- Name: centro_custo_user centro_custo_user_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.centro_custo_user
    ADD CONSTRAINT centro_custo_user_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: competition_registrations competition_registrations_prova_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.competition_registrations
    ADD CONSTRAINT competition_registrations_prova_id_foreign FOREIGN KEY (prova_id) REFERENCES public.provas(id) ON DELETE CASCADE;


--
-- Name: competition_registrations competition_registrations_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.competition_registrations
    ADD CONSTRAINT competition_registrations_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: competitions competitions_evento_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.competitions
    ADD CONSTRAINT competitions_evento_id_foreign FOREIGN KEY (evento_id) REFERENCES public.events(id) ON DELETE SET NULL;


--
-- Name: convocation_movement_items conv_mov_items_mov_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.convocation_movement_items
    ADD CONSTRAINT conv_mov_items_mov_id_foreign FOREIGN KEY (movimento_convocatoria_id) REFERENCES public.convocation_movements(id) ON DELETE CASCADE;


--
-- Name: convocation_athletes convocation_athletes_atleta_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.convocation_athletes
    ADD CONSTRAINT convocation_athletes_atleta_id_foreign FOREIGN KEY (atleta_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: convocation_athletes convocation_athletes_convocatoria_grupo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.convocation_athletes
    ADD CONSTRAINT convocation_athletes_convocatoria_grupo_id_foreign FOREIGN KEY (convocatoria_grupo_id) REFERENCES public.convocation_groups(id) ON DELETE CASCADE;


--
-- Name: convocation_groups convocation_groups_criado_por_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.convocation_groups
    ADD CONSTRAINT convocation_groups_criado_por_foreign FOREIGN KEY (criado_por) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: convocation_groups convocation_groups_evento_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.convocation_groups
    ADD CONSTRAINT convocation_groups_evento_id_foreign FOREIGN KEY (evento_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: convocation_movements convocation_movements_convocatoria_grupo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.convocation_movements
    ADD CONSTRAINT convocation_movements_convocatoria_grupo_id_foreign FOREIGN KEY (convocatoria_grupo_id) REFERENCES public.convocation_groups(id) ON DELETE CASCADE;


--
-- Name: convocation_movements convocation_movements_evento_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.convocation_movements
    ADD CONSTRAINT convocation_movements_evento_id_foreign FOREIGN KEY (evento_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: convocation_movements convocation_movements_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.convocation_movements
    ADD CONSTRAINT convocation_movements_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: dados_financeiros dados_financeiros_mensalidade_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dados_financeiros
    ADD CONSTRAINT dados_financeiros_mensalidade_id_foreign FOREIGN KEY (mensalidade_id) REFERENCES public.monthly_fees(id) ON DELETE SET NULL;


--
-- Name: dados_financeiros dados_financeiros_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dados_financeiros
    ADD CONSTRAINT dados_financeiros_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: event_age_group event_age_group_age_group_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_age_group
    ADD CONSTRAINT event_age_group_age_group_id_foreign FOREIGN KEY (age_group_id) REFERENCES public.age_groups(id) ON DELETE CASCADE;


--
-- Name: event_age_group event_age_group_event_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_age_group
    ADD CONSTRAINT event_age_group_event_id_foreign FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_attendances event_attendances_evento_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_attendances
    ADD CONSTRAINT event_attendances_evento_id_foreign FOREIGN KEY (evento_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_attendances event_attendances_registado_por_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_attendances
    ADD CONSTRAINT event_attendances_registado_por_foreign FOREIGN KEY (registado_por) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: event_attendances event_attendances_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_attendances
    ADD CONSTRAINT event_attendances_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: event_convocations event_convocations_evento_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_convocations
    ADD CONSTRAINT event_convocations_evento_id_foreign FOREIGN KEY (evento_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_convocations event_convocations_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_convocations
    ADD CONSTRAINT event_convocations_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: event_participants event_participants_event_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_participants
    ADD CONSTRAINT event_participants_event_id_foreign FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_participants event_participants_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_participants
    ADD CONSTRAINT event_participants_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: event_results event_results_age_group_snapshot_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_results
    ADD CONSTRAINT event_results_age_group_snapshot_id_foreign FOREIGN KEY (age_group_snapshot_id) REFERENCES public.age_groups(id) ON DELETE SET NULL;


--
-- Name: event_results event_results_evento_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_results
    ADD CONSTRAINT event_results_evento_id_foreign FOREIGN KEY (evento_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_results event_results_registado_por_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_results
    ADD CONSTRAINT event_results_registado_por_foreign FOREIGN KEY (registado_por) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: event_results event_results_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_results
    ADD CONSTRAINT event_results_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: events events_centro_custo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_centro_custo_id_foreign FOREIGN KEY (centro_custo_id) REFERENCES public.cost_centers(id) ON DELETE SET NULL;


--
-- Name: events events_criado_por_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_criado_por_foreign FOREIGN KEY (criado_por) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: events events_tipo_config_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_tipo_config_id_foreign FOREIGN KEY (tipo_config_id) REFERENCES public.event_type_configs(id) ON DELETE SET NULL;


--
-- Name: financial_entries financial_entries_centro_custo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.financial_entries
    ADD CONSTRAINT financial_entries_centro_custo_id_foreign FOREIGN KEY (centro_custo_id) REFERENCES public.cost_centers(id) ON DELETE SET NULL;


--
-- Name: financial_entries financial_entries_fatura_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.financial_entries
    ADD CONSTRAINT financial_entries_fatura_id_foreign FOREIGN KEY (fatura_id) REFERENCES public.invoices(id) ON DELETE SET NULL;


--
-- Name: financial_entries financial_entries_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.financial_entries
    ADD CONSTRAINT financial_entries_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: invoice_items invoice_items_centro_custo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_centro_custo_id_foreign FOREIGN KEY (centro_custo_id) REFERENCES public.cost_centers(id) ON DELETE SET NULL;


--
-- Name: invoice_items invoice_items_fatura_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_fatura_id_foreign FOREIGN KEY (fatura_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_centro_custo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_centro_custo_id_foreign FOREIGN KEY (centro_custo_id) REFERENCES public.cost_centers(id) ON DELETE SET NULL;


--
-- Name: invoices invoices_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: macrocycles macrocycles_epoca_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.macrocycles
    ADD CONSTRAINT macrocycles_epoca_id_foreign FOREIGN KEY (epoca_id) REFERENCES public.seasons(id) ON DELETE CASCADE;


--
-- Name: mapa_conciliacao mapa_conciliacao_extrato_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.mapa_conciliacao
    ADD CONSTRAINT mapa_conciliacao_extrato_id_foreign FOREIGN KEY (extrato_id) REFERENCES public.bank_statements(id) ON DELETE CASCADE;


--
-- Name: mapa_conciliacao mapa_conciliacao_lancamento_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.mapa_conciliacao
    ADD CONSTRAINT mapa_conciliacao_lancamento_id_foreign FOREIGN KEY (lancamento_id) REFERENCES public.financial_entries(id) ON DELETE CASCADE;


--
-- Name: membership_fees membership_fees_transaction_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.membership_fees
    ADD CONSTRAINT membership_fees_transaction_id_foreign FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE SET NULL;


--
-- Name: membership_fees membership_fees_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.membership_fees
    ADD CONSTRAINT membership_fees_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: mesocycles mesocycles_macrociclo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.mesocycles
    ADD CONSTRAINT mesocycles_macrociclo_id_foreign FOREIGN KEY (macrociclo_id) REFERENCES public.macrocycles(id) ON DELETE CASCADE;


--
-- Name: microcycles microcycles_mesociclo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.microcycles
    ADD CONSTRAINT microcycles_mesociclo_id_foreign FOREIGN KEY (mesociclo_id) REFERENCES public.mesocycles(id) ON DELETE CASCADE;


--
-- Name: monthly_fees monthly_fees_age_group_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.monthly_fees
    ADD CONSTRAINT monthly_fees_age_group_id_foreign FOREIGN KEY (age_group_id) REFERENCES public.age_groups(id) ON DELETE SET NULL;


--
-- Name: movement_items movement_items_centro_custo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.movement_items
    ADD CONSTRAINT movement_items_centro_custo_id_foreign FOREIGN KEY (centro_custo_id) REFERENCES public.cost_centers(id) ON DELETE SET NULL;


--
-- Name: movement_items movement_items_movimento_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.movement_items
    ADD CONSTRAINT movement_items_movimento_id_foreign FOREIGN KEY (movimento_id) REFERENCES public.movements(id) ON DELETE CASCADE;


--
-- Name: movements movements_centro_custo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.movements
    ADD CONSTRAINT movements_centro_custo_id_foreign FOREIGN KEY (centro_custo_id) REFERENCES public.cost_centers(id) ON DELETE SET NULL;


--
-- Name: movements movements_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.movements
    ADD CONSTRAINT movements_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: news_items news_items_autor_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.news_items
    ADD CONSTRAINT news_items_autor_foreign FOREIGN KEY (autor) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: presences presences_escalao_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.presences
    ADD CONSTRAINT presences_escalao_id_foreign FOREIGN KEY (escalao_id) REFERENCES public.age_groups(id) ON DELETE SET NULL;


--
-- Name: presences presences_treino_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.presences
    ADD CONSTRAINT presences_treino_id_foreign FOREIGN KEY (treino_id) REFERENCES public.trainings(id) ON DELETE SET NULL;


--
-- Name: presences presences_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.presences
    ADD CONSTRAINT presences_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: provas provas_competicao_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.provas
    ADD CONSTRAINT provas_competicao_id_foreign FOREIGN KEY (competicao_id) REFERENCES public.competitions(id) ON DELETE SET NULL;


--
-- Name: result_provas result_provas_atleta_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.result_provas
    ADD CONSTRAINT result_provas_atleta_id_foreign FOREIGN KEY (atleta_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: result_provas result_provas_evento_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.result_provas
    ADD CONSTRAINT result_provas_evento_id_foreign FOREIGN KEY (evento_id) REFERENCES public.events(id) ON DELETE SET NULL;


--
-- Name: result_splits result_splits_resultado_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.result_splits
    ADD CONSTRAINT result_splits_resultado_id_foreign FOREIGN KEY (resultado_id) REFERENCES public.results(id) ON DELETE CASCADE;


--
-- Name: results results_prova_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_prova_id_foreign FOREIGN KEY (prova_id) REFERENCES public.provas(id) ON DELETE CASCADE;


--
-- Name: results results_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: sales sales_cliente_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_cliente_id_foreign FOREIGN KEY (cliente_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: sales sales_produto_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_produto_id_foreign FOREIGN KEY (produto_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: sales sales_vendedor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_vendedor_id_foreign FOREIGN KEY (vendedor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_team_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_foreign FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: teams teams_coach_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_coach_id_foreign FOREIGN KEY (treinador_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: training_athletes training_athletes_registado_por_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_athletes
    ADD CONSTRAINT training_athletes_registado_por_foreign FOREIGN KEY (registado_por) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: training_athletes training_athletes_treino_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_athletes
    ADD CONSTRAINT training_athletes_treino_id_foreign FOREIGN KEY (treino_id) REFERENCES public.trainings(id) ON DELETE CASCADE;


--
-- Name: training_athletes training_athletes_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_athletes
    ADD CONSTRAINT training_athletes_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: training_series training_series_treino_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_series
    ADD CONSTRAINT training_series_treino_id_foreign FOREIGN KEY (treino_id) REFERENCES public.trainings(id) ON DELETE CASCADE;


--
-- Name: training_sessions training_sessions_team_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_sessions
    ADD CONSTRAINT training_sessions_team_id_foreign FOREIGN KEY (equipa_id) REFERENCES public.teams(id) ON DELETE SET NULL;


--
-- Name: trainings trainings_criado_por_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.trainings
    ADD CONSTRAINT trainings_criado_por_foreign FOREIGN KEY (criado_por) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: trainings trainings_epoca_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.trainings
    ADD CONSTRAINT trainings_epoca_id_foreign FOREIGN KEY (epoca_id) REFERENCES public.seasons(id) ON DELETE SET NULL;


--
-- Name: trainings trainings_evento_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.trainings
    ADD CONSTRAINT trainings_evento_id_foreign FOREIGN KEY (evento_id) REFERENCES public.events(id) ON DELETE SET NULL;


--
-- Name: trainings trainings_microciclo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.trainings
    ADD CONSTRAINT trainings_microciclo_id_foreign FOREIGN KEY (microciclo_id) REFERENCES public.microcycles(id) ON DELETE SET NULL;


--
-- Name: transactions transactions_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_foreign FOREIGN KEY (category_id) REFERENCES public.financial_categories(id) ON DELETE SET NULL;


--
-- Name: transactions transactions_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_documents user_documents_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_documents
    ADD CONSTRAINT user_documents_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_guardian user_guardian_guardian_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_guardian
    ADD CONSTRAINT user_guardian_guardian_id_foreign FOREIGN KEY (guardian_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_guardian user_guardian_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_guardian
    ADD CONSTRAINT user_guardian_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_relationships user_relationships_related_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_relationships
    ADD CONSTRAINT user_relationships_related_user_id_foreign FOREIGN KEY (related_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_relationships user_relationships_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_relationships
    ADD CONSTRAINT user_relationships_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_type_permissions user_type_permissions_user_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_type_permissions
    ADD CONSTRAINT user_type_permissions_user_type_id_foreign FOREIGN KEY (user_type_id) REFERENCES public.user_types(id) ON DELETE CASCADE;


--
-- Name: user_user_type user_user_type_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_user_type
    ADD CONSTRAINT user_user_type_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_user_type user_user_type_user_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_user_type
    ADD CONSTRAINT user_user_type_user_type_id_foreign FOREIGN KEY (user_type_id) REFERENCES public.user_types(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict D6dk2BSovRVthyCmRHOZIdZzNNpGUl0FVin0oL3SxFLwWfd9CvoNBZx0Dhq6S8Q

