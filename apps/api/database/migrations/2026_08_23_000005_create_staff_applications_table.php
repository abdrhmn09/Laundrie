<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_opening_id')->constrained('staff_openings')->cascadeOnDelete();
            $table->foreignId('laundry_id')->constrained('laundries')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('application_type', 20)->default('staff')->comment('staff, staff_courier');
            $table->text('message')->nullable();
            $table->string('status', 20)->default('PENDING')->comment('PENDING, ACCEPTED, REJECTED, WITHDRAWN');
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['user_id', 'laundry_id', 'status']);
            $table->index(['staff_opening_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_applications');
    }
};
