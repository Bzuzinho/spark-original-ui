<?php

namespace App\Http\Controllers\Communication;

use App\Http\Controllers\Controller;
use App\Http\Requests\Communication\StoreInternalMessageRequest;
use App\Models\InternalMessage;
use App\Models\InternalMessageRecipient;
use App\Services\Communication\InternalCommunicationService;
use Illuminate\Http\RedirectResponse;

class InternalMemberCommunicationController extends Controller
{
    public function __construct(private readonly InternalCommunicationService $internalCommunicationService)
    {
    }

    public function store(StoreInternalMessageRequest $request): RedirectResponse
    {
        $recipientIds = collect($request->validated('recipient_ids', []))
            ->filter(fn ($id) => $id !== $request->user()->id)
            ->values();

        if ($recipientIds->isEmpty()) {
            return back()->withErrors([
                'recipient_ids' => 'Selecione pelo menos um destinatário diferente do utilizador atual.',
            ]);
        }

        $payload = $request->validated();
        $payload['recipient_ids'] = $recipientIds->all();
        $payload['type'] = $payload['type'] ?? 'info';

        $this->internalCommunicationService->send($request->user(), $payload);

        return back()->with('success', 'Comunicação interna enviada com sucesso.');
    }

    public function markRead(InternalMessageRecipient $recipient): RedirectResponse
    {
        abort_unless($recipient->recipient_id === request()->user()->id, 403);

        $this->internalCommunicationService->markAsRead($recipient);

        return back()->with('success', 'Mensagem marcada como lida.');
    }

    public function markUnread(InternalMessageRecipient $recipient): RedirectResponse
    {
        abort_unless($recipient->recipient_id === request()->user()->id, 403);

        $this->internalCommunicationService->markAsUnread($recipient);

        return back()->with('success', 'Mensagem marcada como não lida.');
    }

    public function destroyReceived(InternalMessageRecipient $recipient): RedirectResponse
    {
        abort_unless($recipient->recipient_id === request()->user()->id, 403);

        $this->internalCommunicationService->deleteReceived($recipient);

        return back()->with('success', 'Mensagem removida da caixa de entrada.');
    }

    public function destroySent(InternalMessage $message): RedirectResponse
    {
        abort_unless($message->sender_id === request()->user()->id, 403);

        $this->internalCommunicationService->deleteSent($message);

        return back()->with('success', 'Mensagem removida dos enviados.');
    }
}