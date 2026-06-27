<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TournamentMatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'schedule_id',
        'home_team_id',
        'away_team_id',
        'winner_team_id',
        'status',
        'result_type',
        'set_scores',
        'notes',
    ];

    protected $casts = [
        'set_scores' => 'array',
    ];

    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

    public function homeTeam()
    {
        return $this->belongsTo(TournamentTeam::class, 'home_team_id');
    }

    public function awayTeam()
    {
        return $this->belongsTo(TournamentTeam::class, 'away_team_id');
    }

    public function winnerTeam()
    {
        return $this->belongsTo(TournamentTeam::class, 'winner_team_id');
    }
}
