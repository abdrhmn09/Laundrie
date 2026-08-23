<?php

namespace App\Domain\Auth\Http\Requests;

use App\Domain\Auth\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $role = $this->input('role', UserRole::Customer->value);

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20', 'unique:users,phone'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['sometimes', 'string', Rule::in(array_column(UserRole::cases(), 'value'))],
        ];

        if ($role === UserRole::Courier->value) {
            $rules['vehicle_type'] = ['required', 'string', Rule::in(['Motorcycle', 'Car', 'Bicycle'])];
            $rules['license_plate'] = ['required', 'string', 'max:50'];
            $rules['sim_number'] = ['nullable', 'string', 'max:50'];
        } elseif (in_array($role, [UserRole::Manager->value, UserRole::Staff->value], true)) {
            $rules['outlet_name'] = ['required', 'string', 'max:255'];
            $rules['outlet_address'] = ['required', 'string', 'max:500'];
        } elseif (in_array($role, [UserRole::SuperAdmin->value, UserRole::OperationsAdmin->value, UserRole::FinanceAdmin->value], true)) {
            $rules['invitation_code'] = ['required', 'string'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah terdaftar.',
            'phone.unique' => 'Nomor telepon ini sudah terdaftar.',
            'password.required' => 'Password wajib diisi.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
            'vehicle_type.required' => 'Jenis kendaraan wajib dipilih.',
            'license_plate.required' => 'Nomor polisi kendaraan wajib diisi.',
            'outlet_name.required' => 'Nama outlet laundry wajib diisi.',
            'outlet_address.required' => 'Alamat outlet laundry wajib diisi.',
            'invitation_code.required' => 'Kode undangan internal admin wajib diisi.',
        ];
    }
}