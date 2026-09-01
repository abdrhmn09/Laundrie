<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'customer_id',
        'laundry_id',
        'pickup_address_id',
        'delivery_address_id',
        'status',
        'estimated_weight',
        'actual_weight',
        'estimated_total',
        'final_total',
        'currency',
        'scheduled_pickup_start',
        'scheduled_pickup_end',
        'scheduled_delivery_start',
        'scheduled_delivery_end',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'estimated_weight' => 'decimal:2',
            'actual_weight' => 'decimal:2',
            'estimated_total' => 'decimal:2',
            'final_total' => 'decimal:2',
            'scheduled_pickup_start' => 'datetime',
            'scheduled_pickup_end' => 'datetime',
            'scheduled_delivery_start' => 'datetime',
            'scheduled_delivery_end' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function laundry(): BelongsTo
    {
        return $this->belongsTo(Laundry::class);
    }

    public function pickupAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'pickup_address_id');
    }

    public function deliveryAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'delivery_address_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    public function scopeForCustomer($query, int $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    public function scopeForLaundry($query, int $laundryId)
    {
        return $query->where('laundry_id', $laundryId);
    }
}
