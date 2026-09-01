<?php

namespace App\Domain\Laundry\Http\Controllers;

use App\Models\VerificationDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LaundryVerificationController extends \App\Http\Controllers\Controller
{
    private function assertManager(Request $request): \App\Models\Laundry
    {
        $laundry = $request->user()->ownedLaundry;
        if (! $laundry) {
            throw ValidationException::withMessages(['laundry' => ['Anda bukan Manager.']]);
        }
        return $laundry;
    }

    // GET /api/v1/laundry/verification-documents — dokumen staff pelamar untuk laundry manager
    public function index(Request $request): JsonResponse
    {
        $laundry = $this->assertManager($request);

        $query = VerificationDocument::query()
            ->where(function ($q) use ($laundry) {
                // Dokumen KTP staff_application yang laundry_id-nya adalah laundry manager
                $q->where('owner_type', 'staff_application')
                  ->whereIn('owner_id', function ($sub) use ($laundry) {
                      $sub->select('id')->from('staff_applications')->where('laundry_id', $laundry->id);
                  });
                // Juga dokumen user yang sedang melamar ke laundry ini (jika ada)
                $q->orWhere(function ($qq) use ($laundry) {
                    $qq->where('owner_type', 'user')
                       ->whereIn('owner_id', function ($sub) use ($laundry) {
                           $sub->select('user_id')->from('staff_applications')->where('laundry_id', $laundry->id)->where('status', 'PENDING');
                       });
                });
            });

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $docs = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 15));

        // Enrich dengan owner user
        $docs->getCollection()->transform(function ($doc) {
            $ownerUser = null;
            $ownerLabel = null;
            try {
                if ($doc->owner_type === 'staff_application') {
                    $app = \App\Models\StaffApplication::with('applicant', 'laundry')->find($doc->owner_id);
                    if ($app && $app->applicant) {
                        $ownerUser = ['id' => $app->applicant->id, 'name' => $app->applicant->name, 'email' => $app->applicant->email, 'phone' => $app->applicant->phone];
                        $ownerLabel = $app->applicant->name . ' (' . $app->applicant->email . ') → ' . $app->laundry->business_name . ' [' . $app->application_type . ']';
                    }
                } elseif ($doc->owner_type === 'user') {
                    $u = \App\Models\User::find($doc->owner_id);
                    if ($u) {
                        $ownerUser = ['id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'phone' => $u->phone];
                        $ownerLabel = $u->name . ' (' . $u->email . ')';
                    }
                }
            } catch (\Exception $e) {}
            $doc->setAttribute('owner_user', $ownerUser);
            $doc->setAttribute('owner_label', $ownerLabel);
            return $doc;
        });

        return response()->json($docs);
    }

    // GET /api/v1/laundry/verification-documents/{id}/file — preview dokumen staff
    public function file(Request $request, int $id)
    {
        $laundry = $this->assertManager($request);
        $doc = VerificationDocument::findOrFail($id);

        // Pastikan dokumen ini milik laundry manager (staff_application atau user yang melamar ke laundry ini)
        $isOwn = false;
        if ($doc->owner_type === 'staff_application') {
            $app = \App\Models\StaffApplication::find($doc->owner_id);
            $isOwn = $app && $app->laundry_id === $laundry->id;
        } elseif ($doc->owner_type === 'user') {
            $isOwn = \App\Models\StaffApplication::where('user_id', $doc->owner_id)->where('laundry_id', $laundry->id)->exists();
        }
        if (! $isOwn) {
            return response()->json(['message' => 'Dokumen bukan milik laundry Anda.'], 403);
        }

        $path = storage_path('app/private/' . $doc->file_path);
        if (! file_exists($path)) $path = storage_path('app/' . $doc->file_path);
        if (! file_exists($path)) return response()->json(['message' => 'File tidak ditemukan.'], 404);

        $mime = mime_content_type($path) ?: 'application/octet-stream';
        return response()->file($path, [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="' . basename($path) . '"',
        ]);
    }

    // POST /api/v1/laundry/verification-documents/{id}/review — manager approve/reject KTP staff
    public function review(Request $request, int $id): JsonResponse
    {
        $laundry = $this->assertManager($request);

        $request->validate([
            'status' => ['required', 'in:APPROVED,REJECTED'],
            'rejection_reason' => ['required_if:status,REJECTED', 'nullable', 'string', 'max:1000'],
        ]);

        $doc = VerificationDocument::findOrFail($id);

        // Pastikan dokumen milik laundry ini
        $isOwn = false;
        if ($doc->owner_type === 'staff_application') {
            $app = \App\Models\StaffApplication::find($doc->owner_id);
            $isOwn = $app && $app->laundry_id === $laundry->id;
        } elseif ($doc->owner_type === 'user') {
            $isOwn = \App\Models\StaffApplication::where('user_id', $doc->owner_id)->where('laundry_id', $laundry->id)->exists();
        }
        if (! $isOwn) {
            return response()->json(['message' => 'Dokumen bukan milik laundry Anda.'], 403);
        }

        if ($doc->status !== 'PENDING') {
            return response()->json(['message' => 'Dokumen sudah direview.'], 422);
        }

        DB::transaction(function () use ($doc, $request, $laundry) {
            $doc->update([
                'status' => $request->input('status'),
                'reviewed_by' => $request->user()->id,
                'rejection_reason' => $request->input('rejection_reason'),
            ]);

            // Jika KTP staff ditolak, otomatis tolak lamaran terkait
            if ($request->input('status') === 'REJECTED' && $doc->owner_type === 'staff_application') {
                $app = \App\Models\StaffApplication::find($doc->owner_id);
                if ($app && $app->status === 'PENDING') {
                    $app->update([
                        'status' => 'REJECTED',
                        'reviewed_at' => now(),
                        'reviewed_by' => $request->user()->id,
                    ]);
                }
            }
        });

        return response()->json([
            'message' => $request->input('status') === 'APPROVED' ? 'Dokumen KTP disetujui. Silakan terima lamaran staff.' : 'Dokumen KTP ditolak.',
            'document' => $doc->fresh(),
        ]);
    }
}
