<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSponsorRequest;
use App\Http\Requests\UpdateSponsorRequest;
use App\Models\Sponsor;
use App\Models\SponsorCategory;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class PatrociniosController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Patrocinios/Index', [
            'sponsors' => Sponsor::with(['category'])
                ->latest()
                ->paginate(15),
            'categories' => SponsorCategory::where('active', true)->get(),
            'stats' => [
                'totalSponsors' => Sponsor::count(),
                'activeSponsors' => Sponsor::where('estado', 'ativo')->count(),
                'totalValue' => Sponsor::where('estado', 'ativo')->sum('valor_patrocinio'),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Patrocinios/Create', [
            'categories' => SponsorCategory::where('active', true)->get(),
        ]);
    }

    public function store(StoreSponsorRequest $request): RedirectResponse
    {
        Sponsor::create($request->validated());

        return redirect()->route('patrocinios.index')
            ->with('success', 'Patrocinador criado com sucesso!');
    }

    public function show(Sponsor $patrocinio): Response
    {
        return Inertia::render('Patrocinios/Show', [
            'sponsor' => $patrocinio->load(['category']),
        ]);
    }

    public function edit(Sponsor $patrocinio): Response
    {
        return Inertia::render('Patrocinios/Edit', [
            'sponsor' => $patrocinio->load(['category']),
            'categories' => SponsorCategory::where('active', true)->get(),
        ]);
    }

    public function update(UpdateSponsorRequest $request, Sponsor $patrocinio): RedirectResponse
    {
        $patrocinio->update($request->validated());

        return redirect()->route('patrocinios.index')
            ->with('success', 'Patrocinador atualizado com sucesso!');
    }

    public function destroy(Sponsor $patrocinio): RedirectResponse
    {
        $patrocinio->delete();

        return redirect()->route('patrocinios.index')
            ->with('success', 'Patrocinador eliminado com sucesso!');
    }
}
