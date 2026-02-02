<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserRelationship;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class MemberRelationshipController extends Controller
{
    /**
     * Display a listing of the member's relationships.
     */
    public function index(User $member): JsonResponse
    {
        $relationships = $member->relationships()
            ->with('relatedUser')
            ->latest()
            ->get();
        
        return response()->json([
            'relationships' => $relationships,
        ]);
    }

    /**
     * Store a newly created relationship.
     */
    public function store(Request $request, User $member): JsonResponse
    {
        $validated = $request->validate([
            'related_user_id' => 'required|exists:users,id',
            'type' => ['required', Rule::in(['encarregado_educacao', 'educando', 'familiar'])],
        ]);

        // Check if relationship already exists
        $exists = UserRelationship::where('user_id', $member->id)
            ->where('related_user_id', $validated['related_user_id'])
            ->where('type', $validated['type'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Esta relação já existe.',
            ], 422);
        }

        $relationship = $member->relationships()->create($validated);

        // Create reciprocal relationship if needed
        if ($validated['type'] === 'encarregado_educacao') {
            // Create reciprocal educando relationship
            UserRelationship::firstOrCreate([
                'user_id' => $validated['related_user_id'],
                'related_user_id' => $member->id,
                'type' => 'educando',
            ]);
        } elseif ($validated['type'] === 'educando') {
            // Create reciprocal encarregado_educacao relationship
            UserRelationship::firstOrCreate([
                'user_id' => $validated['related_user_id'],
                'related_user_id' => $member->id,
                'type' => 'encarregado_educacao',
            ]);
        }

        return response()->json([
            'message' => 'Relação criada com sucesso!',
            'relationship' => $relationship->load('relatedUser'),
        ], 201);
    }

    /**
     * Remove the specified relationship.
     */
    public function destroy(User $member, UserRelationship $relationship): JsonResponse
    {
        // Verify relationship belongs to member
        if ($relationship->user_id !== $member->id) {
            return response()->json([
                'message' => 'Relação não pertence a este membro.',
            ], 403);
        }

        // Delete reciprocal relationship
        if ($relationship->type === 'encarregado_educacao') {
            UserRelationship::where('user_id', $relationship->related_user_id)
                ->where('related_user_id', $member->id)
                ->where('type', 'educando')
                ->delete();
        } elseif ($relationship->type === 'educando') {
            UserRelationship::where('user_id', $relationship->related_user_id)
                ->where('related_user_id', $member->id)
                ->where('type', 'encarregado_educacao')
                ->delete();
        }

        $relationship->delete();

        return response()->json([
            'message' => 'Relação eliminada com sucesso!',
        ]);
    }
}
