#!/usr/bin/env bash
# reset-eventos-migrations.sh - Resetar e reaplicar migrations de eventos
set -euo pipefail

echo "🔄 Resetando módulo de eventos para eliminar duplicações..."
echo ""

# Verificar se estamos no diretório correto
if [[ ! -f "artisan" ]]; then
    echo "❌ Erro: Execute este script da raiz do projeto Laravel"
    exit 1
fi

# 1. Apagar migration antiga de age_group_id (se existir)
echo "🗑️  Removendo migration obsoleta add_age_group_id_to_event_results_table..."
if [[ -f "database/migrations/2026_02_22_120000_add_age_group_id_to_event_results_table.php" ]]; then
    rm -f database/migrations/2026_02_22_120000_add_age_group_id_to_event_results_table.php
    echo "   ✔ Apagada"
else
    echo "   ✔ Não existe (OK)"
fi

# 2. Rollback migrations de eventos (order matters!)
echo ""
echo "⏪ Revertendo migrations de eventos..."

php artisan migrate:rollback --path=database/migrations/2026_01_30_150007_create_event_results_table.php || true
php artisan migrate:rollback --path=database/migrations/2026_01_30_150006_create_event_attendances_table.php || true
php artisan migrate:rollback --path=database/migrations/2026_01_30_150003_create_event_convocations_table.php || true
php artisan migrate:rollback --path=database/migrations/2026_01_30_150002_create_events_table.php || true

echo "   ✔ Rollback completo"

# 3. Rodar migrations atualizadas
echo ""
echo "🚀 Aplicando migrations corrigidas..."

php artisan migrate --path=database/migrations/2026_01_30_150002_create_events_table.php
php artisan migrate --path=database/migrations/2026_01_30_150002_1_create_event_age_group_pivot_table.php
php artisan migrate --path=database/migrations/2026_01_30_150003_create_event_convocations_table.php
php artisan migrate --path=database/migrations/2026_01_30_150006_create_event_attendances_table.php
php artisan migrate --path=database/migrations/2026_01_30_150007_create_event_results_table.php

echo "   ✔ Migrations aplicadas"

# 4. Limpar caches
echo ""
echo "🧹 Limpando caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

echo ""
echo "✅ Reset completo! Estrutura corrigida:"
echo ""
echo "   📋 Mudanças aplicadas:"
echo "   • events.escaloes_elegiveis (JSON)     → event_age_group (pivot table)"
echo "   • event_results.escalao (string)       → age_group_snapshot_id (FK)"
echo "   • event_results.age_group_id           → REMOVIDO"
echo "   • Snapshot automático via EventResult::creating()"
echo "   • Observer usa ageGroups() relationship"
echo "   • Controllers usam sync() na pivot table"
echo ""
echo "   📊 Fonte única de verdade: age_groups"
echo ""
