<?php

namespace App\Http\Controllers\Communication;

use App\Http\Controllers\Controller;
use App\Services\Communication\InAppAlertService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CommunicationAlertController extends Controller
{
    public function __construct(private readonly InAppAlertService $inAppAlertService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $limit = (int) $request->integer('limit', 20);

        return response()->json([
            'alerts' => $this->inAppAlertService->userFeed($request->user()->id, $limit),
            'unread_count' => $this->inAppAlertService->unreadCount($request->user()->id),
        ]);
    }

    public function markRead(Request $request): RedirectResponse
    {
        $request->validate([
            'alert_id' => ['required', 'exists:in_app_alerts,id'],
        ]);

        $this->inAppAlertService->markAsRead($request->string('alert_id')->toString(), $request->user()->id);

        return back()->with('success', 'Alerta marcado como lido.');
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        $this->inAppAlertService->markAllAsRead($request->user()->id);

        return back()->with('success', 'Todos os alertas foram marcados como lidos.');
    }
}
