<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AgeGroup;
use Illuminate\Http\Request;

class EscaloesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return AgeGroup::orderBy('min_age')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:age_groups',
            'description' => 'nullable|string',
            'min_age' => 'nullable|integer|min:0',
            'max_age' => 'nullable|integer|min:0',
            'min_year' => 'nullable|integer',
            'max_year' => 'nullable|integer',
            'sexo' => 'nullable|string|in:masculino,feminino,misto',
            'active' => 'boolean',
        ]);

        return AgeGroup::create($validated);
    }

    /**
     * Display the specified resource.
     */
    public function show(AgeGroup $ageGroup)
    {
        return $ageGroup;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AgeGroup $ageGroup)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:age_groups,name,' . $ageGroup->id,
            'description' => 'nullable|string',
            'min_age' => 'nullable|integer|min:0',
            'max_age' => 'nullable|integer|min:0',
            'min_year' => 'nullable|integer',
            'max_year' => 'nullable|integer',
            'sexo' => 'nullable|string|in:masculino,feminino,misto',
            'active' => 'boolean',
        ]);

        $ageGroup->update($validated);
        return $ageGroup;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AgeGroup $ageGroup)
    {
        $ageGroup->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
