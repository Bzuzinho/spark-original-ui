<?php

namespace App\Http\Controllers\Communication;

use App\Http\Controllers\Controller;
use App\Http\Requests\Communication\SendIndividualCommunicationRequest;
use App\Http\Requests\Communication\ScheduleCommunicationCampaignRequest;
use App\Http\Requests\Communication\StoreCommunicationCampaignRequest;
use App\Http\Requests\Communication\UpdateCommunicationCampaignRequest;
use App\Models\CommunicationCampaign;
use App\Services\Communication\CommunicationCampaignService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;
use Throwable;

class CommunicationCampaignController extends Controller
{
    public function __construct(private readonly CommunicationCampaignService $campaignService)
    {
    }

    public function store(StoreCommunicationCampaignRequest $request): RedirectResponse
    {
        try {
            $payload = $this->preparePayload($request->validated());
            $campaign = $this->campaignService->createCampaign($payload, $request->user()?->id);

            if (($request->validated('submission_mode') ?? null) === 'send') {
                $this->campaignService->sendCampaign($campaign->load('channels', 'segment'), $request->user()?->id, true);

                return back()->with('success', 'Campanha guardada e envio iniciado.');
            }

            return back()->with('success', 'Campanha guardada como agendada.');
        } catch (Throwable $exception) {
            return back()->with('error', $exception->getMessage());
        }
    }

    public function update(UpdateCommunicationCampaignRequest $request, CommunicationCampaign $campaign): RedirectResponse
    {
        try {
            $payload = $this->preparePayload($request->validated());
            $campaign = $this->campaignService->updateCampaign($campaign, $payload);

            if (($request->validated('submission_mode') ?? null) === 'send') {
                $this->campaignService->sendCampaign($campaign->load('channels', 'segment'), $request->user()?->id, true);

                return back()->with('success', 'Campanha atualizada e envio iniciado.');
            }

            return back()->with('success', 'Campanha atualizada como agendada.');
        } catch (Throwable $exception) {
            return back()->with('error', $exception->getMessage());
        }
    }

    public function duplicate(CommunicationCampaign $campaign): RedirectResponse
    {
        $campaign->load('channels');
        $this->campaignService->duplicateCampaign($campaign, request()->user()?->id);

        return back()->with('success', 'Campanha duplicada com sucesso.');
    }

    public function schedule(ScheduleCommunicationCampaignRequest $request, CommunicationCampaign $campaign): RedirectResponse
    {
        $this->campaignService->scheduleCampaign($campaign, $request->validated('scheduled_at'));

        return back()->with('success', 'Campanha agendada com sucesso.');
    }

    public function send(CommunicationCampaign $campaign): RedirectResponse
    {
        try {
            $this->campaignService->sendCampaign($campaign->load('channels', 'segment'), request()->user()?->id, true);
            return back()->with('success', 'Processamento da campanha iniciado.');
        } catch (Throwable $exception) {
            return back()->with('error', $exception->getMessage());
        }
    }

    public function cancel(CommunicationCampaign $campaign): RedirectResponse
    {
        $this->campaignService->cancelCampaign($campaign);

        return back()->with('success', 'Campanha cancelada com sucesso.');
    }

    public function destroy(CommunicationCampaign $campaign): RedirectResponse
    {
        $campaign->delete();

        return back()->with('success', 'Envio apagado com sucesso.');
    }

    public function sendIndividual(SendIndividualCommunicationRequest $request): RedirectResponse
    {
        try {
            $this->campaignService->sendIndividualCommunication($request->validated(), $request->user()?->id);

            return back()->with('success', 'Envio individual processado com sucesso.');
        } catch (Throwable $exception) {
            return back()->with('error', $exception->getMessage());
        }
    }

    private function preparePayload(array $validated): array
    {
        $submissionMode = $validated['submission_mode'] ?? null;
        $payload = Arr::except($validated, ['submission_mode']);

        if ($submissionMode === 'schedule') {
            $payload['status'] = 'agendada';

            return $payload;
        }

        if ($submissionMode === 'send') {
            $payload['status'] = 'rascunho';
            $payload['scheduled_at'] = null;
        }

        return $payload;
    }
}
