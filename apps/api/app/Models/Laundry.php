<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Laundry extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'business_name',
        'legal_name',
        'address_line',
        'latitude',
        'longitude',
        'operating_hours',
        'capacity_config',
        'status',
        'contact_phone',
        'contact_email',
    ];

    protected function casts(): array
    {
        return [
            'operating_hours' => 'array',
            'capacity_config' => 'array',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function staff(): HasMany
    {
        return $this->hasMany(Staff::class);
    }

    public function openings(): HasMany
    {
        return $this->hasMany(StaffOpening::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function isManager(User $user): bool
    {
        return $this->user_id === $user->id;
    }
}
