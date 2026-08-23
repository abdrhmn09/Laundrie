<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthRegisterTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_register_as_customer(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'phone' => '081234567890',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('message', 'Pendaftaran berhasil. Silakan periksa email Anda untuk verifikasi.')
            ->assertJsonPath('user.name', 'Budi Santoso')
            ->assertJsonPath('user.email', 'budi@example.com')
            ->assertJsonPath('user.role', 'customer')
            ->assertJsonPath('user.status', 'email_unverified')
            ->assertJsonPath('token_type', 'Bearer')
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email', 'phone', 'role', 'status'],
                'token',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'budi@example.com',
            'role' => 'customer',
            'status' => 'email_unverified',
        ]);
    }

    public function test_register_validates_required_fields(): void
    {
        $response = $this->postJson('/api/v1/auth/register', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_register_rejects_duplicate_email(): void
    {
        User::factory()->create(['email' => 'sama@example.com']);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Orang Lain',
            'email' => 'sama@example.com',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_register_requires_password_confirmation(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Budi',
            'email' => 'budi@example.com',
            'password' => 'rahasia123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_register_rejects_invalid_role(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Budi',
            'email' => 'budi@example.com',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
            'role' => 'superhero',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role']);
    }
}