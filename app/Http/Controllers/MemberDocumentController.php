<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserDocument;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class MemberDocumentController extends Controller
{
    /**
     * Display a listing of the member's documents.
     */
    public function index(User $member): JsonResponse
    {
        $documents = $member->documents()->latest()->get();
        
        return response()->json([
            'documents' => $documents,
        ]);
    }

    /**
     * Store a newly created document.
     */
    public function store(Request $request, User $member): JsonResponse
    {
        $validated = $request->validate([
            'tipo' => ['required', Rule::in(['cc', 'atestado', 'autorizacao', 'rgpd', 'consentimento', 'afiliacao', 'declaracao_transporte', 'outro'])],
            'nome' => 'nullable|string|max:255',
            'ficheiro' => 'required|file|max:5120', // 5MB max
            'data_validade' => 'nullable|date',
        ]);

        // Store the file
        $path = $request->file('ficheiro')->store('documents', 'public');

        $document = $member->documents()->create([
            'tipo' => $validated['tipo'],
            'nome' => $validated['nome'] ?? null,
            'ficheiro' => $path,
            'data_validade' => $validated['data_validade'] ?? null,
        ]);

        return response()->json([
            'message' => 'Documento carregado com sucesso!',
            'document' => $document,
        ], 201);
    }

    /**
     * Remove the specified document.
     */
    public function destroy(User $member, UserDocument $document): JsonResponse
    {
        // Verify document belongs to member
        if ($document->user_id !== $member->id) {
            return response()->json([
                'message' => 'Documento não pertence a este membro.',
            ], 403);
        }

        // Delete file from storage
        if ($document->ficheiro) {
            Storage::disk('public')->delete($document->ficheiro);
        }

        $document->delete();

        return response()->json([
            'message' => 'Documento eliminado com sucesso!',
        ]);
    }
}
