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
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('document_type', 'ilike', "%{$search}%")
                  ->orWhere('file_path', 'ilike', "%{$search}%");
                // Cari di user terkait via owner
                // Untuk owner_type=user, cari di users
                $userIds = \App\Models\User::where('name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
                    ->pluck('id')->toArray();
                if (!empty($userIds)) {
                    $q->orWhere(function ($qq) use ($userIds) {
                        $qq->where('owner_type', 'user')->whereIn('owner_id', $userIds);
                    });
                    // Juga untuk laundry yang dimiliki user tersebut
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

        // Enrich with owner user info for display (tampilkan dokumen yang dimiliki user)
        $docs->getCollection()->transform(function ($doc) {
            $ownerUser = null;
            $ownerLabel = null;
            try {
                if ($doc->owner_type === 'user') {
                    $u = \App\Models\User::find($doc->owner_id);
                    if ($u) {
                        $ownerUser = ['id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'phone' => $u->phone];
                        $ownerLabel = $u->name . ' (' . $u->email . ')';
                    }
                } elseif ($doc->owner_type === 'laundry') {
                    $l = \App\Models\Laundry::with('owner')->find($doc->owner_id);
                    if ($l && $l->owner) {
                        $ownerUser = ['id' => $l->owner->id, 'name' => $l->owner->name, 'email' => $l->owner->email];
                        $ownerLabel = $l->business_name . ' — ' . $l->owner->name . ' (' . $l->owner->email . ')';
                    }
                } elseif ($doc->owner_type === 'courier') {
                    $c = \App\Models\Courier::with('user', 'laundry')->find($doc->owner_id);
                    if ($c && $c->user) {
                        $ownerUser = ['id' => $c->user->id, 'name' => $c->user->name, 'email' => $c->user->email];
                        $ownerLabel = $c->user->name . ' (' . $c->user->email . ') — ' . $c->courier_type . ($c->laundry ? ' @ ' . $c->laundry->business_name : '');
                    }
                } elseif ($doc->owner_type === 'staff_application') {
                    $app = \App\Models\StaffApplication::with('applicant', 'laundry')->find($doc->owner_id);
                    if ($app && $app->applicant) {
                        $ownerUser = ['id' => $app->applicant->id, 'name' => $app->applicant->name, 'email' => $app->applicant->email];
                        $ownerLabel = $app->applicant->name . ' (' . $app->applicant->email . ') → ' . ($app->laundry->business_name ?? 'Laundry #' . $app->laundry_id) . ' [' . $app->application_type . ']';
                    }
                }
            } catch (\Exception $e) {}
            $doc->setAttribute('owner_user', $ownerUser);
            $doc->setAttribute('owner_label', $ownerLabel);
            return $doc;
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
