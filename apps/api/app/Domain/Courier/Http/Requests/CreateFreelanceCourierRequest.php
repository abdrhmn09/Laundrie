<?php

namespace App\Domain\Courier\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateFreelanceCourierRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'vehicle_type' => ['required', 'string', 'max:30'],
            'service_area' => ['nullable', 'array'],
            'payout_info'  => ['nullable', 'array'],
        ];
    }
}
