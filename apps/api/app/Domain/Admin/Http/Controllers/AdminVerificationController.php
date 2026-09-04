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

        // Admin hanya kelola dokumen laundry & courier (freelance), bukan staff (KTP staff diverifikasi manager)
        $query->whereIn('owner_type', ['laundry', 'courier']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('owner_type')) {
            // Jika admin filter spesifik, tetap batasi hanya laundry/courier
            if (in_array($request->input('owner_type'), ['laundry', 'courier'])) {
                $query->where('owner_type', $request->input('owner_type'));
            }
        }
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('document_type', 'ilike', "%{$search}%")
                  ->orWhere('file_path', 'ilike', "%{$search}%");
                // Cari di user terkait via laundry/courier (admin hanya kelola laundry & courier)
                $userIds = \App\Models\User::where('name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
                    ->pluck('id')->toArray();
                if (!empty($userIds)) {
                    $laundryIds = \App\Models\Laundry::whereIn('user_id', $userIds)->pluck('id')->toArray();
                    if (!empty($laundryIds)) {
                        $q->orWhere(function ($qq) use ($laundryIds) {
                            $qq->where('owner_type', 'laundry')->whereIn('owner_id', $laundryIds);
                        });
                    }
                    $courierIds = \App\Models\Courier::whereIn('user_id', $userIds)->pluck('id')->toArray();
                    if (!empty($courierIds)) {
                        $q->orWhere(function ($qq) use ($courierIds) {
                            $qq->where('owner_type', 'courier')->whereIn('owner_id', $courierIds);
                        });
                    }
                }
            });
        }

        $docs = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 15));

        // Enrich with owner user info for display (tampilkan dokumen yang dimiliki user per tipe)
        $docs->getCollection()->transform(function ($doc) {
            return $this->enrichDoc($doc);
        });

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
        $doc = $this->enrichDoc($doc);

        $url = null;
        if ($doc->file_path) {
            $url = url("/api/v1/admin/verification-documents/{$doc->id}/file");
        }

        return response()->json([
            'document' => $doc,
            'preview_url' => $url,
        ]);
    }

    public function file(Request $request, int $id)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Hanya admin yang dapat mengakses.'], 403);
        }

        $doc = VerificationDocument::findOrFail($id);
        $path = storage_path('app/private/' . $doc->file_path);
        // Fallback to local disk path
        if (! file_exists($path)) {
            $path = storage_path('app/' . $doc->file_path);
        }
        if (! file_exists($path)) {
            return response()->json(['message' => 'File tidak ditemukan.'], 404);
        }

        $mime = mime_content_type($path) ?: 'application/octet-stream';
        return response()->file($path, [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="' . basename($path) . '"',
        ]);
    }

    private function enrichDoc($doc)
    {
        $ownerUser = null;
        $ownerLabel = null;
        try {
            if ($doc->owner_type === 'user') {
                $u = \App\Models\User::find($doc->owner_id);
                if ($u) {
                    $ownerUser = ['id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'phone' => $u->phone, 'role' => $u->role];
                    $ownerLabel = $u->name . ' (' . $u->email . ') — Pelanggan/Staff';
                }
            } elseif ($doc->owner_type === 'laundry') {
                $l = \App\Models\Laundry::with('owner')->find($doc->owner_id);
                if ($l && $l->owner) {
                    $ownerUser = ['id' => $l->owner->id, 'name' => $l->owner->name, 'email' => $l->owner->email, 'phone' => $l->owner->phone, 'role' => $l->owner->role];
                    $ownerLabel = $l->business_name . ' — ' . $l->owner->name . ' (' . $l->owner->email . ')';
                }
            } elseif ($doc->owner_type === 'courier') {
                $c = \App\Models\Courier::with('user', 'laundry')->find($doc->owner_id);
                if ($c && $c->user) {
                    $ownerUser = ['id' => $c->user->id, 'name' => $c->user->name, 'email' => $c->user->email, 'phone' => $c->user->phone, 'role' => $c->user->role];
                    $ownerLabel = $c->user->name . ' (' . $c->user->email . ') — ' . $c->courier_type . ($c->laundry ? ' @ ' . $c->laundry->business_name : ' (Freelance)');
                }
            } elseif ($doc->owner_type === 'staff_application') {
                $app = \App\Models\StaffApplication::with('applicant', 'laundry')->find($doc->owner_id);
                if ($app && $app->applicant) {
                    $ownerUser = ['id' => $app->applicant->id, 'name' => $app->applicant->name, 'email' => $app->applicant->email, 'phone' => $app->applicant->phone, 'role' => $app->applicant->role];
                    $ownerLabel = $app->applicant->name . ' (' . $app->applicant->email . ') → ' . ($app->laundry->business_name ?? 'Laundry #' . $app->laundry_id) . ' [' . $app->application_type . ']';
                }
            }
        } catch (\Exception $e) {}
        $doc->setAttribute('owner_user', $ownerUser);
        $doc->setAttribute('owner_label', $ownerLabel);
        // User type badge
        $userType = 'Customer';
        if ($ownerUser) {
            if ($doc->owner_type === 'laundry') $userType = 'Laundry (Manager)';
            elseif ($doc->owner_type === 'courier' && str_contains($ownerLabel ?? '', 'Freelance')) $userType = 'Kurir Freelance';
            elseif ($doc->owner_type === 'courier') $userType = 'Kurir Staff Laundry';
            elseif ($doc->owner_type === 'staff_application') $userType = 'Staff Pelamar';
            elseif ($doc->owner_type === 'user') $userType = 'Staff (KTP)';
            else $userType = $ownerUser['role'] ?? 'User';
        }
        $doc->setAttribute('user_type_label', $userType);
        return $doc;
    }
}
