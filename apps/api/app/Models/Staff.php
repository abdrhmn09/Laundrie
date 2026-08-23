<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Staff extends Model
{
    use HasFactory;

    protected $table = 'staff';

    protected $fillable = [
        'user_id',
        'laundry_id',
        'role',
        'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function laundry(): BelongsTo
    {
        return $this->belongsTo(Laundry::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'ACTIVE';
    }
}
