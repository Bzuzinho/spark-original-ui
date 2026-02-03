<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KeyValueStore;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class KeyValueController extends Controller
{
    /**
     * GET /api/kv/{key}
     * 
     * Fetch value by key (supports ?scope=user)
     */
    public function show(Request $request, string $key): JsonResponse
    {
        $scope = $request->get('scope', 'global');
        $userId = $scope === 'user' ? auth()->id() : null;

        $value = KeyValueStore::getValue($key, $userId);

        return response()->json([
            'key' => $key,
            'value' => $value,
            'scope' => $scope,
        ]);
    }

    /**
     * PUT /api/kv/{key}
     * 
     * Set/update value by key
     */
    public function update(Request $request, string $key): JsonResponse
    {
        $validated = $request->validate([
            'value' => 'required',
            'scope' => 'sometimes|in:global,user',
        ]);

        $scope = $validated['scope'] ?? 'global';
        $userId = $scope === 'user' ? auth()->id() : null;

        KeyValueStore::setValue($key, $validated['value'], $userId);

        return response()->json([
            'message' => 'Value saved successfully',
            'key' => $key,
        ]);
    }

    /**
     * DELETE /api/kv/{key}
     * 
     * Delete value by key
     */
    public function destroy(Request $request, string $key): JsonResponse
    {
        $scope = $request->get('scope', 'global');
        $userId = $scope === 'user' ? auth()->id() : null;

        KeyValueStore::deleteValue($key, $userId);

        return response()->json([
            'message' => 'Value deleted successfully',
            'key' => $key,
        ]);
    }
}
