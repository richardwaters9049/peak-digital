<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiAuditLog extends Model
{
    protected $fillable = [
        'review_id',
        'task',
        'provider',
        'model',
        'prompt',
        'response',
        'estimated_tokens',
        'used_fallback',
    ];

    protected function casts(): array
    {
        return [
            'response' => 'array',
            'used_fallback' => 'boolean',
        ];
    }

    public function review(): BelongsTo
    {
        return $this->belongsTo(Review::class);
    }
}
