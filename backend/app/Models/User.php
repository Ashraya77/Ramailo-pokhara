<?php

namespace App\Models;

use App\Enums\UserRole;
use App\Support\Cuid;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'users';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'name', 'email', 'password_hash', 'role', 'is_active', 'last_login_at'];

    protected $hidden = ['password_hash'];

    protected static function booted(): void
    {
        static::creating(function (self $user): void {
            if ($user->getKey() === null) {
                $user->setAttribute($user->getKeyName(), Cuid::generate());
            }
        });
    }

    protected function casts(): array
    {
        return ['role' => UserRole::class, 'is_active' => 'boolean', 'last_login_at' => 'datetime', 'created_at' => 'datetime', 'updated_at' => 'datetime'];
    }

    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::ADMIN;
    }

    public function isActive(): bool
    {
        return $this->is_active;
    }

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class, 'author_id');
    }
}
