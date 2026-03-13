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
use App\Http\Controllers\Api\EventResultsController;
use App\Http\Controllers\Api\ProvaTiposController;
use App\Http\Controllers\Api\TrainingController;
use App\Http\Controllers\Api\TrainingAttendanceController;
use App\Http\Controllers\Api\AthleteController;
use App\Http\Controllers\Api\CompetitionController;
use App\Http\Controllers\Api\CompetitionResultController;
use App\Http\Controllers\Api\CompetitionRegistrationController;
use App\Http\Controllers\Api\TeamResultController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->group(function () {
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
    Route::apiResource('event-results', EventResultsController::class);
    Route::get('event-results-stats', [EventResultsController::class, 'stats']);
    Route::get('prova-tipos', [ProvaTiposController::class, 'index']);

    // Settings APIs
    Route::apiResource('user-types', TiposUtilizadorController::class);
    Route::apiResource('age-groups', EscaloesController::class);
    Route::apiResource('event-types', TiposEventoController::class);
    Route::apiResource('cost-centers', CentrosCustoController::class);
    Route::apiResource('club-settings', ClubSettingController::class);

    // Desportivo Module APIs (Step 5-6)
    Route::prefix('desportivo')->group(function () {
        // Athletes
        Route::apiResource('athletes', AthleteController::class, ['only' => ['index', 'show']]);

        // Trainings
        Route::apiResource('trainings', TrainingController::class);

        // Training Attendance (Cais)
        Route::prefix('trainings/{trainingId}/attendance')->group(function () {
            Route::get('/', [TrainingAttendanceController::class, 'index']);
            Route::put('{athleteId}', [TrainingAttendanceController::class, 'update']);
            Route::post('mark-all', [TrainingAttendanceController::class, 'markAllPresent']);
            Route::post('clear-all', [TrainingAttendanceController::class, 'clearAll']);
        });

        // Competitions
        Route::apiResource('competitions', CompetitionController::class);

        // Competition Results
        Route::apiResource('competition-results', CompetitionResultController::class);
        Route::apiResource('competition-registrations', CompetitionRegistrationController::class)->only(['index', 'store', 'destroy']);
        Route::apiResource('team-results', TeamResultController::class)->only(['index', 'store', 'destroy']);
    });
});
