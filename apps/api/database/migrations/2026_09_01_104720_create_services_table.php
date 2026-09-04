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
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laundry_id')->constrained('laundries')->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('service_type', 50);
            $table->string('pricing_model', 20); // flat, per_weight, per_item
            $table->decimal('base_price', 12, 2)->default(0);
            $table->decimal('price_per_unit', 12, 2)->nullable();
            $table->string('unit', 10)->default('kg');
            $table->decimal('minimum_charge', 12, 2)->default(0);
            $table->integer('estimated_duration')->nullable();
            $table->string('status', 20)->default('ACTIVE');
            $table->timestamps();
            $table->index(['laundry_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
