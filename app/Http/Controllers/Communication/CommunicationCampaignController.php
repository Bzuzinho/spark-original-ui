<?php

namespace App\Http\Controllers\Communication;

use App\Http\Controllers\Controller;
use App\Http\Requests\Communication\ScheduleCommunicationCampaignRequest;
use App\Http\Requests\Communication\StoreCommunicationCampaignRequest;
use App\Http\Requests\Communication\UpdateCommunicationCampaignRequest;
use App\Models\CommunicationCampaign;
use App\Services\Communication\CommunicationCampaignService;
use Illuminate\Http\RedirectResponse;
use Throwable;

class CommunicationCampaignController extends Controller
{
    public function __construct(private readonly CommunicationCampaignService $campaignService)
    {
    }

    public function store(StoreCommunicationCampaignRequest $request): RedirectResponse
    {
        $this->campaignService->createCampaign($request->validated(), $request->user()?->id);

        return back()->with('success', 'Campanha criada com sucesso.');
    }

    public function update(UpdateCommunicationCampaignRequest $request, CommunicationCampaign $campaign): RedirectResponse
    {
        $this->campaignService->updateCampaign($campaign, $request->validated());

        return back()->with('success', 'Campanha atualizada com sucesso.');
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
}
