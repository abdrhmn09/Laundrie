<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Courier extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'laundry_id',
        'courier_type',
        'vehicle_type',
        'service_area',
        'payout_info',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'service_area' => 'array',
            'payout_info' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function laundry(): BelongsTo
    {
        return $this->belongsTo(Laundry::class);
    }

    public function isFreelance(): bool
    {
        return $this->courier_type === 'freelance';
    }

    public function isLaundryStaff(): bool
    {
        return $this->courier_type === 'laundry_staff';
    }
}
