<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlatformConfig extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'description',
        'is_public',
        'updated_by',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the typed value of this config
     */
    public function typedValue(): mixed
    {
        return match ($this->type) {
            'integer' => (int) $this->value,
            'decimal' => (float) $this->value,
            'boolean' => filter_var($this->value, FILTER_VALIDATE_BOOLEAN),
            'json' => json_decode($this->value, true),
            default => $this->value,
        };
    }
}
