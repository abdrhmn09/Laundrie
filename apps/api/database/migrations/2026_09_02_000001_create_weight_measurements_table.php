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
        Schema::create('weight_measurements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('measurement_type', 20); // estimated, actual
            $table->decimal('estimated_value', 8, 2)->nullable();
            $table->decimal('actual_value', 8, 2)->nullable();
            $table->string('unit', 5)->default('kg');
            $table->unsignedBigInteger('evidence_id')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('staff')->nullOnDelete();
            $table->timestamp('recorded_at')->nullable();
            $table->string('status', 20)->default('PENDING'); // PENDING, RECORDED, VERIFIED, SUPERSEDED
            $table->timestamps();

            $table->index(['order_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('weight_measurements');
    }
};
