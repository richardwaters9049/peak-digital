<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutomationRun extends Model
{
    protected $fillable = [
        'automation_workflow_id',
        'review_id',
        'status',
        'payload',
        'events',
        'ran_at',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'events' => 'array',
            'ran_at' => 'datetime',
        ];
    }

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(AutomationWorkflow::class, 'automation_workflow_id');
    }

    public function review(): BelongsTo
    {
        return $this->belongsTo(Review::class);
    }
}
