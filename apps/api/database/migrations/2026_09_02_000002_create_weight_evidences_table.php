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
        Schema::create('weight_evidences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('measurement_id')->constrained('weight_measurements')->cascadeOnDelete();
            $table->foreignId('laundry_id')->constrained('laundries')->cascadeOnDelete();
            $table->foreignId('staff_id')->constrained('staff')->cascadeOnDelete();
            $table->decimal('weight', 8, 2);
            $table->string('unit', 5)->default('kg');
            $table->string('photo_path', 255);
            $table->char('photo_hash', 64);
            $table->timestamp('captured_at');
            $table->timestamp('confirmed_at')->nullable();
            $table->string('status', 20)->default('CAPTURED'); // CAPTURED, CONFIRMED, INVALIDATED
            $table->string('device_id', 100)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamp('invalidated_at')->nullable();
            $table->foreignId('invalidated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('invalidation_reason')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'staff_id', 'status']);
        });

        // Add foreign key from weight_measurements.evidence_id to weight_evidences.id
        Schema::table('weight_measurements', function (Blueprint $table) {
            $table->foreign('evidence_id')->references('id')->on('weight_evidences')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('weight_measurements', function (Blueprint $table) {
            $table->dropForeign(['evidence_id']);
        });
        Schema::dropIfExists('weight_evidences');
    }
};
