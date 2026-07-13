<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Business extends Model
{
    protected $fillable = ['name', 'sector', 'website', 'goals'];

    protected function casts(): array
    {
        return [
            'goals' => 'array',
        ];
    }

    public function locations(): HasMany
    {
        return $this->hasMany(Location::class);
    }
}
