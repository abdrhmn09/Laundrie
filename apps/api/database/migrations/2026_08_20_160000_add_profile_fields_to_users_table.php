<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar_url')->nullable()->after('status');
            $table->date('date_of_birth')->nullable()->after('avatar_url');
            $table->string('gender', 20)->nullable()->after('date_of_birth');
            $table->json('notification_preferences')->nullable()->after('gender');
            $table->boolean('email_notifications')->default(true)->after('notification_preferences');
            $table->boolean('whatsapp_notifications')->default(false)->after('email_notifications');
            $table->timestamp('phone_verified_at')->nullable()->after('whatsapp_notifications');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'avatar_url',
                'date_of_birth',
                'gender',
                'notification_preferences',
                'email_notifications',
                'whatsapp_notifications',
                'phone_verified_at',
            ]);
        });
    }
};
