export interface Stats {
  athletesCount: number;
  trainings7Days: number;
  trainings30Days: number;
  km7Days: number;
  km30Days: number;
}

export interface BasicItem {
  id: string;
}

export interface Athlete extends BasicItem {
  nome_completo: string;
  email: string;
  estado?: string;
  tipo_membro?: string[];
  escalao?: string[];
  ativo_desportivo?: boolean;
  data_atestado_medico?: string | null;
}

export interface Training extends BasicItem {
  numero_treino?: string | null;
  data: string;
  hora_inicio?: string | null;
  hora_fim?: string | null;
  local?: string | null;
  tipo_treino: string;
  volume_planeado_m?: number | null;
  descricao_treino?: string | null;
  escaloes?: string[] | null;
}

export interface Session extends BasicItem {
  treino_id: string;
  data: string;
  fase_epoca?: string;
  objetivo_fisiologico?: string;
  objetivo_tecnico?: string;
  nota_staff?: string;
  updated_at: string;
}

export interface Attendance extends BasicItem {
  legacy_presence_id?: string | null;
  user_id: string;
  nome_atleta: string;
  status: string;
  classificacao?: string | null;
  distancia_realizada_m?: number | null;
  notas?: string | null;
}

export interface Season extends BasicItem {
  nome: string;
  ano_temporada: string;
  estado: string;
  tipo: string;
  data_inicio: string;
  data_fim: string;
}

export interface Macro extends BasicItem {
  nome: string;
  tipo: string;
  data_inicio: string;
  data_fim: string;
  escalao?: string | null;
}

export interface Micro extends BasicItem {
  season_id: string;
  semana_label: string;
  data_inicio: string;
  data_fim: string;
  carga_prevista: number;
  foco: string;
}

export interface Competition extends BasicItem {
  titulo: string;
  data_inicio: string;
  local?: string;
  tipo: string;
}

export interface CompetitionEntry extends BasicItem {
  competition_id: string;
  athlete_id: string;
  prova?: string;
  seed_time?: string | null;
}

export interface CompetitionResult extends BasicItem {
  prova: string;
  tempo?: string | null;
  classificacao?: number | null;
  event?: { id: string; titulo: string };
  athlete?: { nome_completo: string };
}

export interface TeamResult extends BasicItem {
  competicao_id: string;
  equipa: string;
  classificacao?: number | null;
  pontos?: number | null;
}

export interface PerformanceMetric extends BasicItem {
  athlete_id: string;
  data: string;
  carga_aguda: number;
  carga_cronica: number;
  acwr: number;
  rpe: number;
  volume_semanal_m: number;
  prontidao: number;
  observacoes?: string;
}

export interface TrainingMetric extends BasicItem {
  training_id: string;
  athlete_id: string;
  metrica: string;
  valor: string;
  tempo?: string;
  observacao?: string;
}

export interface TrainingSession extends Session {}
export interface TrainingAttendance extends Attendance {}
export interface Macrocycle extends Macro {}
export interface Microcycle extends Micro {}

export interface AgeGroup {
  id: string;
  nome: string;
}

export interface Event {
  id: string;
  titulo: string;
  data_inicio: string;
  data_fim?: string;
  tipo: string;
  estado: string;
  local: string;
  descricao?: string;
  criado_por?: string;
  hora_inicio?: string;
  hora_fim?: string;
  escaloes_elegiveis?: string[];
}

export interface CostCenter {
  id: string;
  nome: string;
  codigo?: string;
  ativo?: boolean;
}

export interface EventType {
  id: string;
  nome: string;
  visibilidade_default?: string;
  ativo?: boolean;
}

export interface TrainingTemplate {
  id: string;
  nome: string;
  tipo_treino: string;
  volume_planeado_m?: number;
  descricao_treino?: string;
  escaloes?: string[];
  created_at: string;
}

export interface V2SeasonPlan {
  id: string;
  nome: string;
  data_inicio: string;
  data_fim: string;
  fase: string;
  objetivo_fisiologico: string;
  objetivo_tecnico: string;
  carga_prevista: number;
}

export interface V2MicrocyclePlan {
  id: string;
  season_id: string;
  semana_label: string;
  data_inicio: string;
  data_fim: string;
  carga_prevista: number;
  foco: string;
}

export interface SessionContext {
  id: string;
  treino_id: string;
  fase_epoca?: string;
  objetivo_fisiologico?: string;
  objetivo_tecnico?: string;
  nota_staff?: string;
  updated_at: string;
}

export interface AthleteOperationalRow {
  user_id: string;
  assiduidade_percent?: number | null;
  disciplina_status?: 'ok' | 'atencao' | 'critico' | string;
  pb_label?: string | null;
  total_resultados?: number;
}

export interface CaisPerformanceRow {
  id: string;
  metrica: string;
  valor: string;
  tempo: string;
  observacao: string;
}

export type User = Athlete;
export type PresenceRow = Attendance;
export type EventResult = CompetitionResult;