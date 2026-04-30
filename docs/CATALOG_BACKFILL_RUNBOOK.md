# Catalog Backfill Runbook

## Objetivo

Executar o passo 1 de unificacao do catalogo de forma repetivel e segura em ambiente local ou de validacao.

Este runbook cobre:

- seed controlado de `loja_produtos`
- `dry-run` do backfill
- persistencia real no catalogo canonico
- limpeza das fixtures de ensaio

## Pre-requisitos

- migrations do passo 1 aplicadas
- tabelas `products`, `product_variants`, `loja_produtos`, `loja_produto_variantes` e `product_catalog_migrations` disponiveis

## 1. Criar fixtures controladas do legado

```bash
php artisan db:seed --class=Database\\Seeders\\LegacyStoreCatalogSeeder --force
```

Isto cria um conjunto pequeno e previsivel de artigos legacy com codigos `LEG-SEED-*`.

## 2. Executar `dry-run`

```bash
php artisan catalog:backfill-store-products-into-products \
  --dry-run \
  --report=storage/app/testing/manual-catalog-backfill-report.json
```

Esperado:

- tabela de metricas no terminal
- relatorio JSON em `storage/app/testing/manual-catalog-backfill-report.json`
- nenhuma alteracao persistida em `products`, `product_variants` ou `product_catalog_migrations`

## 3. Executar persistencia real

So avancar se o `dry-run` nao tiver conflitos ou se os conflitos estiverem validados manualmente.

```bash
php artisan catalog:backfill-store-products-into-products \
  --report=storage/app/testing/manual-catalog-backfill-report-persisted.json
```

Esperado:

- criacao ou match de produtos canonicos
- criacao ou match de variantes canonicas
- escrita de mappings em `product_catalog_migrations`

## 4. Reexecutar para validar idempotencia

```bash
php artisan catalog:backfill-store-products-into-products
```

Esperado:

- sem duplicacao de produtos
- sem duplicacao de variantes
- sem duplicacao de mappings

## 5. Limpar fixtures de ensaio

```bash
php artisan catalog:reset-backfill-fixtures --force
```

Isto remove:

- `loja_produtos` e `loja_produto_variantes` com prefixo `LEG-SEED-`
- produtos canonicos criados a partir dessas fixtures
- variantes canonicas criadas a partir dessas fixtures
- mappings tecnicos respetivos
- relatorios JSON conhecidos em `storage/app/testing`

Para limpar apenas relatorios:

```bash
php artisan catalog:reset-backfill-fixtures --reports-only --force
```

## 6. Auditar mappings tecnicos

Depois de qualquer backfill persistido, correr a auditoria de consistencia:

```bash
php artisan catalog:audit-backfill-mappings \
  --report=storage/app/testing/catalog-audit-report.json
```

Esperado:

- `issue_count = 0`
- `valid_mappings` igual ao numero total de mappings esperados
- relatorio JSON com lista vazia de issues

Se houver issues, corrigir primeiro os mappings tecnicos ou os registos canonicos/legacy antes de avancar para o passo 2.

## Regras operacionais

- nao adicionar colunas `legacy_*` em `products` ou `product_variants`
- usar sempre `product_catalog_migrations` como ponte tecnica
- tratar conflitos de codigo ou SKU como decisao manual, nunca auto-resolver sem criterio seguro