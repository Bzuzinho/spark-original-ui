<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (! Schema::hasColumn('products', 'slug')) {
                $table->string('slug')->nullable()->after('codigo');
            }

            if (! Schema::hasColumn('products', 'destaque')) {
                $table->boolean('destaque')->default(false)->after('visible_in_store');
            }

            if (! Schema::hasColumn('products', 'ordem')) {
                $table->integer('ordem')->nullable()->after('stock_minimo');
            }
        });

        $usedSlugs = [];

        DB::table('products')
            ->select(['id', 'nome', 'codigo', 'slug'])
            ->orderBy('created_at')
            ->get()
            ->each(function ($product) use (&$usedSlugs) {
                $currentSlug = $product->slug;
                $slug = filled($currentSlug)
                    ? $this->uniqueSlug((string) $currentSlug, (string) $product->id, $usedSlugs)
                    : $this->buildSlug((string) $product->nome, (string) $product->codigo, (string) $product->id, $usedSlugs);

                DB::table('products')
                    ->where('id', $product->id)
                    ->update(['slug' => $slug]);
            });

        Schema::table('products', function (Blueprint $table) {
            $table->unique('slug');
            $table->index('destaque');
            $table->index('ordem');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique('products_slug_unique');
            $table->dropIndex('products_destaque_index');
            $table->dropIndex('products_ordem_index');

            if (Schema::hasColumn('products', 'ordem')) {
                $table->dropColumn('ordem');
            }

            if (Schema::hasColumn('products', 'destaque')) {
                $table->dropColumn('destaque');
            }

            if (Schema::hasColumn('products', 'slug')) {
                $table->dropColumn('slug');
            }
        });
    }

    private function buildSlug(string $name, string $code, string $id, array &$usedSlugs): string
    {
        $base = Str::slug($name);

        if (! filled($base)) {
            $base = Str::slug($code);
        }

        if (! filled($base)) {
            $base = 'produto';
        }

        return $this->uniqueSlug($base, $id, $usedSlugs);
    }

    private function uniqueSlug(string $baseSlug, string $id, array &$usedSlugs): string
    {
        $baseSlug = Str::slug($baseSlug) ?: 'produto';
        $slug = $baseSlug;
        $suffix = 2;

        while (isset($usedSlugs[$slug]) || DB::table('products')->where('slug', $slug)->where('id', '!=', $id)->exists()) {
            $slug = sprintf('%s-%d', $baseSlug, $suffix);
            $suffix++;
        }

        $usedSlugs[$slug] = true;

        return $slug;
    }

};