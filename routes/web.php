<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MembrosController;
use App\Http\Controllers\MemberDocumentController;
use App\Http\Controllers\MemberRelationshipController;
use App\Http\Controllers\EventosController;
use App\Http\Controllers\DesportivoController;
use App\Http\Controllers\FinanceiroController;
use App\Http\Controllers\LojaController;
use App\Http\Controllers\PatrociniosController;
use App\Http\Controllers\ComunicacaoController;
use App\Http\Controllers\MarketingController;
use App\Http\Controllers\SettingsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Resource routes
    Route::resource('membros', MembrosController::class);
    
    // Member documents and relationships
    Route::prefix('membros/{member}')->group(function() {
        Route::get('documents', [MemberDocumentController::class, 'index'])->name('membros.documents.index');
        Route::post('documents', [MemberDocumentController::class, 'store'])->name('membros.documents.store');
        Route::delete('documents/{document}', [MemberDocumentController::class, 'destroy'])->name('membros.documents.destroy');
        
        Route::get('relationships', [MemberRelationshipController::class, 'index'])->name('membros.relationships.index');
        Route::post('relationships', [MemberRelationshipController::class, 'store'])->name('membros.relationships.store');
        Route::delete('relationships/{relationship}', [MemberRelationshipController::class, 'destroy'])->name('membros.relationships.destroy');
    });
    
    Route::resource('eventos', EventosController::class);
    Route::resource('desportivo', DesportivoController::class);
    Route::resource('financeiro', FinanceiroController::class);
    Route::resource('loja', LojaController::class);
    Route::resource('patrocinios', PatrociniosController::class);
    Route::resource('comunicacao', ComunicacaoController::class);
    Route::resource('marketing', MarketingController::class);
    
    // Settings routes
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
    
    // Settings CRUD sub-routes
    Route::post('/settings/user-types', [SettingsController::class, 'storeUserType'])->name('settings.user-types.store');
    Route::put('/settings/user-types/{userType}', [SettingsController::class, 'updateUserType'])->name('settings.user-types.update');
    Route::delete('/settings/user-types/{userType}', [SettingsController::class, 'destroyUserType'])->name('settings.user-types.destroy');
    
    Route::post('/settings/age-groups', [SettingsController::class, 'storeAgeGroup'])->name('settings.age-groups.store');
    Route::put('/settings/age-groups/{ageGroup}', [SettingsController::class, 'updateAgeGroup'])->name('settings.age-groups.update');
    Route::delete('/settings/age-groups/{ageGroup}', [SettingsController::class, 'destroyAgeGroup'])->name('settings.age-groups.destroy');
    
    Route::post('/settings/event-types', [SettingsController::class, 'storeEventType'])->name('settings.event-types.store');
    Route::put('/settings/event-types/{eventType}', [SettingsController::class, 'updateEventType'])->name('settings.event-types.update');
    Route::delete('/settings/event-types/{eventType}', [SettingsController::class, 'destroyEventType'])->name('settings.event-types.destroy');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';