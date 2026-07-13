<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiAuditLog;
use App\Models\AutomationRun;
use App\Models\Review;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $reviews = Review::query()->with('analysis')->get();
        $total = $reviews->count();
        $negative = $reviews->where('rating', '<=', 2)->count();
        $responded = $reviews->whereNotNull('responded_at')->count();
        $analysed = $reviews->whereNotNull('analysis')->count();

        return response()->json([
            'metrics' => [
                'review_volume' => $total,
                'average_rating' => round((float) $reviews->avg('rating'), 2),
                'negative_alerts' => $negative,
                'response_sla' => $total > 0 ? round(($responded / $total) * 100) : 0,
                'ai_coverage' => $total > 0 ? round(($analysed / $total) * 100) : 0,
            ],
            'rating_distribution' => collect([5, 4, 3, 2, 1])
                ->map(fn (int $rating) => [
                    'rating' => $rating,
                    'count' => $reviews->where('rating', $rating)->count(),
                ])
                ->values(),
            'trends' => $reviews
                ->flatMap(fn (Review $review) => $review->analysis?->topic_tags ?? [])
                ->countBy()
                ->sortDesc()
                ->take(6)
                ->map(fn ($count, $topic) => ['topic' => $topic, 'count' => $count])
                ->values(),
            'recent_ai_logs' => AiAuditLog::query()
                ->latest()
                ->take(5)
                ->get(['id', 'task', 'provider', 'model', 'estimated_tokens', 'used_fallback', 'created_at']),
            'recent_automation_runs' => AutomationRun::query()
                ->with('workflow:id,name')
                ->latest('ran_at')
                ->take(5)
                ->get(),
        ]);
    }
}
