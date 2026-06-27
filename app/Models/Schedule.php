<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $fillable = ['title', 'location', 'date', 'start_time', 'end_time', 'note'];

    public function tournamentMatch()
    {
        return $this->hasOne(TournamentMatch::class);
    }
}
