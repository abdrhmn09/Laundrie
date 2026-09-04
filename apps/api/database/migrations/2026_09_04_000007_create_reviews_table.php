<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained('orders')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('laundry_id')->constrained('laundries')->cascadeOnDelete();
            $table->foreignId('courier_id')->nullable()->constrained('couriers')->nullOnDelete();
            $table->unsignedTinyInteger('laundry_rating')->comment('1 to 5 stars');
            $table->unsignedTinyInteger('courier_rating')->nullable()->comment('1 to 5 stars');
            $table->text('comment')->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->timestamps();

            $table->index(['laundry_id', 'laundry_rating']);
            $table->index(['courier_id', 'courier_rating']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
