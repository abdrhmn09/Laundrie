<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('laundry_id')->constrained('laundries')->cascadeOnDelete();
            $table->string('role', 20)->default('STAFF')->comment('STAFF only');
            $table->string('status', 20)->default('ACTIVE')->comment('ACTIVE, INACTIVE');
            $table->timestamps();
            $table->unique(['user_id', 'laundry_id']);
            $table->index(['laundry_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
