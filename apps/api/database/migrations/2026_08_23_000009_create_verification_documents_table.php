<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('verification_documents', function (Blueprint $table) {
            $table->id();
            $table->string('owner_type', 50)->comment('laundry, courier');
            $table->unsignedBigInteger('owner_id');
            $table->string('document_type', 50)->comment('KTP, NIB, SIM, STNK, foto lokasi');
            $table->string('file_path', 255)->comment('object key privat');
            $table->string('status', 20)->default('PENDING')->comment('PENDING, APPROVED, REJECTED');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
            $table->index(['owner_type', 'owner_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verification_documents');
    }
};
