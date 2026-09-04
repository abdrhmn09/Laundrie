<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Settlement extends Model
{
    use HasFactory;

    protected $fillable = [
        'settlement_number',
        'laundry_id',
        'courier_id',
        'period_start',
        'period_end',
        'gross_amount',
        'platform_commission',
        'net_amount',
        'status',
        'approved_by',
        'paid_at',
        'bank_name',
        'account_number',
        'account_holder',
    ];

    protected $casts = [
        'gross_amount' => 'decimal:2',
        'platform_commission' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'period_start' => 'datetime',
        'period_end' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function laundry(): BelongsTo
    {
        return $this->belongsTo(Laundry::class);
    }

    public function courier(): BelongsTo
    {
        return $this->belongsTo(Courier::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
