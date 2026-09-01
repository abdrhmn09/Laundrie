<?php

namespace App\Domain\Customer\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends \App\Http\Controllers\Controller
{
    private function customer(Request $request)
    {
        $user = $request->user();
        $customer = $user->customer;
        if (! $customer) {
            $customer = $user->customer()->create([
                'name' => $user->name,
                'phone' => $user->phone ?? '',
                'email' => $user->email,
            ]);
        }
        return $customer;
    }

    public function index(Request $request): JsonResponse
    {
        $customer = $this->customer($request);
        $addresses = $customer->addresses()->orderByDesc('is_default')->orderByDesc('created_at')->paginate($request->integer('per_page', 15));
        return response()->json($addresses);
    }

    public function store(Request $request): JsonResponse
    {
        $customer = $this->customer($request);
        $data = $request->validate([
            'label' => ['nullable', 'string', 'max:50'],
            'recipient_name' => ['required', 'string', 'max:150'],
            'phone' => ['required', 'string', 'max:20'],
            'address_line' => ['required', 'string'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'delivery_notes' => ['nullable', 'string'],
            'is_default' => ['sometimes', 'boolean'],
        ]);

        if (! empty($data['is_default'])) {
            $customer->addresses()->update(['is_default' => false]);
        }

        $address = $customer->addresses()->create($data);

        if ($customer->addresses()->count() === 1) {
            $address->update(['is_default' => true]);
        }

        return response()->json(['message' => 'Alamat berhasil ditambahkan.', 'address' => $address], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $customer = $this->customer($request);
        $address = $customer->addresses()->findOrFail($id);

        $data = $request->validate([
            'label' => ['nullable', 'string', 'max:50'],
            'recipient_name' => ['sometimes', 'string', 'max:150'],
            'phone' => ['sometimes', 'string', 'max:20'],
            'address_line' => ['sometimes', 'string'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'delivery_notes' => ['nullable', 'string'],
            'is_default' => ['sometimes', 'boolean'],
        ]);

        if (! empty($data['is_default'])) {
            $customer->addresses()->update(['is_default' => false]);
        }

        $address->update($data);

        return response()->json(['message' => 'Alamat diperbarui.', 'address' => $address]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $customer = $this->customer($request);
        $address = $customer->addresses()->findOrFail($id);
        $wasDefault = $address->is_default;
        $address->delete();

        if ($wasDefault) {
            $first = $customer->addresses()->first();
            if ($first) $first->update(['is_default' => true]);
        }

        return response()->json(['message' => 'Alamat dihapus.']);
    }

    public function setDefault(Request $request, int $id): JsonResponse
    {
        $customer = $this->customer($request);
        $address = $customer->addresses()->findOrFail($id);
        $customer->addresses()->update(['is_default' => false]);
        $address->update(['is_default' => true]);

        return response()->json(['message' => 'Alamat default diperbarui.', 'address' => $address]);
    }
}
