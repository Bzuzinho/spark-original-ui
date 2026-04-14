<?php

namespace App\Http\Controllers;

use App\Models\CommunicationCampaign;
use App\Models\CommunicationAlertCategory;
use App\Models\CommunicationDynamicSource;
use App\Models\CommunicationDelivery;
use App\Models\CommunicationSegment;
use App\Models\CommunicationTemplate;
use App\Models\InAppAlert;
use App\Models\AgeGroup;
use App\Models\User;
use App\Services\Communication\SegmentResolverService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;
use App\Support\Communication\AlertCategoryRegistry;
use App\Support\Communication\TemplateVariableCatalog;

class ComunicacaoController extends Controller
{
    private const TECHNICAL_INDIVIDUAL_SEGMENT_DESCRIPTION = 'Segmento tecnico criado automaticamente para envio individual.';

    public function __construct(private readonly SegmentResolverService $segmentResolverService)
    {
    }

    private ?bool $usersHaveAgeGroupColumn = null;

    public function index(Request $request): Response
    {
        $campaignsQuery = CommunicationCampaign::query()
            ->with([
                'segment:id,name,rules_json',
                'author:id,name,nome_completo',
                'channels:id,campaign_id,channel,is_enabled,template_id,subject,message_body',
                'deliveries:id,campaign_id,channel,status,success_count,failed_count,error_message,sent_at,created_at',
            ])
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
            ->where(function ($query) {
                $query->where('type', '!=', 'system')
                    ->orWhereNull('type');
            })
            ->where(function ($query) {
                $query->where('description', '!=', self::TECHNICAL_INDIVIDUAL_SEGMENT_DESCRIPTION)
                    ->orWhereNull('description');
            })
            ->latest()
            ->paginate(12, ['*'], 'segments_page')
            ->withQueryString();

        $segments->getCollection()->transform(function (CommunicationSegment $segment) {
            $rules = $segment->rules_json ?? [];

            return [
                ...$segment->toArray(),
                'estimated_recipients' => $this->segmentResolverService->estimateRecipients($segment),
                'resolved_age_group_labels' => $this->segmentResolverService->resolveAgeGroupLabels($rules['age_group_ids'] ?? []),
                'resolved_user_types' => array_values(array_filter($rules['user_types'] ?? [])),
                'resolved_user_ids' => array_values(array_filter($rules['user_ids'] ?? [])),
            ];
        });

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
                'segments' => CommunicationSegment::select('id', 'name')
                    ->where('is_active', true)
                    ->where(function ($query) {
                        $query->where('type', '!=', 'system')
                            ->orWhereNull('type');
                    })
                    ->where(function ($query) {
                        $query->where('description', '!=', self::TECHNICAL_INDIVIDUAL_SEGMENT_DESCRIPTION)
                            ->orWhereNull('description');
                    })
                    ->orderBy('name')
                    ->get(),
                'dynamicSources' => $this->dynamicSourcesForCommunication(),
                'alertCategories' => AlertCategoryRegistry::all(true)->values()->all(),
                'templates' => CommunicationTemplate::select('id', 'name', 'channel', 'category')->where('status', 'ativo')->orderBy('name')->get(),
                'ageGroups' => AgeGroup::select('id', 'nome')->where('ativo', true)->orderBy('nome')->get(),
                'userTypes' => $this->communicationUserTypes(),
                'templateVariables' => TemplateVariableCatalog::definitions(),
                'recipients' => User::query()
                    ->select($this->recipientSelectColumns())
                    ->where(function ($query) {
                        $query->where('estado', 'ativo')->orWhereNull('estado');
                    })
                    ->orderByRaw('COALESCE(nome_completo, name) asc')
                    ->get(),
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

    private function dynamicSourcesForCommunication(): array
    {
        if (Schema::hasTable('communication_dynamic_sources')) {
            return CommunicationDynamicSource::query()
                ->select('id', 'name', 'description', 'strategy', 'sort_order', 'is_active')
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get()
                ->toArray();
        }

        return [
            ['id' => '', 'name' => 'Todos os membros', 'description' => 'Inclui todos os membros ativos do sistema.', 'strategy' => 'all_members', 'sort_order' => 1, 'is_active' => true],
            ['id' => '', 'name' => 'Atletas por escalão', 'description' => 'Seleciona utilizadores com perfil de atleta.', 'strategy' => 'athletes', 'sort_order' => 2, 'is_active' => true],
            ['id' => '', 'name' => 'Pais/Encarregados', 'description' => 'Seleciona encarregados de educação ativos.', 'strategy' => 'guardians', 'sort_order' => 3, 'is_active' => true],
            ['id' => '', 'name' => 'Treinadores', 'description' => 'Seleciona utilizadores com perfil de treinador.', 'strategy' => 'coaches', 'sort_order' => 4, 'is_active' => true],
            ['id' => '', 'name' => 'Pagamentos em atraso', 'description' => 'Membros com faturas vencidas por regularizar.', 'strategy' => 'overdue_payments', 'sort_order' => 5, 'is_active' => true],
            ['id' => '', 'name' => 'Participantes de evento', 'description' => 'Membros ligados a participações em eventos.', 'strategy' => 'event_participants', 'sort_order' => 6, 'is_active' => true],
            ['id' => '', 'name' => 'Utilizadores com alertas por ler', 'description' => 'Utilizadores com alertas internos pendentes de leitura.', 'strategy' => 'users_with_unread_alerts', 'sort_order' => 7, 'is_active' => true],
        ];
    }

    private function communicationUserTypes(): array
    {
        return User::query()
            ->pluck('tipo_membro')
            ->filter(fn ($value) => is_array($value) && $value !== [])
            ->flatten()
            ->filter()
            ->unique()
            ->sort()
            ->values()
            ->map(fn (string $value) => ['value' => $value, 'label' => str_replace('_', ' ', ucfirst($value))])
            ->all();
    }

    private function recipientSelectColumns(): array
    {
        $columns = [
            'id',
            'name',
            'nome_completo',
            'email',
            'telemovel',
            'contacto_telefonico',
            'contacto',
            'tipo_membro',
            'escalao',
            'estado',
            'numero_socio',
        ];

        if ($this->usersHaveAgeGroupColumn()) {
            $columns[] = 'age_group_id';
        }

        return $columns;
    }

    private function usersHaveAgeGroupColumn(): bool
    {
        return $this->usersHaveAgeGroupColumn ??= Schema::hasColumn('users', 'age_group_id');
    }
}
