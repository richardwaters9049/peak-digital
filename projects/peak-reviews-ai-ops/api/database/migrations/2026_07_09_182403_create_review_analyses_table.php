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
        Schema::create('review_analyses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('review_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('sentiment');
            $table->string('urgency');
            $table->json('topic_tags');
            $table->string('likely_root_cause');
            $table->text('recommended_action');
            $table->text('reply_draft');
            $table->unsignedTinyInteger('confidence');
            $table->boolean('used_fallback')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_analyses');
    }
};
