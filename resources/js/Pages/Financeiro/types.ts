export interface User {
  id: string;
  numero_socio: string;
  nome_completo: string;
  data_inscricao?: string | null;
  nif?: string | null;
  morada?: string | null;
  tipo_mensalidade?: string | null;
  centro_custo?: string[] | null;
  centro_custo_pesos?: Array<{ id: string; peso: number }>;
  tipo_membro?: string[] | null;
  escalao?: string[] | null;
}

export interface CentroCusto {
  id: string;
  nome: string;
  tipo: 'equipa' | 'departamento' | 'pessoa' | 'projeto';
  descricao?: string | null;
  orcamento?: number | null;
  ativo: boolean;
}

export interface Fatura {
  id: string;
  user_id: string;
  data_fatura: string;
  mes?: string | null;
  data_emissao: string;
  data_vencimento: string;
  valor_total: number;
  oculta?: boolean;
  estado_pagamento: 'pendente' | 'pago' | 'vencido' | 'parcial' | 'cancelado';
  numero_recibo?: string | null;
  referencia_pagamento?: string | null;
  centro_custo_id?: string | null;
  tipo: string;
  origem_tipo?: 'evento' | 'stock' | 'patrocinio' | 'manual' | null;
  origem_id?: string | null;
  observacoes?: string | null;
  created_at?: string | null;
}

export interface InvoiceType {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string | null;
  ativo: boolean;
}

export interface FaturaItem {
  id: string;
  fatura_id: string;
  descricao: string;
  valor_unitario: number;
  quantidade: number;
  imposto_percentual: number;
  total_linha: number;
  produto_id?: string | null;
  centro_custo_id?: string | null;
  created_at?: string | null;
}

export interface LancamentoFinanceiro {
  id: string;
  data: string;
  tipo: 'receita' | 'despesa';
  categoria?: string | null;
  descricao: string;
  documento_ref?: string | null;
  valor: number;
  centro_custo_id?: string | null;
  user_id?: string | null;
  fatura_id?: string | null;
  origem_tipo?: 'evento' | 'stock' | 'patrocinio' | 'manual' | null;
  origem_id?: string | null;
  metodo_pagamento?: string | null;
  comprovativo?: string | null;
  created_at?: string | null;
}

export interface ExtratoBancario {
  id: string;
  conta?: string | null;
  data_movimento: string;
  descricao: string;
  valor: number;
  saldo?: number | null;
  referencia?: string | null;
  ficheiro_id?: string | null;
  centro_custo_id?: string | null;
  conciliado: boolean;
  lancamento_id?: string | null;
  created_at?: string | null;
}

export interface ConciliacaoMapa {
  id: string;
  extrato_id: string;
  lancamento_id: string;
  fatura_id?: string | null;
  movimento_id?: string | null;
  estado_fatura_anterior?: string | null;
  estado_movimento_anterior?: string | null;
}

export interface Movimento {
  id: string;
  user_id?: string | null;
  nome_manual?: string | null;
  nif_manual?: string | null;
  morada_manual?: string | null;
  classificacao: 'receita' | 'despesa';
  data_emissao: string;
  data_vencimento: string;
  valor_total: number;
  estado_pagamento: 'pendente' | 'pago' | 'vencido' | 'parcial' | 'cancelado';
  numero_recibo?: string | null;
  referencia_pagamento?: string | null;
  metodo_pagamento?: string | null;
  comprovativo?: string | null;
  documento_original?: string | null;
  centro_custo_id?: string | null;
  tipo: 'inscricao' | 'material' | 'servico' | 'patrocinio' | 'outro';
  origem_tipo?: 'evento' | 'stock' | 'patrocinio' | 'manual' | null;
  origem_id?: string | null;
  observacoes?: string | null;
  created_at?: string | null;
}

export interface MovimentoItem {
  id: string;
  movimento_id: string;
  descricao: string;
  valor_unitario: number;
  quantidade: number;
  imposto_percentual: number;
  total_linha: number;
  produto_id?: string | null;
  centro_custo_id?: string | null;
  fatura_id?: string | null;
  created_at?: string | null;
}

export interface Product {
  id: string;
  nome: string;
  preco: number;
  stock: number;
  stock_minimo?: number | null;
  ativo?: boolean;
}

export interface MonthlyFee {
  id: string;
  designacao: string;
  valor: number;
  age_group_id?: string | null;
}

export interface AgeGroup {
  id: string;
  nome: string;
}
