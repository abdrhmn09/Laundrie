<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 30)->unique();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('laundry_id')->constrained('laundries')->cascadeOnDelete();
            $table->foreignId('pickup_address_id')->constrained('addresses')->cascadeOnDelete();
            $table->foreignId('delivery_address_id')->constrained('addresses')->cascadeOnDelete();
            $table->string('status', 30)->default('DRAFT');
            $table->decimal('estimated_weight', 8, 2)->nullable();
            $table->decimal('actual_weight', 8, 2)->nullable();
            $table->decimal('estimated_total', 12, 2)->default(0);
            $table->decimal('final_total', 12, 2)->nullable();
            $table->string('currency', 3)->default('IDR');
            $table->timestamp('scheduled_pickup_start');
            $table->timestamp('scheduled_pickup_end');
            $table->timestamp('scheduled_delivery_start')->nullable();
            $table->timestamp('scheduled_delivery_end')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->index(['customer_id', 'status']);
            $table->index(['laundry_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
