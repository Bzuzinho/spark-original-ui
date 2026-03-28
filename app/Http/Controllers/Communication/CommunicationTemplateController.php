<?php

namespace App\Http\Controllers\Communication;

use App\Http\Controllers\Controller;
use App\Http\Requests\Communication\StoreCommunicationTemplateRequest;
use App\Http\Requests\Communication\UpdateCommunicationTemplateRequest;
use App\Models\CommunicationTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class CommunicationTemplateController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            CommunicationTemplate::latest()->paginate(20)
        );
    }

    public function store(StoreCommunicationTemplateRequest $request): RedirectResponse
    {
        CommunicationTemplate::create([
            ...$request->validated(),
            'created_by' => $request->user()?->id,
            'updated_by' => $request->user()?->id,
        ]);

        return back()->with('success', 'Template criado com sucesso.');
    }

    public function update(UpdateCommunicationTemplateRequest $request, CommunicationTemplate $template): RedirectResponse
    {
        $template->update([
            ...$request->validated(),
            'updated_by' => $request->user()?->id,
        ]);

        return back()->with('success', 'Template atualizado com sucesso.');
    }

    public function duplicate(CommunicationTemplate $template): RedirectResponse
    {
        CommunicationTemplate::create([
            'name' => $template->name . ' (Copia)',
            'channel' => $template->channel,
            'category' => $template->category,
            'subject' => $template->subject,
            'body' => $template->body,
            'variables_json' => $template->variables_json,
            'status' => 'em_revisao',
            'created_by' => request()->user()?->id,
            'updated_by' => request()->user()?->id,
        ]);

        return back()->with('success', 'Template duplicado com sucesso.');
    }

    public function toggle(CommunicationTemplate $template): RedirectResponse
    {
        $template->update([
            'status' => $template->status === 'inativo' ? 'ativo' : 'inativo',
            'updated_by' => request()->user()?->id,
        ]);

        return back()->with('success', 'Estado do template atualizado.');
    }
}
