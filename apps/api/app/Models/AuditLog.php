<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AuditLog extends Model
{
    public $timestamps = false; // Table uses performed_at, no created_at/updated_at

    protected $fillable = [
        'user_id',
        'actor_role',
        'action',
        'subject_type',
        'subject_id',
        'justification',
        'before_state',
        'after_state',
        'ip_address',
        'user_agent',
        'performed_at',
    ];

    protected $casts = [
        'before_state' => 'array',
        'after_state' => 'array',
        'performed_at' => 'datetime',
    ];

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
