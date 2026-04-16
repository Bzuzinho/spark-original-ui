<?php

namespace App\Http\Controllers\Communication;

use App\Http\Controllers\Controller;
use App\Services\Communication\InAppAlertService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

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
        $this->inAppAlertService->markAsRead($this->validatedAlertId($request), $request->user()->id);

        return back()->with('success', 'Alerta marcado como lido.');
    }

    public function markUnread(Request $request): RedirectResponse
    {
        $this->inAppAlertService->markAsUnread($this->validatedAlertId($request), $request->user()->id);

        return back()->with('success', 'Alerta marcado como não lido.');
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        $this->inAppAlertService->markAllAsRead($request->user()->id);

        return back()->with('success', 'Todos os alertas foram marcados como lidos.');
    }

    public function destroy(Request $request, string $alert): RedirectResponse
    {
        $this->inAppAlertService->deleteForUser($alert, $request->user()->id);

        return back()->with('success', 'Alerta apagado com sucesso.');
    }

    private function validatedAlertId(Request $request): string
    {
        $validated = $request->validate([
            'alert_id' => [
                'required',
                'string',
                Rule::exists('in_app_alerts', 'id')->where(fn ($query) => $query->where('user_id', $request->user()->id)),
            ],
        ]);

        return (string) $validated['alert_id'];
    }
}
