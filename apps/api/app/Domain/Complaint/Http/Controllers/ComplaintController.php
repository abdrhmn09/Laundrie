<?php

namespace App\Domain\Complaint\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\DisputeEvidence;
use App\Models\Notification;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ComplaintController extends Controller
{
    /**
     * Submit a new dispute complaint for an order
     */
    public function store(Request $request, int $orderId): JsonResponse
    {
        $user = $request->user();
        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['message' => 'Hanya akun pelanggan yang dapat mengajukan komplain.'], 403);
        }

        $order = Order::where('customer_id', $customer->id)->findOrFail($orderId);

        $request->validate([
            'category' => 'required|string|in:weight_price,item_lost,damaged,late_delivery,other',
            'description' => 'required|string|min:10',
            'requested_resolution' => 'nullable|string|in:REFUND,RE_WASH,COMPENSATION',
            'evidence_photo' => 'nullable|file|image|max:10240',
        ]);

        $complaint = DB::transaction(function () use ($request, $order, $customer, $user) {
            $complaint = Complaint::create([
                'order_id' => $order->id,
                'customer_id' => $customer->id,
                'category' => $request->input('category'),
                'description' => $request->input('description'),
                'requested_resolution' => $request->input('requested_resolution', 'REFUND'),
                'status' => 'SUBMITTED',
            ]);

            // Save evidence photo if present
            if ($request->hasFile('evidence_photo')) {
                $file = $request->file('evidence_photo');
                $path = $file->store('dispute_evidences', 'public');
                $hash = hash_file('sha256', $file->getRealPath());

                DisputeEvidence::create([
                    'complaint_id' => $complaint->id,
                    'uploaded_by' => $user->id,
                    'file_path' => $path,
                    'file_hash' => $hash,
                    'description' => 'Foto bukti diajukan saat membuat komplain.',
                ]);
            }

            // Create Notification
            Notification::create([
                'user_id' => $user->id,
                'title' => 'Komplain Pesanan #' . $order->order_number . ' Diterima',
                'body' => 'Laporan sengketa Anda sedang ditinjau oleh Tim Operasional Laundrie.',
                'type' => 'COMPLAINT_UPDATE',
                'data' => ['complaint_id' => $complaint->id, 'order_id' => $order->id],
            ]);

            return $complaint->load('evidences');
        });

        return response()->json([
            'message' => 'Komplain sengketa berhasil diajukan.',
            'complaint' => $complaint,
        ], 201);
    }

    /**
     * Get customer's submitted complaints
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['message' => 'Bukan pelanggan.'], 403);
        }

        $complaints = Complaint::with(['order.laundry', 'evidences'])
            ->where('customer_id', $customer->id)
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'complaints' => $complaints,
        ]);
    }
}
