<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class NotificationPreference extends Model
{
    use HasUuids;

    protected $fillable = [
        'email_notificacoes',
        'alertas_pagamento',
        'alertas_atividade',
    ];

    protected $casts = [
        'email_notificacoes' => 'boolean',
        'alertas_pagamento' => 'boolean',
        'alertas_atividade' => 'boolean',
    ];
}
