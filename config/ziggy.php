<?php

return [
    'except' => ['debugbar.*', 'ignition.*'],
    'url' => env('APP_URL', config('app.url')),
];
