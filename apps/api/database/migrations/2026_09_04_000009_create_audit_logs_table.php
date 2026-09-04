<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('actor_role', 30)->nullable()->comment('SUPER_ADMIN, FINANCE_ADMIN, OPERATIONS_ADMIN, MANAGER, STAFF, COURIER, CUSTOMER');
            $table->string('action', 80)->comment('e.g. complaint.resolved, settlement.approved, order.overridden, config.updated');
            $table->string('subject_type', 60)->nullable()->comment('Model class e.g. Complaint, Order, Settlement');
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->text('justification')->nullable()->comment('Mandatory reason for sensitive actions');
            $table->json('before_state')->nullable();
            $table->json('after_state')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('performed_at')->useCurrent();

            $table->index(['user_id', 'action']);
            $table->index(['subject_type', 'subject_id']);
            $table->index(['performed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
