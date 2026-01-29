<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserType;
use Illuminate\Http\Request;

class UserTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return UserType::orderBy('name')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:user_types',
            'description' => 'nullable|string',
            'active' => 'boolean',
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
            'name' => 'sometimes|string|max:255|unique:user_types,name,' . $userType->id,
            'description' => 'nullable|string',
            'active' => 'boolean',
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
