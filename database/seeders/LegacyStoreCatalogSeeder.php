<?php

namespace Database\Seeders;

use App\Models\ItemCategory;
use App\Models\LojaProduto;
use App\Models\LojaProdutoVariante;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LegacyStoreCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $category = ItemCategory::query()->updateOrCreate(
            ['codigo' => 'LOJA-MERCH'],
            [
                'nome' => 'Merchandising Loja',
                'contexto' => 'loja',
                'ativo' => true,
            ]
        );

        $products = [
            [
                'codigo' => 'LEG-SEED-001',
                'nome' => 'T-Shirt Oficial',
                'slug' => 't-shirt-oficial',
                'descricao' => 'Artigo legado para ensaio do backfill canonico.',
                'preco' => 22.50,
                'stock_atual' => 12,
                'stock_minimo' => 2,
                'variantes' => [
                    ['nome' => 'Base', 'tamanho' => 'M', 'cor' => 'Azul', 'sku' => 'LEG-SEED-001-M-AZ', 'preco_extra' => 0, 'stock_atual' => 5],
                    ['nome' => 'Base', 'tamanho' => 'L', 'cor' => 'Azul', 'sku' => 'LEG-SEED-001-L-AZ', 'preco_extra' => 0, 'stock_atual' => 4],
                ],
            ],
            [
                'codigo' => 'LEG-SEED-002',
                'nome' => 'Calcoes Oficiais',
                'slug' => 'calcoes-oficiais',
                'descricao' => 'Segundo artigo legado para backfill.',
                'preco' => 18.00,
                'stock_atual' => 8,
                'stock_minimo' => 1,
                'variantes' => [
                    ['nome' => 'Base', 'tamanho' => 'M', 'cor' => 'Preto', 'sku' => 'LEG-SEED-002-M-PR', 'preco_extra' => 1.50, 'stock_atual' => 3],
                ],
            ],
        ];

        foreach ($products as $payload) {
            $legacyProduct = LojaProduto::query()->updateOrCreate(
                ['codigo' => $payload['codigo']],
                [
                    'categoria_id' => $category->id,
                    'nome' => $payload['nome'],
                    'slug' => $payload['slug'],
                    'descricao' => $payload['descricao'],
                    'preco' => $payload['preco'],
                    'imagem_principal_path' => null,
                    'ativo' => true,
                    'destaque' => false,
                    'gere_stock' => true,
                    'stock_atual' => $payload['stock_atual'],
                    'stock_minimo' => $payload['stock_minimo'],
                    'ordem' => 1,
                ]
            );

            foreach ($payload['variantes'] as $variantPayload) {
                LojaProdutoVariante::query()->updateOrCreate(
                    ['sku' => $variantPayload['sku']],
                    [
                        'loja_produto_id' => $legacyProduct->id,
                        'nome' => $variantPayload['nome'],
                        'tamanho' => $variantPayload['tamanho'],
                        'cor' => $variantPayload['cor'],
                        'preco_extra' => $variantPayload['preco_extra'],
                        'stock_atual' => $variantPayload['stock_atual'],
                        'ativo' => true,
                    ]
                );
            }
        }

        $this->command?->info('LegacyStoreCatalogSeeder executado com sucesso.');
    }
}