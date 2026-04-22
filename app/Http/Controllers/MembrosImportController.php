<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMembrosImportRequest;
use App\Services\Members\MemberImportService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MembrosImportController extends Controller
{
    public function __construct(private readonly MemberImportService $memberImportService)
    {
    }

    public function template(): BinaryFileResponse
    {
        $path = storage_path('app/templates/membros_import_template_v2.csv');

        abort_unless(file_exists($path), 404, 'Template de importação não encontrado.');

        return response()->download($path, 'membros_import_template_v2.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function preview(StoreMembrosImportRequest $request): JsonResponse
    {
        $payload = $request->validated();

        return response()->json(
            $this->memberImportService->preview(
                $payload['rows'],
                $payload['mapping']
            )
        );
    }

    public function store(StoreMembrosImportRequest $request): JsonResponse
    {
        $payload = $request->validated();

        return response()->json(
            $this->memberImportService->import(
                $payload['rows'],
                $payload['mapping'],
                [
                    'import_only_valid_rows' => (bool) ($payload['options']['import_only_valid_rows'] ?? true),
                ]
            )
        );
    }
}