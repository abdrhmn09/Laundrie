<?php

namespace App\Domain\Admin\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * Paginated audit log viewer with filters
     */
    public function index(Request $request): JsonResponse
    {
        $logs = AuditLog::with('actor:id,name,email')
            ->when($request->input('action'),      fn($q, $v) => $q->where('action', 'like', "%{$v}%"))
            ->when($request->input('actor_role'),  fn($q, $v) => $q->where('actor_role', $v))
            ->when($request->input('user_id'),     fn($q, $v) => $q->where('user_id', $v))
            ->when($request->input('subject_type'), fn($q, $v) => $q->where('subject_type', $v))
            ->when($request->input('date_from'),   fn($q, $v) => $q->whereDate('performed_at', '>=', $v))
            ->when($request->input('date_to'),     fn($q, $v) => $q->whereDate('performed_at', '<=', $v))
            ->orderByDesc('performed_at')
            ->paginate(30);

        return response()->json($logs);
    }

    /**
     * Get single audit log detail
     */
    public function show(int $id): JsonResponse
    {
        $log = AuditLog::with('actor:id,name,email')->findOrFail($id);

        return response()->json(['log' => $log]);
    }
}
