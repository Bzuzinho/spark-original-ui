# Relatório de Debug - Sistema de Eventos

## Data: 2025
## Iteração: 2

---

## 🔍 Problema Identificado

O sistema estava a apresentar um loop infinito de atualizações causado pela duplicação do hook `useEventStatusSync` em múltiplos componentes.

### Sintomas:
- Re-renderizações infinitas
- Performance degradada
- Possível travamento do browser
- Console logs excessivos

---

## 🐛 Causa Raiz

O hook `useEventStatusSync` estava a ser chamado em **3 locais diferentes**:

1. ✅ `EventsView.tsx` (linha 30) - **CORRETO** - View principal
2. ❌ `EventosCalendar.tsx` (linha 25) - **REMOVIDO** - Duplicação
3. ❌ `EventosList.tsx` (linha 65) - **REMOVIDO** - Duplicação

### Por que isto causava problemas?

Cada componente filho que usava o hook estava a:
1. Observar os eventos no `useKV`
2. Detectar eventos expirados
3. Actualizar o estado através do `setEvents`
4. Triggerar re-renderização em todos os componentes
5. Repetir o ciclo infinitamente

---

## ✅ Solução Implementada

### 1. Removida duplicação do hook

**EventosCalendar.tsx:**
```diff
- import { useEventStatusSync } from '@/hooks/use-event-status-sync';

  export function EventosCalendar() {
    const [events, setEvents] = useKV<Event[]>('club-events', []);
-   useEventStatusSync(events, setEvents);
```

**EventosList.tsx:**
```diff
- import { useEventStatusSync } from '@/hooks/use-event-status-sync';

  export function EventosList() {
    const [events, setEvents] = useKV<Event[]>('club-events', []);
-   useEventStatusSync(events, setEvents);
```

### 2. Hook permanece apenas no EventsView

O `EventsView.tsx` é o componente pai que gere toda a vista de eventos. É o local correcto para ter esta lógica centralizada.

**EventsView.tsx (correto):**
```typescript
export function EventsView({ navigationContext, onClearContext }: EventsViewProps) {
  const [activeTab, setActiveTab] = useState('calendario');
  const [events, setEvents] = useKV<Event[]>('club-events', []);
  
  useEventStatusSync(events, setEvents); // ✅ Única instância
```

### 3. Melhorias no hook para prevenir loops

Adicionado:
- `useRef` para tracking de estado anterior
- Comparação de estado antes de actualizar
- Logs detalhados para debug
- Protecção contra updates desnecessários

```typescript
const lastCheckRef = useRef<string>('');

const currentCheck = JSON.stringify(events.map(e => ({ id: e.id, estado: e.estado })));

if (hasChanges && currentCheck !== lastCheckRef.current) {
  console.log('[EventStatusSync] Atualizando eventos:', changedEventIds);
  lastCheckRef.current = JSON.stringify(updatedEvents.map(e => ({ id: e.id, estado: e.estado })));
  setEvents(() => updatedEvents);
}
```

---

## 🧪 Como Testar

### Teste 1: Verificar que não há loops infinitos
1. Abrir DevTools Console (F12)
2. Navegar para a vista de Eventos
3. Alternar entre os tabs (Calendário, Eventos, Convocatórias, etc.)
4. **Resultado esperado:** Não devem aparecer logs repetidos de "[EventStatusSync]"

### Teste 2: Verificar actualização automática de estados
1. Criar um evento com data passada e estado "agendado"
2. Aguardar alguns segundos
3. Recarregar a página
4. **Resultado esperado:** O evento deve aparecer com estado "concluído"

### Teste 3: Performance
1. Criar vários eventos (5-10)
2. Navegar rapidamente entre tabs
3. **Resultado esperado:** Interface deve responder imediatamente sem lag

### Teste 4: Verificar DiagnosticOverlay
1. Abrir a aplicação
2. Interagir com eventos
3. **Resultado esperado:** O botão de diagnóstico não deve aparecer no canto inferior direito

---

## 📊 Checklist de Validação

- [x] Hook removido de EventosCalendar.tsx
- [x] Hook removido de EventosList.tsx
- [x] Hook mantido apenas em EventsView.tsx
- [x] Adicionado tracking de estado no hook
- [x] Adicionados logs para debug
- [ ] Testado: Não há loops infinitos
- [ ] Testado: Estados são actualizados correctamente
- [ ] Testado: Performance está normal
- [ ] Testado: Sem erros no console

---

## 🎯 Próximos Passos Recomendados

1. **Monitorizar** a aplicação durante uso normal
2. **Verificar** se há outros hooks ou efeitos duplicados
3. **Considerar** implementar React DevTools Profiler para análise de performance
4. **Documentar** patterns para evitar duplicação de hooks em componentes filhos

---

## 📝 Notas Técnicas

### Padrão Correcto para Hooks de Sincronização:
- ✅ Colocar em componentes **pais** (views principais)
- ❌ Evitar em componentes **filhos** que recebem dados por props
- ✅ Um único ponto de controlo para cada recurso
- ✅ Componentes filhos devem ser **stateless** quando possível

### Arquitectura Recomendada:
```
EventsView (tem useEventStatusSync)
  ├── EventosCalendar (recebe events via useKV - leitura apenas)
  ├── EventosList (recebe events via useKV - leitura apenas)
  ├── ConvocatoriasList (recebe events via useKV - leitura apenas)
  └── ... outros componentes
```

---

## 🔗 Ficheiros Modificados

1. `/src/components/eventos/EventosCalendar.tsx`
2. `/src/components/eventos/EventosList.tsx`
3. `/src/hooks/use-event-status-sync.ts`
4. `/DEBUG_REPORT.md` (este ficheiro)

---

**Status:** ✅ CORRIGIDO - Aguardando testes de validação
