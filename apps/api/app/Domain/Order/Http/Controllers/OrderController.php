<?php

namespace App\Domain\Order\Http\Controllers;

use App\Domain\Order\Http\Requests\CreateOrderRequest;
use App\Domain\Order\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends \App\Http\Controllers\Controller
{
    // POST /api/v1/orders — customer create DRAFT
    public function store(CreateOrderRequest $request): JsonResponse
    {
        $user = $request->user();
        $customer = $user->customer;
        if (! $customer) {
            $customer = $user->customer()->create(['name' => $user->name, 'phone' => $user->phone ?? '', 'email' => $user->email]);
        }

        $data = $request->validated();

        // Validasi alamat milik customer
        $pickup = $customer->addresses()->findOrFail($data['pickup_address_id']);
        $delivery = $customer->addresses()->findOrFail($data['delivery_address_id']);

        $laundry = \App\Models\Laundry::where('id', $data['laundry_id'])->where('status', 'ACTIVE')->firstOrFail();

        $order = DB::transaction(function () use ($customer, $laundry, $data, $pickup, $delivery, $user) {
            $orderNumber = 'LDR-' . date('Y') . '-' . str_pad((string) (Order::count() + 1), 6, '0', STR_PAD_LEFT);

            $estimatedTotal = 0;
            $itemsData = [];

            foreach ($data['items'] as $item) {
                $service = Service::where('id', $item['service_id'])->where('laundry_id', $laundry->id)->where('status', 'ACTIVE')->firstOrFail();

                $quantity = (float) $item['quantity'];
                $unitPrice = (float) ($service->price_per_unit ?? $service->base_price);
                // Jika per_weight, unit_price adalah per kg, jika flat, base_price
                if ($service->pricing_model === 'flat') {
                    $unitPrice = (float) $service->base_price;
                } elseif ($service->pricing_model === 'per_weight' || $service->pricing_model === 'per_item') {
                    $unitPrice = (float) ($service->price_per_unit ?? $service->base_price);
                }

                $estimatedAmount = $quantity * $unitPrice;
                // Minimum charge
                if ($service->minimum_charge > 0 && $estimatedAmount < $service->minimum_charge) {
                    $estimatedAmount = (float) $service->minimum_charge;
                }

                $estimatedTotal += $estimatedAmount;

                $itemsData[] = [
                    'service_id' => $service->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'estimated_amount' => $estimatedAmount,
                ];
            }

            $order = Order::create([
                'order_number' => $orderNumber,
                'customer_id' => $customer->id,
                'laundry_id' => $laundry->id,
                'pickup_address_id' => $pickup->id,
                'delivery_address_id' => $delivery->id,
                'status' => 'DRAFT',
                'estimated_weight' => $data['estimated_weight'] ?? null,
                'estimated_total' => $estimatedTotal,
                'currency' => 'IDR',
                'scheduled_pickup_start' => $data['scheduled_pickup_start'],
                'scheduled_pickup_end' => $data['scheduled_pickup_end'],
            ]);

            foreach ($itemsData as $itemData) {
                $order->items()->create($itemData);
            }

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'from_status' => null,
                'to_status' => 'DRAFT',
                'changed_by' => $user->id,
            ]);

            // Auto-dispatch courier job if pickup_method is COURIER or by default
            if ($request->input('pickup_method', 'COURIER') === 'COURIER') {
                \App\Models\CourierJob::create([
                    'order_id' => $order->id,
                    'job_type' => 'PICKUP',
                    'status' => 'DISPATCHED',
                    'notes' => 'Tugas Penjemputan Otomatis dari Pesanan Baru #' . $order->order_number,
                ]);
            }

            return $order->load(['laundry', 'items.service', 'pickupAddress', 'deliveryAddress', 'courierJobs']);
        });

        return response()->json([
            'message' => 'Pesanan berhasil dibuat (DRAFT).',
            'order' => new OrderResource($order),
        ], 201);
    }

    // GET /api/v1/orders — list for customer or laundry
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Order::with(['laundry', 'items.service']);

        if ($user->isManager() || $user->isStaff()) {
            $laundryId = $user->ownedLaundry?->id ?? $user->staffMemberships()->first()?->laundry_id;
            if ($laundryId) {
                $query->where('laundry_id', $laundryId);
            }
        } else {
            $customer = $user->customer;
            if ($customer) {
                $query->where('customer_id', $customer->id);
            } else {
                $query->whereRaw('1=0');
            }
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $orders = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 15));

        return OrderResource::collection($orders)->response();
    }

    // GET /api/v1/orders/{id}
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $order = Order::with(['laundry', 'items.service', 'pickupAddress', 'deliveryAddress', 'statusHistories'])->findOrFail($id);

        // Authorization
        $isCustomer = $user->customer && $order->customer_id === $user->customer->id;
        $isLaundry = ($user->ownedLaundry && $order->laundry_id === $user->ownedLaundry->id) || $user->staffMemberships()->where('laundry_id', $order->laundry_id)->exists();
        $isAdmin = $user->isAdmin();

        if (! $isCustomer && ! $isLaundry && ! $isAdmin) {
            return response()->json(['message' => 'Tidak berhak melihat pesanan ini.'], 403);
        }

        return response()->json([
            'order' => new OrderResource($order),
            'history' => $order->statusHistories,
        ]);
    }

    // POST /api/v1/orders/{id}/confirm — DRAFT -> PENDING_PAYMENT / CONFIRMED
    public function confirm(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $order = Order::findOrFail($id);

        $customer = $user->customer;
        if (! $customer || $order->customer_id !== $customer->id) {
            return response()->json(['message' => 'Hanya pemilik pesanan yang dapat konfirmasi.'], 403);
        }

        if ($order->status !== 'DRAFT') {
            throw ValidationException::withMessages(['status' => ['Hanya pesanan DRAFT yang dapat dikonfirmasi. Status saat ini: ' . $order->status]]);
        }

        DB::transaction(function () use ($order, $user) {
            $from = $order->status;
            $to = 'PENDING_PAYMENT';
            $order->update(['status' => $to]);
            OrderStatusHistory::create([
                'order_id' => $order->id,
                'from_status' => $from,
                'to_status' => $to,
                'changed_by' => $user->id,
            ]);
        });

        return response()->json([
            'message' => 'Pesanan dikonfirmasi. Lanjut ke pembayaran.',
            'order' => new OrderResource($order->fresh()->load(['laundry', 'items.service'])),
        ]);
    }

    // POST /api/v1/orders/{id}/cancel
    public function cancel(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $order = Order::findOrFail($id);

        $isCustomer = $user->customer && $order->customer_id === $user->customer->id;
        $isManager = $user->ownedLaundry && $order->laundry_id === $user->ownedLaundry->id;

        if (! $isCustomer && ! $isManager && ! $user->isAdmin()) {
            return response()->json(['message' => 'Tidak berhak membatalkan.'], 403);
        }

        $allowedFrom = ['DRAFT', 'PENDING_PAYMENT', 'CONFIRMED', 'COURIER_ASSIGNED', 'PICKUP_EN_ROUTE', 'PICKED_UP', 'RECEIVED_AT_LAUNDRY', 'PROCESSING'];
        if (! in_array($order->status, $allowedFrom, true)) {
            throw ValidationException::withMessages(['status' => ['Pesanan dengan status ' . $order->status . ' tidak dapat dibatalkan.']]);
        }

        $reason = $request->input('reason', 'Dibatalkan oleh ' . $user->name);

        DB::transaction(function () use ($order, $user, $reason) {
            $from = $order->status;
            $order->update(['status' => 'CANCELLED']);
            OrderStatusHistory::create([
                'order_id' => $order->id,
                'from_status' => $from,
                'to_status' => 'CANCELLED',
                'changed_by' => $user->id,
                'reason' => $reason,
                'metadata' => $request->input('metadata'),
            ]);
        });

        return response()->json(['message' => 'Pesanan dibatalkan.', 'order' => new OrderResource($order->fresh())]);
    }
}
