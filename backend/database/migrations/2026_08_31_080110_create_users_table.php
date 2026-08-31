<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->string('id', 32)->primary();

            $table->string('name');
            $table->string('email')->unique();
            $table->string('password_hash');

            $table->enum('role', ['ADMIN'])->default('ADMIN');

            $table->boolean('is_active')->default(true);

            $table->timestamp('last_login_at', 3)->nullable();

            $table->timestamps(3);

            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};