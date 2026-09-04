<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('payment_number', 50)->unique();
            $table->string('provider', 30)->default('MIDTRANS');
            $table->string('provider_reference')->nullable()->unique();
            $table->string('payment_type', 30)->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('status', 20)->default('PENDING')->comment('PENDING, PAID, FAILED, EXPIRED, REFUNDED');
            $table->timestamp('paid_at')->nullable();
            $table->json('raw_payload')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
