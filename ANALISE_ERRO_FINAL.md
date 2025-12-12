# 🔍 ANÁLISE SISTEMÁTICA DO ERRO RECORRENTE

## Data: 2025
## Status: EM ANÁLISE

---

## 📋 PROBLEMA REPORTADO

**Situação:** Erro recorrente mesmo após múltiplas tentativas de correção ("Fix all reported errors")

**Frequência:** Sistemático - aparece constantemente

**Contexto:** O utilizador reporta que o mesmo erro continua a aparecer repetidamente

---

## 🎯 ESTRATÉGIA DE DIAGNÓSTICO

### Fase 1: Identificar o Erro Específico

Como não foi fornecido o erro específico, vou verificar os pontos mais problemáticos baseado no histórico:

1. **Módulo Desportivo** - Presenças e Treinos
2. **Select Components** - Erro com valores vazios
3. **Navegação** - Entre perfis de utilizador
4. **Persistência de dados** - useKV

### Fase 2: Áreas de Verificação Prioritária

#### A. Select Components com Valores Vazios

**Erro conhecido:**
```
A <Select.Item /> must have a value prop that is not an empty string.
```

**Localizações a verificar:**
- `/src/components/tabs/SportsTab.tsx` (resultados de provas)
- `/src/components/tabs/sports/TreinosTab.tsx`
- `/src/components/tabs/sports/PresencasTab.tsx`
- Qualquer Dialog de criação/edição que use Select

**Solução:**
- Garantir que todos os Select.Item têm `value` não-vazio
- Usar placeholder em vez de item vazio
- Validar antes de submeter

#### B. Problemas de Importação/Módulos

**Erro conhecido:**
```
Failed to resolve module
Cannot find module
```

**Verificações:**
- Imports com caminhos incorretos
- Componentes não exportados
- Circular dependencies

#### C. Problemas com useKV

**Erro conhecido:**
- Perda de dados
- Dados não persistem
- Atualizações não funcionam

**Padrão correto já documentado em SOLUCAO-DEFINITIVA.md**

---

## 🔧 PLANO DE CORREÇÃO SISTEMÁTICA

### Passo 1: Verificar TODOS os Select Components

```bash
# Procurar por Select.Item em todos os ficheiros
grep -r "Select.Item" src/
```

**Ação:** Garantir que NENHUM Select.Item tem `value=""`

### Passo 2: Verificar Imports

**Verificar:**
- Todos os paths `@/...` estão corretos
- Todos os componentes exportados existem
- Não há imports circulares

### Passo 3: Verificar useKV Patterns

**Procurar por padrões incorretos:**
```typescript
// ❌ ERRADO
setData([...data, item])
setData(data.map(...))
setData(data.filter(...))
```

**Substituir por:**
```typescript
// ✅ CORRETO
setData(current => [...(current || []), item])
setData(current => (current || []).map(...))
setData(current => (current || []).filter(...))
```

### Passo 4: Verificar Navegação

**Pontos críticos:**
- Navegação de educando → encarregado
- Navegação de encarregado → educando
- Navegação em convocatórias
- Navegação em resultados

---

## 📝 CHECKLIST DE VERIFICAÇÃO COMPLETA

### Módulo Desportivo

- [ ] TreinosTab.tsx - Criação de treino
- [ ] TreinosTab.tsx - Edição de treino
- [ ] TreinosTab.tsx - Select de escalões
- [ ] PresencasTab.tsx - Registo de presenças
- [ ] PresencasTab.tsx - Lista de atletas
- [ ] DashboardTab.tsx - Estatísticas
- [ ] CompeticoesTab.tsx - Criação de competições
- [ ] RelatoriosTab.tsx - Geração de relatórios

### Módulo Membros

- [ ] SportsTab.tsx - Resultados de provas
- [ ] SportsTab.tsx - Select de eventos
- [ ] SportsTab.tsx - Select de provas
- [ ] SportsTab.tsx - Edição de resultado
- [ ] PersonalTab.tsx - Navegação para encarregados
- [ ] PersonalTab.tsx - Navegação para educandos

### Módulo Eventos

- [ ] EventsView.tsx - Criação de eventos
- [ ] Presenças - Registo
- [ ] Convocatórias - Criação
- [ ] Convocatórias - Navegação

### Componentes Gerais

- [ ] Todos os Select têm valores não-vazios
- [ ] Todos os imports estão corretos
- [ ] Todos os useKV usam padrão funcional
- [ ] Todas as navegações funcionam

---

## 🚨 ERROS MAIS PROVÁVEIS (por ordem de probabilidade)

### 1. Select.Item com value vazio (80% probabilidade)

**Localização provável:**
- `/src/components/tabs/SportsTab.tsx` - Dialog de criar/editar resultado

**Sintoma:** Erro ao abrir dialog de criação/edição

**Correção:** Remover Select.Item vazios, usar placeholder

### 2. Navegação não funciona (15% probabilidade)

**Localização provável:**
- Componentes de cards clicáveis
- Links para perfis de utilizador

**Sintoma:** Clicar não navega

**Correção:** Verificar props `onNavigate` e handlers de click

### 3. Dados não persistem (5% probabilidade)

**Localização provável:**
- Qualquer componente com useKV

**Sintoma:** Dados desaparecem após refresh

**Correção:** Usar padrão funcional de atualização

---

## 🔄 PROCESSO DE TESTE

### Teste 1: Módulo Desportivo - Resultados
1. Ir a Membros → selecionar atleta → tab Desportivo
2. Na tabela "Resultados", clicar "Criar Novo"
3. **Verificar se abre sem erro**
4. Tentar preencher todos os campos
5. **Verificar se Select de Evento funciona**
6. Guardar
7. **Verificar se persiste**

### Teste 2: Módulo Desportivo - Presenças
1. Ir a Gestão Desportiva → Presenças
2. Verificar se registos existentes aparecem
3. Clicar para registar presenças
4. **Verificar se lista de atletas aparece**
5. Marcar presenças
6. Guardar
7. **Verificar se estatísticas atualizam**

### Teste 3: Navegação
1. Ir a Membros → selecionar atleta menor
2. Na tab Personal, ver encarregados
3. Clicar no card do encarregado
4. **Verificar se navega para perfil do encarregado**

---

## 💡 PRÓXIMA AÇÃO IMEDIATA

**PASSO 1:** Verificar TODOS os ficheiros com Select para encontrar items com `value=""`

**PASSO 2:** Corrigir TODOS os Select.Item problemáticos de uma só vez

**PASSO 3:** Testar sistematicamente cada correção

**PASSO 4:** Documentar o erro específico que estava a acontecer

---

## 📞 NECESSIDADE DE INFORMAÇÃO

Para resolver definitivamente, preciso saber:

1. **Qual é o erro específico que aparece?**
   - Mensagem de erro completa
   - Stack trace
   - Console do browser (F12 → Console)

2. **Quando é que o erro aparece?**
   - Ao abrir a aplicação?
   - Ao clicar em algo específico?
   - Ao tentar guardar?
   - Ao navegar?

3. **Em que módulo/página?**
   - Membros?
   - Gestão Desportiva?
   - Eventos?
   - Outro?

4. **O que estava a tentar fazer?**
   - Criar novo registo?
   - Editar existente?
   - Apenas visualizar?
   - Navegar?

---

## ✅ AÇÃO A TOMAR

Vou agora fazer uma **verificação sistemática de TODOS os Select components** no código e corrigir qualquer problema encontrado.

