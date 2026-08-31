<?php

namespace App\Support;

use Illuminate\Support\Str;

class Slug
{
    public static function normalize(string $value): string
    {
        $value = trim($value);

        if (class_exists(\Transliterator::class)) {
            $transliterator = \Transliterator::create('Devanagari-Latin; Latin-ASCII; Lower()');

            if ($transliterator !== null) {
                $value = $transliterator->transliterate($value);
            }
        }

        return Str::slug($value);
    }
}
