<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_valid_credentials(): void
    {
        User::factory()->create([
            'email' => 'budi@example.com',
            'password' => 'rahasia123',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'budi@example.com',
            'password' => 'rahasia123',
            'device_name' => 'pixel-7',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Login berhasil.')
            ->assertJsonPath('user.email', 'budi@example.com')
            ->assertJsonPath('token_type', 'Bearer')
            ->assertJsonStructure(['user' => ['id', 'name', 'email', 'role', 'status'], 'token']);

        $this->assertDatabaseHas('users', ['email' => 'budi@example.com']);
        $this->assertDatabaseHas('personal_access_tokens', ['tokenable_id' => User::where('email', 'budi@example.com')->first()->id]);
    }

    public function test_login_updates_last_login_at(): void
    {
        $user = User::factory()->create([
            'email' => 'budi@example.com',
            'password' => 'rahasia123',
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'budi@example.com',
            'password' => 'rahasia123',
        ])->assertOk();

        $this->assertNotNull($user->fresh()->last_login_at);
    }

    public function test_login_rejects_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'budi@example.com',
            'password' => 'rahasia123',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'budi@example.com',
            'password' => 'salahbanget',
        ]);

        $response->assertStatus(401)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_login_rejects_unknown_email(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'tidakada@example.com',
            'password' => 'rahasia123',
        ]);

        $response->assertStatus(401)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_suspended_user_cannot_login(): void
    {
        User::factory()->suspended()->create([
            'email' => 'nakal@example.com',
            'password' => 'rahasia123',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'nakal@example.com',
            'password' => 'rahasia123',
        ]);

        $response->assertStatus(403)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_login_is_rate_limited(): void
    {
        User::factory()->create([
            'email' => 'budi@example.com',
            'password' => 'rahasia123',
        ]);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', [
                'email' => 'budi@example.com',
                'password' => 'salah',
            ])->assertStatus(401);
        }

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'budi@example.com',
            'password' => 'salah',
        ]);

        $response->assertStatus(429);
    }
}