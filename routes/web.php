<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MembrosController;
use App\Http\Controllers\MemberDocumentController;
use App\Http\Controllers\MemberRelationshipController;
use App\Http\Controllers\EventosController;
use App\Http\Controllers\DesportivoController;
use App\Http\Controllers\FinanceiroController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\MembershipFeeController;
use App\Http\Controllers\FinancialCategoryController;
use App\Http\Controllers\FinancialReportController;
use App\Http\Controllers\LojaController;
use App\Http\Controllers\PatrociniosController;
use App\Http\Controllers\ComunicacaoController;
use App\Http\Controllers\MarketingCampaignController;
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
    
    // Event participant management routes
    Route::post('eventos/{evento}/participants', [EventosController::class, 'addParticipant'])->name('eventos.participants.add');
    Route::delete('eventos/{evento}/participants/{user}', [EventosController::class, 'removeParticipant'])->name('eventos.participants.remove');
    Route::put('eventos/{evento}/participants/{user}', [EventosController::class, 'updateParticipantStatus'])->name('eventos.participants.update');
    Route::get('eventos-stats', [EventosController::class, 'stats'])->name('eventos.stats');
    
    Route::resource('desportivo', DesportivoController::class);
    Route::resource('financeiro', FinanceiroController::class);
    Route::resource('loja', LojaController::class);
    Route::resource('patrocinios', PatrociniosController::class);
    Route::resource('comunicacao', ComunicacaoController::class);
    Route::post('/comunicacao/{comunicacao}/send', [ComunicacaoController::class, 'send'])->name('comunicacao.send');
    Route::resource('marketing', MarketingController::class);
    Route::resource('marketing', MarketingCampaignController::class);
    
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
    
    // Financial module routes
    Route::prefix('financeiro')->group(function () {
        // Transactions
        Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
        Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
        Route::put('/transactions/{transaction}', [TransactionController::class, 'update'])->name('transactions.update');
        Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy'])->name('transactions.destroy');
        
        // Membership Fees
        Route::get('/membership-fees', [MembershipFeeController::class, 'index'])->name('membership-fees.index');
        Route::post('/membership-fees', [MembershipFeeController::class, 'store'])->name('membership-fees.store');
        Route::put('/membership-fees/{membershipFee}', [MembershipFeeController::class, 'update'])->name('membership-fees.update');
        Route::delete('/membership-fees/{membershipFee}', [MembershipFeeController::class, 'destroy'])->name('membership-fees.destroy');
        Route::post('/membership-fees/generate', [MembershipFeeController::class, 'generate'])->name('membership-fees.generate');
        Route::post('/membership-fees/{membershipFee}/mark-as-paid', [MembershipFeeController::class, 'markAsPaid'])->name('membership-fees.mark-as-paid');
        
        // Categories
        Route::get('/categories', [FinancialCategoryController::class, 'index'])->name('financial-categories.index');
        Route::post('/categories', [FinancialCategoryController::class, 'store'])->name('financial-categories.store');
        Route::put('/categories/{category}', [FinancialCategoryController::class, 'update'])->name('financial-categories.update');
        Route::delete('/categories/{category}', [FinancialCategoryController::class, 'destroy'])->name('financial-categories.destroy');
        
        // Reports
        Route::get('/reports', [FinancialReportController::class, 'index'])->name('financial-reports.index');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';