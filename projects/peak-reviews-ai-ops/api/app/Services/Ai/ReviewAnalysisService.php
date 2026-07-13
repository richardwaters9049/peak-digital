<?php

namespace App\Services\Ai;

use App\Models\AiAuditLog;
use App\Models\Review;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ReviewAnalysisService
{
    public function analyse(Review $review): array
    {
        $prompt = $this->analysisPrompt($review);
        $payload = $this->callOpenAi($prompt) ?? $this->fallbackAnalysis($review);
        $payload['used_fallback'] = $payload['used_fallback'] ?? true;

        AiAuditLog::create([
            'review_id' => $review->id,
            'task' => 'review_analysis',
            'provider' => $payload['used_fallback'] ? 'fallback' : 'openai',
            'model' => $payload['model'] ?? config('services.openai.model'),
            'prompt' => $prompt,
            'response' => $payload,
            'estimated_tokens' => $this->estimateTokens($prompt, json_encode($payload)),
            'used_fallback' => $payload['used_fallback'],
        ]);

        unset($payload['model']);

        return $payload;
    }

    public function replyDraft(Review $review): array
    {
        $analysis = $review->analysis;

        if (! $analysis) {
            return $this->analyse($review);
        }

        $payload = [
            'reply_draft' => $analysis->reply_draft,
            'recommended_action' => $analysis->recommended_action,
            'sentiment' => $analysis->sentiment,
            'urgency' => $analysis->urgency,
            'topic_tags' => $analysis->topic_tags,
            'likely_root_cause' => $analysis->likely_root_cause,
            'confidence' => $analysis->confidence,
            'used_fallback' => $analysis->used_fallback,
        ];

        AiAuditLog::create([
            'review_id' => $review->id,
            'task' => 'reply_draft',
            'provider' => $analysis->used_fallback ? 'fallback' : 'openai',
            'model' => config('services.openai.model'),
            'prompt' => 'Reuse existing review analysis reply draft.',
            'response' => $payload,
            'estimated_tokens' => $this->estimateTokens($review->body, $analysis->reply_draft),
            'used_fallback' => $analysis->used_fallback,
        ]);

        return $payload;
    }

    private function callOpenAi(string $prompt): ?array
    {
        $apiKey = config('services.openai.api_key');

        if (! $apiKey) {
            return null;
        }

        try {
            $response = Http::withToken($apiKey)
                ->timeout((int) config('services.openai.timeout'))
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => config('services.openai.model'),
                    'response_format' => ['type' => 'json_object'],
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You are an AI operations analyst for a UK review-management SaaS. Return only valid JSON.',
                        ],
                        ['role' => 'user', 'content' => $prompt],
                    ],
                ]);

            if (! $response->successful()) {
                return null;
            }

            $content = $response->json('choices.0.message.content');
            $decoded = json_decode($content, true);

            if (! is_array($decoded)) {
                return null;
            }

            return array_merge($this->normaliseAnalysis($decoded), [
                'used_fallback' => false,
                'model' => config('services.openai.model'),
            ]);
        } catch (\Throwable) {
            return null;
        }
    }

    private function fallbackAnalysis(Review $review): array
    {
        $body = Str::lower($review->body);
        $topics = [];

        foreach ([
            'delivery' => ['delivery', 'late', 'courier', 'shipping'],
            'returns' => ['return', 'refund', 'exchange'],
            'support' => ['support', 'service', 'staff', 'email'],
            'product_quality' => ['broken', 'quality', 'faulty', 'damaged'],
            'pricing' => ['price', 'expensive', 'cost'],
        ] as $topic => $keywords) {
            foreach ($keywords as $keyword) {
                if (Str::contains($body, $keyword)) {
                    $topics[] = $topic;
                    break;
                }
            }
        }

        $topics = array_values(array_unique($topics ?: ['general_experience']));
        $sentiment = $review->rating >= 4 ? 'positive' : ($review->rating === 3 ? 'neutral' : 'negative');
        $urgency = $review->rating <= 2 || Str::contains($body, ['angry', 'terrible', 'never again']) ? 'high' : ($review->rating === 3 ? 'medium' : 'low');
        $rootCause = match (true) {
            in_array('returns', $topics, true) => 'Returns process friction',
            in_array('delivery', $topics, true) => 'Delivery expectation mismatch',
            in_array('product_quality', $topics, true) => 'Product quality or fulfilment issue',
            in_array('support', $topics, true) => 'Customer support follow-up delay',
            default => 'Customer experience variance',
        };

        return [
            'sentiment' => $sentiment,
            'urgency' => $urgency,
            'topic_tags' => $topics,
            'likely_root_cause' => $rootCause,
            'recommended_action' => $urgency === 'high'
                ? 'Escalate to customer care, acknowledge the issue publicly, and create a same-day recovery task.'
                : 'Respond with a tailored acknowledgement and route the theme into the weekly insight digest.',
            'reply_draft' => $this->fallbackReply($review, $rootCause),
            'confidence' => $urgency === 'high' ? 88 : 81,
            'used_fallback' => true,
            'model' => 'deterministic-demo-v1',
        ];
    }

    private function fallbackReply(Review $review, string $rootCause): string
    {
        $firstName = Str::of($review->customer_name)->explode(' ')->first() ?: 'there';

        if ($review->rating <= 2) {
            return "Hi {$firstName}, thank you for flagging this. I am sorry your experience fell short, especially around {$rootCause}. We would like to put this right quickly, so our team will contact you directly today with a clear next step.";
        }

        if ($review->rating === 3) {
            return "Hi {$firstName}, thanks for the honest feedback. We are pleased parts of the experience worked for you, and we will use your comments around {$rootCause} to improve the next visit.";
        }

        return "Hi {$firstName}, thank you for the lovely review. We are glad the experience landed well and really appreciate you taking the time to share it.";
    }

    private function analysisPrompt(Review $review): string
    {
        return <<<PROMPT
Analyse this customer review for a reputation-management operations console.

Return JSON with: sentiment, urgency, topic_tags, likely_root_cause, recommended_action, reply_draft, confidence.

Source: {$review->source}
Rating: {$review->rating}/5
Customer: {$review->customer_name}
Title: {$review->title}
Review: {$review->body}
PROMPT;
    }

    private function normaliseAnalysis(array $payload): array
    {
        return [
            'sentiment' => $payload['sentiment'] ?? 'neutral',
            'urgency' => $payload['urgency'] ?? 'medium',
            'topic_tags' => array_values($payload['topic_tags'] ?? ['general_experience']),
            'likely_root_cause' => $payload['likely_root_cause'] ?? 'Customer experience variance',
            'recommended_action' => $payload['recommended_action'] ?? 'Review and respond manually.',
            'reply_draft' => $payload['reply_draft'] ?? 'Thanks for taking the time to leave a review. We appreciate the feedback.',
            'confidence' => min(99, max(1, (int) ($payload['confidence'] ?? 75))),
        ];
    }

    private function estimateTokens(string $prompt, ?string $response): int
    {
        return (int) ceil((strlen($prompt) + strlen($response ?? '')) / 4);
    }
}
