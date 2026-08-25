<?php

namespace App\Domain\Verification\Http\Controllers;

use App\Domain\Verification\Http\Requests\StoreVerificationDocumentRequest;
use App\Models\VerificationDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class VerificationDocumentController extends \App\Http\Controllers\Controller
{
    public function store(StoreVerificationDocumentRequest $request): JsonResponse
    {
        $user = $request->user();
        $ownerType = $request->input('owner_type');
        $ownerId = (int) $request->input('owner_id');

        // Authorization: user must own the laundry or courier
        if ($ownerType === 'laundry') {
            $laundry = \App\Models\Laundry::findOrFail($ownerId);
            if ($laundry->user_id !== $user->id && ! $user->isAdmin()) {
                return response()->json(['message' => 'Anda bukan pemilik laundry ini.'], 403);
            }
        } elseif ($ownerType === 'courier') {
            $courier = \App\Models\Courier::findOrFail($ownerId);
            if ($courier->user_id !== $user->id && ! $user->isAdmin()) {
                return response()->json(['message' => 'Anda bukan pemilik courier ini.'], 403);
            }
        }

        $file = $request->file('file');
        $path = $file->store("verification/{$ownerType}/{$ownerId}", 'local');

        $doc = VerificationDocument::create([
            'owner_type'    => $ownerType,
            'owner_id'      => $ownerId,
            'document_type' => $request->input('document_type'),
            'file_path'     => $path,
            'status'        => 'PENDING',
        ]);

        return response()->json([
            'message'  => 'Dokumen berhasil diunggah. Menunggu verifikasi.',
            'document' => $doc,
        ], 201);
    }

    public function index(\Illuminate\Http\Request $request): JsonResponse
    {
        $user = $request->user();
        $query = VerificationDocument::query();

        // Filter by owner if provided
        if ($request->has('owner_type') && $request->has('owner_id')) {
            $query->where('owner_type', $request->input('owner_type'))
                  ->where('owner_id', $request->input('owner_id'));
        }

        // Non-admin can only see own documents
        if (! $user->isAdmin()) {
            $laundryIds = $user->ownedLaundry ? [$user->ownedLaundry->id] : [];
            $courierIds = $user->courierProfile ? [$user->courierProfile->id] : [];
            $query->where(function ($q) use ($laundryIds, $courierIds) {
                $q->where(function ($qq) use ($laundryIds) {
                    $qq->where('owner_type', 'laundry')->whereIn('owner_id', $laundryIds);
                })->orWhere(function ($qq) use ($courierIds) {
                    $qq->where('owner_type', 'courier')->whereIn('owner_id', $courierIds);
                });
            });
        }

        $docs = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 15));
        return response()->json($docs);
    }
}
