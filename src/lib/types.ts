export type MemberType = 
  | "atleta"
  | "encarregado_educacao"
  | "treinador"
  | "dirigente"
  | "socio"
  | "funcionario";

export type MemberStatus = "ativo" | "inativo" | "suspenso";

export type Sex = "masculino" | "feminino";

export type CivilStatus = "solteiro" | "casado" | "divorciado" | "viuvo";

export type UserProfile = "admin" | "encarregado" | "atleta" | "staff";

export interface User {
  id: string;
  numero_socio: string;
  
  foto_perfil?: string;
  nome_completo: string;
  data_nascimento: string;
  nif?: string;
  cc?: string;
  morada?: string;
  codigo_postal?: string;
  localidade?: string;
  nacionalidade?: string;
  estado_civil?: CivilStatus;
  ocupacao?: string;
  empresa?: string;
  escola?: string;
  menor: boolean;
  sexo: Sex;
  numero_irmaos?: number;
  contacto?: string;
  email_secundario?: string;
  encarregado_educacao?: string[];
  educandos?: string[];
  tipo_membro: MemberType[];
  estado: MemberStatus;
  contacto_telefonico?: string;
  
  tipo_mensalidade?: string;
  conta_corrente?: number;
  centro_custo?: string[];
  centro_custo_pesos?: Array<{ id: string; peso: number }>;
  conta_corrente_manual?: number;
  
  num_federacao?: string;
  cartao_federacao?: string;
  numero_pmb?: string;
  data_inscricao?: string;
  inscricao?: string;
  escalao?: string[];
  data_atestado_medico?: string;
  arquivo_atestado_medico?: string[];
  informacoes_medicas?: string;
  ativo_desportivo?: boolean;
  
  perfil: UserProfile;
  senha?: string;
  rgpd: boolean;
  data_rgpd?: string;
  arquivo_rgpd?: string;
  consentimento: boolean;
  data_consentimento?: string;
  arquivo_consentimento?: string;
  afiliacao: boolean;
  data_afiliacao?: string;
  arquivo_afiliacao?: string;
  declaracao_de_transporte: boolean;
  declaracao_transporte?: string;
  email_utilizador: string;
}

export type PartialUser = Partial<User> & {
  id: string;
  nome_completo: string;
  numero_socio: string;
};

export type EventoTipo = 'prova' | 'estagio' | 'reuniao' | 'evento_interno' | 'treino' | 'outro';
export type EventoVisibilidade = 'privado' | 'restrito' | 'publico';

export interface EventoTipoConfig {
  id: string;
  nome: string;
  cor: string;
  icon: string;
  ativo: boolean;
  gera_taxa: boolean;
  requer_convocatoria: boolean;
  requer_transporte: boolean;
  visibilidade_default: EventoVisibilidade;
  created_at: string;
}

export interface Event {
  id: string;
  titulo: string;
  descricao: string;
  data_inicio: string;
  hora_inicio?: string;
  data_fim?: string;
  hora_fim?: string;
  local?: string;
  local_detalhes?: string;
  tipo: EventoTipo;
  tipo_config_id?: string;
  tipo_piscina?: 'piscina_25m' | 'piscina_50m' | 'aguas_abertas';
  visibilidade?: EventoVisibilidade;
  escaloes_elegiveis?: string[];
  transporte_necessario?: boolean;
  transporte_detalhes?: string;
  hora_partida?: string;
  local_partida?: string;
  taxa_inscricao?: number;
  custo_inscricao_por_prova?: number;
  custo_inscricao_por_salto?: number;
  custo_inscricao_estafeta?: number;
  centro_custo_id?: string;
  observacoes?: string;
  convocatoria_ficheiro?: string;
  regulamento_ficheiro?: string;
  estado: 'rascunho' | 'agendado' | 'em_curso' | 'concluido' | 'cancelado';
  criado_por: string;
  criado_em: string;
  atualizado_em?: string;
  recorrente?: boolean;
  recorrencia_data_inicio?: string;
  recorrencia_data_fim?: string;
  recorrencia_dias_semana?: number[];
  evento_pai_id?: string;
}

export interface EventoConvocatoria {
  id: string;
  evento_id: string;
  user_id: string;
  data_convocatoria: string;
  estado_confirmacao: 'pendente' | 'confirmado' | 'recusado';
  data_resposta?: string;
  justificacao?: string;
  observacoes?: string;
  transporte_clube?: boolean;
}

export interface ConvocatoriaGrupo {
  id: string;
  evento_id: string;
  data_criacao: string;
  criado_por: string;
  atletas_ids: string[];
  hora_encontro?: string;
  local_encontro?: string;
  observacoes?: string;
  tipo_custo: 'por_salto' | 'por_atleta';
  valor_por_salto?: number;
  valor_por_estafeta?: number;
  valor_inscricao_unitaria?: number;
  valor_inscricao_calculado?: number;
  movimento_id?: string;
}

export interface ConvocatoriaAtleta {
  convocatoria_grupo_id: string;
  atleta_id: string;
  provas: string[];
  estafetas?: number;
  presente: boolean;
  confirmado: boolean;
}

export interface ResultadoProva {
  id: string;
  atleta_id: string;
  evento_id: string;
  evento_nome?: string;
  prova: string;
  local: string;
  data: string;
  piscina: 'piscina_25m' | 'piscina_50m' | 'aguas_abertas';
  tempo_final: string;
  created_at: string;
  updated_at?: string;
}

export type EstadoPresenca = 'presente' | 'ausente' | 'justificado';

export interface EventoPresenca {
  id: string;
  evento_id: string;
  user_id: string;
  estado: EstadoPresenca;
  hora_chegada?: string;
  observacoes?: string;
  registado_por: string;
  registado_em: string;
}

export interface EventoResultado {
  id: string;
  evento_id: string;
  user_id: string;
  prova: string;
  tempo?: string;
  classificacao?: number;
  piscina?: string;
  escalao?: string;
  observacoes?: string;
  epoca?: string;
  registado_por: string;
  registado_em: string;
}

export interface NewsItem {
  id: string;
  titulo: string;
  conteudo: string;
  imagem?: string;
  destaque: boolean;
  autor: string;
  data_publicacao: string;
  categorias: string[];
}

export interface Sponsor {
  id: string;
  nome: string;
  logo?: string;
  tipo: 'principal' | 'secundario' | 'apoio';
  contrato_inicio: string;
  contrato_fim?: string;
  valor_anual?: number;
  contacto_nome?: string;
  contacto_email?: string;
  contacto_telefone?: string;
  ativo: boolean;
}

export interface Product {
  id: string;
  nome: string;
  descricao?: string;
  imagem?: string;
  categoria: string;
  preco: number;
  stock: number;
  stock_minimo: number;
  ativo: boolean;
}

export interface Sale {
  id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  total: number;
  cliente_id?: string;
  vendedor_id: string;
  data: string;
  metodo_pagamento: 'dinheiro' | 'cartao' | 'mbway' | 'transferencia';
}

export interface Transaction {
  id: string;
  tipo: 'receita' | 'despesa';
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  centro_custo?: string;
  user_id?: string;
  metodo_pagamento?: string;
  comprovativo?: string;
}

export interface Mensalidade {
  id: string;
  designacao: string;
  valor: number;
  ativo: boolean;
  created_at?: string;
}

export interface CentroCusto {
  id: string;
  nome: string;
  tipo: 'equipa' | 'departamento' | 'pessoa' | 'projeto';
  descricao?: string;
  orcamento?: number;
  ativo: boolean;
  created_at?: string;
}

export interface Fatura {
  id: string;
  user_id: string;
  data_fatura: string;
  mes?: string;
  data_emissao: string;
  data_vencimento: string;
  valor_total: number;
  estado_pagamento: 'pendente' | 'pago' | 'vencido' | 'parcial' | 'cancelado';
  numero_recibo?: string;
  referencia_pagamento?: string;
  centro_custo_id?: string;
  tipo: 'mensalidade' | 'inscricao' | 'material' | 'servico' | 'outro';
  observacoes?: string;
  created_at?: string;
}

export interface FaturaItem {
  id: string;
  fatura_id: string;
  descricao: string;
  valor_unitario: number;
  quantidade: number;
  imposto_percentual: number;
  total_linha: number;
  produto_id?: string;
  centro_custo_id?: string;
  created_at?: string;
}

export interface LancamentoFinanceiro {
  id: string;
  data: string;
  tipo: 'receita' | 'despesa';
  categoria?: string;
  descricao: string;
  valor: number;
  centro_custo_id?: string;
  user_id?: string;
  fatura_id?: string;
  metodo_pagamento?: string;
  comprovativo?: string;
  created_at?: string;
}

export interface ExtratoBancario {
  id: string;
  conta?: string;
  data_movimento: string;
  descricao: string;
  valor: number;
  saldo?: number;
  referencia?: string;
  centro_custo_id?: string;
  conciliado: boolean;
  lancamento_id?: string;
  created_at?: string;
}

export interface Movimento {
  id: string;
  user_id?: string;
  nome_manual?: string;
  nif_manual?: string;
  morada_manual?: string;
  classificacao: 'receita' | 'despesa';
  data_emissao: string;
  data_vencimento: string;
  valor_total: number;
  estado_pagamento: 'pendente' | 'pago' | 'vencido' | 'parcial' | 'cancelado';
  numero_recibo?: string;
  referencia_pagamento?: string;
  centro_custo_id?: string;
  tipo: 'inscricao' | 'material' | 'servico' | 'outro';
  observacoes?: string;
  created_at?: string;
}

export interface MovimentoItem {
  id: string;
  movimento_id: string;
  descricao: string;
  valor_unitario: number;
  quantidade: number;
  imposto_percentual: number;
  total_linha: number;
  produto_id?: string;
  centro_custo_id?: string;
  fatura_id?: string;
  created_at?: string;
}

export interface MovimentoConvocatoria {
  id: string;
  user_id: string;
  convocatoria_grupo_id: string;
  evento_id: string;
  evento_nome: string;
  tipo: 'convocatoria';
  data_emissao: string;
  valor: number;
  itens: MovimentoConvocatoriaItem[];
  created_at: string;
}

export interface MovimentoConvocatoriaItem {
  id: string;
  movimento_convocatoria_id: string;
  descricao: string;
  valor: number;
}

export interface DadosDesportivos {
  id: string;
  user_id: string;
  num_federacao?: string;
  cartao_federacao?: string;
  numero_pmb?: string;
  data_inscricao?: string;
  inscricao_path?: string;
  escalao_id?: string;
  data_atestado_medico?: string;
  arquivo_atestado_medico?: string[];
  informacoes_medicas?: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export type TipoEpoca = 'principal' | 'secundaria' | 'verao' | 'preparacao' | 'pre_epoca';
export type EstadoEpoca = 'planeada' | 'em_curso' | 'concluida' | 'arquivada';
export type TipoPiscina = 'piscina_25m' | 'piscina_50m' | 'aguas_abertas';

export interface Epoca {
  id: string;
  nome: string;
  ano_temporada: string;
  data_inicio: string;
  data_fim: string;
  tipo: TipoEpoca;
  estado: EstadoEpoca;
  piscina_principal?: TipoPiscina;
  escaloes_abrangidos?: string[];
  descricao?: string;
  provas_alvo?: string[];
  volume_total_previsto?: number;
  volume_medio_semanal?: number;
  num_semanas_previsto?: number;
  num_competicoes_previstas?: number;
  objetivos_performance?: string;
  objetivos_tecnicos?: string;
  created_at?: string;
  updated_at?: string;
}

export type TipoMacrociclo = 'preparacao_geral' | 'preparacao_especifica' | 'competicao' | 'taper' | 'transicao';

export interface Macrociclo {
  id: string;
  epoca_id: string;
  nome: string;
  tipo: TipoMacrociclo;
  data_inicio: string;
  data_fim: string;
  escalao?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Mesociclo {
  id: string;
  macrociclo_id: string;
  nome: string;
  foco: string;
  data_inicio: string;
  data_fim: string;
  created_at?: string;
}

export interface Microciclo {
  id: string;
  mesociclo_id: string;
  semana: string;
  volume_previsto?: number;
  notas?: string;
  created_at?: string;
}

export type TipoTreino = 'aerobio' | 'sprint' | 'tecnica' | 'forca' | 'recuperacao' | 'misto';
export type ZonaIntensidade = 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5';
export type Estilo = 'crawl' | 'costas' | 'brucos' | 'mariposa' | 'estilos' | 'livres';

export interface Treino {
  id: string;
  numero_treino?: string;
  data: string;
  hora_inicio?: string;
  hora_fim?: string;
  local?: string;
  epoca_id?: string;
  microciclo_id?: string;
  grupo_escalao_id?: string;
  escaloes?: string[];
  tipo_treino: TipoTreino;
  volume_planeado_m?: number;
  notas_gerais?: string;
  descricao_treino?: string;
  criado_por?: string;
  created_at?: string;
  atualizado_em?: string;
  evento_id?: string;
}

export interface TreinoSerie {
  id: string;
  treino_id: string;
  ordem: number;
  descricao_texto: string;
  distancia_total_m: number;
  zona_intensidade?: ZonaIntensidade;
  estilo?: Estilo;
  repeticoes?: number;
  intervalo?: string;
  observacoes?: string;
  created_at?: string;
}

export interface TreinoAtleta {
  id: string;
  treino_id: string;
  user_id: string;
  presente: boolean;
  estado?: EstadoPresenca;
  volume_real_m?: number;
  rpe?: number;
  observacoes_tecnicas?: string;
  registado_por?: string;
  registado_em?: string;
  created_at?: string;
}

export interface Presenca {
  id: string;
  user_id: string;
  data: string;
  treino_id?: string;
  tipo: 'treino' | 'competicao' | 'reuniao' | 'estagio' | 'outro';
  justificacao?: string;
  presente: boolean;
  created_at?: string;
}

export interface Competicao {
  id: string;
  nome: string;
  local: string;
  data_inicio: string;
  data_fim?: string;
  tipo: 'oficial' | 'interna' | 'masters' | 'formacao' | 'outro';
  evento_id?: string;
  created_at?: string;
}

export interface Prova {
  id: string;
  competicao_id: string;
  estilo: Estilo;
  distancia_m: number;
  genero: 'masculino' | 'feminino' | 'misto';
  escalao_id?: string;
  ordem_prova?: number;
  created_at?: string;
}

export interface InscricaoProva {
  id: string;
  prova_id: string;
  user_id: string;
  estado: 'inscrito' | 'confirmado' | 'desistiu';
  valor_inscricao?: number;
  fatura_id?: string;
  movimento_id?: string;
  created_at?: string;
}

export interface Resultado {
  id: string;
  prova_id: string;
  user_id: string;
  tempo_oficial: number;
  posicao?: number;
  pontos_fina?: number;
  desclassificado: boolean;
  observacoes?: string;
  created_at?: string;
}

export interface ResultadoSplit {
  id: string;
  resultado_id: string;
  distancia_parcial_m: number;
  tempo_parcial: number;
  created_at?: string;
}

export interface Fornecedor {
  id: string;
  nome: string;
  nif?: string;
  morada?: string;
  codigo_postal?: string;
  localidade?: string;
  contacto_telefone?: string;
  contacto_email?: string;
  contacto_nome?: string;
  iban?: string;
  observacoes?: string;
  ativo: boolean;
  created_at?: string;
}

export interface ArtigoLoja {
  id: string;
  nome: string;
  descricao?: string;
  categoria: string;
  preco_venda: number;
  preco_custo?: number;
  stock_atual: number;
  stock_minimo: number;
  fornecedor_id?: string;
  centro_custo_id?: string;
  imagem?: string;
  ativo: boolean;
  created_at?: string;
}

export type EstadoEncomenda = 'pendente' | 'aprovada' | 'em_preparacao' | 'entregue' | 'cancelada';
export type LocalEntrega = 'clube' | 'morada_atleta' | 'outro';

export interface EncomendaArtigo {
  id: string;
  data_encomenda: string;
  user_id: string;
  artigo_id: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  escalao_id: string;
  centro_custo_id: string;
  local_entrega: LocalEntrega;
  morada_entrega?: string;
  estado: EstadoEncomenda;
  data_entrega?: string;
  observacoes?: string;
  fatura_id?: string;
  movimento_id?: string;
  criado_por?: string;
  created_at?: string;
}

export interface MovimentoStock {
  id: string;
  artigo_id: string;
  tipo: 'entrada' | 'saida' | 'ajuste' | 'devolucao';
  quantidade: number;
  stock_anterior: number;
  stock_novo: number;
  motivo?: string;
  fornecedor_id?: string;
  encomenda_id?: string;
  valor_unitario?: number;
  centro_custo_id?: string;
  registado_por?: string;
  data_movimento: string;
  created_at?: string;
}
