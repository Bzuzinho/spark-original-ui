<?php

namespace App\Http\Controllers;

use App\Models\Sponsor;
use App\Http\Requests\StoreSponsorRequest;
use App\Http\Requests\UpdateSponsorRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PatrocinosController extends Controller
{
    public function index(Request $request): Response
    {
        $sponsors = Sponsor::query()
            ->when($request->search, function ($query, $search) {
                $query->where('nome', 'like', "%{$search}%")
                      ->orWhere('descricao', 'like', "%{$search}%");
            })
            ->when($request->tipo, function ($query, $tipo) {
                $query->where('tipo', $tipo);
            })
            ->when($request->estado, function ($query, $estado) {
                $query->where('estado', $estado);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $stats = [
            'total' => Sponsor::count(),
            'ativos' => Sponsor::active()->count(),
            'valorTotal' => Sponsor::active()->sum('valor_anual'),
        ];

        return Inertia::render('Sponsorships/Index', [
            'sponsors' => $sponsors,
            'stats' => $stats,
            'filters' => $request->only(['search', 'tipo', 'estado']),
        ]);
    }

    public function store(StoreSponsorRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('sponsors', 'public');
        }

        $sponsor = Sponsor::create($data);

        return redirect()->back()->with('success', 'Patrocinador criado com sucesso');
    }

    public function update(UpdateSponsorRequest $request, Sponsor $patrocinio)
    {
        $data = $request->validated();

        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($patrocinio->logo) {
                Storage::disk('public')->delete($patrocinio->logo);
            }
            $data['logo'] = $request->file('logo')->store('sponsors', 'public');
        }

        $patrocinio->update($data);

        return redirect()->back()->with('success', 'Patrocinador atualizado com sucesso');
    }

    public function destroy(Sponsor $patrocinio)
    {
        if ($patrocinio->logo) {
            Storage::disk('public')->delete($patrocinio->logo);
        }

        $patrocinio->delete();

        return redirect()->back()->with('success', 'Patrocinador removido com sucesso');
    }
}
