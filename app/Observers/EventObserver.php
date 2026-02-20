<?php

namespace App\Observers;

use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class EventObserver
{
    /**
     * Handle the Event "created" event.
     * Automatically create attendance records for training events.
     */
    public function created(Event $event): void
    {
        // Only auto-create attendances for training events
        if ($event->tipo !== 'treino') {
            return;
        }

        try {
            // Get eligible users based on escaloes_elegiveis
            $users = $this->getEligibleUsers($event);

            if ($users->isEmpty()) {
                Log::info("No eligible users found for event: {$event->id}");
                return;
            }

            // Create attendance records for each eligible user
            foreach ($users as $user) {
                EventAttendance::create([
                    'evento_id' => $event->id,
                    'user_id' => $user->id,
                    'estado_presenca' => 'ausente', // Default to absent
                    'data_marcacao' => now(),
                    'observacoes' => 'Criado automaticamente',
                ]);
            }

            Log::info("Created {$users->count()} attendance records for event: {$event->id}");
        } catch (\Exception $e) {
            Log::error("Error creating attendance records for event {$event->id}: {$e->getMessage()}");
        }
    }

    /**
     * Handle the Event "updated" event.
     * Update attendance records if escaloes_elegiveis changed.
     */
    public function updated(Event $event): void
    {
        // Only process training events
        if ($event->tipo !== 'treino') {
            return;
        }

        // Check if escaloes_elegiveis was changed
        if (!$event->isDirty('escaloes_elegiveis')) {
            return;
        }

        try {
            // Get current eligible users
            $eligibleUsers = $this->getEligibleUsers($event);
            $eligibleUserIds = $eligibleUsers->pluck('id')->toArray();

            // Get existing attendance records
            $existingAttendances = EventAttendance::where('evento_id', $event->id)->get();
            $existingUserIds = $existingAttendances->pluck('user_id')->toArray();

            // Add new users who are now eligible
            $newUserIds = array_diff($eligibleUserIds, $existingUserIds);
            foreach ($newUserIds as $userId) {
                EventAttendance::create([
                    'evento_id' => $event->id,
                    'user_id' => $userId,
                    'estado_presenca' => 'ausente',
                    'data_marcacao' => now(),
                    'observacoes' => 'Adicionado automaticamente (escalão atualizado)',
                ]);
            }

            // Remove users who are no longer eligible
            $removedUserIds = array_diff($existingUserIds, $eligibleUserIds);
            if (!empty($removedUserIds)) {
                EventAttendance::where('evento_id', $event->id)
                    ->whereIn('user_id', $removedUserIds)
                    ->delete();
            }

            if (!empty($newUserIds) || !empty($removedUserIds)) {
                Log::info("Updated attendance records for event {$event->id}: Added " . count($newUserIds) . ", Removed " . count($removedUserIds));
            }
        } catch (\Exception $e) {
            Log::error("Error updating attendance records for event {$event->id}: {$e->getMessage()}");
        }
    }

    /**
     * Handle the Event "deleted" event.
     * Cleanup related attendance records.
     */
    public function deleted(Event $event): void
    {
        try {
            // Delete all attendance records for this event
            $deletedCount = EventAttendance::where('evento_id', $event->id)->delete();
            
            Log::info("Deleted {$deletedCount} attendance records for event: {$event->id}");
        } catch (\Exception $e) {
            Log::error("Error deleting attendance records for event {$event->id}: {$e->getMessage()}");
        }
    }

    /**
     * Get users eligible for the event based on escaloes_elegiveis.
     *
     * @param Event $event
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function getEligibleUsers(Event $event)
    {
        // If no specific escaloes are defined, return empty collection
        if (empty($event->escaloes_elegiveis)) {
            return collect([]);
        }

        $query = User::where('estado', 'ativo');

        $query->where(function ($builder) use ($event) {
            foreach ($event->escaloes_elegiveis as $escalao) {
                $builder->orWhereJsonContains('escalao', $escalao);
            }
        });

        return $query->get();
    }
}
