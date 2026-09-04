<?php

namespace App\Domain\Admin\Services;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogService
{
    /**
     * Record an immutable audit event.
     *
     * @param  array{
     *     action: string,
     *     subject_type?: string,
     *     subject_id?: int,
     *     justification?: string,
     *     before_state?: array,
     *     after_state?: array,
     * } $context
     */
    public static function record(
        ?int $userId,
        ?string $actorRole,
        array $context,
        ?Request $request = null,
    ): AuditLog {
        return AuditLog::create([
            'user_id'      => $userId,
            'actor_role'   => $actorRole,
            'action'       => $context['action'],
            'subject_type' => $context['subject_type'] ?? null,
            'subject_id'   => $context['subject_id'] ?? null,
            'justification'=> $context['justification'] ?? null,
            'before_state' => $context['before_state'] ?? null,
            'after_state'  => $context['after_state'] ?? null,
            'ip_address'   => $request?->ip(),
            'user_agent'   => $request ? substr((string) $request->userAgent(), 0, 255) : null,
            'performed_at' => now(),
        ]);
    }
}
