<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('name', 150);
            $table->string('phone', 20);
            $table->string('email', 150)->nullable();
            $table->json('notification_preferences')->nullable();
            $table->string('avatar_path', 255)->nullable()->comment('object key foto profil di storage privat');
            $table->string('cover_photo_path', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
