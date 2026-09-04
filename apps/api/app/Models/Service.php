<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'laundry_id',
        'name',
        'service_type',
        'pricing_model',
        'base_price',
        'price_per_unit',
        'unit',
        'minimum_charge',
        'estimated_duration',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'base_price' => 'decimal:2',
            'price_per_unit' => 'decimal:2',
            'minimum_charge' => 'decimal:2',
        ];
    }

    public function laundry(): BelongsTo
    {
        return $this->belongsTo(Laundry::class);
    }

    public function prices(): HasMany
    {
        return $this->hasMany(ServicePrice::class);
    }

    public function activePrice(): HasMany
    {
        return $this->hasMany(ServicePrice::class)->whereNull('valid_until');
    }
}
