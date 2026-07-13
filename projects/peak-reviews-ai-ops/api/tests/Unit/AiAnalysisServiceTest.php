<?php

namespace Tests\Unit;

use App\Models\Business;
use App\Models\Review;
use App\Services\Ai\ReviewAnalysisService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiAnalysisServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_fallback_analysis_detects_returns_theme(): void
    {
        config(['services.openai.api_key' => null]);

        $business = Business::create([
            'name' => 'Demo Business',
            'sector' => 'E-commerce',
        ]);
        $location = $business->locations()->create([
            'name' => 'Online Store',
            'city' => 'Liverpool',
            'average_rating' => 4.1,
        ]);
        $review = Review::create([
            'location_id' => $location->id,
            'source' => 'google',
            'customer_name' => 'Alex Buyer',
            'rating' => 2,
            'title' => 'Refund issue',
            'body' => 'The return was accepted but the refund took too long.',
            'status' => 'new',
            'reviewed_at' => now(),
        ]);

        $payload = app(ReviewAnalysisService::class)->analyse($review);

        $this->assertTrue($payload['used_fallback']);
        $this->assertSame('negative', $payload['sentiment']);
        $this->assertContains('returns', $payload['topic_tags']);
        $this->assertSame('Returns process friction', $payload['likely_root_cause']);
    }
}
