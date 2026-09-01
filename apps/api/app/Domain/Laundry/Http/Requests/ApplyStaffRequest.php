<?php

namespace App\Domain\Laundry\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApplyStaffRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'application_type' => ['required', 'in:staff,staff_courier'],
            'message'          => ['nullable', 'string', 'max:1000'],
        ];
    }
}
