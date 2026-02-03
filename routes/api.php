<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TiposUtilizadorController;
use App\Http\Controllers\Api\EscaloesController;
use App\Http\Controllers\Api\TiposEventoController;
use App\Http\Controllers\Api\CentrosCustoController;
use App\Http\Controllers\Api\ClubSettingController;
use App\Http\Controllers\Api\KeyValueController;
use App\Http\Controllers\Api\UsersController;
use App\Http\Controllers\Api\EventsController;
use App\Http\Controllers\Api\ProvasController;
use App\Http\Controllers\Api\ResultsController;
use App\Http\Controllers\Api\EventAttendancesController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->group(function () {
    // Current user
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Key-Value Store endpoints
    Route::get('/kv/{key}', [KeyValueController::class, 'show']);
    Route::put('/kv/{key}', [KeyValueController::class, 'update']);
    Route::delete('/kv/{key}', [KeyValueController::class, 'destroy']);

    // Resource APIs
    Route::apiResource('users', UsersController::class);
    Route::apiResource('events', EventsController::class);
    Route::apiResource('provas', ProvasController::class);
    Route::apiResource('results', ResultsController::class);
    Route::apiResource('event-attendances', EventAttendancesController::class);

    // Settings APIs
    Route::apiResource('user-types', TiposUtilizadorController::class);
    Route::apiResource('age-groups', EscaloesController::class);
    Route::apiResource('event-types', TiposEventoController::class);
    Route::apiResource('cost-centers', CentrosCustoController::class);
    Route::apiResource('club-settings', ClubSettingController::class);
});
