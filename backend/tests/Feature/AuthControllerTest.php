<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Cuid;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_login_returns_an_authenticated_user_and_token(): void
    {
        $user = $this->createUser();

        $this->travelTo('2026-08-31 09:00:00');

        $response = $this->postJson('/api/auth/login', [
            'email' => '  ADMIN@EXAMPLE.COM  ',
            'password' => 'correct-password',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.id', $user->id)
            ->assertJsonPath('data.user.name', $user->name)
            ->assertJsonPath('data.user.email', $user->email)
            ->assertJsonPath('data.user.role', 'ADMIN')
            ->assertJsonMissingPath('data.user.password_hash')
            ->assertJsonStructure(['data' => ['token']]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'last_login_at' => '2026-08-31 09:00:00',
        ]);
    }

    public function test_login_returns_401_for_incorrect_password(): void
    {
        $this->createUser();

        $this->postJson('/api/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'incorrect-password',
        ])
            ->assertUnauthorized()
            ->assertExactJson([
                'success' => false,
                'error' => [
                    'code' => 'UNAUTHENTICATED',
                    'message' => 'Invalid credentials.',
                ],
            ]);
    }

    public function test_login_returns_401_for_an_inactive_user(): void
    {
        $this->createUser(['is_active' => false]);

        $this->postJson('/api/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'correct-password',
        ])->assertUnauthorized();
    }

    public function test_login_keeps_malformed_input_as_a_validation_error(): void
    {
        $this->postJson('/api/auth/login', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_me_returns_the_authenticated_user_and_rejects_missing_tokens(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.id', $user->id)
            ->assertJsonMissingPath('data.user.password_hash');

        $this->app['auth']->forgetGuards();

        $this->withoutToken()->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_logout_revokes_only_the_current_token(): void
    {
        $user = $this->createUser();
        $currentToken = $user->createToken('current-token');
        $otherToken = $user->createToken('other-token');

        $this->withoutToken()->withToken($currentToken->plainTextToken)
            ->postJson('/api/auth/logout')
            ->assertOk()
            ->assertExactJson([
                'success' => true,
                'message' => 'Logged out successfully.',
            ]);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $currentToken->accessToken->id,
        ]);
        $this->assertDatabaseHas('personal_access_tokens', [
            'id' => $otherToken->accessToken->id,
        ]);

        $this->app['auth']->forgetGuards();

        $this->withoutToken()->withToken($currentToken->plainTextToken)
            ->getJson('/api/auth/me')
            ->assertUnauthorized();

        $this->app['auth']->forgetGuards();

        $this->withToken($otherToken->plainTextToken)
            ->getJson('/api/auth/me')
            ->assertOk();
    }

    public function test_logout_rejects_missing_tokens(): void
    {
        $this->postJson('/api/auth/logout')->assertUnauthorized();
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function createUser(array $attributes = []): User
    {
        return User::create([
            'id' => Cuid::generate(),
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password_hash' => Hash::make('correct-password'),
            'role' => 'ADMIN',
            'is_active' => true,
            ...$attributes,
        ]);
    }
}
