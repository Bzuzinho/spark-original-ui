<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MembersController;
use App\Http\Controllers\MemberDocumentController;
use App\Http\Controllers\MemberRelationshipController;
use App\Http\Controllers\EventsController;
use App\Http\Controllers\SportsController;
use App\Http\Controllers\FinanceiroController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\MembershipFeeController;
use App\Http\Controllers\FinancialCategoryController;
use App\Http\Controllers\FinancialReportController;
use App\Http\Controllers\InventarioController;
use App\Http\Controllers\PatrociniosController;
use App\Http\Controllers\ComunicacaoController;
use App\Http\Controllers\MarketingCampaignController;
use App\Http\Controllers\ConfiguracoesController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TeamMemberController;
use App\Http\Controllers\TrainingSessionController;
use App\Http\Controllers\CallUpController;
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
    Route::resource('members', MembersController::class);
    
    // Member documents and relationships
    Route::prefix('members/{member}')->group(function() {
        Route::get('documents', [MemberDocumentController::class, 'index'])->name('members.documents.index');
        Route::post('documents', [MemberDocumentController::class, 'store'])->name('members.documents.store');
        Route::delete('documents/{document}', [MemberDocumentController::class, 'destroy'])->name('members.documents.destroy');
        
        Route::get('relationships', [MemberRelationshipController::class, 'index'])->name('members.relationships.index');
        Route::post('relationships', [MemberRelationshipController::class, 'store'])->name('members.relationships.store');
        Route::delete('relationships/{relationship}', [MemberRelationshipController::class, 'destroy'])->name('members.relationships.destroy');
    });
    
    Route::resource('events', EventsController::class);
    
    // Event participant management routes
    Route::post('events/{event}/participants', [EventsController::class, 'addParticipant'])->name('events.participants.add');
    Route::delete('events/{event}/participants/{user}', [EventsController::class, 'removeParticipant'])->name('events.participants.remove');
    Route::put('events/{event}/participants/{user}', [EventsController::class, 'updateParticipantStatus'])->name('events.participants.update');
    Route::get('events-stats', [EventsController::class, 'stats'])->name('events.stats');
    
    Route::resource('sports', SportsController::class);
    Route::resource('financeiro', FinanceiroController::class);
    Route::resource('inventario', InventarioController::class);
    Route::resource('patrocinios', PatrociniosController::class);
    Route::resource('comunicacao', ComunicacaoController::class);
    Route::post('/comunicacao/{comunicacao}/send', [ComunicacaoController::class, 'send'])->name('comunicacao.send');
    Route::resource('marketing', MarketingCampaignController::class);
    
    // Configurações routes
    Route::get('/configuracoes', [ConfiguracoesController::class, 'index'])->name('configuracoes');
    
    // Configurações CRUD sub-routes
    Route::post('/configuracoes/user-types', [ConfiguracoesController::class, 'storeUserType'])->name('configuracoes.user-types.store');
    Route::put('/configuracoes/user-types/{userType}', [ConfiguracoesController::class, 'updateUserType'])->name('configuracoes.user-types.update');
    Route::delete('/configuracoes/user-types/{userType}', [ConfiguracoesController::class, 'destroyUserType'])->name('configuracoes.user-types.destroy');
    
    Route::post('/configuracoes/age-groups', [ConfiguracoesController::class, 'storeAgeGroup'])->name('configuracoes.age-groups.store');
    Route::put('/configuracoes/age-groups/{ageGroup}', [ConfiguracoesController::class, 'updateAgeGroup'])->name('configuracoes.age-groups.update');
    Route::delete('/configuracoes/age-groups/{ageGroup}', [ConfiguracoesController::class, 'destroyAgeGroup'])->name('configuracoes.age-groups.destroy');
    
    Route::post('/configuracoes/event-types', [ConfiguracoesController::class, 'storeEventType'])->name('configuracoes.event-types.store');
    Route::put('/configuracoes/event-types/{eventType}', [ConfiguracoesController::class, 'updateEventType'])->name('configuracoes.event-types.update');
    Route::delete('/configuracoes/event-types/{eventType}', [ConfiguracoesController::class, 'destroyEventType'])->name('configuracoes.event-types.destroy');
    
    Route::put('/configuracoes/club', [ConfiguracoesController::class, 'updateClubSettings'])->name('configuracoes.club.update');
    // Sports module routes
    Route::resource('teams', TeamController::class);
    Route::resource('team-members', TeamMemberController::class)->except(['index', 'create', 'show', 'edit']);
    Route::resource('training-sessions', TrainingSessionController::class);
    Route::resource('call-ups', CallUpController::class);
    // Financial module routes
    Route::prefix('financial')->group(function () {
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