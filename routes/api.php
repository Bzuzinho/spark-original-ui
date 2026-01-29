<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserTypeController;
use App\Http\Controllers\Api\AgeGroupController;
use App\Http\Controllers\Api\EventTypeController;
use App\Http\Controllers\Api\CostCenterController;
use App\Http\Controllers\Api\ClubSettingController;

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

    // Settings APIs
    Route::apiResource('user-types', UserTypeController::class);
    Route::apiResource('age-groups', AgeGroupController::class);
    Route::apiResource('event-types', EventTypeController::class);
    Route::apiResource('cost-centers', CostCenterController::class);
    Route::apiResource('club-settings', ClubSettingController::class);
});
