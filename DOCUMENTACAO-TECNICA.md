# Documentação Técnica - Sistema de Gestão de Clube (BSCN)

## 1. ARQUITETURA DO SISTEMA

### Tecnologias Base
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS + Shadcn UI v4
- **Persistência**: Spark KV (useKV hook)
- **Autenticação**: Sistema interno com perfis
- **Build**: Vite 7

### Estrutura de Pastas
```
src/
├── App.tsx                    # Componente raiz, gestão de autenticação e rotas
├── views/                     # Vistas principais (módulos)
│   ├── LoginView.tsx
│   ├── HomeView.tsx
│   ├── MembersView.tsx
│   ├── SportsView.tsx
│   ├── EventsView.tsx
│   ├── FinancialView.tsx
│   ├── InventoryView.tsx
│   ├── SponsorsView.tsx
│   ├── MarketingView.tsx
│   └── SettingsView.tsx
├── components/
│   ├── Layout.tsx             # Layout principal com sidebar
│   ├── UserList.tsx           # Lista de membros
│   ├── UserProfile.tsx        # Perfil de utilizador
│   ├── eventos/               # Componentes do módulo Eventos
│   ├── financial/             # Componentes do módulo Financeiro
│   ├── tabs/                  # Tabs do perfil de utilizador
│   └── ui/                    # Componentes Shadcn (40+ componentes)
├── lib/
│   ├── types.ts               # Todas as interfaces TypeScript
│   ├── auth.ts                # Lógica de autenticação
│   ├── user-helpers.ts        # Funções auxiliares de utilizadores
│   └── financial-sync.ts      # Sincronização financeira
└── hooks/
    ├── use-mobile.ts
    └── use-event-status-sync.ts
```

---

## 2. BASE DE DADOS (Spark KV Storage)

### Tabelas Principais (Keys KV)

#### **club-users** → `User[]`
Armazena todos os utilizadores/membros do clube
```typescript
interface User {
  // Identificação
  id: string
  numero_socio: string
  nome_completo: string
  email_utilizador: string
  senha?: string
  perfil: 'admin' | 'encarregado' | 'atleta' | 'staff'
  
  // Dados Pessoais
  data_nascimento: string
  sexo: 'masculino' | 'feminino'
  menor: boolean
  nif?: string
  cc?: string
  morada?: string
  codigo_postal?: string
  localidade?: string
  contacto?: string
  
  // Tipos e Estado
  tipo_membro: MemberType[]  // Pode ter múltiplos tipos
  estado: 'ativo' | 'inativo' | 'suspenso'
  
  // Relações Familiares
  encarregado_educacao?: string[]  // IDs dos encarregados
  educandos?: string[]             // IDs dos educandos
  
  // Dados Financeiros
  tipo_mensalidade?: string
  conta_corrente?: number
  centro_custo?: string[]
  
  // Dados Desportivos (se atleta)
  num_federacao?: string
  escalao?: string[]  // IDs dos escalões
  data_atestado_medico?: string
  arquivo_atestado_medico?: string[]
  ativo_desportivo?: boolean
  
  // Documentação Legal
  rgpd: boolean
  consentimento: boolean
  afiliacao: boolean
  declaracao_de_transporte: boolean
}
```

#### **club-events** → `Event[]`
Eventos, treinos, competições, reuniões
```typescript
interface Event {
  id: string
  titulo: string
  descricao: string
  tipo: 'prova' | 'estagio' | 'reuniao' | 'evento_interno' | 'treino' | 'outro'
  
  // Datas e Local
  data_inicio: string
  hora_inicio?: string
  data_fim?: string
  hora_fim?: string
  local?: string
  
  // Elegibilidade
  escaloes_elegiveis?: string[]  // Quais escalões podem participar
  
  // Estado (auto-gerido por hook)
  estado: 'rascunho' | 'agendado' | 'em_curso' | 'concluido' | 'cancelado'
  
  // Transporte
  transporte_necessario?: boolean
  transporte_detalhes?: string
  hora_partida?: string
  local_partida?: string
  
  // Financeiro
  taxa_inscricao?: number
  centro_custo_id?: string
  
  // Recorrência (para treinos)
  recorrente?: boolean
  recorrencia_dias_semana?: number[]
  evento_pai_id?: string
  
  criado_por: string
  criado_em: string
}
```

#### **club-presencas** → `EventoPresenca[]`
Registo de presenças em eventos
```typescript
interface EventoPresenca {
  id: string
  evento_id: string    // FK para Event
  user_id: string      // FK para User
  estado: 'presente' | 'ausente' | 'justificado'
  hora_chegada?: string
  observacoes?: string
  registado_por: string
  registado_em: string
}
```

#### **club-convocatorias-grupos** → `ConvocatoriaGrupo[]`
Convocatórias para eventos (especialmente competições)
```typescript
interface ConvocatoriaGrupo {
  id: string
  evento_id: string           // FK para Event
  atletas_ids: string[]       // FKs para Users
  data_criacao: string
  criado_por: string
  
  // Detalhes logísticos
  hora_encontro?: string
  local_encontro?: string
  observacoes?: string
  
  // Custos (para competições)
  tipo_custo: 'por_salto' | 'por_atleta'
  valor_por_salto?: number
  valor_por_estafeta?: number
  valor_inscricao_unitaria?: number
  valor_inscricao_calculado?: number
  
  movimento_id?: string       // FK para Movimento (gerado automaticamente)
}
```

#### **club-evento-resultados** → `EventoResultado[]`
Resultados de provas/competições
```typescript
interface EventoResultado {
  id: string
  evento_id: string    // FK para Event
  user_id: string      // FK para User
  prova: string
  tempo?: string
  classificacao?: number
  piscina?: string
  escalao?: string
  epoca?: string
  observacoes?: string
  registado_por: string
  registado_em: string
}
```

#### **club-faturas** → `Fatura[]`
Mensalidades dos atletas
```typescript
interface Fatura {
  id: string
  user_id: string              // FK para User
  data_fatura: string
  mes?: string
  data_emissao: string
  data_vencimento: string
  valor_total: number
  estado_pagamento: 'pendente' | 'pago' | 'vencido' | 'parcial' | 'cancelado'
  tipo: 'mensalidade' | 'inscricao' | 'material' | 'servico' | 'outro'
  centro_custo_id?: string
  observacoes?: string
}
```

#### **club-movimentos** → `Movimento[]`
Receitas e despesas gerais
```typescript
interface Movimento {
  id: string
  user_id?: string             // Opcional, FK para User
  nome_manual?: string         // Se não for um user
  classificacao: 'receita' | 'despesa'
  data_emissao: string
  data_vencimento: string
  valor_total: number
  estado_pagamento: 'pendente' | 'pago' | 'vencido' | 'parcial' | 'cancelado'
  tipo: 'inscricao' | 'material' | 'servico' | 'outro'
  centro_custo_id?: string
  observacoes?: string
}
```

#### **club-mensalidades** → `Mensalidade[]`
Tipos de mensalidades disponíveis
```typescript
interface Mensalidade {
  id: string
  designacao: string
  valor: number
  ativo: boolean
}
```

#### **club-centros-custo** → `CentroCusto[]`
Centros de custo para organização financeira
```typescript
interface CentroCusto {
  id: string
  nome: string
  tipo: 'equipa' | 'departamento' | 'pessoa' | 'projeto'
  descricao?: string
  orcamento?: number
  ativo: boolean
}
```

#### **settings-age-groups** → Escalões
Configuração de escalões/categorias de idade

#### **settings-user-types** → Tipos de Membro
Configuração de tipos personalizados de membro

#### **authenticated-user** → `User | null`
Utilizador atualmente autenticado

---

## 3. RELAÇÕES ENTRE TABELAS

### Relações Principais

```
User (club-users)
  ├─→ encarregado_educacao[] ──→ User.id (relação bidirecional)
  ├─→ educandos[] ──→ User.id (relação bidirecional)
  ├─→ escalao[] ──→ AgeGroup.id (settings-age-groups)
  ├─→ tipo_mensalidade ──→ Mensalidade.id (club-mensalidades)
  ├─→ centro_custo[] ──→ CentroCusto.id (club-centros-custo)
  │
  ├─→ EventoPresenca.user_id (1:N)
  ├─→ EventoResultado.user_id (1:N)
  ├─→ Fatura.user_id (1:N)
  └─→ Movimento.user_id (1:N)

Event (club-events)
  ├─→ escaloes_elegiveis[] ──→ AgeGroup.id
  ├─→ centro_custo_id ──→ CentroCusto.id
  ├─→ evento_pai_id ──→ Event.id (para eventos recorrentes)
  │
  ├─→ EventoPresenca.evento_id (1:N)
  ├─→ EventoResultado.evento_id (1:N)
  └─→ ConvocatoriaGrupo.evento_id (1:N)

ConvocatoriaGrupo (club-convocatorias-grupos)
  ├─→ evento_id ──→ Event.id
  ├─→ atletas_ids[] ──→ User.id
  └─→ movimento_id ──→ Movimento.id (gerado automaticamente)

EventoPresenca (club-presencas)
  ├─→ evento_id ──→ Event.id
  └─→ user_id ──→ User.id

EventoResultado (club-evento-resultados)
  ├─→ evento_id ──→ Event.id
  └─→ user_id ──→ User.id

Fatura (club-faturas)
  ├─→ user_id ──→ User.id
  └─→ centro_custo_id ──→ CentroCusto.id

Movimento (club-movimentos)
  ├─→ user_id ──→ User.id (opcional)
  └─→ centro_custo_id ──→ CentroCusto.id
```

---

## 4. MÓDULOS DA APLICAÇÃO

### 4.1 Módulo de Autenticação (LoginView)
- **Funcionalidade**: Login com email e senha
- **Perfis**: admin, encarregado, atleta, staff
- **Credenciais padrão**: 
  - admin@bscn.pt / password123
  - admin@benedita.pt / benedita2025

### 4.2 Módulo Home (HomeView)
- Dashboard com estatísticas
- Próximos eventos
- Acesso rápido a funcionalidades

### 4.3 Módulo Membros (MembersView)
**Componentes principais**:
- `UserList`: Lista com filtros e pesquisa
- `UserProfile`: Perfil completo com 4 tabs

**4 Tabs do Perfil**:
1. **Pessoal** (PersonalTab): Dados pessoais, identificação, contactos, relações familiares
2. **Financeiro** (FinancialTab): Mensalidades, conta corrente, faturas, centros de custo
3. **Desportivo** (SportsTab): Dados federativos, atestado médico, presenças, resultados (APENAS para atletas)
4. **Configuração** (ConfigurationTab): Email, senha, perfil, documentação legal (RGPD, etc)

**Características**:
- Relações bidirecionais encarregado ↔ educando
- Múltiplos tipos de membro por utilizador
- Campos condicionais baseados em tipo e idade
- Integração com módulo financeiro e eventos

### 4.4 Módulo Eventos (EventsView)
**7 Tabs**:
1. **Calendário**: Vista de calendário dos eventos
2. **Eventos**: Lista e criação de eventos
3. **Convocatórias**: Gestão de convocatórias para eventos
4. **Presenças**: Registo de presenças nos eventos
5. **Resultados**: Registo de resultados de competições
6. **Relatórios**: Análises estatísticas
7. **Configuração**: Tipos de eventos personalizados

**Fluxo de Presenças (Treinos)**:
1. Criar evento tipo='treino' com escalões elegíveis
2. Sistema cria registo vazio em Presenças tab
3. Abrir registo e adicionar atletas manualmente
4. Classificar cada atleta: presente/ausente/justificado
5. Guardar - atletas sem classificação são removidos
6. Presenças aparecem no perfil do atleta (tab Desportivo)

**Fluxo de Convocatórias (Competições)**:
1. Criar evento tipo='prova'
2. Criar convocatória na tab Convocatórias
3. Adicionar atletas e provas
4. Sistema gera automaticamente Movimento financeiro
5. Movimento aparece no módulo Financeiro

**Estado Automático de Eventos**:
- Hook `useEventStatusSync` atualiza estados:
  - Data futura → 'agendado'
  - Data = hoje → 'em_curso'
  - Data passada → 'concluido'

### 4.5 Módulo Desportivo (SportsView)
**6 Tabs**:
1. **Dashboard**: KPIs desportivos
2. **Planeamento**: Épocas e Macrociclos
3. **Treinos**: Criação de treinos com séries
4. **Presenças**: Registo de presenças em treinos
5. **Competições**: Vista de eventos tipo='prova' (link para Eventos)
6. **Relatórios**: Análise de performance

**Integração com Eventos**:
- Treinos criados aqui geram eventos automaticamente
- Competições são geridas no módulo Eventos
- Presenças sincronizadas entre módulos

### 4.6 Módulo Financeiro (FinancialView)
**5 Tabs**:
1. **Dashboard**: KPIs financeiros com cards:
   - Total Geral (saldo global)
   - Receitas do Mês
   - Mensalidades Vencidas (contagem absoluta)
   - Pendentes (soma de vencidos)
   - Despesas do Mês

2. **Mensalidades**: Gestão de faturas de mensalidades dos atletas

3. **Movimentos**: Receitas e despesas gerais
   - Receitas: Inscrições, vendas, patrocínios
   - Despesas: Material, serviços, transportes
   - Auto-criados por convocatórias de competição

4. **Banco**: Gestão de extratos bancários

5. **Relatórios**: Análises financeiras detalhadas

**Sincronização Automática**:
- Convocatórias de competição → Movimento
- Mensalidades → Fatura por atleta
- Conta corrente atualizada automaticamente

### 4.7 Módulo Inventário (InventoryView)
- Gestão de produtos
- Controlo de stock
- Vendas

### 4.8 Módulo Patrocínios (SponsorsView)
- Cadastro de patrocinadores
- Contratos e valores
- Contactos

### 4.9 Módulo Marketing (MarketingView)
- Notícias e comunicações
- Gestão de conteúdo

### 4.10 Módulo Configurações (SettingsView)
- Escalões (age-groups)
- Tipos de membros personalizados
- Tipos de mensalidades
- Centros de custo
- Configurações gerais

---

## 5. FLUXOS DE DADOS PRINCIPAIS

### 5.1 Fluxo de Criação de Utilizador
```
MembersView → Criar Novo
  → Gera numero_socio automático
  → Preenche formulário (4 tabs)
  → Se menor=true → mostra campo encarregado_educacao
  → Ao selecionar encarregado → atualiza educandos[] do encarregado
  → Guardar → Atualiza club-users com useKV
```

### 5.2 Fluxo de Registo de Presença (Treino)
```
EventsView → Tab Eventos → Criar evento tipo='treino'
  → Define escaloes_elegiveis
  → Guardar evento
  → Tab Presenças → Aparece card vazio do treino
  → Abrir card → Adicionar atletas manualmente
  → Classificar cada atleta (presente/ausente/justificado)
  → Guardar → Cria EventoPresenca[] em club-presencas
  → Presenças visíveis em:
    - Módulo Eventos, Tab Presenças
    - Perfil do atleta, Tab Desportivo
    - Módulo Desportivo, Tab Presenças
```

### 5.3 Fluxo de Convocatória para Competição
```
EventsView → Tab Eventos → Criar evento tipo='prova'
  → Define dados da competição
  → Tab Convocatórias → Criar convocatória
  → Seleciona atletas
  → Define provas e custos
  → Guardar → Sistema automaticamente:
    1. Cria ConvocatoriaGrupo em club-convocatorias-grupos
    2. Cria Movimento em club-movimentos
    3. Liga movimento_id ao grupo
    4. Movimento aparece no Financeiro
```

### 5.4 Fluxo de Mensalidade
```
FinancialView → Tab Mensalidades → Criar Fatura
  → Seleciona user_id (atleta)
  → Define mes, valor, data_vencimento
  → Guardar → Cria Fatura em club-faturas
  → Aparece na conta do atleta:
    - Perfil do atleta, Tab Financeiro
    - Dashboard financeiro (se vencida)
```

---

## 6. COMPONENTES TÉCNICOS CHAVE

### 6.1 Hooks Personalizados

**useKV** (do Spark SDK):
```typescript
const [value, setValue, deleteValue] = useKV<Type>('key-name', defaultValue)

// ⚠️ IMPORTANTE: Sempre usar função de callback para atualizar
setValue(currentValue => [...currentValue, newItem])  // ✅ CORRETO
setValue([...value, newItem])  // ❌ ERRADO - causa perda de dados
```

**useEventStatusSync**:
```typescript
// Hook que atualiza automaticamente estados de eventos
// Baseado na data atual vs data do evento
useEventStatusSync(events, setEvents)
```

### 6.2 Persistência de Dados

**Todas as tabelas usam Spark KV**:
```typescript
// Leitura
const [users] = useKV<User[]>('club-users', [])

// Escrita (sempre com função)
setUsers(current => [...current, newUser])

// Atualização
setUsers(current => 
  current.map(u => u.id === userId ? updatedUser : u)
)

// Remoção
setUsers(current => current.filter(u => u.id !== userId))
```

### 6.3 Autenticação

**Ficheiro**: `src/lib/auth.ts`
```typescript
export async function authenticateUser(
  email: string, 
  password: string, 
  users: User[]
): Promise<User | null>
```

**Perfis e Permissões**:
- `admin`: Acesso total
- `encarregado`: Acesso aos seus educandos
- `atleta`: Acesso ao próprio perfil
- `staff`: Acesso limitado

---

## 7. PADRÕES DE CÓDIGO

### 7.1 Estrutura de Componentes
```typescript
export function ComponentName() {
  // 1. Hooks de dados (useKV)
  const [data, setData] = useKV<Type[]>('key', [])
  
  // 2. Estado local (useState)
  const [localState, setLocalState] = useState(initial)
  
  // 3. Efeitos (useEffect)
  useEffect(() => { /* ... */ }, [deps])
  
  // 4. Handlers
  const handleAction = () => { /* ... */ }
  
  // 5. Render
  return <div>...</div>
}
```

### 7.2 Atualização de Arrays com useKV
```typescript
// ✅ SEMPRE usar função callback
setItems(current => [...current, newItem])
setItems(current => current.filter(i => i.id !== id))
setItems(current => current.map(i => i.id === id ? updated : i))

// ❌ NUNCA referenciar variável diretamente
setItems([...items, newItem])  // CAUSA PERDA DE DADOS
```

### 7.3 Nomenclatura
- **Componentes**: PascalCase (`UserList.tsx`)
- **Funções**: camelCase (`handleSaveUser`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Interfaces**: PascalCase (`interface User {}`)
- **Keys KV**: kebab-case (`'club-users'`)

---

## 8. INTEGRAÇÕES ENTRE MÓDULOS

### Membros ↔ Eventos
- Perfil do atleta (tab Desportivo) mostra presenças filtradas de `club-presencas`
- Link para ver evento completo no módulo Eventos

### Membros ↔ Financeiro
- Perfil do utilizador (tab Financeiro) mostra faturas filtradas de `club-faturas`
- Conta corrente calculada dinamicamente

### Eventos ↔ Financeiro
- Convocatórias de competição criam automaticamente Movimentos
- `ConvocatoriaGrupo.movimento_id` liga ao `Movimento.id`

### Eventos ↔ Desportivo
- Treinos criados no Desportivo geram eventos automaticamente
- Competições geridas nos Eventos, visíveis no Desportivo
- Presenças sincronizadas entre módulos

---

## 9. INICIALIZAÇÃO DO SISTEMA

**Ficheiro**: `src/App.tsx`

**Ao iniciar, sistema cria automaticamente**:
1. Utilizador admin@bscn.pt (se não existir)
2. Utilizador admin@benedita.pt (sempre atualiza senha)
3. Tipos de membro padrão (Atleta, Encarregado, Treinador, Dirigente, Sócio, Funcionário)
4. Mensalidades padrão (Infantil €30, Juvenil €35, Sénior €40)
5. Centros de custo padrão (Geral, Infantil, Juvenil)

---

## 10. VALIDAÇÕES E REGRAS DE NEGÓCIO

### Utilizadores
- Numero de sócio único e auto-gerado
- Email único por utilizador
- Se menor=true, deve ter encarregado_educacao
- Atleta deve ter pelo menos um escalão
- Relação encarregado ↔ educando é bidirecional

### Eventos
- Data de início obrigatória
- Se tipo='treino' e recorrente=true, cria eventos filhos
- Estado atualiza automaticamente baseado na data
- Escalões elegíveis define quem pode participar

### Presenças
- Apenas atletas dos escaloes_elegiveis podem ser adicionados
- Estado deve ser: presente, ausente ou justificado
- Atletas sem classificação não são guardados
- Apenas atletas com estado='ativo' são considerados

### Convocatórias
- Apenas para eventos com requer_convocatoria=true
- Cria automaticamente movimento financeiro
- Movimento herda centro_custo do escalão do atleta

### Financeiro
- Faturas vencidas: data_vencimento < hoje e estado != 'pago'
- Conta corrente: soma de todas as faturas e movimentos do utilizador
- Dashboard calcula valores do mês atual

---

## 11. COMPONENTES SHADCN UTILIZADOS

Do diretório `src/components/ui/`:
- Form, Input, Label, Textarea - Formulários
- Button, Badge - Ações e estados
- Card - Containers
- Tabs - Navegação por secções
- Dialog, Sheet - Modais
- Select, Checkbox, Switch, RadioGroup - Selecções
- Table - Listas tabulares
- Calendar, Popover - Datas
- Sonner (toast) - Notificações
- ScrollArea - Scroll personalizado
- Avatar - Fotos de perfil

---

## 12. FICHEIROS DE CONFIGURAÇÃO

- `tailwind.config.js` - Configuração Tailwind
- `vite.config.ts` - Configuração Vite (NÃO EDITAR)
- `tsconfig.json` - Configuração TypeScript
- `index.html` - HTML base com Google Fonts (Inter)
- `src/index.css` - Variáveis CSS do tema
- `PRD.md` - Documento de requisitos do produto

---

## RESUMO EXECUTIVO

Este sistema é uma aplicação web completa para gestão de clubes desportivos, com foco em:

1. **Gestão de Membros** - Perfis completos com dados pessoais, financeiros e desportivos
2. **Gestão de Eventos** - Treinos, competições, reuniões com presenças e resultados
3. **Gestão Financeira** - Mensalidades, movimentos, controlo de contas
4. **Integração Total** - Módulos interligados com sincronização automática de dados

**Tecnologia**: React + TypeScript + Spark KV
**Persistência**: Sistema de chave-valor reativo (useKV)
**UI**: Shadcn v4 + Tailwind CSS
**Arquitetura**: SPA com routing em memória, estado global via KV

**Pontos Críticos**:
- ⚠️ Sempre usar funções callback com useKV para evitar perda de dados
- ⚠️ Relações bidirecionais devem ser mantidas sincronizadas
- ⚠️ Convocatórias geram movimentos financeiros automaticamente
- ⚠️ Estados de eventos atualizam automaticamente por hook
