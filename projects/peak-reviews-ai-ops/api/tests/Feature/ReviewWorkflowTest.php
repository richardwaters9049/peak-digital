<?php

namespace Tests\Feature;

use App\Models\AutomationWorkflow;
use App\Models\Business;
use App\Models\Location;
use App\Models\Review;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_webhook_ingests_and_analyses_review_with_fallback(): void
    {
        $location = $this->location();

        $response = $this->postJson('/api/webhooks/reviews/google', [
            'location_id' => $location->id,
            'customer_name' => 'Jane Customer',
            'customer_email' => 'jane@example.com',
            'rating' => 1,
            'title' => 'Return was painful',
            'body' => 'The return and refund process was terrible. Support took too long to reply.',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('source', 'google')
            ->assertJsonPath('analysis.sentiment', 'negative')
            ->assertJsonPath('analysis.used_fallback', true);

        $this->assertDatabaseHas('ai_audit_logs', [
            'task' => 'review_analysis',
            'provider' => 'fallback',
        ]);
    }

    public function test_dashboard_summary_returns_core_operational_metrics(): void
    {
        $location = $this->location();
        Review::create([
            'location_id' => $location->id,
            'source' => 'google',
            'customer_name' => 'Happy Customer',
            'rating' => 5,
            'body' => 'Excellent support and friendly staff.',
            'status' => 'responded',
            'reviewed_at' => now(),
            'responded_at' => now(),
        ]);

        $this->getJson('/api/dashboard/summary')
            ->assertOk()
            ->assertJsonPath('metrics.review_volume', 1)
            ->assertJsonPath('metrics.average_rating', 5)
            ->assertJsonStructure(['metrics', 'rating_distribution', 'trends', 'recent_ai_logs']);
    }

    public function test_review_can_generate_reply_draft_and_automation_run(): void
    {
        $location = $this->location();
        $review = Review::create([
            'location_id' => $location->id,
            'source' => 'facebook',
            'customer_name' => 'Sam Reviewer',
            'rating' => 2,
            'title' => 'Late visit',
            'body' => 'The appointment was late and support did not explain the delay.',
            'status' => 'new',
            'reviewed_at' => now(),
        ]);

        $this->postJson("/api/reviews/{$review->id}/analyse")
            ->assertOk()
            ->assertJsonPath('analysis.urgency', 'high');

        $this->postJson("/api/reviews/{$review->id}/reply-draft")
            ->assertOk()
            ->assertJsonStructure(['reply_draft', 'recommended_action']);

        $workflow = AutomationWorkflow::create([
            'name' => 'Negative Review Rescue',
            'trigger' => 'rating <= 2',
            'description' => 'Escalate and recover.',
            'enabled' => true,
            'steps' => [
                ['name' => 'Classify', 'detail' => 'Score the review.'],
                ['name' => 'Assign', 'detail' => 'Create recovery task.'],
            ],
        ]);

        $this->postJson("/api/automations/{$workflow->id}/run", ['review_id' => $review->id])
            ->assertCreated()
            ->assertJsonPath('status', 'completed')
            ->assertJsonPath('events.0.status', 'completed');
    }

    private function location(): Location
    {
        $business = Business::create([
            'name' => 'Demo Business',
            'sector' => 'Retail',
            'goals' => ['Improve response SLA'],
        ]);

        return $business->locations()->create([
            'name' => 'Liverpool',
            'city' => 'Liverpool',
            'postcode' => 'L1 1AA',
            'average_rating' => 4.4,
        ]);
    }
}
