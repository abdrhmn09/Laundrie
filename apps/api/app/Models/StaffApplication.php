<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_opening_id',
        'laundry_id',
        'user_id',
        'application_type',
        'message',
        'status',
        'reviewed_at',
        'reviewed_by',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
        ];
    }

    public function opening(): BelongsTo
    {
        return $this->belongsTo(StaffOpening::class, 'staff_opening_id');
    }

    public function laundry(): BelongsTo
    {
        return $this->belongsTo(Laundry::class);
    }

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function isPending(): bool
    {
        return $this->status === 'PENDING';
    }
}
