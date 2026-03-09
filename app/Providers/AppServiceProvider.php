<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Event;
use App\Observers\EventObserver;
use App\Models\TrainingAthlete;
use App\Observers\TrainingAthleteObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register Event Observer
        Event::observe(EventObserver::class);
        
        // Register TrainingAthlete Observer (FASE 4 - Refactor Desportivo)
        TrainingAthlete::observe(TrainingAthleteObserver::class);
    }
}
