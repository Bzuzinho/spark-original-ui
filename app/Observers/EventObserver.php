<?php

namespace App\Observers;

use App\Models\Event;
use App\Models\EventAttendance;
use Illuminate\Support\Facades\Log;

class EventObserver
{
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
}
