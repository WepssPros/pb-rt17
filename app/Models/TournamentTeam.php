<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TournamentTeam extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'player_one',
        'player_two',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function homeMatches()
    {
        return $this->hasMany(TournamentMatch::class, 'home_team_id');
    }

    public function awayMatches()
    {
        return $this->hasMany(TournamentMatch::class, 'away_team_id');
    }
}
