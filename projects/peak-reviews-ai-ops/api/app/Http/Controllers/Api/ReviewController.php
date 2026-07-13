<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Services\Ai\ReviewAnalysisService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $reviews = Review::query()
            ->with(['location.business', 'analysis'])
            ->when($request->string('sentiment')->toString(), fn ($query, string $sentiment) => $query->whereHas('analysis', fn ($analysis) => $analysis->where('sentiment', $sentiment)))
            ->when($request->string('source')->toString(), fn ($query, string $source) => $query->where('source', $source))
            ->when($request->string('status')->toString(), fn ($query, string $status) => $query->where('status', $status))
            ->when($request->string('q')->toString(), fn ($query, string $q) => $query->where(fn ($inner) => $inner
                ->where('customer_name', 'like', "%{$q}%")
                ->orWhere('body', 'like', "%{$q}%")
                ->orWhere('title', 'like', "%{$q}%")
            ))
            ->latest('reviewed_at')
            ->paginate((int) $request->integer('per_page', 30));

        return response()->json($reviews);
    }

    public function show(Review $review): JsonResponse
    {
        return response()->json(
            $review->load(['location.business', 'analysis', 'automationRuns.workflow'])
        );
    }

    public function analyse(Review $review, ReviewAnalysisService $service): JsonResponse
    {
        $payload = $service->analyse($review);
        $analysis = $review->analysis()->updateOrCreate(
            ['review_id' => $review->id],
            $payload
        );

        $review->update(['status' => $payload['urgency'] === 'high' ? 'escalated' : 'analysed']);

        return response()->json([
            'review' => $review->fresh(['location.business', 'analysis']),
            'analysis' => $analysis,
        ]);
    }

    public function replyDraft(Review $review, ReviewAnalysisService $service): JsonResponse
    {
        return response()->json($service->replyDraft($review->load('analysis')));
    }
}
