<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServicePrice extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'service_id',
        'price_per_unit',
        'base_price',
        'minimum_charge',
        'valid_from',
        'valid_until',
    ];

    protected function casts(): array
    {
        return [
            'price_per_unit' => 'decimal:2',
            'base_price' => 'decimal:2',
            'minimum_charge' => 'decimal:2',
            'valid_from' => 'datetime',
            'valid_until' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
