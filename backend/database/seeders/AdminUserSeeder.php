<?php

namespace Database\Seeders;

use App\Models\User;
use App\Support\Cuid;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = strtolower(trim(env('ADMIN_EMAIL', 'admin@example.com')));
        $password = env('ADMIN_PASSWORD');

        if (!$password) {
            throw new \RuntimeException(
                'ADMIN_PASSWORD must be set in .env'
            );
        }

        if (strlen($password) < 12) {
            throw new \RuntimeException(
                'ADMIN_PASSWORD must be at least 12 characters'
            );
        }

        User::updateOrCreate(
            ['email' => $email],
            [
                'id' => Cuid::generate(),
                'name' => env('ADMIN_NAME', 'News Admin'),
                'password_hash' => Hash::make($password),
                'role' => 'ADMIN',
                'is_active' => true,
            ]
        );
    }
}