<?php

namespace App\Domain\Laundry\Http\Controllers;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LaundryStaffController extends \App\Http\Controllers\Controller
{
    private function assertManager(Request $request): \App\Models\Laundry
    {
        $laundry = $request->user()->ownedLaundry;
        if (! $laundry) {
            throw ValidationException::withMessages(['laundry' => ['Anda bukan Manager.']]);
        }
        return $laundry;
    }

    // GET /api/v1/laundry/staff — list staff for manager's laundry
    public function index(Request $request): JsonResponse
    {
        $laundry = $this->assertManager($request);
        $staff = Staff::with('user')
            ->where('laundry_id', $laundry->id)
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));

        return response()->json($staff);
    }

    // POST /api/v1/laundry/staff — tambah staff langsung (tanpa lamaran) — PRD §11
    public function store(Request $request): JsonResponse
    {
        $laundry = $this->assertManager($request);

        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ], [
            'email.exists' => 'User dengan email tersebut tidak ditemukan. Pastikan user sudah terdaftar sebagai Pelanggan.',
        ]);

        $user = User::where('email', $request->input('email'))->firstOrFail();

        if ($user->id === $request->user()->id) {
            throw ValidationException::withMessages(['email' => ['Tidak dapat menambahkan diri sendiri sebagai Staff.']]);
        }

        if (Staff::where('user_id', $user->id)->where('laundry_id', $laundry->id)->exists()) {
            throw ValidationException::withMessages(['email' => ['User sudah menjadi Staff di laundry ini.']]);
        }

        // Cek apakah user sudah punya laundry sendiri (tidak boleh jadi staff di laundry lain jika sudah manager? — boleh, tapi per kebijakan, satu user bisa jadi staff di laundry lain)
        $staff = DB::transaction(function () use ($user, $laundry) {
            return Staff::create([
                'user_id' => $user->id,
                'laundry_id' => $laundry->id,
                'role' => 'STAFF',
                'status' => 'ACTIVE',
            ]);
        });

        return response()->json([
            'message' => 'Staff berhasil ditambahkan langsung.',
            'staff' => $staff->load('user'),
        ], 201);
    }

    // DELETE /api/v1/laundry/staff/{id} — nonaktifkan staff
    public function destroy(Request $request, int $id): JsonResponse
    {
        $laundry = $this->assertManager($request);
        $staff = Staff::where('id', $id)->where('laundry_id', $laundry->id)->firstOrFail();
        $staff->update(['status' => 'INACTIVE']);

        return response()->json(['message' => 'Staff dinonaktifkan.']);
    }

    // POST /api/v1/laundry/staff/{id}/activate — aktifkan kembali
    public function activate(Request $request, int $id): JsonResponse
    {
        $laundry = $this->assertManager($request);
        $staff = Staff::where('id', $id)->where('laundry_id', $laundry->id)->firstOrFail();
        $staff->update(['status' => 'ACTIVE']);

        return response()->json(['message' => 'Staff diaktifkan kembali.', 'staff' => $staff]);
    }
}
