<?php

namespace App\Http\Controllers;

use App\Models\MarketingCampaign;
use App\Http\Requests\StoreCampaignRequest;
use App\Http\Requests\UpdateCampaignRequest;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CampanhasMarketingController extends Controller
{
    public function index(Request $request): Response
    {
        $query = MarketingCampaign::query();

        // Apply filters
        if ($request->filled('type')) {
            $query->ofType($request->type);
        }

        if ($request->filled('status')) {
            $query->ofStatus($request->status);
        }

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        $campaigns = $query->latest()->paginate(15);

        // Calculate stats
        $stats = [
            'total_campaigns' => MarketingCampaign::count(),
            'active_campaigns' => MarketingCampaign::active()->count(),
            'budget_total' => MarketingCampaign::sum('budget') ?? 0,
            'planned_campaigns' => MarketingCampaign::ofStatus('planned')->count(),
            'completed_campaigns' => MarketingCampaign::completed()->count(),
        ];

        return Inertia::render('Marketing/Index', [
            'campaigns' => $campaigns,
            'stats' => $stats,
            'filters' => [
                'type' => $request->type,
                'status' => $request->status,
                'search' => $request->search,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Marketing/Create');
    }

    public function store(StoreCampaignRequest $request): RedirectResponse
    {
        MarketingCampaign::create($request->validated());

        return redirect()->route('marketing.index')
            ->with('success', 'Campanha criada com sucesso!');
    }

    public function show(MarketingCampaign $marketing): Response
    {
        return Inertia::render('Marketing/Show', [
            'campaign' => $marketing,
        ]);
    }

    public function edit(MarketingCampaign $marketing): Response
    {
        return Inertia::render('Marketing/Edit', [
            'campaign' => $marketing,
        ]);
    }

    public function update(UpdateCampaignRequest $request, MarketingCampaign $marketing): RedirectResponse
    {
        $marketing->update($request->validated());

        return redirect()->route('marketing.index')
            ->with('success', 'Campanha atualizada com sucesso!');
    }

    public function destroy(MarketingCampaign $marketing): RedirectResponse
    {
        $marketing->delete();

        return redirect()->route('marketing.index')
            ->with('success', 'Campanha eliminada com sucesso!');
    }
}
