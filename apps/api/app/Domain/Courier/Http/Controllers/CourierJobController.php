<?php

namespace App\Domain\Courier\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Courier;
use App\Models\CourierJob;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CourierJobController extends Controller
{
    /**
     * Get list of jobs available for courier or assigned to courier
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $courier = Courier::where('user_id', $user->id)->first();

        if (!$courier) {
            return response()->json([
                'message' => 'Akun Anda belum terdaftar sebagai kurir.',
            ], 403);
        }

        $type = $request->query('type', 'available');

        if ($type === 'my_jobs') {
            $jobs = CourierJob::with(['order.laundry', 'order.customer', 'order.pickupAddress', 'order.deliveryAddress'])
                ->where('courier_id', $courier->id)
                ->orderByDesc('id')
                ->get();
        } else {
            // Available jobs dispatched to all couriers or matching courier's laundry
            $query = CourierJob::with(['order.laundry', 'order.customer', 'order.pickupAddress', 'order.deliveryAddress'])
                ->where('status', 'DISPATCHED')
                ->whereNull('courier_id');

            if ($courier->isLaundryStaff()) {
                $query->whereHas('order', function ($q) use ($courier) {
                    $q->where('laundry_id', $courier->laundry_id);
                });
            }

            $jobs = $query->orderByDesc('id')->get();
        }

        return response()->json([
            'courier' => $courier,
            'jobs' => $jobs,
        ]);
    }

    /**
     * Get courier's active assigned job
     */
    public function active(Request $request): JsonResponse
    {
        $user = $request->user();
        $courier = Courier::where('user_id', $user->id)->first();

        if (!$courier) {
            return response()->json(['message' => 'Bukan akun kurir.'], 403);
        }

        $activeJob = CourierJob::with(['order.laundry', 'order.customer', 'order.pickupAddress', 'order.deliveryAddress'])
            ->where('courier_id', $courier->id)
            ->whereIn('status', ['ACCEPTED', 'IN_TRANSIT'])
            ->first();

        return response()->json([
            'active_job' => $activeJob,
        ]);
    }

    /**
     * Accept a job
     */
    public function accept(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $courier = Courier::where('user_id', $user->id)->first();

        if (!$courier) {
            return response()->json(['message' => 'Akun Anda belum terdaftar sebagai kurir.'], 403);
        }

        $job = CourierJob::findOrFail($id);

        if ($job->status !== 'DISPATCHED') {
            return response()->json(['message' => 'Tugas ini sudah diambil atau tidak lagi tersedia.'], 422);
        }

        $job->update([
            'courier_id' => $courier->id,
            'status' => 'ACCEPTED',
            'accepted_at' => now(),
        ]);

        return response()->json([
            'message' => 'Tugas berhasil diterima!',
            'job' => $job->fresh(['order.laundry', 'order.pickupAddress', 'order.deliveryAddress']),
        ]);
    }

    /**
     * Update job status (ACCEPTED -> IN_TRANSIT -> COMPLETED)
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $courier = Courier::where('user_id', $user->id)->first();

        if (!$courier) {
            return response()->json(['message' => 'Akun Anda belum terdaftar sebagai kurir.'], 403);
        }

        $job = CourierJob::with('order')->findOrFail($id);

        if ($job->courier_id !== $courier->id) {
            return response()->json(['message' => 'Anda tidak memiliki hak akses untuk tugas ini.'], 403);
        }

        $request->validate([
            'status' => 'required|in:IN_TRANSIT,COMPLETED,CANCELLED',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'notes' => 'nullable|string',
            'proof_photo' => 'nullable|image|max:10240',
        ]);

        $nextStatus = $request->input('status');
        $photoPath = $job->proof_photo_path;
        $photoHash = $job->proof_photo_hash;

        if ($request->hasFile('proof_photo')) {
            $file = $request->file('proof_photo');
            $contents = file_get_contents($file->getRealPath());
            $photoHash = hash('sha256', $contents);
            $photoPath = $file->store('courier-proofs', 'public');
        }

        DB::transaction(function () use ($job, $nextStatus, $request, $photoPath, $photoHash) {
            $updateData = [
                'status' => $nextStatus,
                'latitude' => $request->input('latitude', $job->latitude),
                'longitude' => $request->input('longitude', $job->longitude),
                'notes' => $request->input('notes', $job->notes),
                'proof_photo_path' => $photoPath,
                'proof_photo_hash' => $photoHash,
            ];

            if ($nextStatus === 'IN_TRANSIT' && !$job->started_at) {
                $updateData['started_at'] = now();
                if ($job->job_type === 'PICKUP') {
                    $job->order->update(['status' => 'PICKUP_IN_PROGRESS']);
                } else {
                    $job->order->update(['status' => 'DELIVERY_IN_PROGRESS']);
                }
            }

            if ($nextStatus === 'COMPLETED') {
                $updateData['completed_at'] = now();
                if ($job->job_type === 'PICKUP') {
                    $job->order->update(['status' => 'RECEIVED_AT_LAUNDRY']);
                } else {
                    $job->order->update(['status' => 'COMPLETED', 'completed_at' => now()]);
                }
            }

            $job->update($updateData);
        });

        return response()->json([
            'message' => 'Status tugas berhasil diperbarui.',
            'job' => $job->fresh(['order.laundry', 'order.pickupAddress', 'order.deliveryAddress']),
        ]);
    }
}
