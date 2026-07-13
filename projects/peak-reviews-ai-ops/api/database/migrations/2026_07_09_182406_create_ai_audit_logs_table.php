<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ai_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('review_id')->nullable()->constrained()->nullOnDelete();
            $table->string('task');
            $table->string('provider');
            $table->string('model');
            $table->text('prompt');
            $table->json('response');
            $table->unsignedInteger('estimated_tokens')->default(0);
            $table->boolean('used_fallback')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_audit_logs');
    }
};
