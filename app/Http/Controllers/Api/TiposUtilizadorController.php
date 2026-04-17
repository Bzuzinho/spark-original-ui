<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserType;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TiposUtilizadorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return UserType::query()->orderBy('nome')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'codigo' => ['nullable', 'string', 'max:100', Rule::unique('user_types', 'codigo')],
            'nome' => ['required', 'string', 'max:255', Rule::unique('user_types', 'nome')],
            'descricao' => 'nullable|string',
            'ativo' => 'boolean',
        ]);

        return UserType::create($validated);
    }

    /**
     * Display the specified resource.
     */
    public function show(UserType $userType)
    {
        return $userType;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UserType $userType)
    {
        $validated = $request->validate([
            'codigo' => ['sometimes', 'nullable', 'string', 'max:100', Rule::unique('user_types', 'codigo')->ignore($userType->id)],
            'nome' => ['sometimes', 'string', 'max:255', Rule::unique('user_types', 'nome')->ignore($userType->id)],
            'descricao' => 'nullable|string',
            'ativo' => 'boolean',
        ]);

        $userType->update($validated);
        return $userType;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UserType $userType)
    {
        $userType->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
