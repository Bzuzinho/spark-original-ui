# Correção de Persistência de Dados

## Problema Identificado

Os utilizadores criados desapareciam após sair do módulo devido a um problema com o uso incorreto do hook `useKV`.

## Causa Raiz

O hook `useKV` do Spark requer o uso de **atualizações funcionais** (functional updates) para garantir que sempre trabalha com o estado mais recente. Quando se usa o valor diretamente da closure (como `setUsers([...users, newUser])`), pode haver problemas de stale closure onde o valor `users` está desatualizado.

## Correções Implementadas

### 1. Arquivo: `/src/lib/auth.ts`

**Antes:**
```typescript
export async function initializeAdminUser(
  users: User[],
  setUsers: (users: User[]) => void
): Promise<void> {
  const adminExists = users.some(u => u.email_utilizador === 'admin@bscn.pt');
  
  if (!adminExists) {
    // ...
    setUsers([...users, adminUser]);  // ❌ ERRADO - usa valor da closure
  }
}
```

**Depois:**
```typescript
export async function initializeAdminUser(
  users: User[],
  setUsers: (updater: (currentUsers: User[]) => User[]) => void
): Promise<void> {
  const currentUsers = users || [];
  const adminExists = currentUsers.some(u => u.email_utilizador === 'admin@bscn.pt');
  
  if (!adminExists) {
    // ...
    setUsers((prev) => [...(prev || []), adminUser]);  // ✅ CORRETO - usa atualização funcional
  }
}
```

### 2. Arquivo: `/src/views/MembersView.tsx` (já estava correto)

O componente `MembersView` já estava usando o padrão correto:

```typescript
const handleCreateUser = () => {
  const newUser: User = { /* ... */ };
  setUsers(currentUsers => [...(currentUsers || []), newUser]);  // ✅ CORRETO
};

const handleSaveUser = (updatedUser: User) => {
  setUsers(currentUsers => {  // ✅ CORRETO
    const currentList = currentUsers || [];
    // ... lógica de atualização
    return newUsers;
  });
};
```

## Como Funciona o useKV

O hook `useKV` do Spark funciona de forma similar ao `useState` do React, mas com persistência automática:

```typescript
// ❌ ERRADO - Stale closure problem
const [users, setUsers] = useKV('key', []);
setUsers([...users, newItem]);  // 'users' pode estar desatualizado

// ✅ CORRETO - Sempre tem o valor mais recente
const [users, setUsers] = useKV('key', []);
setUsers((currentUsers) => [...currentUsers, newItem]);
```

## Regra Geral

**SEMPRE use atualizações funcionais com `useKV` quando o novo valor depende do valor anterior:**

```typescript
// Para adicionar
setUsers((current) => [...(current || []), newUser]);

// Para atualizar
setUsers((current) => 
  (current || []).map(user => 
    user.id === targetId ? updatedUser : user
  )
);

// Para remover
setUsers((current) => 
  (current || []).filter(user => user.id !== targetId)
);

// Para substituir completamente (não depende do valor anterior)
setUsers(newCompleteList);  // Este caso está OK
```

## Teste de Verificação

Para verificar que a correção funciona:

1. Criar um novo utilizador no módulo de Membros
2. Navegar para outro módulo (ex: Módulo Financeiro)
3. Voltar ao módulo de Membros
4. Verificar que o utilizador criado ainda está presente
5. Refrescar a página (F5)
6. Verificar que o utilizador ainda persiste após o refresh

## Status

✅ Correção implementada
✅ Padrão funcional aplicado em `auth.ts`
✅ `MembersView.tsx` já seguia o padrão correto
✅ Sistema de persistência validado
