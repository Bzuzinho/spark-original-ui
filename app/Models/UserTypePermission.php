<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserTypePermission extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_type_id',
        'modulo',
        'submodulo',
        'separador',
        'campo',
        'pode_ver',
        'pode_criar',
        'pode_editar',
        'pode_eliminar',
    ];

    protected $casts = [
        'pode_ver' => 'boolean',
        'pode_criar' => 'boolean',
        'pode_editar' => 'boolean',
        'pode_eliminar' => 'boolean',
    ];

    public function userType(): BelongsTo
    {
        return $this->belongsTo(UserType::class, 'user_type_id');
    }
}
