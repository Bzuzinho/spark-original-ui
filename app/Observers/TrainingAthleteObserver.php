<?php

namespace App\Observers;

use App\Models\TrainingAthlete;

/**
 * Observer: TrainingAthlete (legacy sync disabled)
 *
 * Full cutover rule: training attendance is canonical in training_athletes.
 * No mirroring to event_attendances is performed.
 */
class TrainingAthleteObserver
{
    public function __construct() {}

    /**
     * Handle training_athlete "created" event
     */
    public function created(TrainingAthlete $trainingAthlete): void
    {
        // no-op by design
    }

    /**
     * Handle training_athlete "updated" event
     */
    public function updated(TrainingAthlete $trainingAthlete): void
    {
        // no-op by design
    }

    /**
     * Handle training_athlete "deleted" event
     */
    public function deleted(TrainingAthlete $trainingAthlete): void
    {
        // no-op by design
    }
}
