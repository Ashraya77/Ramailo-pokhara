<?php

namespace App\Support;

use Illuminate\Support\Str;

class Cuid
{
    public static function generate(): string
    {
        return 'c' . Str::lower(
            Str::random(24)
        );
    }
}