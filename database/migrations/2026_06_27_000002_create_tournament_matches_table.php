<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tournament_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('home_team_id')->constrained('tournament_teams')->cascadeOnDelete();
            $table->foreignId('away_team_id')->constrained('tournament_teams')->cascadeOnDelete();
            $table->foreignId('winner_team_id')->nullable()->constrained('tournament_teams')->nullOnDelete();
            $table->enum('status', ['scheduled', 'finished'])->default('scheduled');
            $table->enum('result_type', ['straight', 'rubber'])->nullable();
            $table->json('set_scores')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tournament_matches');
    }
};
