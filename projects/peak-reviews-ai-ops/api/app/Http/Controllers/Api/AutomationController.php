<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AutomationRun;
use App\Models\AutomationWorkflow;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AutomationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'workflows' => AutomationWorkflow::query()
                ->withCount('runs')
                ->latest()
                ->get(),
            'runs' => AutomationRun::query()
                ->with(['workflow', 'review.analysis'])
                ->latest('ran_at')
                ->take(12)
                ->get(),
        ]);
    }

    public function run(AutomationWorkflow $workflow, Request $request): JsonResponse
    {
        $payload = $request->validate([
            'review_id' => ['nullable', 'integer', Rule::exists('reviews', 'id')],
        ]);

        $review = isset($payload['review_id'])
            ? Review::query()->with('analysis')->find($payload['review_id'])
            : Review::query()->with('analysis')->where('rating', '<=', 3)->latest()->first();

        $events = collect($workflow->steps)->map(fn (array $step, int $index) => [
            'step' => $index + 1,
            'name' => $step['name'],
            'status' => 'completed',
            'detail' => $step['detail'],
            'timestamp' => now()->addSeconds($index * 7)->toISOString(),
        ])->values();

        $run = AutomationRun::create([
            'automation_workflow_id' => $workflow->id,
            'review_id' => $review?->id,
            'status' => 'completed',
            'payload' => [
                'triggered_by' => 'demo_console',
                'review_rating' => $review?->rating,
                'review_sentiment' => $review?->analysis?->sentiment,
            ],
            'events' => $events->all(),
            'ran_at' => now(),
        ]);

        return response()->json($run->load(['workflow', 'review.analysis']), 201);
    }
}
