<?php

namespace App\Domain\Settlement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Courier;
use App\Models\Laundry;
use App\Models\Settlement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettlementController extends Controller
{
    /**
     * Get Laundry Manager settlement history
     */
    public function laundrySettlements(Request $request): JsonResponse
    {
        $user = $request->user();
        $laundry = $user->ownedLaundry;

        if (!$laundry) {
            return response()->json(['message' => 'Akun Anda bukan pemilik laundry.'], 403);
        }

        $settlements = Settlement::where('laundry_id', $laundry->id)
            ->orderByDesc('id')
            ->get();

        // Calculate available net earnings from COMPLETED orders
        $totalEarned = DB::table('orders')
            ->where('laundry_id', $laundry->id)
            ->where('status', 'COMPLETED')
            ->sum('estimated_total');

        $totalWithdrawn = Settlement::where('laundry_id', $laundry->id)
            ->whereIn('status', ['APPROVED', 'PAID'])
            ->sum('net_amount');

        $availableBalance = max(0, $totalEarned - $totalWithdrawn);

        return response()->json([
            'laundry' => $laundry,
            'total_earned' => (float) $totalEarned,
            'total_withdrawn' => (float) $totalWithdrawn,
            'available_balance' => (float) $availableBalance,
            'settlements' => $settlements,
        ]);
    }

    /**
     * Laundry Manager requests payout settlement
     */
    public function requestLaundrySettlement(Request $request): JsonResponse
    {
        $user = $request->user();
        $laundry = $user->ownedLaundry;

        if (!$laundry) {
            return response()->json(['message' => 'Bukan pemilik laundry.'], 403);
        }

        $request->validate([
            'amount' => 'required|numeric|min:10000',
            'bank_name' => 'required|string',
            'account_number' => 'required|string',
            'account_holder' => 'required|string',
        ]);

        $amount = (float) $request->input('amount');
        $commission = $amount * 0.10; // 10% platform commission
        $netAmount = $amount - $commission;

        $settlement = Settlement::create([
            'settlement_number' => 'STL-' . date('Ymd') . '-' . str_pad((string) (Settlement::count() + 1), 6, '0', STR_PAD_LEFT),
            'laundry_id' => $laundry->id,
            'gross_amount' => $amount,
            'platform_commission' => $commission,
            'net_amount' => $netAmount,
            'bank_name' => $request->input('bank_name'),
            'account_number' => $request->input('account_number'),
            'account_holder' => $request->input('account_holder'),
            'status' => 'PENDING',
        ]);

        return response()->json([
            'message' => 'Pengajuan pencairan dana berhasil dibuat.',
            'settlement' => $settlement,
        ], 201);
    }

    /**
     * Get Freelance Courier earnings & balance
     */
    public function courierEarnings(Request $request): JsonResponse
    {
        $user = $request->user();
        $courier = Courier::where('user_id', $user->id)->first();

        if (!$courier) {
            return response()->json(['message' => 'Bukan akun kurir.'], 403);
        }

        $settlements = Settlement::where('courier_id', $courier->id)
            ->orderByDesc('id')
            ->get();

        // Calculate total earnings from completed jobs (Rp 15.000 per completed job)
        $completedJobsCount = DB::table('courier_jobs')
            ->where('courier_id', $courier->id)
            ->where('status', 'COMPLETED')
            ->count();

        $totalEarned = $completedJobsCount * 15000;

        $totalWithdrawn = Settlement::where('courier_id', $courier->id)
            ->whereIn('status', ['APPROVED', 'PAID'])
            ->sum('net_amount');

        $availableBalance = max(0, $totalEarned - $totalWithdrawn);

        return response()->json([
            'courier' => $courier,
            'completed_jobs_count' => $completedJobsCount,
            'total_earned' => (float) $totalEarned,
            'total_withdrawn' => (float) $totalWithdrawn,
            'available_balance' => (float) $availableBalance,
            'settlements' => $settlements,
        ]);
    }

    /**
     * Courier requests withdrawal
     */
    public function withdrawCourierEarnings(Request $request): JsonResponse
    {
        $user = $request->user();
        $courier = Courier::where('user_id', $user->id)->first();

        if (!$courier || !$courier->isFreelance()) {
            return response()->json(['message' => 'Hanya kurir freelance yang dapat melakukan penarikan saldo.'], 403);
        }

        $request->validate([
            'amount' => 'required|numeric|min:10000',
            'bank_name' => 'required|string',
            'account_number' => 'required|string',
            'account_holder' => 'required|string',
        ]);

        $amount = (float) $request->input('amount');

        $settlement = Settlement::create([
            'settlement_number' => 'STL-CR-' . date('Ymd') . '-' . str_pad((string) (Settlement::count() + 1), 6, '0', STR_PAD_LEFT),
            'courier_id' => $courier->id,
            'gross_amount' => $amount,
            'platform_commission' => 0,
            'net_amount' => $amount,
            'bank_name' => $request->input('bank_name'),
            'account_number' => $request->input('account_number'),
            'account_holder' => $request->input('account_holder'),
            'status' => 'PENDING',
        ]);

        return response()->json([
            'message' => 'Permintaan penarikan saldo berhasil dikirim.',
            'settlement' => $settlement,
        ], 201);
    }

    /**
     * Admin Finance — List all pending settlements
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $settlements = Settlement::with(['laundry', 'courier.user'])
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'settlements' => $settlements,
        ]);
    }

    /**
     * Admin Finance — Approve settlement payout
     */
    public function approveSettlement(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $settlement = Settlement::findOrFail($id);

        if ($settlement->status === 'PAID') {
            return response()->json(['message' => 'Pencairan ini sudah disetujui sebelumnya.'], 422);
        }

        $settlement->update([
            'status' => 'PAID',
            'approved_by' => $user->id,
            'paid_at' => now(),
        ]);

        return response()->json([
            'message' => 'Pencairan dana berhasil disetujui dan dicairkan.',
            'settlement' => $settlement,
        ]);
    }
}
