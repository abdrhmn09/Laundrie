<?php

namespace App\Domain\Laundry\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateLaundryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'business_name'   => ['required', 'string', 'max:150'],
            'legal_name'      => ['nullable', 'string', 'max:150'],
            'address_line'    => ['required', 'string', 'max:500'],
            'latitude'        => ['nullable', 'numeric', 'between:-90,90'],
            'longitude'       => ['nullable', 'numeric', 'between:-180,180'],
            'operating_hours' => ['nullable', 'array'],
            'capacity_config' => ['nullable', 'array'],
            'contact_phone'   => ['required', 'string', 'max:20'],
            'contact_email'   => ['nullable', 'email', 'max:150'],
        ];
    }

    public function messages(): array
    {
        return [
            'business_name.required' => 'Nama bisnis laundry wajib diisi.',
            'address_line.required'  => 'Alamat operasional laundry wajib diisi.',
            'contact_phone.required' => 'Kontak laundry wajib diisi.',
        ];
    }
}
