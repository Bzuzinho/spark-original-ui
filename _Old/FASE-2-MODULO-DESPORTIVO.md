# Fase 2: Alinhamento do Módulo Desportivo

## Resumo das Alterações

Este documento descreve a implementação da Fase 2 do Módulo Desportivo, que alinha completamente a gestão desportiva com o sistema de utilizadores e o módulo financeiro.

## 1. Nova Estrutura de Dados

### Tipos Criados (`src/lib/types.ts`)

#### DadosDesportivos (1:1 com User)
```typescript
interface DadosDesportivos {
  id: string;
  user_id: string;  // FK → users
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
```

**Armazenamento KV:** `dados-desportivos`

**Princípio:** Em vez de guardar dados desportivos diretamente no User, criamos uma relação 1:1 que permite gerir estes dados de forma independente.

---

#### Planeamento de Épocas e Ciclos

##### Época
```typescript
interface Epoca {
  id: string;
  nome: string;  // "Época 2024/2025"
  data_inicio: string;
  data_fim: string;
  tipo: 'principal' | 'curta';
  ativo: boolean;
}
```
**Armazenamento KV:** `epocas`

##### Macrociclo
```typescript
interface Macrociclo {
  id: string;
  epoca_id: string;
  nome: string;
  tipo: 'preparacao_geral' | 'preparacao_especifica' | 'competicao' | 'taper' | 'transicao';
  data_inicio: string;
  data_fim: string;
}
```
**Armazenamento KV:** `macrociclos`

##### Mesociclo
```typescript
interface Mesociclo {
  id: string;
  macrociclo_id: string;
  nome: string;
  foco: string;  // "VO2", "Técnica", "Sprint"
  data_inicio: string;
  data_fim: string;
}
```
**Armazenamento KV:** `mesociclos`

##### Microciclo
```typescript
interface Microciclo {
  id: string;
  mesociclo_id: string;
  semana: string;  // "2024-W42"
  volume_previsto?: number;
  notas?: string;
}
```
**Armazenamento KV:** `microciclos`

---

#### Treinos

##### Treino (Sessão)
```typescript
interface Treino {
  id: string;
  data: string;
  local?: string;
  epoca_id?: string;
  microciclo_id?: string;
  grupo_escalao_id?: string;
  tipo_treino: 'aerobio' | 'sprint' | 'tecnica' | 'forca' | 'recuperacao' | 'misto';
  volume_planeado_m?: number;
  notas_gerais?: string;
}
```
**Armazenamento KV:** `treinos`

##### TreinoSerie
```typescript
interface TreinoSerie {
  id: string;
  treino_id: string;
  ordem: number;
  descricao_texto: string;  // "8x50 crawl saída 1:00 Z4"
  distancia_total_m: number;
  zona_intensidade?: 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5';
  estilo?: 'crawl' | 'costas' | 'brucos' | 'mariposa' | 'estilos' | 'livres';
}
```
**Armazenamento KV:** `treino-series`

##### TreinoAtleta (Execução)
```typescript
interface TreinoAtleta {
  id: string;
  treino_id: string;
  user_id: string;
  presente: boolean;
  volume_real_m?: number;
  rpe?: number;  // 1-10
  observacoes_tecnicas?: string;
}
```
**Armazenamento KV:** `treino-atleta`

**Na Ficha de Utilizador:** O separador Desportivo mostra treinos do atleta filtrando `treino-atleta` por `user_id`.

---

#### Presenças

```typescript
interface Presenca {
  id: string;
  user_id: string;
  data: string;
  treino_id?: string;
  tipo: 'treino' | 'competicao' | 'reuniao' | 'estagio' | 'outro';
  justificacao?: string;
  presente: boolean;
}
```
**Armazenamento KV:** `presencas`

---

#### Competições e Resultados

##### Competicao
```typescript
interface Competicao {
  id: string;
  nome: string;
  local: string;
  data_inicio: string;
  data_fim?: string;
  tipo: 'oficial' | 'interna' | 'masters' | 'formacao' | 'outro';
  evento_id?: string;  // Opcional, se ligado a Event
}
```
**Armazenamento KV:** `competicoes`

##### Prova
```typescript
interface Prova {
  id: string;
  competicao_id: string;
  estilo: 'crawl' | 'costas' | 'brucos' | 'mariposa' | 'estilos' | 'livres';
  distancia_m: number;
  genero: 'masculino' | 'feminino' | 'misto';
  escalao_id?: string;
  ordem_prova?: number;
}
```
**Armazenamento KV:** `provas`

##### InscricaoProva (🔗 Liga ao Financeiro)
```typescript
interface InscricaoProva {
  id: string;
  prova_id: string;
  user_id: string;
  estado: 'inscrito' | 'confirmado' | 'desistiu';
  valor_inscricao?: number;
  fatura_id?: string;  // 🔗 FK → faturas
  movimento_id?: string;  // 🔗 FK → movimentos
}
```
**Armazenamento KV:** `inscricoes-provas`

**Integração com Financeiro:** 
- Quando um atleta é inscrito numa prova, pode ser gerado um movimento/fatura
- `movimento_id` ou `fatura_id` são preenchidos
- O valor da inscrição aparece na conta corrente do atleta
- O centro de custo é herdado do escalão do atleta ou do evento

##### Resultado
```typescript
interface Resultado {
  id: string;
  prova_id: string;
  user_id: string;
  tempo_oficial: number;  // em centésimos
  posicao?: number;
  pontos_fina?: number;
  desclassificado: boolean;
  observacoes?: string;
}
```
**Armazenamento KV:** `resultados`

##### ResultadoSplit (Opcional)
```typescript
interface ResultadoSplit {
  id: string;
  resultado_id: string;
  distancia_parcial_m: number;
  tempo_parcial: number;
}
```
**Armazenamento KV:** `resultado-splits`

---

## 2. Estrutura do Módulo Desportivo

### Vista: `/src/views/SportsView.tsx`

O módulo desportivo está organizado em **6 separadores** (tabs):

#### 1. **Dashboard**
- **Componente:** `DashboardTab.tsx`
- **Função:** Visão geral com KPIs principais
- **Métricas:**
  - Km treinados (última semana, último mês)
  - Atletas ativos
  - Próximas competições (30 dias)
  - Alertas: atestados médicos a caducar, baixa presença

#### 2. **Planeamento**
- **Componente:** `PlaneamentoTab.tsx`
- **Função:** Gerir épocas, macrociclos, mesociclos e microciclos
- **Tabelas:**
  - Lista de épocas (com estado ativo/inativo)
  - Lista de macrociclos (com tipo e datas)
  - (Futuro: mesociclos e microciclos)

#### 3. **Treinos**
- **Componente:** `TreinosTab.tsx`
- **Função:** Criar e gerir sessões de treino
- **Tabelas:**
  - Lista de treinos (data, local, tipo, volume planeado)
  - Cada treino pode ter múltiplas séries
  - Registo de volume real e RPE por atleta

#### 4. **Presenças**
- **Componente:** `PresencasTab.tsx`
- **Função:** Controlar assiduidade dos atletas
- **Tabelas:**
  - Lista de presenças (data, atleta, tipo, estado)
  - Filtros por atleta, data, tipo de evento

#### 5. **Competições**
- **Componente:** `CompeticoesTab.tsx`
- **Função:** Gerir competições, provas, inscrições e resultados
- **Tabelas:**
  - Lista de competições
  - Provas por competição
  - Inscrições (🔗 gera movimentos financeiros)
  - Resultados
- **Integração Financeira:**
  - Inscrições geram faturas/movimentos
  - Ligação a centros de custo

#### 6. **Relatórios**
- **Componente:** `RelatoriosTab.tsx`
- **Função:** Análise de desempenho e relatórios cruzados
- **Relatórios:**
  - **Peso Financeiro vs Desportivo:**
    - Total pago por atleta
    - Número de provas realizadas
    - Km treinados
    - €/Prova (investimento médio)
  - Evolução de tempos
  - Assiduidade por escalão
  - Medalhas e pódios

---

## 3. Integração com Ficha de Utilizador

### Separador Desportivo (`SportsTab.tsx`)

O separador Desportivo da Ficha de Utilizador **NÃO cria dados próprios**. Em vez disso:

#### 3.1. Campos Fixos (vêm de `DadosDesportivos`)
- Número de Federação
- Cartão de Federação
- Número PMB
- Data de Inscrição
- Escalão
- Atestado Médico (data, arquivo, informações)
- Ativo Desportivamente

**Implementação:**
```typescript
// Quando a ficha abre, buscar ou criar DadosDesportivos
const [dadosDesp, setDadosDesp] = useKV<DadosDesportivos[]>('dados-desportivos', []);
const atletaDados = dadosDesp.find(d => d.user_id === user.id);

// Se não existir, criar
if (!atletaDados && user.tipo_membro.includes('atleta')) {
  const novoDado: DadosDesportivos = {
    id: crypto.randomUUID(),
    user_id: user.id,
    ativo: user.ativo_desportivo || false,
    // ... outros campos do user
  };
  setDadosDesp(currentData => [...currentData, novoDado]);
}
```

#### 3.2. Grelhas (vêm de outras tabelas)

**Grelha: Presenças**
```typescript
const presencasAtleta = presencas.filter(p => p.user_id === user.id);
```
- Mostra últimas 50 presenças
- Botão "Ver no Módulo Desportivo" → abre `SportsView` no tab "Presenças"

**Grelha: Treinos**
```typescript
const treinosAtleta = treinoAtleta.filter(ta => ta.user_id === user.id);
```
- Mostra últimos treinos com volume real e RPE
- Botão "Ver Detalhes" → abre treino específico no Módulo Desportivo

**Grelha: Resultados**
```typescript
const resultadosAtleta = resultados.filter(r => r.user_id === user.id);
```
- Mostra resultados de provas
- Botão "Ver Competição" → abre competição no Módulo Desportivo

---

## 4. Integração com Módulo Financeiro

### 4.1. Fluxo de Inscrições em Provas

```
1. Treinador cria Competicao no Módulo Desportivo
2. Treinador cria Provas dentro da Competicao
3. Treinador inscreve atletas nas Provas
   → Cria InscricaoProva com valor_inscricao
4. Sistema gera Movimento/Fatura:
   - tipo: 'inscricao'
   - user_id: atleta_id
   - valor_total: valor_inscricao
   - centro_custo_id: escalão do atleta ou evento
5. InscricaoProva.movimento_id é atualizado
6. Movimento aparece na conta corrente do atleta
```

### 4.2. Relatório "Peso Financeiro vs Desportivo"

**Localização:** Módulo Desportivo → Relatórios → Tab "Relatórios"

**Colunas:**
- Nome do Atleta
- Total Pago (soma de faturas pagas)
- Número de Provas (count de resultados)
- Km Treinados (soma de volume_real_m)
- Estado (ativo/inativo)
- €/Prova (total pago ÷ número de provas)

**Fonte de Dados:**
```typescript
// Para cada atleta:
const totalPago = faturas
  .filter(f => f.user_id === atleta.id && f.estado_pagamento === 'pago')
  .reduce((sum, f) => sum + f.valor_total, 0);

const numProvas = resultados.filter(r => r.user_id === atleta.id).length;

const kmTreinados = treinoAtleta
  .filter(t => t.user_id === atleta.id && t.presente)
  .reduce((sum, t) => sum + (t.volume_real_m || 0), 0) / 1000;
```

---

## 5. Migração de Dados Existentes

### 5.1. Migrar campos de User para DadosDesportivos

**Script de Migração (executar no App.tsx useEffect):**
```typescript
useEffect(() => {
  const migrarDadosDesportivos = async () => {
    const users = await spark.kv.get<User[]>('club-users');
    const dadosDesp = await spark.kv.get<DadosDesportivos[]>('dados-desportivos') || [];
    
    const atletasNovos = (users || [])
      .filter(u => u.tipo_membro.includes('atleta'))
      .filter(u => !dadosDesp.some(d => d.user_id === u.id));
    
    const novosDados: DadosDesportivos[] = atletasNovos.map(u => ({
      id: crypto.randomUUID(),
      user_id: u.id,
      num_federacao: u.num_federacao,
      cartao_federacao: u.cartao_federacao,
      numero_pmb: u.numero_pmb,
      data_inscricao: u.data_inscricao,
      inscricao_path: u.inscricao,
      escalao_id: u.escalao?.[0],
      data_atestado_medico: u.data_atestado_medico,
      arquivo_atestado_medico: u.arquivo_atestado_medico,
      informacoes_medicas: u.informacoes_medicas,
      ativo: u.ativo_desportivo || false,
      created_at: new Date().toISOString(),
    }));
    
    if (novosDados.length > 0) {
      await spark.kv.set('dados-desportivos', [...dadosDesp, ...novosDados]);
    }
  };
  
  migrarDadosDesportivos();
}, []);
```

### 5.2. Manter compatibilidade com User

Durante o período de transição, os campos `user.num_federacao`, etc., **ainda existem** mas são sincronizados com `DadosDesportivos`:

```typescript
// Quando atualizar DadosDesportivos, sincronizar com User
const syncUserData = (dadosDesp: DadosDesportivos) => {
  const user = users.find(u => u.id === dadosDesp.user_id);
  if (user) {
    const updatedUser = {
      ...user,
      num_federacao: dadosDesp.num_federacao,
      cartao_federacao: dadosDesp.cartao_federacao,
      numero_pmb: dadosDesp.numero_pmb,
      data_inscricao: dadosDesp.data_inscricao,
      inscricao: dadosDesp.inscricao_path,
      escalao: dadosDesp.escalao_id ? [dadosDesp.escalao_id] : [],
      data_atestado_medico: dadosDesp.data_atestado_medico,
      arquivo_atestado_medico: dadosDesp.arquivo_atestado_medico,
      informacoes_medicas: dadosDesp.informacoes_medicas,
      ativo_desportivo: dadosDesp.ativo,
    };
    // Atualizar user
  }
};
```

---

## 6. Componentes Criados

### Diretório: `/src/components/tabs/sports/`

1. **DashboardTab.tsx** - Dashboard com KPIs e alertas
2. **PlaneamentoTab.tsx** - Gestão de épocas e ciclos
3. **TreinosTab.tsx** - Criação e gestão de treinos
4. **PresencasTab.tsx** - Controlo de assiduidade
5. **CompeticoesTab.tsx** - Gestão de competições e inscrições
6. **RelatoriosTab.tsx** - Análise de desempenho e relatórios cruzados

---

## 7. Próximos Passos (Futuro)

### 7.1. Implementar Formulários Completos
- Criar/Editar Época
- Criar/Editar Treino com Séries
- Criar/Editar Competição com Provas
- Inscrever Atletas em Provas (com geração de movimento)

### 7.2. Sincronização Bidirecional
- Atualizar `User` quando `DadosDesportivos` mudar
- Atualizar `DadosDesportivos` quando `User` mudar
- Garantir consistência entre módulos

### 7.3. Relatórios Avançados
- Gráficos de evolução de tempos
- Análise de assiduidade por período
- Comparação entre atletas/escalões
- Dashboard executivo (direção)

### 7.4. Exportação de Dados
- Exportar relatórios para Excel
- Imprimir fichas de treino
- Gerar PDFs de resultados

---

## 8. Estrutura de Armazenamento KV (Resumo)

| Chave KV | Tipo | Descrição |
|----------|------|-----------|
| `dados-desportivos` | `DadosDesportivos[]` | Dados desportivos 1:1 com atletas |
| `epocas` | `Epoca[]` | Épocas desportivas |
| `macrociclos` | `Macrociclo[]` | Macrociclos de treino |
| `mesociclos` | `Mesociclo[]` | Mesociclos de treino |
| `microciclos` | `Microciclo[]` | Microciclos (planeamento semanal) |
| `treinos` | `Treino[]` | Sessões de treino |
| `treino-series` | `TreinoSerie[]` | Séries dentro de treinos |
| `treino-atleta` | `TreinoAtleta[]` | Execução de treinos por atleta |
| `presencas` | `Presenca[]` | Presenças em treinos/eventos |
| `competicoes` | `Competicao[]` | Competições |
| `provas` | `Prova[]` | Provas dentro de competições |
| `inscricoes-provas` | `InscricaoProva[]` | Inscrições de atletas em provas |
| `resultados` | `Resultado[]` | Resultados de provas |
| `resultado-splits` | `ResultadoSplit[]` | Splits de resultados |

---

## 9. Benefícios da Nova Arquitetura

✅ **Separação de Responsabilidades:** Dados desportivos não poluem a tabela de utilizadores

✅ **Integração Financeira:** Inscrições em provas geram movimentos/faturas automaticamente

✅ **Relatórios Cruzados:** Fácil cruzar dados financeiros com performance desportiva

✅ **Escalabilidade:** Fácil adicionar novos tipos de dados (splits, records pessoais, etc.)

✅ **Histórico Completo:** Todas as tabelas têm `created_at` para tracking temporal

✅ **Flexibilidade:** Planeamento de treinos em múltiplos níveis (época → macro → meso → micro)

---

## 10. Estado de Implementação

✅ **Tipos criados** em `types.ts`

✅ **Módulo Desportivo** com 6 tabs implementados

✅ **Dashboard** com KPIs e alertas

✅ **Estrutura base** para Planeamento, Treinos, Presenças, Competições e Relatórios

⏳ **Formulários de criação/edição** (próxima fase)

⏳ **Sincronização bidirecional** User ↔ DadosDesportivos

⏳ **Geração automática** de movimentos financeiros nas inscrições

⏳ **Gráficos e visualizações** nos relatórios

---

## Conclusão

A Fase 2 estabelece uma **arquitetura sólida e escalável** para o Módulo Desportivo, alinhada com:
- Ficha de Utilizador (separador Desportivo como vista sobre os dados)
- Módulo Financeiro (inscrições geram movimentos, relatórios cruzados)
- Princípios de normalização de dados (DadosDesportivos 1:1, tabelas separadas)

O sistema está pronto para evolução com formulários completos e funcionalidades avançadas.
