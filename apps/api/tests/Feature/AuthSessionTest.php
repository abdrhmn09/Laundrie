<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthSessionTest extends TestCase
{
    use RefreshDatabase;

    public function test_me_returns_authenticated_user(): void
    {
        $user = User::factory()->create(['name' => 'Budi Santoso']);
        Sanctum::actingAs($user, ['orders:read']);

        $response = $this->getJson('/api/v1/auth/me');

        $response->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.name', 'Budi Santoso')
            ->assertJsonPath('user.email', $user->email);
    }

    public function test_me_requires_authentication(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401);
    }

    public function test_logout_revokes_current_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-device')->plainTextToken;

        $response = $this->withHeaders(['Authorization' => 'Bearer '.$token])
            ->postJson('/api/v1/auth/logout');

        $response->assertOk()
            ->assertJsonPath('message', 'Logout berhasil.');

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_token_is_invalid_after_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-device')->plainTextToken;

        $this->withHeaders(['Authorization' => 'Bearer '.$token])
            ->postJson('/api/v1/auth/logout')
            ->assertOk();

        $this->app['auth']->forgetGuards();

        $this->withHeaders(['Authorization' => 'Bearer '.$token])
            ->getJson('/api/v1/auth/me')
            ->assertStatus(401);
    }

    public function test_logout_requires_authentication(): void
    {
        $response = $this->postJson('/api/v1/auth/logout');

        $response->assertStatus(401);
    }
}