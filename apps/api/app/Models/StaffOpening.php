<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StaffOpening extends Model
{
    use HasFactory;

    protected $fillable = [
        'laundry_id',
        'title',
        'description',
        'quota',
        'status',
    ];

    public function laundry(): BelongsTo
    {
        return $this->belongsTo(Laundry::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(StaffApplication::class);
    }

    public function isOpen(): bool
    {
        return $this->status === 'OPEN';
    }
}
