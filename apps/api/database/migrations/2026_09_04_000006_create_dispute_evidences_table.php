<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dispute_evidences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_id')->constrained('complaints')->cascadeOnDelete();
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->string('file_path');
            $table->string('file_hash', 64)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['complaint_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dispute_evidences');
    }
};
