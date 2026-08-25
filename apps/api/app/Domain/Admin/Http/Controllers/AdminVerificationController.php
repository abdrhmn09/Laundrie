<?php

namespace App\Domain\Admin\Http\Controllers;

use App\Models\VerificationDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminVerificationController extends \App\Http\Controllers\Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Hanya admin yang dapat mengakses.'], 403);
        }

        $query = VerificationDocument::query()->with(['reviewer']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('owner_type')) {
            $query->where('owner_type', $request->input('owner_type'));
        }

        $docs = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 15));

        return response()->json($docs);
    }

    public function review(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Hanya admin yang dapat mereview.'], 403);
        }

        $request->validate([
            'status'           => ['required', 'in:APPROVED,REJECTED'],
            'rejection_reason' => ['required_if:status,REJECTED', 'nullable', 'string', 'max:1000'],
        ]);

        $doc = VerificationDocument::findOrFail($id);

        if ($doc->status !== 'PENDING') {
            return response()->json(['message' => 'Dokumen sudah direview.'], 422);
        }

        DB::transaction(function () use ($doc, $request, $user) {
            $doc->update([
                'status'           => $request->input('status'),
                'reviewed_by'      => $user->id,
                'rejection_reason' => $request->input('rejection_reason'),
            ]);

            // Update related entity status if approved
            if ($request->input('status') === 'APPROVED') {
                if ($doc->owner_type === 'laundry') {
                    $laundry = \App\Models\Laundry::find($doc->owner_id);
                    if ($laundry && $laundry->status === 'PENDING') {
                        $laundry->update(['status' => 'DOCUMENT_REVIEW']);
                    }
                } elseif ($doc->owner_type === 'courier') {
                    $courier = \App\Models\Courier::find($doc->owner_id);
                    if ($courier && $courier->status === 'PENDING') {
                        $courier->update(['status' => 'VERIFIED']);
                    }
                }
            }

            // Audit log — jika tabel audit_logs ada, catat; jika tidak, lewati (MVP)
            if (\Illuminate\Support\Facades\Schema::hasTable('audit_logs')) {
                try {
                    \Illuminate\Support\Facades\DB::table('audit_logs')->insert([
                        'actor_type' => 'admin',
                        'actor_id'   => $user->id,
                        'action'     => 'verification.' . strtolower($request->input('status')),
                        'entity_type'=> 'verification_document',
                        'entity_id'  => $doc->id,
                        'old_values' => json_encode(['status' => 'PENDING']),
                        'new_values' => json_encode(['status' => $request->input('status'), 'rejection_reason' => $request->input('rejection_reason')]),
                        'ip_address' => $request->ip(),
                        'user_agent' => $request->userAgent(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                } catch (\Exception $e) {
                    // ignore if audit_logs schema different
                }
            }
        });

        return response()->json([
            'message'  => $request->input('status') === 'APPROVED' ? 'Dokumen disetujui.' : 'Dokumen ditolak.',
            'document' => $doc->fresh(),
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Hanya admin yang dapat mengakses.'], 403);
        }

        $doc = VerificationDocument::findOrFail($id);

        // Generate signed URL for preview (for local, just return file_path)
        $url = null;
        if ($doc->file_path) {
            try {
                $url = \Illuminate\Support\Facades\Storage::disk('local')->temporaryUrl($doc->file_path, now()->addMinutes(10));
            } catch (\Exception $e) {
                $url = \Illuminate\Support\Facades\Storage::disk('local')->url($doc->file_path);
            }
        }

        return response()->json([
            'document' => $doc,
            'preview_url' => $url,
        ]);
    }
}
