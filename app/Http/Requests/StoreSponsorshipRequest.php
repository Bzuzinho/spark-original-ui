<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSponsorshipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sponsor_id' => ['required', 'exists:sponsors,id'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'type' => ['required', 'in:money,goods,mixed'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'periodicity' => ['required', 'in:pontual,mensal,trimestral,anual'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'cost_center_id' => ['nullable', 'exists:cost_centers,id'],
            'status' => ['required', 'in:ativo,pendente,fechado,cancelado'],
            'notes' => ['nullable', 'string'],
            'money_items' => ['nullable', 'array'],
            'money_items.*.id' => ['nullable', 'uuid'],
            'money_items.*.description' => ['required_with:money_items', 'string', 'max:255'],
            'money_items.*.amount' => ['required_with:money_items', 'numeric', 'gt:0'],
            'money_items.*.expected_date' => ['nullable', 'date'],
            'goods_items' => ['nullable', 'array'],
            'goods_items.*.id' => ['nullable', 'uuid'],
            'goods_items.*.item_name' => ['required_with:goods_items', 'string', 'max:255'],
            'goods_items.*.item_id' => ['nullable', 'exists:products,id'],
            'goods_items.*.category' => ['nullable', 'string', 'max:255'],
            'goods_items.*.quantity' => ['required_with:goods_items', 'numeric', 'gt:0'],
            'goods_items.*.unit_value' => ['nullable', 'numeric', 'gte:0'],
            'goods_items.*.total_value' => ['nullable', 'numeric', 'gte:0'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $type = $this->input('type');
            $moneyItems = collect($this->input('money_items', []))
                ->filter(fn ($item) => !empty($item['description']) && (float) ($item['amount'] ?? 0) > 0);
            $goodsItems = collect($this->input('goods_items', []))
                ->filter(fn ($item) => !empty($item['item_name']) && (float) ($item['quantity'] ?? 0) > 0);

            if (in_array($type, ['money', 'mixed'], true) && $moneyItems->isEmpty()) {
                $validator->errors()->add('money_items', 'Tem de existir pelo menos uma linha monetária válida.');
            }

            if (in_array($type, ['goods', 'mixed'], true) && $goodsItems->isEmpty()) {
                $validator->errors()->add('goods_items', 'Tem de existir pelo menos uma linha de artigos válida.');
            }
        });
    }
}