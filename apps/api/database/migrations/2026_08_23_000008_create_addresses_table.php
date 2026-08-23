<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->string('label', 50)->nullable()->comment('Rumah, Kantor');
            $table->string('recipient_name', 150);
            $table->string('phone', 20);
            $table->text('address_line');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->text('delivery_notes')->nullable();
            $table->boolean('is_default')->default(false);
            $table->string('status', 20)->default('ACTIVE')->comment('ACTIVE, INACTIVE');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
