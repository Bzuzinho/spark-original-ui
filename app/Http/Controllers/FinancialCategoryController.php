<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFinancialCategoryRequest;
use App\Http\Requests\UpdateFinancialCategoryRequest;
use App\Models\FinancialCategory;
use Illuminate\Http\RedirectResponse;

class FinancialCategoryController extends Controller
{
    public function index()
    {
        $categories = FinancialCategory::orderBy('nome')->get();

        return response()->json($categories);
    }

    public function store(StoreFinancialCategoryRequest $request): RedirectResponse
    {
        FinancialCategory::create($request->validated());

        return redirect()->back()->with('success', 'Categoria criada com sucesso!');
    }

    public function update(UpdateFinancialCategoryRequest $request, FinancialCategory $category): RedirectResponse
    {
        $category->update($request->validated());

        return redirect()->back()->with('success', 'Categoria atualizada com sucesso!');
    }

    public function destroy(FinancialCategory $category): RedirectResponse
    {
        $category->delete();

        return redirect()->back()->with('success', 'Categoria eliminada com sucesso!');
    }
}
