<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    
    public function up(): void
    {
        Schema::create('user_user_type', function (Blueprint $table) {
            $table->uuid('user_id');
            $table->uuid('user_type_id');
            $table->timestamps();
            
            $table->primary(['user_id', 'user_type_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('user_type_id')->references('id')->on('user_types')->onDelete('cascade');
            
            $table->index('user_id');
            $table->index('user_type_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_user_type');
    }
};