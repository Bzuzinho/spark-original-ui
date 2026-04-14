<?php

return [
    'sms' => [
        'enabled' => env('SMS_ENABLED', false),
        'api_url' => env('SMS_API_URL'),
        'token' => env('SMS_API_TOKEN'),
        'sender' => env('SMS_SENDER', 'ClubOS'),
    ],
];
