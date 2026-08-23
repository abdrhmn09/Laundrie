<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('laundries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete()->comment('Owner/Manager otomatis, unique max 1 laundry per user');
            $table->string('business_name', 150);
            $table->string('legal_name', 150)->nullable();
            $table->text('address_line');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->json('operating_hours')->nullable();
            $table->json('capacity_config')->nullable();
            $table->string('status', 20)->default('PENDING')->comment('PENDING, DOCUMENT_REVIEW, VERIFIED, ACTIVE, REJECTED, SUSPENDED, CLOSED');
            $table->string('contact_phone', 20);
            $table->string('contact_email', 150)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('laundries');
    }
};
