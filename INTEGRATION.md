# Integração Módulo Desportivo ↔ Módulo de Eventos

## Objetivo
Eliminar redundância de dados entre os módulos, mantendo o **Módulo de Eventos como fonte única de verdade** para agendamento, presenças e competições, enquanto o **Módulo Desportivo** adiciona camadas de detalhes técnicos específicos do desporto.

---

## Arquitetura de Dados

### ✅ Módulo de Eventos (Fonte Única de Verdade)
**Storage Keys:**
- `club-events` → Event[] - Todos os eventos (treinos, provas, reuniões, estágios)
- `convocatorias-grupos` → ConvocatoriaGrupo[] - Convocatórias para eventos
- `evento-presencas` → EventoPresenca[] - Presenças em todos os eventos
- `evento-resultados` → EventoResultado[] - Resultados de competições

**Tipos de Eventos Relevantes:**
- `tipo: 'treino'` → Aparece no tab "Treinos" do Módulo Desportivo
- `tipo: 'prova'` → Aparece no tab "Competições" do Módulo Desportivo
- `tipo: 'estagio'` → Aparece nos relatórios e presenças
- `tipo: 'reuniao'` → Aparece apenas no módulo de eventos

### ✅ Módulo Desportivo (Detalhes Técnicos)
**Storage Keys:**
- `treinos` → Treino[] - Detalhes técnicos dos treinos (séries, zonas, volumes)
- `treino-series` → TreinoSerie[] - Séries individuais de cada treino
- `treino-atleta` → TreinoAtleta[] - Volume real e RPE por atleta
- `epocas` → Epoca[] - Épocas desportivas
- `macrociclos` → Macrociclo[] - Planeamento de macrociclos
- `mesociclos` → Mesociclo[] - Planeamento de mesociclos
- `microciclos` → Microciclo[] - Planeamento de microciclos

**Dados de Atleta:**
- `DadosDesportivos` (tabela 1:1 com User) - Número de federação, atestado médico, escalão

---

## Fluxo de Dados

### 1️⃣ Treinos
**Criação:**
1. Admin cria evento `tipo='treino'` no **Módulo de Eventos** → define data, hora, local, escalões
2. (Opcional) Admin vai ao **Módulo Desportivo** → tab "Treinos" → adiciona detalhes técnicos (séries, zonas, estilos)

**Visualização:**
- **Módulo de Eventos** → tab "Eventos" → lista todos os eventos tipo='treino'
- **Módulo Desportivo** → tab "Treinos" → mostra:
  - Estatísticas: conta eventos tipo='treino'
  - Tabela: lista entradas da tabela `treinos` (apenas treinos com detalhes técnicos)
  - Card de integração: explica o modelo e tem botão "Ir para Eventos"

**Presenças:**
- Registadas no **Módulo de Eventos** → tab "Presenças"
- Visualizadas no **Módulo Desportivo** → tab "Presenças" (readonly, com link para gerir)

---

### 2️⃣ Competições
**Criação:**
1. Admin cria evento `tipo='prova'` no **Módulo de Eventos** → define data, local, tipo de piscina
2. Admin cria convocatória no **Módulo de Eventos** → tab "Convocatórias" → seleciona atletas e provas
3. Sistema gera movimento financeiro automaticamente → `ConvocatoriaGrupo.movimento_id`

**Visualização:**
- **Módulo de Eventos** → gestão completa de provas, convocatórias, inscrições
- **Módulo Desportivo** → tab "Competições" → mostra:
  - Estatísticas: conta eventos tipo='prova', total de inscrições, resultados
  - Tabela: lista eventos tipo='prova' (próximas competições)
  - Card de integração: explica o modelo e tem botão "Ir para Eventos"

**Resultados:**
- Registados no **Módulo de Eventos** → tab "Resultados"
- Visualizados em todos os módulos que precisam (Desportivo, Ficha de Atleta)

---

### 3️⃣ Presenças
**Fonte Única:**
- `evento-presencas` no Módulo de Eventos

**Tipos de Presença:**
- `estado: 'presente'` → Atleta esteve presente
- `estado: 'ausente'` → Atleta faltou
- `estado: 'justificado'` → Falta justificada

**Gestão:**
- **Módulo de Eventos** → tab "Presenças" → registar e editar presenças

**Visualização:**
- **Módulo Desportivo** → tab "Presenças" → vista readonly com estatísticas e link para gerir
- **Ficha de Atleta** → tab "Desportivo" → grid filtrado por atleta

---

## Navegação Entre Módulos

### Do Módulo Desportivo → Módulo de Eventos
Os tabs do Módulo Desportivo que mostram dados do Módulo de Eventos têm botões "Ir para Eventos" que navegam com contexto:

```typescript
// Exemplo: CompeticoesTab.tsx
<Button onClick={() => onNavigate('events', { tab: 'eventos' })}>
  <ArrowRight /> Ir para Eventos
</Button>
```

**Mapeamento:**
- Treinos → `onNavigate('events', { tab: 'eventos' })`
- Competições → `onNavigate('events', { tab: 'eventos' })`
- Presenças → `onNavigate('events', { tab: 'presencas' })`

### Do Módulo de Eventos → Módulo Desportivo
(Opcional) Pode adicionar links do Módulo de Eventos para detalhes técnicos no Módulo Desportivo

---

## Integração Financeira

### Competições Geram Movimentos
Quando uma convocatória é criada para evento `tipo='prova'`:

1. Sistema calcula custos (por salto, por estafeta, ou valor fixo)
2. Cria `Movimento` com:
   - `classificacao: 'despesa'` (do ponto de vista do clube) ou 'receita' (se atleta paga)
   - `tipo: 'inscricao'`
   - `centro_custo_id` → herdado do escalão do atleta
3. Associa `movimento_id` à `ConvocatoriaGrupo`
4. Movimento aparece no **Módulo Financeiro** e na conta corrente do atleta

---

## Tabelas Descontinuadas

As seguintes tabelas do design original **NÃO devem ser usadas** (foram substituídas):

❌ `Competicao` → usar Event com tipo='prova'  
❌ `Prova` → usar detalhes do Event + ConvocatoriaGrupo  
❌ `InscricaoProva` → usar ConvocatoriaGrupo.atletas_ids  
❌ `Resultado` → usar EventoResultado  
❌ `Presenca` (da sports) → usar EventoPresenca  

---

## Checklist de Implementação

### ✅ Concluído
- [x] CompeticoesTab mostra eventos tipo='prova' e navega para Eventos
- [x] TreinosTab mostra eventos tipo='treino' e navega para Eventos
- [x] PresencasTab mostra evento-presencas e navega para Eventos
- [x] SportsView aceita onNavigate prop
- [x] App.tsx passa onNavigate para SportsView
- [x] PRD atualizado com nova arquitetura
- [x] Documento de integração criado

### 🔄 Próximos Passos (Sugestões)
- [ ] Adicionar criação de detalhes técnicos de treino (séries) no Módulo Desportivo
- [ ] Implementar sincronização automática entre Event tipo='treino' e tabela Treino
- [ ] Criar relatórios que cruzam dados de eventos, financeiro e desportivo
- [ ] Adicionar filtros no Módulo Desportivo por época/macrociclo
- [ ] Implementar dashboard do Módulo Desportivo com KPIs integrados

---

## Resumo Visual

```
┌─────────────────────────────────────────────────────────────┐
│                    MÓDULO DE EVENTOS                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ club-events (Event[])                                 │  │
│  │  - tipo: 'treino' ────────────┐                       │  │
│  │  - tipo: 'prova' ─────────┐   │                       │  │
│  │  - tipo: 'estagio'        │   │                       │  │
│  │  - tipo: 'reuniao'        │   │                       │  │
│  └──────────────────────────┼───┼────────────────────────┘  │
│  ┌──────────────────────────┼───┼────────────────────────┐  │
│  │ evento-presencas         │   │                        │  │
│  │ convocatorias-grupos ────┤   │                        │  │
│  │ evento-resultados        │   │                        │  │
│  └──────────────────────────┼───┼────────────────────────┘  │
└────────────────────────────┼───┼──────────────────────────┘
                              │   │
                 ┌────────────┘   └─────────────┐
                 ▼                               ▼
    ┌────────────────────────┐     ┌────────────────────────┐
    │ MÓDULO DESPORTIVO      │     │ MÓDULO FINANCEIRO      │
    │  - Treinos Tab ────────┤     │  - Movimentos          │
    │    (filtered view)     │     │  - Conta Corrente      │
    │                        │     │                        │
    │  - Competições Tab ────┼─────┤  ConvocatoriaGrupo     │
    │    (filtered view)     │     │   .movimento_id        │
    │                        │     │                        │
    │  - Presenças Tab       │     └────────────────────────┘
    │    (filtered view)     │
    │                        │
    │  + Detalhes Técnicos:  │
    │    - treinos (series)  │
    │    - treino-atleta     │
    │    - planeamento       │
    └────────────────────────┘
```

---

## Perguntas Frequentes

**P: Onde criar um novo treino?**  
R: No **Módulo de Eventos**, tipo='treino'. Depois, adicione séries no **Módulo Desportivo** se necessário.

**P: Onde registar presenças?**  
R: No **Módulo de Eventos** → tab "Presenças". O Módulo Desportivo mostra apenas visualização.

**P: Como funcionam as inscrições em competições?**  
R: Crie evento tipo='prova' no **Módulo de Eventos**, depois crie convocatória. O sistema gera movimento financeiro automaticamente.

**P: O que fazer com dados antigos nas tabelas descontinuadas?**  
R: Criar script de migração para mover dados de `Competicao` → `Event`, `Presenca` → `EventoPresenca`, etc.

**P: Posso ter treino sem detalhes técnicos?**  
R: Sim! Event tipo='treino' existe independentemente da tabela `treinos`. Os detalhes técnicos são opcionais.
