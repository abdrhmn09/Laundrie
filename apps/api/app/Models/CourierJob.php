<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourierJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'courier_id',
        'job_type',
        'status',
        'notes',
        'proof_photo_path',
        'proof_photo_hash',
        'latitude',
        'longitude',
        'accepted_at',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'accepted_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function courier(): BelongsTo
    {
        return $this->belongsTo(Courier::class);
    }
}
