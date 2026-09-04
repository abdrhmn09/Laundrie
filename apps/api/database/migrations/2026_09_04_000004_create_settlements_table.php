<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settlements', function (Blueprint $table) {
            $table->id();
            $table->string('settlement_number', 50)->unique();
            $table->foreignId('laundry_id')->nullable()->constrained('laundries')->nullOnDelete();
            $table->foreignId('courier_id')->nullable()->constrained('couriers')->nullOnDelete();
            $table->timestamp('period_start')->nullable();
            $table->timestamp('period_end')->nullable();
            $table->decimal('gross_amount', 12, 2);
            $table->decimal('platform_commission', 12, 2)->default(0);
            $table->decimal('net_amount', 12, 2);
            $table->string('status', 20)->default('PENDING')->comment('PENDING, APPROVED, PAID, REJECTED');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('paid_at')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('account_holder')->nullable();
            $table->timestamps();

            $table->index(['laundry_id', 'status']);
            $table->index(['courier_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settlements');
    }
};
