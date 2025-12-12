# Análise da Base de Dados - Sistema de Gestão de Clube

## Problema Identificado

Os utilizadores criados estavam a desaparecer devido a um problema na inicialização dos dados. O issue principal estava localizado no ficheiro `src/App.tsx`.

## Causas do Problema

### 1. **Inicialização com Stale Closure**
O código original usava uma função externa `initializeAdminUser` que recebia o array `users` como parâmetro:

```typescript
// ❌ CÓDIGO PROBLEMÁTICO (ANTES)
useEffect(() => {
  initializeAdminUser(users || [], setUsers);
}, []);
```

O problema é que o `users` passado para a função poderia estar desatualizado (stale) no momento da execução, especialmente na primeira renderização quando o `useKV` ainda está a carregar os dados.

### 2. **Falta de Functional Updates**
A função `setUsers` não estava sempre a usar functional updates, o que pode causar perda de dados quando múltiplas atualizações acontecem rapidamente.

## Solução Implementada

### 1. **Inicialização Corrigida**
Movemos a lógica de inicialização diretamente para dentro do `useEffect` e usamos functional updates:

```typescript
// ✅ CÓDIGO CORRETO (DEPOIS)
useEffect(() => {
  const initialize = async () => {
    const currentUsers = users || [];
    const adminExists = currentUsers.some(u => u.email_utilizador === 'admin@bscn.pt');
    
    if (!adminExists) {
      const adminUser: User = {
        id: crypto.randomUUID(),
        numero_socio: '2025-0001',
        nome_completo: 'Administrador',
        email_utilizador: 'admin@bscn.pt',
        senha: 'password123',
        perfil: 'admin',
        tipo_membro: [],
        estado: 'ativo',
        data_nascimento: '1990-01-01',
        menor: false,
        sexo: 'masculino',
        rgpd: true,
        consentimento: true,
        afiliacao: true,
        declaracao_de_transporte: true,
        ativo_desportivo: false,
      };
      
      // Usa functional update para garantir que não perde dados
      setUsers((current) => [...(current || []), adminUser]);
    }
  };
  
  initialize();
}, []);
```

### 2. **Nova Aba de Diagnóstico**
Foi adicionada uma nova aba "Base de Dados" nas Configurações (`src/views/SettingsView.tsx`) que permite:

- **Ver todos os utilizadores** armazenados na base de dados
- **Ver todas as chaves** do key-value store
- **Exportar utilizadores** para um ficheiro JSON de backup

## Como Usar as Ferramentas de Diagnóstico

### 1. Aceder às Configurações
1. Faça login no sistema com:
   - Email: `admin@bscn.pt`
   - Senha: `password123`
2. Navegue para "Configurações" no menu lateral

### 2. Aba "Base de Dados"
Aqui pode:

- **Ver lista de utilizadores**: Mostra todos os utilizadores guardados com seu número de sócio, nome, email, perfil e estado
- **Ver Todas as Chaves**: Clique neste botão para ver todas as chaves armazenadas no sistema de persistência
- **Exportar Utilizadores**: Faz download de um ficheiro JSON com todos os dados dos utilizadores para backup

### 3. Verificar Persistência
Para confirmar que os dados estão a ser guardados corretamente:

1. Crie um novo utilizador na aba "Membros"
2. Vá para "Configurações" → "Base de Dados"
3. Verifique se o utilizador aparece na lista
4. Recarregue a página (F5)
5. Volte a verificar - o utilizador deve continuar lá

## Chaves do Key-Value Store

O sistema usa as seguintes chaves principais:

- **`club-users`**: Array de todos os utilizadores do sistema
- **`authenticated-user`**: O utilizador atualmente autenticado
- **`settings-age-groups`**: Configurações de escalões
- **`settings-user-types`**: Tipos de utilizador
- **`settings-permissions`**: Permissões por tipo de utilizador
- **`settings-articles`**: Artigos do catálogo
- **`settings-monthly-fees`**: Mensalidades por escalão
- **`settings-cost-centers`**: Centros de custos
- **`settings-club-info`**: Informações do clube
- **`settings-notification-prefs`**: Preferências de notificações

## Boas Práticas para useKV

Ao trabalhar com o hook `useKV`, sempre use **functional updates** quando o novo valor depende do valor anterior:

```typescript
// ❌ ERRADO - usa valor do closure (pode estar desatualizado)
const [users, setUsers] = useKV('users', []);
setUsers([...users, newUser]);

// ✅ CORRETO - usa functional update
const [users, setUsers] = useKV('users', []);
setUsers((currentUsers) => [...currentUsers, newUser]);
```

## Próximos Passos

Se continuar a ter problemas com persistência de dados:

1. Use a aba "Base de Dados" para verificar se os dados estão realmente lá
2. Exporte os dados antes de fazer alterações importantes
3. Verifique o console do browser por erros
4. Confirme que está sempre a usar functional updates no `setUsers`

## Notas Técnicas

- O sistema usa o `useKV` hook do `@github/spark/hooks` para persistência
- Os dados são guardados no key-value store do Spark runtime
- A persistência é automática e não requer configuração adicional
- Cada refresh da página recarrega os dados do store
