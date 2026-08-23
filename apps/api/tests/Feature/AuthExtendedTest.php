<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\URL;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthExtendedTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_verify_email(): void
    {
        $user = User::factory()->unverified()->create();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $user->id,
                'hash' => sha1($user->getEmailForVerification()),
            ]
        );

        $response = $this->getJson($verificationUrl);

        $response->assertOk()
            ->assertJsonPath('message', 'Email berhasil diverifikasi.');

        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        $this->assertEquals('active', $user->fresh()->status);
    }

    public function test_user_can_update_profile(): void
    {
        $user = User::factory()->create(['name' => 'Old Name']);
        Sanctum::actingAs($user);

        $response = $this->putJson('/api/v1/auth/profile', [
            'name' => 'New Name',
            'phone' => '081299998888',
            'gender' => 'male',
            'date_of_birth' => '1995-05-15',
        ]);

        $response->assertOk()
            ->assertJsonPath('user.name', 'New Name')
            ->assertJsonPath('user.phone', '081299998888');

        $this->assertEquals('New Name', $user->fresh()->name);
    }

    public function test_user_can_change_password(): void
    {
        $user = User::factory()->create(['password' => Hash::make('oldpassword123')]);
        Sanctum::actingAs($user);

        $response = $this->putJson('/api/v1/auth/change-password', [
            'current_password' => 'oldpassword123',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Password berhasil diubah.');

        $this->assertTrue(Hash::check('newpassword123', $user->fresh()->password));
    }

    public function test_user_can_manage_sessions(): void
    {
        $user = User::factory()->create();
        $token1 = $user->createToken('Device 1')->plainTextToken;
        $token2 = $user->createToken('Device 2')->plainTextToken;

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/auth/sessions');
        $response->assertOk()
            ->assertJsonCount(2, 'sessions');

        // Revoke all other sessions
        $revokeAllResponse = $this->deleteJson('/api/v1/auth/sessions');
        $revokeAllResponse->assertOk()
            ->assertJsonPath('message', 'Semua sesi perangkat lain telah diakhiri.');
    }
}
