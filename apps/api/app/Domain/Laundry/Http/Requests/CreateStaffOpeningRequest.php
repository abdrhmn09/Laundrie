<?php

namespace App\Domain\Laundry\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateStaffOpeningRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'quota'       => ['required', 'integer', 'min:1', 'max:100'],
            'status'      => ['sometimes', 'in:OPEN,CLOSED'],
        ];
    }
}
