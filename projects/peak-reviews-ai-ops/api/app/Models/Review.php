<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Review extends Model
{
    protected $fillable = [
        'location_id',
        'source',
        'external_id',
        'customer_name',
        'customer_email',
        'rating',
        'title',
        'body',
        'status',
        'reviewed_at',
        'responded_at',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
            'responded_at' => 'datetime',
        ];
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function analysis(): HasOne
    {
        return $this->hasOne(ReviewAnalysis::class);
    }

    public function automationRuns(): HasMany
    {
        return $this->hasMany(AutomationRun::class);
    }
}
