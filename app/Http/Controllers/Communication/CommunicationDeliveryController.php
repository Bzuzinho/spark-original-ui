<?php

namespace App\Http\Controllers\Communication;

use App\Http\Controllers\Controller;
use App\Models\CommunicationDelivery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommunicationDeliveryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = CommunicationDelivery::query()->with(['campaign:id,codigo,title', 'segment:id,name'])->latest();

        if ($request->filled('channel')) {
            $query->where('channel', $request->string('channel')->toString());
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        if ($request->filled('campaign_id')) {
            $query->where('campaign_id', $request->string('campaign_id')->toString());
        }

        return response()->json($query->paginate(20));
    }
}
