<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReviewAnalysis extends Model
{
    protected $fillable = [
        'review_id',
        'sentiment',
        'urgency',
        'topic_tags',
        'likely_root_cause',
        'recommended_action',
        'reply_draft',
        'confidence',
        'used_fallback',
    ];

    protected function casts(): array
    {
        return [
            'topic_tags' => 'array',
            'used_fallback' => 'boolean',
        ];
    }

    public function review(): BelongsTo
    {
        return $this->belongsTo(Review::class);
    }
}
