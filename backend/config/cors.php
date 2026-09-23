<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
    'https://ramailopokhara.com',
    'https://www.ramailopokhara.com',
     'https://www.admin.ramailopokhara.com',
     'http://localhost:3000'

],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
