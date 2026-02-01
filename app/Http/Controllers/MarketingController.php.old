<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Models\NewsCategory;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MarketingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Marketing/Index', [
            'news' => News::with(['author', 'category'])
                ->latest()
                ->paginate(15),
            'categories' => NewsCategory::where('active', true)->get(),
            'stats' => [
                'totalNews' => News::count(),
                'publishedNews' => News::where('estado', 'publicado')->count(),
                'draftNews' => News::where('estado', 'rascunho')->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Marketing/Create', [
            'categories' => NewsCategory::where('active', true)->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'titulo' => 'required|string|max:255',
            'conteudo' => 'required|string',
            'categoria_id' => 'required|exists:news_categories,id',
            'imagem' => 'nullable|string',
            'estado' => 'required|in:rascunho,publicado,arquivado',
            'data_publicacao' => 'nullable|date',
        ]);

        $data['autor_id'] = auth()->id();

        News::create($data);

        return redirect()->route('marketing.index')
            ->with('success', 'Notícia criada com sucesso!');
    }

    public function show(News $marketing): Response
    {
        return Inertia::render('Marketing/Show', [
            'news' => $marketing->load(['author', 'category']),
        ]);
    }

    public function edit(News $marketing): Response
    {
        return Inertia::render('Marketing/Edit', [
            'news' => $marketing->load(['category']),
            'categories' => NewsCategory::where('active', true)->get(),
        ]);
    }

    public function update(Request $request, News $marketing): RedirectResponse
    {
        $data = $request->validate([
            'titulo' => 'required|string|max:255',
            'conteudo' => 'required|string',
            'categoria_id' => 'required|exists:news_categories,id',
            'imagem' => 'nullable|string',
            'estado' => 'required|in:rascunho,publicado,arquivado',
            'data_publicacao' => 'nullable|date',
        ]);

        $marketing->update($data);

        return redirect()->route('marketing.index')
            ->with('success', 'Notícia atualizada com sucesso!');
    }

    public function destroy(News $marketing): RedirectResponse
    {
        $marketing->delete();

        return redirect()->route('marketing.index')
            ->with('success', 'Notícia eliminada com sucesso!');
    }
}
