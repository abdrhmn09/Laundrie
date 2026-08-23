<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff_openings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laundry_id')->constrained('laundries')->cascadeOnDelete();
            $table->string('title', 120);
            $table->text('description')->nullable();
            $table->integer('quota')->default(1);
            $table->string('status', 20)->default('OPEN')->comment('OPEN, CLOSED');
            $table->timestamps();
            $table->index(['laundry_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_openings');
    }
};
