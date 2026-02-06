<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MembrosController;
use App\Http\Controllers\DocumentosMembrosController;
use App\Http\Controllers\RelacoesMembroController;
use App\Http\Controllers\EventosController;
use App\Http\Controllers\DesportivoController;
use App\Http\Controllers\FinanceiroController;
use App\Http\Controllers\TransacoesController;
use App\Http\Controllers\TaxasController;
use App\Http\Controllers\CategoriasFinanceirasController;
use App\Http\Controllers\RelatoriosFinanceirosController;
use App\Http\Controllers\LojaController;
use App\Http\Controllers\PatrocinosController;
use App\Http\Controllers\ComunicacaoController;
use App\Http\Controllers\CampanhasMarketingController;
use App\Http\Controllers\ConfiguracoesController;
use App\Http\Controllers\EquipasController;
use App\Http\Controllers\MembrosEquipaController;
use App\Http\Controllers\SessoesFormacaoController;
use App\Http\Controllers\ConvocatoriasController;
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
    Route::resource('membros', MembrosController::class)
        ->parameters(['membros' => 'member']);
    
    // Member documents and relationships
    Route::prefix('membros/{member}')->group(function() {
        Route::get('documentos', [DocumentosMembrosController::class, 'index'])->name('membros.documentos.index');
        Route::post('documentos', [DocumentosMembrosController::class, 'store'])->name('membros.documentos.store');
        Route::delete('documentos/{document}', [DocumentosMembrosController::class, 'destroy'])->name('membros.documentos.destroy');
        
        Route::get('relacoes', [RelacoesMembroController::class, 'index'])->name('membros.relacoes.index');
        Route::post('relacoes', [RelacoesMembroController::class, 'store'])->name('membros.relacoes.store');
        Route::delete('relacoes/{relationship}', [RelacoesMembroController::class, 'destroy'])->name('membros.relacoes.destroy');
    });
    
    Route::resource('eventos', EventosController::class);
    
    // Event participant management routes
    Route::post('eventos/{event}/participantes', [EventosController::class, 'addParticipant'])->name('eventos.participantes.add');
    Route::delete('eventos/{event}/participantes/{user}', [EventosController::class, 'removeParticipant'])->name('eventos.participantes.remove');
    Route::put('eventos/{event}/participantes/{user}', [EventosController::class, 'updateParticipantStatus'])->name('eventos.participantes.update');
    Route::get('eventos-stats', [EventosController::class, 'stats'])->name('eventos.stats');
    
    Route::resource('desportivo', DesportivoController::class);
    Route::resource('financeiro', FinanceiroController::class);
    Route::resource('loja', LojaController::class);
    Route::resource('patrocinios', PatrocinosController::class);
    Route::resource('comunicacao', ComunicacaoController::class);
    Route::post('/comunicacao/{communication}/enviar', [ComunicacaoController::class, 'send'])->name('comunicacao.enviar');
    Route::resource('campanhas-marketing', CampanhasMarketingController::class);
    
    // Settings routes
    Route::get('/configuracoes', [ConfiguracoesController::class, 'index'])->name('configuracoes');
    
    // Settings CRUD sub-routes
    Route::post('/configuracoes/tipos-utilizador', [ConfiguracoesController::class, 'storeUserType'])->name('configuracoes.tipos-utilizador.store');
    Route::put('/configuracoes/tipos-utilizador/{userType}', [ConfiguracoesController::class, 'updateUserType'])->name('configuracoes.tipos-utilizador.update');
    Route::delete('/configuracoes/tipos-utilizador/{userType}', [ConfiguracoesController::class, 'destroyUserType'])->name('configuracoes.tipos-utilizador.destroy');
    
    Route::post('/configuracoes/escaloes', [ConfiguracoesController::class, 'storeAgeGroup'])->name('configuracoes.escaloes.store');
    Route::put('/configuracoes/escaloes/{ageGroup}', [ConfiguracoesController::class, 'updateAgeGroup'])->name('configuracoes.escaloes.update');
    Route::delete('/configuracoes/escaloes/{ageGroup}', [ConfiguracoesController::class, 'destroyAgeGroup'])->name('configuracoes.escaloes.destroy');
    
    Route::post('/configuracoes/tipos-evento', [ConfiguracoesController::class, 'storeEventType'])->name('configuracoes.tipos-evento.store');
    Route::put('/configuracoes/tipos-evento/{eventType}', [ConfiguracoesController::class, 'updateEventType'])->name('configuracoes.tipos-evento.update');
    Route::delete('/configuracoes/tipos-evento/{eventType}', [ConfiguracoesController::class, 'destroyEventType'])->name('configuracoes.tipos-evento.destroy');
    
    Route::put('/configuracoes/clube', [ConfiguracoesController::class, 'updateClubSettings'])->name('configuracoes.club.update');
    
    Route::put('/configuracoes/clube', [ConfiguracoesController::class, 'updateClubSettings'])->name('configuracoes.clube.update');

    Route::post('/configuracoes/permissoes', [ConfiguracoesController::class, 'storePermission'])->name('configuracoes.permissoes.store');
    Route::put('/configuracoes/permissoes/{permission}', [ConfiguracoesController::class, 'updatePermission'])->name('configuracoes.permissoes.update');
    Route::delete('/configuracoes/permissoes/{permission}', [ConfiguracoesController::class, 'destroyPermission'])->name('configuracoes.permissoes.destroy');

    Route::post('/configuracoes/centros-custo', [ConfiguracoesController::class, 'storeCostCenter'])->name('configuracoes.centros-custo.store');
    Route::put('/configuracoes/centros-custo/{costCenter}', [ConfiguracoesController::class, 'updateCostCenter'])->name('configuracoes.centros-custo.update');
    Route::delete('/configuracoes/centros-custo/{costCenter}', [ConfiguracoesController::class, 'destroyCostCenter'])->name('configuracoes.centros-custo.destroy');

    Route::post('/configuracoes/mensalidades', [ConfiguracoesController::class, 'storeMonthlyFee'])->name('configuracoes.mensalidades.store');
    Route::put('/configuracoes/mensalidades/{monthlyFee}', [ConfiguracoesController::class, 'updateMonthlyFee'])->name('configuracoes.mensalidades.update');
    Route::delete('/configuracoes/mensalidades/{monthlyFee}', [ConfiguracoesController::class, 'destroyMonthlyFee'])->name('configuracoes.mensalidades.destroy');

    Route::post('/configuracoes/artigos', [ConfiguracoesController::class, 'storeProduct'])->name('configuracoes.artigos.store');
    Route::put('/configuracoes/artigos/{product}', [ConfiguracoesController::class, 'updateProduct'])->name('configuracoes.artigos.update');
    Route::delete('/configuracoes/artigos/{product}', [ConfiguracoesController::class, 'destroyProduct'])->name('configuracoes.artigos.destroy');

    Route::post('/configuracoes/fornecedores', [ConfiguracoesController::class, 'storeSupplier'])->name('configuracoes.fornecedores.store');
    Route::put('/configuracoes/fornecedores/{supplier}', [ConfiguracoesController::class, 'updateSupplier'])->name('configuracoes.fornecedores.update');
    Route::delete('/configuracoes/fornecedores/{supplier}', [ConfiguracoesController::class, 'destroySupplier'])->name('configuracoes.fornecedores.destroy');

    Route::post('/configuracoes/provas', [ConfiguracoesController::class, 'storeProvaTipo'])->name('configuracoes.provas.store');
    Route::put('/configuracoes/provas/{provaTipo}', [ConfiguracoesController::class, 'updateProvaTipo'])->name('configuracoes.provas.update');
    Route::delete('/configuracoes/provas/{provaTipo}', [ConfiguracoesController::class, 'destroyProvaTipo'])->name('configuracoes.provas.destroy');

    Route::put('/configuracoes/notificacoes', [ConfiguracoesController::class, 'updateNotificationPreferences'])->name('configuracoes.notificacoes.update');
    // Sports module routes
    Route::resource('equipas', EquipasController::class);
    Route::resource('membros-equipa', MembrosEquipaController::class)->except(['index', 'create', 'show', 'edit']);
    Route::resource('sessoes-formacao', SessoesFormacaoController::class);
    Route::resource('convocatorias', ConvocatoriasController::class);
    // Financial module routes
    Route::prefix('financeiro')->group(function () {
        // Transactions
        Route::get('/transacoes', [TransacoesController::class, 'index'])->name('transacoes.index');
        Route::post('/transacoes', [TransacoesController::class, 'store'])->name('transacoes.store');
        Route::put('/transacoes/{transaction}', [TransacoesController::class, 'update'])->name('transacoes.update');
        Route::delete('/transacoes/{transaction}', [TransacoesController::class, 'destroy'])->name('transacoes.destroy');
        
        // Membership Fees
        Route::get('/taxas', [TaxasController::class, 'index'])->name('taxas.index');
        Route::post('/taxas', [TaxasController::class, 'store'])->name('taxas.store');
        Route::put('/taxas/{membershipFee}', [TaxasController::class, 'update'])->name('taxas.update');
        Route::delete('/taxas/{membershipFee}', [TaxasController::class, 'destroy'])->name('taxas.destroy');
        Route::post('/taxas/gerar', [TaxasController::class, 'generate'])->name('taxas.gerar');
        Route::post('/taxas/{membershipFee}/marcar-pago', [TaxasController::class, 'markAsPaid'])->name('taxas.marcar-pago');
        
        // Categories
        Route::get('/categorias', [CategoriasFinanceirasController::class, 'index'])->name('categorias-financeiras.index');
        Route::post('/categorias', [CategoriasFinanceirasController::class, 'store'])->name('categorias-financeiras.store');
        Route::put('/categorias/{category}', [CategoriasFinanceirasController::class, 'update'])->name('categorias-financeiras.update');
        Route::delete('/categorias/{category}', [CategoriasFinanceirasController::class, 'destroy'])->name('categorias-financeiras.destroy');
        
        // Reports
        Route::get('/relatorios', [RelatoriosFinanceirosController::class, 'index'])->name('relatorios-financeiros.index');
    });
});

// Backward compatibility redirects (English → Portuguese)
// These redirects help with transition period and maintain old bookmarks
Route::redirect('/members', '/membros', 301);
Route::redirect('/members/{id}', '/membros/{id}', 301);
Route::redirect('/events', '/eventos', 301);
Route::redirect('/events/{id}', '/eventos/{id}', 301);
Route::redirect('/sports', '/desportivo', 301);
Route::redirect('/sports/{id}', '/desportivo/{id}', 301);
Route::redirect('/financial', '/financeiro', 301);
Route::redirect('/shop', '/loja', 301);
Route::redirect('/shop/{id}', '/loja/{id}', 301);
Route::redirect('/sponsorships', '/patrocinios', 301);
Route::redirect('/sponsorships/{id}', '/patrocinios/{id}', 301);
Route::redirect('/communication', '/comunicacao', 301);
Route::redirect('/communication/{id}', '/comunicacao/{id}', 301);
Route::redirect('/marketing', '/campanhas-marketing', 301);
Route::redirect('/marketing/{id}', '/campanhas-marketing/{id}', 301);
Route::redirect('/settings', '/configuracoes', 301);
Route::redirect('/teams', '/equipas', 301);
Route::redirect('/teams/{id}', '/equipas/{id}', 301);
Route::redirect('/team-members', '/membros-equipa', 301);
Route::redirect('/training-sessions', '/sessoes-formacao', 301);
Route::redirect('/call-ups', '/convocatorias', 301);

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';