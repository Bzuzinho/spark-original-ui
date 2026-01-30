<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Páginas placeholder (9 módulos)
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