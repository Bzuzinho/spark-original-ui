<?php

namespace App\Http\Controllers\Communication;

use App\Http\Controllers\Controller;
use App\Http\Requests\Communication\StoreCommunicationSegmentRequest;
use App\Http\Requests\Communication\UpdateCommunicationSegmentRequest;
use App\Models\CommunicationSegment;
use App\Services\Communication\SegmentResolverService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;

class CommunicationSegmentController extends Controller
{
    public function __construct(private readonly SegmentResolverService $segmentResolverService)
    {
    }

    public function index(): JsonResponse
    {
        $segments = CommunicationSegment::latest()->paginate(20);

        $segments->getCollection()->transform(function (CommunicationSegment $segment) {
            return [
                ...$segment->toArray(),
                'estimated_recipients' => $this->segmentResolverService->resolveRecipients($segment)->count(),
            ];
        });

        return response()->json($segments);
    }

    public function store(StoreCommunicationSegmentRequest $request): RedirectResponse
    {
        $data = $request->validated();

        CommunicationSegment::create([
            ...$data,
            'slug' => $data['slug'] ?? Str::slug($data['name']),
            'created_by' => $request->user()?->id,
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);

        return back()->with('success', 'Segmento criado com sucesso.');
    }

    public function update(UpdateCommunicationSegmentRequest $request, CommunicationSegment $segment): RedirectResponse
    {
        $data = $request->validated();

        $segment->update([
            ...$data,
            'slug' => $data['slug'] ?? $segment->slug ?? Str::slug($data['name']),
        ]);

        return back()->with('success', 'Segmento atualizado com sucesso.');
    }

    public function destroy(CommunicationSegment $segment): RedirectResponse
    {
        $segment->delete();

        return back()->with('success', 'Segmento apagado com sucesso.');
    }
}
