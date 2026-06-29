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
            $table->index('schedule_id', 'tournament_matches_schedule_id_index');
        });

        Schema::table('tournament_matches', function (Blueprint $table) {
            $table->dropUnique('tournament_matches_schedule_id_unique');
        });
    }

    public function down(): void
    {
        $duplicates = DB::table('tournament_matches')
            ->select('schedule_id')
            ->groupBy('schedule_id')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('schedule_id');

        foreach ($duplicates as $scheduleId) {
            $keepId = DB::table('tournament_matches')
                ->where('schedule_id', $scheduleId)
                ->orderBy('id')
                ->value('id');

            DB::table('tournament_matches')
                ->where('schedule_id', $scheduleId)
                ->where('id', '!=', $keepId)
                ->delete();
        }

        Schema::table('tournament_matches', function (Blueprint $table) {
            $table->unique('schedule_id', 'tournament_matches_schedule_id_unique');
        });

        Schema::table('tournament_matches', function (Blueprint $table) {
            $table->dropIndex('tournament_matches_schedule_id_index');
        });
    }
};
