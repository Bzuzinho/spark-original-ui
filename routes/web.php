<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    $userTypes = \App\Models\UserType::where('active', true)->get();
    $ageGroups = \App\Models\AgeGroup::all();
    
    // Get user counts
    $totalUsers = \App\Models\User::count();
    
    // Filter users by tipo_membro jsonb field
    // Athletes: users with tipo='Atleta' in tipo_membro jsonb
    $activeAthletes = \App\Models\User::whereJsonContains('tipo_membro->tipo', 'Atleta')->count();
    
    // Guardians: users with tipo='Encarregado' in tipo_membro jsonb
    $guardians = \App\Models\User::whereJsonContains('tipo_membro->tipo', 'Encarregado')->count();
    
    $stats = [
        'totalUsers' => $totalUsers,
        'totalUserTypes' => $userTypes->count(),
        'totalAgeGroups' => $ageGroups->count(),
        'totalMembers' => $totalUsers, // Same as totalUsers for now
        'activeAthletes' => $activeAthletes,
        'guardians' => $guardians,
        'upcomingEvents' => 0, // Placeholder until events table exists
        'monthlyRevenue' => 0.00, // Placeholder until transactions table exists
    ];
    
    return Inertia::render('Dashboard', [
        'userTypes' => $userTypes,
        'ageGroups' => $ageGroups,
        'stats' => $stats,
    ]);
})->middleware(['auth'])->name('dashboard');

// Módulos principais (9 menus)
Route::middleware('auth')->group(function () {
    Route::get('/membros', fn() => Inertia::render('Membros/Index'))->name('membros');
    Route::get('/desportivo', fn() => Inertia::render('Desportivo/Index'))->name('desportivo');
    Route::get('/eventos', fn() => Inertia::render('Eventos/Index'))->name('eventos');
    Route::get('/financeiro', fn() => Inertia::render('Financeiro/Index'))->name('financeiro');
    Route::get('/loja', fn() => Inertia::render('Loja/Index'))->name('loja');
    Route::get('/patrocinios', fn() => Inertia::render('Patrocinios/Index'))->name('patrocinios');
    Route::get('/comunicacao', fn() => Inertia::render('Comunicacao/Index'))->name('comunicacao');
    Route::get('/marketing', fn() => Inertia::render('Marketing/Index'))->name('marketing');
    Route::get('/settings', fn() => Inertia::render('Settings/Index'))->name('settings');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

// Test route (remove later)
Route::get('/test-components', function () {
    return Inertia::render('TestComponents');
})->name('test.components');

