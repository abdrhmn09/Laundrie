<?php

namespace App\Domain\Pricing\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePriceRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'base_price' => ['required', 'numeric', 'min:0'],
            'price_per_unit' => ['nullable', 'numeric', 'min:0'],
            'minimum_charge' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
