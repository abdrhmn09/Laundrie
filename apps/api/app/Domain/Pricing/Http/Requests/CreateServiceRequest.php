<?php

namespace App\Domain\Pricing\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateServiceRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'service_type' => ['required', 'string', 'max:50'],
            'pricing_model' => ['required', 'in:flat,per_weight,per_item'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'price_per_unit' => ['nullable', 'numeric', 'min:0', 'required_if:pricing_model,per_weight,per_item'],
            'unit' => ['nullable', 'string', 'in:kg,pcs'],
            'minimum_charge' => ['nullable', 'numeric', 'min:0'],
            'estimated_duration' => ['nullable', 'integer', 'min:1'],
            'status' => ['sometimes', 'in:ACTIVE,INACTIVE'],
        ];
    }
}
