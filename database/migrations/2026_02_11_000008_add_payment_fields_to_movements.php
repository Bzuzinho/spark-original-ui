<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::table('movements', function (Blueprint $table) {
            if (!Schema::hasColumn('movements', 'metodo_pagamento')) {
                $table->string('metodo_pagamento')->nullable()->after('referencia_pagamento');
            }
            if (!Schema::hasColumn('movements', 'comprovativo')) {
                $table->string('comprovativo')->nullable()->after('metodo_pagamento');
            }
        });
    }

    public function down(): void
    {
        Schema::table('movements', function (Blueprint $table) {
            if (Schema::hasColumn('movements', 'comprovativo')) {
                $table->dropColumn('comprovativo');
            }
            if (Schema::hasColumn('movements', 'metodo_pagamento')) {
                $table->dropColumn('metodo_pagamento');
            }
        });
    }
};
