<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiAuditLog;
use App\Models\Location;
use App\Models\Review;
use App\Services\Ai\ReviewAnalysisService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class WebhookReviewController extends Controller
{
    public function store(string $source, Request $request, ReviewAnalysisService $service): JsonResponse
    {
        $payload = $request->validate([
            'location_id' => ['nullable', 'integer', Rule::exists('locations', 'id')],
            'external_id' => ['nullable', 'string', 'max:120'],
            'customer_name' => ['required', 'string', 'max:120'],
            'customer_email' => ['nullable', 'email', 'max:160'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['nullable', 'string', 'max:180'],
            'body' => ['required', 'string', 'max:4000'],
            'reviewed_at' => ['nullable', 'date'],
        ]);

        $location = isset($payload['location_id'])
            ? Location::findOrFail($payload['location_id'])
            : Location::query()->firstOrFail();

        $review = Review::create([
            ...$payload,
            'location_id' => $location->id,
            'source' => $source,
            'status' => 'new',
            'reviewed_at' => $payload['reviewed_at'] ?? now(),
        ]);

        $analysisPayload = $service->analyse($review);
        $review->analysis()->create($analysisPayload);
        $review->update(['status' => $analysisPayload['urgency'] === 'high' ? 'escalated' : 'analysed']);

        return response()->json($review->fresh(['location.business', 'analysis']), 201);
    }

    public function recent(): JsonResponse
    {
        return response()->json([
            'reviews' => Review::query()
                ->with(['location.business', 'analysis'])
                ->latest()
                ->take(8)
                ->get(),
            'ai_audit' => AiAuditLog::query()
                ->latest()
                ->take(8)
                ->get(['id', 'review_id', 'task', 'provider', 'model', 'estimated_tokens', 'used_fallback', 'created_at']),
        ]);
    }
}
