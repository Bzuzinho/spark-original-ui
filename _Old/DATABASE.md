# Base de Dados - Sistema de Gestão de Clube

## Tecnologia Utilizada

Este sistema utiliza o **Spark KV (Key-Value Store)** como base de dados. É uma base de dados persistente que guarda todos os dados localmente no browser do utilizador.

## Como Funciona

### Persistência de Dados
- Os dados são guardados automaticamente usando o hook `useKV` do React
- Os dados persistem entre sessões (mesmo após fechar o browser)
- Cada chave (key) guarda um tipo específico de dados

### Chaves da Base de Dados

#### Utilizadores
- **Chave**: `club-users`
- **Tipo**: Array de objetos User
- **Descrição**: Guarda todos os utilizadores do clube (atletas, treinadores, funcionários, etc.)

#### Utilizador Autenticado
- **Chave**: `authenticated-user`
- **Tipo**: Objeto User ou null
- **Descrição**: Guarda o utilizador atualmente autenticado

#### Eventos
- **Chave**: `club-events`
- **Tipo**: Array de objetos Event
- **Descrição**: Guarda todos os eventos do clube

#### Notícias
- **Chave**: `club-news`
- **Tipo**: Array de objetos NewsItem
- **Descrição**: Guarda todas as notícias publicadas

#### Patrocinadores
- **Chave**: `club-sponsors`
- **Tipo**: Array de objetos Sponsor
- **Descrição**: Guarda informação sobre patrocinadores

#### Produtos/Inventário
- **Chave**: `club-products`
- **Tipo**: Array de objetos Product
- **Descrição**: Guarda o inventário de produtos

#### Vendas
- **Chave**: `club-sales`
- **Tipo**: Array de objetos Sale
- **Descrição**: Registo de todas as vendas

#### Transações Financeiras
- **Chave**: `club-transactions`
- **Tipo**: Array de objetos Transaction
- **Descrição**: Todas as transações financeiras

#### Mensalidades
- **Chave**: `club-mensalidades`
- **Tipo**: Array de objetos Mensalidade
- **Descrição**: Registo de mensalidades dos membros

#### Centros de Custo
- **Chave**: `club-centros-custo`
- **Tipo**: Array de objetos CentroCusto
- **Descrição**: Centros de custo para organização financeira

#### Faturas
- **Chave**: `club-faturas`
- **Tipo**: Array de objetos Fatura
- **Descrição**: Todas as faturas emitidas

#### Lançamentos Financeiros
- **Chave**: `club-lancamentos`
- **Tipo**: Array de objetos LancamentoFinanceiro
- **Descrição**: Lançamentos contabilísticos

#### Extratos Bancários
- **Chave**: `club-extratos`
- **Tipo**: Array de objetos ExtratoBancario
- **Descrição**: Extratos bancários importados

## Como Usar

### No Código React (Recomendado)

```typescript
import { useKV } from '@github/spark/hooks';

// Ler e escrever dados
const [users, setUsers] = useKV<User[]>('club-users', []);

// Adicionar um novo utilizador (SEMPRE usar função de atualização)
setUsers(currentUsers => [...currentUsers, newUser]);

// Atualizar um utilizador
setUsers(currentUsers =>
  currentUsers.map(user =>
    user.id === userId ? updatedUser : user
  )
);

// Remover um utilizador
setUsers(currentUsers =>
  currentUsers.filter(user => user.id !== userId)
);
```

### Com API Direta (Para casos especiais)

```typescript
// Ler dados
const users = await spark.kv.get<User[]>('club-users');

// Guardar dados
await spark.kv.set('club-users', updatedUsers);

// Listar todas as chaves
const allKeys = await spark.kv.keys();

// Apagar uma chave
await spark.kv.delete('club-users');
```

## ⚠️ Importante

### Regras de Atualização com useKV

**SEMPRE use funções de atualização** quando modificar dados que dependem do valor anterior:

```typescript
// ❌ ERRADO - Pode perder dados (stale closure)
setUsers([...users, newUser]);

// ✅ CORRETO - Sempre seguro
setUsers(currentUsers => [...currentUsers, newUser]);
```

### Quando NÃO depende do valor anterior

Se não precisar do valor anterior, pode usar atualização direta:

```typescript
// ✓ OK - Não depende do valor anterior
setUsers([]);  // Limpar todos os utilizadores
```

## Inicialização

O sistema cria automaticamente um utilizador administrador na primeira execução:

- **Email**: admin@bscn.pt
- **Senha**: password123
- **Perfil**: admin
- **Número de Sócio**: 2025-0001

## Backup e Recuperação

Os dados estão guardados no browser. Para fazer backup:

1. Abrir as ferramentas de desenvolvimento (F12)
2. Ir para a tab "Application" ou "Storage"
3. Procurar por "IndexedDB" ou "Local Storage"
4. Os dados estão guardados com as chaves listadas acima

## Tipos de Dados

Todos os tipos estão definidos em `/src/lib/types.ts`:

- `User` - Utilizadores do sistema
- `Event` - Eventos e atividades
- `NewsItem` - Notícias
- `Sponsor` - Patrocinadores
- `Product` - Produtos/inventário
- `Sale` - Vendas
- `Transaction` - Transações
- `Mensalidade` - Mensalidades
- `CentroCusto` - Centros de custo
- `Fatura` - Faturas
- `LancamentoFinanceiro` - Lançamentos contabilísticos
- `ExtratoBancario` - Extratos bancários
