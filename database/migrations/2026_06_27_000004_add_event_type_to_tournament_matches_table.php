<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tournament_matches', function (Blueprint $table) {
            $table->enum('event_type', ['match', 'info'])->default('match')->after('schedule_id');
        });

        Schema::table('tournament_matches', function (Blueprint $table) {
            $table->dropForeign(['home_team_id']);
            $table->dropForeign(['away_team_id']);
        });

        Schema::table('tournament_matches', function (Blueprint $table) {
            $table->foreignId('home_team_id')->nullable()->change();
            $table->foreignId('away_team_id')->nullable()->change();
        });

        Schema::table('tournament_matches', function (Blueprint $table) {
            $table->foreign('home_team_id')->references('id')->on('tournament_teams')->cascadeOnDelete();
            $table->foreign('away_team_id')->references('id')->on('tournament_teams')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        DB::table('tournament_matches')
            ->where('event_type', 'info')
            ->orWhereNull('home_team_id')
            ->orWhereNull('away_team_id')
            ->delete();

        Schema::table('tournament_matches', function (Blueprint $table) {
            $table->dropForeign(['home_team_id']);
            $table->dropForeign(['away_team_id']);
        });

        Schema::table('tournament_matches', function (Blueprint $table) {
            $table->foreignId('home_team_id')->nullable(false)->change();
            $table->foreignId('away_team_id')->nullable(false)->change();
        });

        Schema::table('tournament_matches', function (Blueprint $table) {
            $table->foreign('home_team_id')->references('id')->on('tournament_teams')->cascadeOnDelete();
            $table->foreign('away_team_id')->references('id')->on('tournament_teams')->cascadeOnDelete();
            $table->dropColumn('event_type');
        });
    }
};
