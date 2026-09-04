<?php

namespace App\Domain\Complaint\Http\Controllers;

use App\Domain\Admin\Services\AuditLogService;
use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Refund;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminComplaintController extends Controller
{
    /**
     * List all complaints for arbitration
     */
    public function index(Request $request): JsonResponse
    {
        $complaints = Complaint::with(['order.customer', 'order.laundry', 'evidences'])
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'complaints' => $complaints,
        ]);
    }

    /**
     * Operations Admin resolves complaint arbitration
     */
    public function resolve(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $complaint = Complaint::with('order.customer.user')->findOrFail($id);

        $request->validate([
            'status' => 'required|string|in:RESOLVED_REFUND,RESOLVED_REJECTED,CLOSED',
            'resolution_notes' => 'required|string|min:5',
        ]);

        $status = $request->input('status');
        $notes = $request->input('resolution_notes');

        DB::transaction(function () use ($complaint, $status, $notes, $user, $request) {
            $before = $complaint->toArray();
            $complaint->update([
                'status' => $status,
                'resolution_notes' => $notes,
                'resolved_by' => $user->id,
                'resolved_at' => now(),
            ]);

            // If RESOLVED_REFUND, auto-create Refund record
            if ($status === 'RESOLVED_REFUND') {
                $payment = Payment::where('order_id', $complaint->order_id)->first();
                if ($payment) {
                    Refund::create([
                        'payment_id' => $payment->id,
                        'order_id' => $complaint->order_id,
                        'requested_by' => $complaint->customer->user_id,
                        'approved_by' => $user->id,
                        'amount' => $payment->amount,
                        'reason' => $notes,
                        'status' => 'APPROVED',
                        'processed_at' => now(),
                    ]);
                }
            }

            // Notification for customer
            Notification::create([
                'user_id' => $complaint->customer->user_id,
                'title' => 'Arbitrase Sengketa Pesanan #' . $complaint->order->order_number . ' Selesai',
                'body' => 'Keputusan arbitrase: ' . ($status === 'RESOLVED_REFUND' ? 'Persetujuan Refund (Dana Dikembalikan).' : 'Ditolak: ' . $notes),
                'type' => 'COMPLAINT_UPDATE',
                'data' => ['complaint_id' => $complaint->id, 'order_id' => $complaint->order_id],
            ]);

            // Immutable Audit Trail
            AuditLogService::record(
                userId: $user->id,
                actorRole: 'OPERATIONS_ADMIN',
                context: [
                    'action'        => 'complaint.resolved',
                    'subject_type'  => 'Complaint',
                    'subject_id'    => $complaint->id,
                    'justification' => $notes,
                    'before_state'  => ['status' => $before['status']],
                    'after_state'   => ['status' => $status],
                ],
                request: $request,
            );
        });

        return response()->json([
            'message' => 'Arbitrase sengketa berhasil diputuskan.',
            'complaint' => $complaint->fresh(['order', 'evidences']),
        ]);
    }
}
