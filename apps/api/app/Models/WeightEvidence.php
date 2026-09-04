<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WeightEvidence extends Model
{
    use HasFactory;

    protected $table = 'weight_evidences';

    protected $fillable = [
        'order_id',
        'measurement_id',
        'laundry_id',
        'staff_id',
        'weight',
        'unit',
        'photo_path',
        'photo_hash',
        'captured_at',
        'confirmed_at',
        'status',
        'device_id',
        'latitude',
        'longitude',
        'invalidated_at',
        'invalidated_by',
        'invalidation_reason',
    ];

    protected function casts(): array
    {
        return [
            'weight' => 'decimal:2',
            'captured_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'invalidated_at' => 'datetime',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function measurement(): BelongsTo
    {
        return $this->belongsTo(WeightMeasurement::class, 'measurement_id');
    }

    public function laundry(): BelongsTo
    {
        return $this->belongsTo(Laundry::class);
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }

    public function invalidatedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invalidated_by');
    }
}
