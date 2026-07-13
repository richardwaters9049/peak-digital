<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AutomationWorkflow extends Model
{
    protected $fillable = ['name', 'trigger', 'description', 'enabled', 'steps'];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'steps' => 'array',
        ];
    }

    public function runs(): HasMany
    {
        return $this->hasMany(AutomationRun::class);
    }
}
