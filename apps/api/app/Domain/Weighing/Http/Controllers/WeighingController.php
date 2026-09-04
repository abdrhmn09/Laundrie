<?php

namespace App\Domain\Weighing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\WeightEvidence;
use App\Models\WeightMeasurement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\ValidationException;

class WeighingController extends Controller
{
    // GET /api/v1/orders/{id}/weighing — Get weighing measurements & active evidence
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $order = Order::with(['weightMeasurements.evidence', 'weightEvidences'])->findOrFail($id);

        // Authorization check
        $isCustomer = $user->customer && $order->customer_id === $user->customer->id;
        $isLaundry = ($user->ownedLaundry && $order->laundry_id === $user->ownedLaundry->id)
            || $user->staffMemberships()->where('laundry_id', $order->laundry_id)->exists();
        $isAdmin = $user->isAdmin();

        if (! $isCustomer && ! $isLaundry && ! $isAdmin) {
            return response()->json(['message' => 'Tidak berhak melihat data penimbangan ini.'], 403);
        }

        $activeMeasurement = $order->weightMeasurements()
            ->where('measurement_type', 'actual')
            ->where('status', '!=', 'SUPERSEDED')
            ->latest()
            ->first();

        $activeEvidence = $activeMeasurement?->evidence;

        $photoUrl = null;
        if ($activeEvidence && Storage::disk('private')->exists($activeEvidence->photo_path)) {
            $photoUrl = URL::temporarySignedRoute(
                'weighing.photo',
                now()->addMinutes(30),
                ['id' => $activeEvidence->id]
            );
        }

        return response()->json([
            'order_id' => $order->id,
            'estimated_weight' => $order->estimated_weight,
            'actual_weight' => $order->actual_weight,
            'status' => $order->status,
            'active_measurement' => $activeMeasurement,
            'active_evidence' => $activeEvidence ? array_merge($activeEvidence->toArray(), ['photo_url' => $photoUrl]) : null,
            'measurements_history' => $order->weightMeasurements,
        ]);
    }

    // POST /api/v1/orders/{id}/weighing/record — Record actual weight & capture photo evidence
    public function record(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        // Must be staff or manager of the laundry
        $staff = $user->staffMemberships()->first();
        $laundry = $user->ownedLaundry;

        if (! $laundry && ! $staff) {
            return response()->json(['message' => 'Hanya staf atau manager laundry yang dapat melakukan penimbangan.'], 403);
        }

        $order = Order::findOrFail($id);
        $laundryId = $laundry?->id ?? $staff->laundry_id;

        if ($order->laundry_id !== $laundryId) {
            return response()->json(['message' => 'Pesanan ini tidak milik laundry Anda.'], 403);
        }

        $allowedStatuses = ['RECEIVED_AT_LAUNDRY', 'WEIGHING_REQUIRED', 'WEIGHT_REVIEW_REQUIRED'];
        if (! in_array($order->status, $allowedStatuses, true)) {
            throw ValidationException::withMessages([
                'status' => ['Penimbangan hanya dapat dilakukan saat status RECEIVED_AT_LAUNDRY atau WEIGHING_REQUIRED. Status saat ini: ' . $order->status],
            ]);
        }

        $request->validate([
            'actual_weight' => ['required', 'numeric', 'min:0.1', 'max:999.99'],
            'photo' => ['required', 'image', 'max:10240'], // Max 10MB
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'device_id' => ['nullable', 'string', 'max:100'],
        ]);

        $actualWeight = (float) $request->input('actual_weight');
        $file = $request->file('photo');

        // Calculate SHA-256 Hash of photo
        $photoHash = hash_file('sha256', $file->getRealPath());

        // Store file in private storage
        $path = $file->store('weight_evidences/' . date('Y/m'), 'private');

        $evidenceRecord = null;
        $measurementRecord = null;

        DB::transaction(function () use ($order, $user, $staff, $laundryId, $actualWeight, $path, $photoHash, $request, &$evidenceRecord, &$measurementRecord) {
            // Supersede old active measurements if any
            $order->weightMeasurements()
                ->where('measurement_type', 'actual')
                ->where('status', '!=', 'SUPERSEDED')
                ->update(['status' => 'SUPERSEDED']);

            $order->weightEvidences()
                ->where('status', 'CAPTURED')
                ->update(['status' => 'INVALIDATED', 'invalidation_reason' => 'Digantikan penimbangan baru']);

            // Create new WeightMeasurement record
            $measurementRecord = WeightMeasurement::create([
                'order_id' => $order->id,
                'measurement_type' => 'actual',
                'actual_value' => $actualWeight,
                'unit' => 'kg',
                'recorded_by' => $staff?->id,
                'recorded_at' => now(),
                'status' => 'RECORDED',
            ]);

            // Create new WeightEvidence record
            $evidenceRecord = WeightEvidence::create([
                'order_id' => $order->id,
                'measurement_id' => $measurementRecord->id,
                'laundry_id' => $laundryId,
                'staff_id' => $staff?->id ?? 1,
                'weight' => $actualWeight,
                'unit' => 'kg',
                'photo_path' => $path,
                'photo_hash' => $photoHash,
                'captured_at' => now(),
                'status' => 'CAPTURED',
                'device_id' => $request->input('device_id'),
                'latitude' => $request->input('latitude'),
                'longitude' => $request->input('longitude'),
            ]);

            $measurementRecord->update(['evidence_id' => $evidenceRecord->id]);

            // Evaluate Weight Variance
            $estimatedWeight = (float) $order->estimated_weight;
            $needsReview = false;

            if ($estimatedWeight > 0) {
                $variancePercent = abs($actualWeight - $estimatedWeight) / $estimatedWeight * 100;
                if ($variancePercent > 30.0) {
                    $needsReview = true;
                }
            }

            $fromStatus = $order->status;
            $newStatus = $needsReview ? 'WEIGHT_REVIEW_REQUIRED' : 'PRICE_FINALIZED';

            if (! $needsReview) {
                $measurementRecord->update(['status' => 'VERIFIED']);
                $evidenceRecord->update(['status' => 'CONFIRMED', 'confirmed_at' => now()]);
            }

            // Update order actual_weight and status
            $order->update([
                'actual_weight' => $actualWeight,
                'status' => $newStatus,
            ]);

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'from_status' => $fromStatus,
                'to_status' => $newStatus,
                'changed_by' => $user->id,
                'reason' => $needsReview ? 'Penimbangan membutuhkan peninjauan pelanggan (>30% selisih)' : 'Penimbangan terverifikasi',
                'metadata' => [
                    'actual_weight' => $actualWeight,
                    'estimated_weight' => $estimatedWeight,
                    'photo_hash' => $photoHash,
                ],
            ]);
        });

        return response()->json([
            'message' => 'Penimbangan dan bukti foto berhasil dicatat.',
            'measurement' => $measurementRecord,
            'evidence' => $evidenceRecord,
            'order_status' => $order->fresh()->status,
        ], 201);
    }

    // POST /api/v1/orders/{id}/weighing/confirm — Customer confirms weight review
    public function confirmReview(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $order = Order::findOrFail($id);

        $customer = $user->customer;
        if (! $customer || $order->customer_id !== $customer->id) {
            return response()->json(['message' => 'Hanya pelanggan pemilik pesanan yang dapat menyetujui hasil penimbangan.'], 403);
        }

        if ($order->status !== 'WEIGHT_REVIEW_REQUIRED') {
            throw ValidationException::withMessages([
                'status' => ['Status pesanan tidak membutuhkan peninjauan berat. Status saat ini: ' . $order->status],
            ]);
        }

        DB::transaction(function () use ($order, $user) {
            $fromStatus = $order->status;
            $newStatus = 'PRICE_FINALIZED';

            $measurement = $order->weightMeasurements()
                ->where('measurement_type', 'actual')
                ->where('status', 'RECORDED')
                ->latest()
                ->first();

            if ($measurement) {
                $measurement->update(['status' => 'VERIFIED']);
                if ($measurement->evidence) {
                    $measurement->evidence->update([
                        'status' => 'CONFIRMED',
                        'confirmed_at' => now(),
                    ]);
                }
            }

            $order->update(['status' => $newStatus]);

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'from_status' => $fromStatus,
                'to_status' => $newStatus,
                'changed_by' => $user->id,
                'reason' => 'Disetujui oleh pelanggan',
            ]);
        });

        return response()->json([
            'message' => 'Penimbangan disetujui. Harga difinalisasi.',
            'order_status' => $order->fresh()->status,
        ]);
    }

    // POST /api/v1/orders/{id}/weighing/invalidate — Invalidate evidence for correction
    public function invalidate(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $order = Order::findOrFail($id);

        $isManager = $user->ownedLaundry && $order->laundry_id === $user->ownedLaundry->id;
        $isAdmin = $user->isAdmin();

        if (! $isManager && ! $isAdmin) {
            return response()->json(['message' => 'Hanya Manager atau Admin yang dapat membatalkan/mengkoreksi bukti penimbangan.'], 403);
        }

        $request->validate([
            'reason' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        $reason = $request->input('reason');

        DB::transaction(function () use ($order, $user, $reason) {
            $measurement = $order->weightMeasurements()
                ->where('measurement_type', 'actual')
                ->where('status', '!=', 'SUPERSEDED')
                ->latest()
                ->first();

            if ($measurement) {
                $measurement->update(['status' => 'SUPERSEDED']);
                if ($measurement->evidence) {
                    $measurement->evidence->update([
                        'status' => 'INVALIDATED',
                        'invalidated_at' => now(),
                        'invalidated_by' => $user->id,
                        'invalidation_reason' => $reason,
                    ]);
                }
            }

            $fromStatus = $order->status;
            $newStatus = 'WEIGHING_REQUIRED';
            $order->update(['status' => $newStatus, 'actual_weight' => null]);

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'from_status' => $fromStatus,
                'to_status' => $newStatus,
                'changed_by' => $user->id,
                'reason' => 'Bukti penimbangan diinvalidasi: ' . $reason,
            ]);
        });

        return response()->json([
            'message' => 'Bukti penimbangan berhasil diinvalidasi. Pesanan kembali ke status WEIGHING_REQUIRED.',
            'order_status' => $order->fresh()->status,
        ]);
    }

    // GET /api/v1/weighing-evidence/{id}/photo — Secure signed route to stream evidence photo
    public function servePhoto(Request $request, int $id)
    {
        if (! $request->hasValidSignature()) {
            return response()->json(['message' => 'URL signed tidak valid atau telah kadaluarsa.'], 401);
        }

        $evidence = WeightEvidence::findOrFail($id);

        if (! Storage::disk('private')->exists($evidence->photo_path)) {
            return response()->json(['message' => 'File gambar tidak ditemukan.'], 404);
        }

        return Storage::disk('private')->response($evidence->photo_path);
    }
}
