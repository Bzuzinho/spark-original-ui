<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UsersController extends Controller
{
    /**
     * GET /api/users
     */
    public function index(): JsonResponse
    {
        $users = User::with(['userTypes', 'ageGroup'])
            ->orderBy('nome_completo')
            ->get();
        
        return response()->json($users);
    }

    /**
     * POST /api/users
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nome_completo' => 'required|string|max:255',
            'email' => 'nullable|email|unique:users,email',
            'data_nascimento' => 'required|date',
            'tipo_membro' => 'nullable|array',
            'estado' => 'required|in:ativo,inativo,suspenso',
            'perfil' => 'nullable|in:admin,atleta,encarregado,treinador,socio',
            'sexo' => 'nullable|in:M,F',
            'morada' => 'nullable|string',
            'contacto' => 'nullable|string',
            'telemovel' => 'nullable|string',
            'nif' => 'nullable|string',
            'password' => 'nullable|string|min:8',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user = User::create($validated);
        
        return response()->json($user, 201);
    }

    /**
     * GET /api/users/{id}
     */
    public function show(string $id): JsonResponse
    {
        $user = User::with(['userTypes', 'ageGroup'])->findOrFail($id);
        return response()->json($user);
    }

    /**
     * PUT /api/users/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        $validated = $request->validate([
            'nome_completo' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'data_nascimento' => 'sometimes|date',
            'tipo_membro' => 'sometimes|array',
            'estado' => 'sometimes|in:ativo,inativo,suspenso',
            'perfil' => 'sometimes|in:admin,atleta,encarregado,treinador,socio',
            'sexo' => 'sometimes|in:M,F',
            'morada' => 'sometimes|string',
            'contacto' => 'sometimes|string',
            'telemovel' => 'sometimes|string',
            'nif' => 'sometimes|string',
            'password' => 'sometimes|string|min:8',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);
        
        return response()->json($user);
    }

    /**
     * DELETE /api/users/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->delete();
        
        return response()->json(['message' => 'User deleted successfully']);
    }
}
