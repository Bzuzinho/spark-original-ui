#!/bin/bash

echo "=== CORRIGINDO MIGRATIONS PARA UUID ==="
echo ""

declare -a migrations=(
  "database/migrations/2026_01_29_163144_create_age_groups_table.php"
  "database/migrations/2026_01_29_163144_create_user_types_table.php"
  "database/migrations/2026_01_29_163145_create_cost_centers_table.php"
  "database/migrations/2026_01_29_163145_create_event_types_table.php"
)

for file in "${migrations[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Corrigindo: $(basename "$file")"
    cp "$file" "${file}.backup"
    sed -i 's/\$table->id();/\$table->uuid('\''id'\'')->primary();/g' "$file"
    echo "   ✅ Corrigido"
  fi
done

echo ""
echo "✅ Migrations base corrigidas!"
