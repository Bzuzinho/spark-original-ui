<?php

namespace App\Http\Controllers;

use App\Models\CommunicationCampaign;
use App\Models\CommunicationDelivery;
use App\Models\CommunicationSegment;
use App\Models\CommunicationTemplate;
use App\Models\InAppAlert;
use App\Models\User;
use App\Services\Communication\SegmentResolverService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ComunicacaoController extends Controller
{
    public function __construct(private readonly SegmentResolverService $segmentResolverService)
    {
    }

    public function index(Request $request): Response
    {
        $campaignsQuery = CommunicationCampaign::query()
            ->with(['segment:id,name', 'author:id,name,nome_completo', 'channels:id,campaign_id,channel,is_enabled'])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $campaignsQuery->where(function ($query) use ($search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%");
            });
        }

        if ($request->filled('channel')) {
            $channel = $request->string('channel')->toString();
            $campaignsQuery->whereHas('channels', fn ($query) => $query->where('channel', $channel));
        }

        if ($request->filled('status')) {
            $campaignsQuery->where('status', $request->string('status')->toString());
        }

        if ($request->filled('author')) {
            $campaignsQuery->where('author_id', $request->string('author')->toString());
        }

        if ($request->filled('period_start')) {
            $campaignsQuery->whereDate('created_at', '>=', $request->string('period_start')->toString());
        }

        if ($request->filled('period_end')) {
            $campaignsQuery->whereDate('created_at', '<=', $request->string('period_end')->toString());
        }

        $campaigns = $campaignsQuery->paginate(12)->withQueryString();

        $deliveriesQuery = CommunicationDelivery::query()
            ->with(['campaign:id,codigo,title', 'segment:id,name'])
            ->latest();

        if ($request->filled('delivery_channel')) {
            $deliveriesQuery->where('channel', $request->string('delivery_channel')->toString());
        }

        if ($request->filled('delivery_status')) {
            $deliveriesQuery->where('status', $request->string('delivery_status')->toString());
        }

        if ($request->filled('delivery_campaign')) {
            $deliveriesQuery->where('campaign_id', $request->string('delivery_campaign')->toString());
        }

        $deliveries = $deliveriesQuery->paginate(12, ['*'], 'deliveries_page')->withQueryString();

        $templates = CommunicationTemplate::query()
            ->latest()
            ->paginate(12, ['*'], 'templates_page')
            ->withQueryString();

        $segments = CommunicationSegment::query()
            ->latest()
            ->paginate(12, ['*'], 'segments_page')
            ->withQueryString();

        $alertsSummary = [
            'total' => InAppAlert::count(),
            'unread' => InAppAlert::where('is_read', false)->count(),
            'read' => InAppAlert::where('is_read', true)->count(),
        ];

        $stats = [
            'scheduled_campaigns' => CommunicationCampaign::where('status', 'agendada')->count(),
            'completed_deliveries' => CommunicationDelivery::where('status', 'completed')->count(),
            'failed_deliveries' => CommunicationDelivery::whereIn('status', ['failed', 'partial'])->count(),
            'active_templates' => CommunicationTemplate::where('status', 'ativo')->count(),
            'total_sent' => CommunicationDelivery::sum('success_count'),
            'total_failed' => CommunicationDelivery::sum('failed_count'),
            'total_pending' => CommunicationDelivery::sum('pending_count'),
            'alerts_unread' => $alertsSummary['unread'],
        ];

        $latestCampaigns = CommunicationCampaign::query()
            ->select('id', 'codigo', 'title', 'status', 'created_at', 'sent_at')
            ->latest()
            ->take(6)
            ->get();

        $channelSummary = CommunicationDelivery::query()
            ->selectRaw('channel, count(*) as total, sum(success_count) as success_count, sum(failed_count) as failed_count')
            ->groupBy('channel')
            ->get();

        return Inertia::render('Comunicacao/Index', [
            'stats' => $stats,
            'campaigns' => $campaigns,
            'deliveries' => $deliveries,
            'templates' => $templates,
            'segments' => $segments,
            'latestCampaigns' => $latestCampaigns,
            'channelSummary' => $channelSummary,
            'alertsSummary' => $alertsSummary,
            'filterOptions' => [
                'authors' => User::select('id', 'name', 'nome_completo')->orderBy('name')->get(),
                'segments' => CommunicationSegment::select('id', 'name')->where('is_active', true)->orderBy('name')->get(),
                'templates' => CommunicationTemplate::select('id', 'name', 'channel')->where('status', 'ativo')->orderBy('name')->get(),
            ],
            'filters' => $request->only([
                'search',
                'channel',
                'status',
                'period_start',
                'period_end',
                'author',
                'delivery_channel',
                'delivery_status',
                'delivery_campaign',
            ]),
        ]);
    }
}
