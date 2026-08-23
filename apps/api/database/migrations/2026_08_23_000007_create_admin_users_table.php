<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('role', 30)->comment('OPERATIONS_ADMIN, FINANCE_ADMIN, SUPER_ADMIN');
            $table->timestamps();
            $table->index('role');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_users');
    }
};
