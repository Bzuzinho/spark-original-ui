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
use App\Http\Controllers\StoreCartController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\StoreOrderController;
use App\Http\Controllers\PatrocinosController;
use App\Http\Controllers\ComunicacaoController;
use App\Http\Controllers\CampanhasMarketingController;
use App\Http\Controllers\ConfiguracoesController;
use App\Http\Controllers\ConfiguracoesDesportivoController;
use App\Http\Controllers\LogisticaController;
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
    
    Route::resource('eventos', EventosController::class)->except(['create']);
    
    // Event participant management routes
    Route::post('eventos/{event}/participantes', [EventosController::class, 'addParticipant'])->name('eventos.participantes.add');
    Route::delete('eventos/{event}/participantes/{user}', [EventosController::class, 'removeParticipant'])->name('eventos.participantes.remove');
    Route::put('eventos/{event}/participantes/{user}', [EventosController::class, 'updateParticipantStatus'])->name('eventos.participantes.update');
    Route::get('eventos-stats', [EventosController::class, 'stats'])->name('eventos.stats');
    
    // Desportivo routes with tabs
    Route::prefix('desportivo')->group(function () {
        Route::get('/', [DesportivoController::class, 'index'])->name('desportivo.index');
        Route::get('planeamento', [DesportivoController::class, 'planeamento'])->name('desportivo.planeamento');
        Route::get('treinos', [DesportivoController::class, 'treinos'])->name('desportivo.treinos');
        Route::get('presencas', [DesportivoController::class, 'presencas'])->name('desportivo.presencas');
        Route::get('cais', [DesportivoController::class, 'cais'])->name('desportivo.cais');
        Route::get('competicoes', [DesportivoController::class, 'competicoes'])->name('desportivo.competicoes');
        Route::get('relatorios', [DesportivoController::class, 'relatorios'])->name('desportivo.relatorios');
        
        // Season (Época) operations
        Route::post('epocas', [DesportivoController::class, 'storeSeason'])->name('desportivo.epoca.store');
        Route::put('epocas/{season}', [DesportivoController::class, 'updateSeason'])->name('desportivo.epoca.update');
        Route::delete('epocas/{season}', [DesportivoController::class, 'deleteSeason'])->name('desportivo.epoca.delete');
        Route::post('macrociclos', [DesportivoController::class, 'storeMacrocycle'])->name('desportivo.macrociclo.store');
        Route::put('macrociclos/{macrocycle}', [DesportivoController::class, 'updateMacrocycle'])->name('desportivo.macrociclo.update');
        Route::delete('macrociclos/{macrocycle}', [DesportivoController::class, 'deleteMacrocycle'])->name('desportivo.macrociclo.delete');
        Route::post('mesociclos', [DesportivoController::class, 'storeMesocycle'])->name('desportivo.mesociclo.store');
        Route::put('mesociclos/{mesocycle}', [DesportivoController::class, 'updateMesocycle'])->name('desportivo.mesociclo.update');
        Route::delete('mesociclos/{mesocycle}', [DesportivoController::class, 'deleteMesocycle'])->name('desportivo.mesociclo.delete');
        
        // Training operations
        Route::post('treinos', [DesportivoController::class, 'storeTraining'])->name('desportivo.treino.store');
        Route::post('treinos/{training}/agendar', [DesportivoController::class, 'scheduleTraining'])->name('desportivo.treino.schedule');
        Route::put('treinos/{training}', [DesportivoController::class, 'updateTraining'])->name('desportivo.treino.update');
        Route::post('treinos/{training}/duplicar', [DesportivoController::class, 'duplicateTraining'])->name('desportivo.treino.duplicate');
        Route::delete('treinos/{training}', [DesportivoController::class, 'deleteTraining'])->name('desportivo.treino.delete');
        
        // Presence operations
            Route::put('treinos/{training}/presencas', [DesportivoController::class, 'updateTrainingPresencas'])->name('desportivo.treino.presencas.update');
            Route::post('treinos/{training}/atletas', [DesportivoController::class, 'addAthleteToTraining'])->name('desportivo.treino.atleta.add');
            Route::delete('treinos/{training}/atletas/{user}', [DesportivoController::class, 'removeAthleteFromTraining'])->name('desportivo.treino.atleta.remove');

            // Presence operations
        Route::put('presencas', [DesportivoController::class, 'updatePresencas'])->name('desportivo.presencas.update');
        Route::post('presencas/marcar-presentes', [DesportivoController::class, 'markAllPresent'])->name('desportivo.presencas.mark-all-present');
        Route::post('presencas/limpar', [DesportivoController::class, 'clearAllPresences'])->name('desportivo.presencas.clear-all');
        Route::get('cais/metricas', [DesportivoController::class, 'getCaisMetrics'])->name('desportivo.cais.metrics.index');
        Route::post('cais/metricas', [DesportivoController::class, 'storeCaisMetrics'])->name('desportivo.cais.metrics.store');
    });
    
    Route::resource('financeiro', FinanceiroController::class)->except(['create']);
    Route::prefix('logistica')->group(function () {
        Route::get('/', [LogisticaController::class, 'index'])->name('logistica.index');
        Route::post('/requisicoes', [LogisticaController::class, 'storeRequest'])->name('logistica.requisicoes.store');
        Route::put('/requisicoes/{logisticsRequest}', [LogisticaController::class, 'updateRequest'])->name('logistica.requisicoes.update');
        Route::delete('/requisicoes/{logisticsRequest}', [LogisticaController::class, 'destroyRequest'])->name('logistica.requisicoes.destroy');
        Route::post('/requisicoes/{logisticsRequest}/aprovar', [LogisticaController::class, 'approveRequest'])->name('logistica.requisicoes.approve');
        Route::post('/requisicoes/{logisticsRequest}/faturar', [LogisticaController::class, 'invoiceRequest'])->name('logistica.requisicoes.invoice');
        Route::post('/requisicoes/{logisticsRequest}/entregar', [LogisticaController::class, 'deliverRequest'])->name('logistica.requisicoes.deliver');

        Route::post('/stock/movimentos', [LogisticaController::class, 'registerStockMovement'])->name('logistica.stock.movimentos.store');

        Route::post('/emprestimos', [LogisticaController::class, 'storeLoan'])->name('logistica.emprestimos.store');
        Route::put('/emprestimos/{equipmentLoan}', [LogisticaController::class, 'updateLoan'])->name('logistica.emprestimos.update');
        Route::delete('/emprestimos/{equipmentLoan}', [LogisticaController::class, 'destroyLoan'])->name('logistica.emprestimos.destroy');
        Route::post('/emprestimos/{equipmentLoan}/devolver', [LogisticaController::class, 'returnLoan'])->name('logistica.emprestimos.return');

        Route::post('/fornecedores/compras', [LogisticaController::class, 'registerSupplierPurchase'])->name('logistica.fornecedores.compras.store');
        Route::put('/fornecedores/compras/{supplierPurchase}', [LogisticaController::class, 'updateSupplierPurchase'])->name('logistica.fornecedores.compras.update');
        Route::delete('/fornecedores/compras/{supplierPurchase}', [LogisticaController::class, 'destroySupplierPurchase'])->name('logistica.fornecedores.compras.destroy');
    });
    Route::post('financeiro/{financeiro}/apagar', [FinanceiroController::class, 'destroy'])->name('financeiro.destroy.post');
    Route::prefix('loja')->group(function () {
        Route::get('/', [StoreController::class, 'index'])->name('loja.index');
        Route::get('/carrinho', [StoreController::class, 'cart'])->name('loja.carrinho');
        Route::get('/pedidos', [StoreController::class, 'orders'])->name('loja.pedidos');

        Route::post('/carrinho/items', [StoreCartController::class, 'store'])->name('loja.cart.store');
        Route::put('/carrinho/items/{storeCartItem}', [StoreCartController::class, 'update'])->name('loja.cart.update');
        Route::delete('/carrinho/items/{storeCartItem}', [StoreCartController::class, 'destroy'])->name('loja.cart.destroy');

        Route::post('/pedidos', [StoreOrderController::class, 'store'])->name('loja.orders.store');
    });
    Route::resource('patrocinios', PatrocinosController::class);
    Route::resource('comunicacao', ComunicacaoController::class);
    Route::post('/comunicacao/{communication}/enviar', [ComunicacaoController::class, 'send'])->name('comunicacao.enviar');
    Route::resource('campanhas-marketing', CampanhasMarketingController::class);
    
    // Settings routes
    Route::get('/configuracoes', [ConfiguracoesController::class, 'index'])->name('configuracoes');
    Route::get('/configuracoes/desportivo', [ConfiguracoesDesportivoController::class, 'index'])
        ->name('configuracoes.desportivo.index');
    Route::post('/configuracoes/desportivo/estados-atleta', [ConfiguracoesDesportivoController::class, 'storeAthleteStatus'])
        ->name('configuracoes.desportivo.estados-atleta.store');
    Route::put('/configuracoes/desportivo/estados-atleta/{athleteStatus}', [ConfiguracoesDesportivoController::class, 'updateAthleteStatus'])
        ->name('configuracoes.desportivo.estados-atleta.update');
    Route::delete('/configuracoes/desportivo/estados-atleta/{athleteStatus}', [ConfiguracoesDesportivoController::class, 'destroyAthleteStatus'])
        ->name('configuracoes.desportivo.estados-atleta.destroy');
    Route::post('/configuracoes/desportivo/tipos-treino', [ConfiguracoesDesportivoController::class, 'storeTrainingType'])
        ->name('configuracoes.desportivo.tipos-treino.store');
    Route::put('/configuracoes/desportivo/tipos-treino/{trainingType}', [ConfiguracoesDesportivoController::class, 'updateTrainingType'])
        ->name('configuracoes.desportivo.tipos-treino.update');
    Route::delete('/configuracoes/desportivo/tipos-treino/{trainingType}', [ConfiguracoesDesportivoController::class, 'destroyTrainingType'])
        ->name('configuracoes.desportivo.tipos-treino.destroy');
    Route::post('/configuracoes/desportivo/zonas-treino', [ConfiguracoesDesportivoController::class, 'storeTrainingZone'])
        ->name('configuracoes.desportivo.zonas-treino.store');
    Route::put('/configuracoes/desportivo/zonas-treino/{trainingZone}', [ConfiguracoesDesportivoController::class, 'updateTrainingZone'])
        ->name('configuracoes.desportivo.zonas-treino.update');
    Route::delete('/configuracoes/desportivo/zonas-treino/{trainingZone}', [ConfiguracoesDesportivoController::class, 'destroyTrainingZone'])
        ->name('configuracoes.desportivo.zonas-treino.destroy');
    Route::post('/configuracoes/desportivo/motivos-ausencia', [ConfiguracoesDesportivoController::class, 'storeAbsenceReason'])
        ->name('configuracoes.desportivo.motivos-ausencia.store');
    Route::put('/configuracoes/desportivo/motivos-ausencia/{absenceReason}', [ConfiguracoesDesportivoController::class, 'updateAbsenceReason'])
        ->name('configuracoes.desportivo.motivos-ausencia.update');
    Route::delete('/configuracoes/desportivo/motivos-ausencia/{absenceReason}', [ConfiguracoesDesportivoController::class, 'destroyAbsenceReason'])
        ->name('configuracoes.desportivo.motivos-ausencia.destroy');
    Route::post('/configuracoes/desportivo/motivos-lesao', [ConfiguracoesDesportivoController::class, 'storeInjuryReason'])
        ->name('configuracoes.desportivo.motivos-lesao.store');
    Route::put('/configuracoes/desportivo/motivos-lesao/{injuryReason}', [ConfiguracoesDesportivoController::class, 'updateInjuryReason'])
        ->name('configuracoes.desportivo.motivos-lesao.update');
    Route::delete('/configuracoes/desportivo/motivos-lesao/{injuryReason}', [ConfiguracoesDesportivoController::class, 'destroyInjuryReason'])
        ->name('configuracoes.desportivo.motivos-lesao.destroy');
    Route::post('/configuracoes/desportivo/tipos-piscina', [ConfiguracoesDesportivoController::class, 'storePoolType'])
        ->name('configuracoes.desportivo.tipos-piscina.store');
    Route::put('/configuracoes/desportivo/tipos-piscina/{poolType}', [ConfiguracoesDesportivoController::class, 'updatePoolType'])
        ->name('configuracoes.desportivo.tipos-piscina.update');
    Route::delete('/configuracoes/desportivo/tipos-piscina/{poolType}', [ConfiguracoesDesportivoController::class, 'destroyPoolType'])
        ->name('configuracoes.desportivo.tipos-piscina.destroy');
    
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

    Route::post('/configuracoes/tipos-fatura', [ConfiguracoesController::class, 'storeInvoiceType'])->name('configuracoes.tipos-fatura.store');
    Route::put('/configuracoes/tipos-fatura/{invoiceType}', [ConfiguracoesController::class, 'updateInvoiceType'])->name('configuracoes.tipos-fatura.update');
    Route::delete('/configuracoes/tipos-fatura/{invoiceType}', [ConfiguracoesController::class, 'destroyInvoiceType'])->name('configuracoes.tipos-fatura.destroy');

    Route::post('/configuracoes/mensalidades', [ConfiguracoesController::class, 'storeMonthlyFee'])->name('configuracoes.mensalidades.store');
    Route::put('/configuracoes/mensalidades/{monthlyFee}', [ConfiguracoesController::class, 'updateMonthlyFee'])->name('configuracoes.mensalidades.update');
    Route::delete('/configuracoes/mensalidades/{monthlyFee}', [ConfiguracoesController::class, 'destroyMonthlyFee'])->name('configuracoes.mensalidades.destroy');

    Route::post('/configuracoes/artigos', [ConfiguracoesController::class, 'storeProduct'])->name('configuracoes.artigos.store');
    Route::put('/configuracoes/artigos/{product}', [ConfiguracoesController::class, 'updateProduct'])->name('configuracoes.artigos.update');
    Route::delete('/configuracoes/artigos/{product}', [ConfiguracoesController::class, 'destroyProduct'])->name('configuracoes.artigos.destroy');

    Route::post('/configuracoes/categorias-itens', [ConfiguracoesController::class, 'storeItemCategory'])->name('configuracoes.categorias-itens.store');
    Route::put('/configuracoes/categorias-itens/{itemCategory}', [ConfiguracoesController::class, 'updateItemCategory'])->name('configuracoes.categorias-itens.update');
    Route::delete('/configuracoes/categorias-itens/{itemCategory}', [ConfiguracoesController::class, 'destroyItemCategory'])->name('configuracoes.categorias-itens.destroy');

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

        Route::post('/movimentos', [FinanceiroController::class, 'storeMovimento'])->name('financeiro.movimentos.store');
        Route::put('/movimentos/{movimento}', [FinanceiroController::class, 'updateMovimento'])->name('financeiro.movimentos.update');
        Route::delete('/movimentos/{movimento}', [FinanceiroController::class, 'destroyMovimento'])->name('financeiro.movimentos.destroy');
        Route::post('/movimentos/{movimento}/liquidar', [FinanceiroController::class, 'liquidarMovimento'])->name('financeiro.movimentos.liquidar');

        Route::post('/extratos', [FinanceiroController::class, 'storeExtrato'])->name('financeiro.extratos.store');
        Route::post('/extratos/bulk', [FinanceiroController::class, 'storeExtratosBulk'])->name('financeiro.extratos.bulk');
        Route::put('/extratos/{extrato}', [FinanceiroController::class, 'updateExtrato'])->name('financeiro.extratos.update');
        Route::delete('/extratos/{extrato}', [FinanceiroController::class, 'destroyExtrato'])->name('financeiro.extratos.destroy');
        Route::post('/extratos/{extrato}/conciliar', [FinanceiroController::class, 'conciliarExtrato'])->name('financeiro.extratos.conciliar');
        Route::post('/extratos/{extrato}/desconciliar', [FinanceiroController::class, 'desconciliarExtrato'])->name('financeiro.extratos.desconciliar');
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
Route::redirect('/settings/desportivo', '/configuracoes/desportivo', 301);
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