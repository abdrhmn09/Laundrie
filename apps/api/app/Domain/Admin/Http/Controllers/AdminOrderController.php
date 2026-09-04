<?php

namespace App\Domain\Admin\Http\Controllers;

use App\Domain\Admin\Services\AuditLogService;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminOrderController extends Controller
{
    /**
     * List all orders with advanced filters for Admin operations
     */
    public function index(Request $request): JsonResponse
    {
        $orders = Order::with(['customer.user', 'laundry'])
            ->when($request->input('status'), fn($q, $s) => $q->where('status', $s))
            ->when($request->input('search'), fn($q, $term) => $q
                ->where('order_number', 'ilike', "%{$term}%")
                ->orWhereHas('customer', fn($q2) => $q2->where('name', 'ilike', "%{$term}%"))
            )
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json($orders);
    }

    /**
     * Manual status override with mandatory justification — immutably logged in audit_logs
     */
    public function override(Request $request, int $orderId): JsonResponse
    {
        $user = $request->user();
        $order = Order::findOrFail($orderId);

        $request->validate([
            'new_status'    => 'required|string',
            'justification' => 'required|string|min:10',
        ]);

        $newStatus     = $request->input('new_status');
        $justification = $request->input('justification');
        $previousStatus = $order->status;

        DB::transaction(function () use ($order, $user, $newStatus, $justification, $previousStatus, $request) {
            $order->update(['status' => $newStatus]);

            OrderStatusHistory::create([
                'order_id'    => $order->id,
                'from_status' => $previousStatus,
                'to_status'   => $newStatus,
                'changed_by'  => $user->id,
            ]);

            AuditLogService::record(
                userId: $user->id,
                actorRole: 'OPERATIONS_ADMIN',
                context: [
                    'action'        => 'order.manual_override',
                    'subject_type'  => 'Order',
                    'subject_id'    => $order->id,
                    'justification' => $justification,
                    'before_state'  => ['status' => $previousStatus],
                    'after_state'   => ['status' => $newStatus],
                ],
                request: $request,
            );
        });

        return response()->json([
            'message' => "Status pesanan #{ $order->order_number} berhasil diubah ke {$newStatus}.",
            'order'   => $order->fresh(),
        ]);
    }
}
