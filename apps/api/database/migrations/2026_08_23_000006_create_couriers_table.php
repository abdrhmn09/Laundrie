<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('couriers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->foreignId('laundry_id')->nullable()->constrained('laundries')->nullOnDelete()->comment('NULL for freelance, filled for laundry_staff');
            $table->string('courier_type', 20)->comment('laundry_staff, freelance');
            $table->string('vehicle_type', 30)->nullable();
            $table->json('service_area')->nullable();
            $table->json('payout_info')->nullable();
            $table->string('status', 20)->default('PENDING')->comment('PENDING, VERIFIED, ACTIVE, SUSPENDED');
            $table->timestamps();
            $table->index(['laundry_id', 'courier_type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('couriers');
    }
};
