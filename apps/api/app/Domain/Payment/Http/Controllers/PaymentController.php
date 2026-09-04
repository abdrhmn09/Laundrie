<?php

namespace App\Domain\Payment\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    /**
     * Initialize payment & generate invoice for an order
     */
    public function charge(Request $request, int $orderId): JsonResponse
    {
        $user = $request->user();
        $order = Order::with(['items.service', 'laundry'])->findOrFail($orderId);

        $customer = $user->customer;
        if (!$customer || $order->customer_id !== $customer->id) {
            return response()->json(['message' => 'Hanya pemilik pesanan yang dapat melakukan pembayaran.'], 403);
        }

        $paymentType = $request->input('payment_type', 'gopay');
        $provider = $request->input('provider', 'MIDTRANS');

        $payment = DB::transaction(function () use ($order, $paymentType, $provider) {
            $paymentNumber = 'PAY-' . date('Ymd') . '-' . str_pad((string) (Payment::count() + 1), 6, '0', STR_PAD_LEFT);
            $invoiceNumber = 'INV-' . date('Ymd') . '-' . str_pad((string) (Invoice::count() + 1), 6, '0', STR_PAD_LEFT);

            $subtotal = (float) ($order->final_total > 0 ? $order->final_total : $order->estimated_total);
            $deliveryFee = 10000;
            $platformFee = 2000;
            $totalAmount = $subtotal + $deliveryFee + $platformFee;

            // 1. Create or get existing invoice
            $invoice = Invoice::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'invoice_number' => $invoiceNumber,
                    'subtotal' => $subtotal,
                    'delivery_fee' => $deliveryFee,
                    'platform_fee' => $platformFee,
                    'total_amount' => $totalAmount,
                    'status' => 'UNPAID',
                    'issued_at' => now(),
                ]
            );

            // 2. Create Payment
            $payment = Payment::create([
                'order_id' => $order->id,
                'payment_number' => $paymentNumber,
                'provider' => $provider,
                'provider_reference' => 'MIDTRANS-SNAP-' . uniqid(),
                'payment_type' => $paymentType,
                'amount' => $totalAmount,
                'status' => 'PENDING',
            ]);

            return $payment->load('order');
        });

        return response()->json([
            'message' => 'Pembayaran berhasil diinisialisasi.',
            'payment' => $payment,
            'snap_token' => 'SNAP_SIMULATED_TOKEN_' . md5($payment->payment_number),
            'redirect_url' => "http://127.0.0.1:5173/orders/{$order->id}/payment-snap?payment_id={$payment->id}",
        ], 201);
    }

    /**
     * Simulate successful payment (Dev/Sandbox)
     */
    public function simulate(Request $request, int $paymentId): JsonResponse
    {
        $payment = Payment::with('order')->findOrFail($paymentId);

        if ($payment->status === 'PAID') {
            return response()->json(['message' => 'Pembayaran ini sudah lunas sebelumnya.'], 200);
        }

        DB::transaction(function () use ($payment) {
            $payment->update([
                'status' => 'PAID',
                'paid_at' => now(),
            ]);

            // Update associated Invoice
            Invoice::where('order_id', $payment->order_id)->update([
                'status' => 'PAID',
                'paid_at' => now(),
            ]);

            // Update Order status
            $payment->order->update([
                'status' => 'CONFIRMED',
            ]);
        });

        return response()->json([
            'message' => 'Pembayaran berhasil disimulasikan sebagai PAID!',
            'payment' => $payment->fresh(),
        ]);
    }

    /**
     * Idempotent Midtrans Webhook Handler
     */
    public function webhook(Request $request): JsonResponse
    {
        $orderId = $request->input('order_id');
        $transactionStatus = $request->input('transaction_status');
        $providerRef = $request->input('transaction_id');

        $payment = Payment::where('provider_reference', $providerRef)
            ->orWhere('payment_number', $orderId)
            ->first();

        if (!$payment) {
            return response()->json(['message' => 'Pembayaran tidak ditemukan.'], 404);
        }

        if ($payment->status === 'PAID') {
            return response()->json(['message' => 'Idempotent response: Payment already processed.'], 200);
        }

        if (in_array($transactionStatus, ['capture', 'settlement'])) {
            DB::transaction(function () use ($payment, $request) {
                $payment->update([
                    'status' => 'PAID',
                    'paid_at' => now(),
                    'raw_payload' => $request->all(),
                ]);

                Invoice::where('order_id', $payment->order_id)->update([
                    'status' => 'PAID',
                    'paid_at' => now(),
                ]);

                $payment->order->update(['status' => 'CONFIRMED']);
            });
        } elseif (in_array($transactionStatus, ['deny', 'expire', 'cancel'])) {
            $payment->update([
                'status' => $transactionStatus === 'expire' ? 'EXPIRED' : 'FAILED',
                'raw_payload' => $request->all(),
            ]);
        }

        return response()->json(['message' => 'Webhook processed successfully.']);
    }
}
