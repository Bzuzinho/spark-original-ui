<?php

namespace App\Events;

use App\Models\TrainingAthlete;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event: TrainingAthlete foi atualizado
 * 
 * Disparado quando um training_athlete é atualizado
 * Usado principalmente para trigger manual de sync em bulk updates
 */
class TrainingAthleteUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public TrainingAthlete $trainingAthlete
    ) {}
}
