<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_configs', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->text('value');
            $table->string('type', 20)->default('string')->comment('string, integer, decimal, boolean, json');
            $table->string('group', 50)->default('general')->comment('general, payment, settlement, logistics, compliance');
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(false)->comment('Whether frontend apps can read this config');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['group', 'is_public']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_configs');
    }
};
