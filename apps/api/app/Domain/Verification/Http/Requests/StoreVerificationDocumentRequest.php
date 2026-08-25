<?php

namespace App\Domain\Verification\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVerificationDocumentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'owner_type'    => ['required', 'in:laundry,courier'],
            'owner_id'      => ['required', 'integer'],
            'document_type' => ['required', 'string', 'max:50'],
            'file'          => ['required', 'file', 'mimes:jpeg,png,jpg,pdf,webp', 'max:5120'],
        ];
    }
}
