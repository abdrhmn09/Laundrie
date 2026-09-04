<?php

namespace App\Domain\Invoice\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    /**
     * Get invoice breakdown for an order
     */
    public function show(Request $request, int $orderId): JsonResponse
    {
        $order = Order::with(['items.service', 'laundry', 'customer', 'pickupAddress', 'deliveryAddress'])->findOrFail($orderId);

        $invoice = Invoice::where('order_id', $orderId)->first();

        if (!$invoice) {
            // Auto generate draft invoice metadata
            $subtotal = (float) ($order->final_total > 0 ? $order->final_total : $order->estimated_total);
            $deliveryFee = 10000;
            $platformFee = 2000;
            $totalAmount = $subtotal + $deliveryFee + $platformFee;

            $invoice = Invoice::create([
                'order_id' => $order->id,
                'invoice_number' => 'INV-' . date('Ymd') . '-' . str_pad((string) (Invoice::count() + 1), 6, '0', STR_PAD_LEFT),
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'platform_fee' => $platformFee,
                'total_amount' => $totalAmount,
                'status' => 'UNPAID',
                'issued_at' => now(),
            ]);
        }

        return response()->json([
            'order' => $order,
            'invoice' => $invoice,
        ]);
    }
}
