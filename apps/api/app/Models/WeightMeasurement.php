<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class WeightMeasurement extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'measurement_type',
        'estimated_value',
        'actual_value',
        'unit',
        'evidence_id',
        'recorded_by',
        'recorded_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'estimated_value' => 'decimal:2',
            'actual_value' => 'decimal:2',
            'recorded_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function evidence(): BelongsTo
    {
        return $this->belongsTo(WeightEvidence::class, 'evidence_id');
    }

    public function recordedByStaff(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'recorded_by');
    }
}
