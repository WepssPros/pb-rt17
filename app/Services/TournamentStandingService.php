<?php

namespace App\Services;

use App\Models\TournamentMatch;
use App\Models\TournamentTeam;

class TournamentStandingService
{
    public function standings()
    {
        $teams = TournamentTeam::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        $rows = $teams->mapWithKeys(function (TournamentTeam $team) {
            return [
                $team->id => [
                    'id' => $team->id,
                    'name' => $team->name,
                    'player_one' => $team->player_one,
                    'player_two' => $team->player_two,
                    'mp' => 0,
                    'w' => 0,
                    'l' => 0,
                    'points' => 0,
                    'set_for' => 0,
                    'set_against' => 0,
                    'set_diff' => 0,
                    'form' => [],
                ],
            ];
        })->all();

        $matches = TournamentMatch::query()
            ->with(['schedule', 'homeTeam', 'awayTeam'])
            ->where('status', 'finished')
            ->whereNotNull('winner_team_id')
            ->orderByDesc(
                \App\Models\Schedule::select('date')
                    ->whereColumn('schedules.id', 'tournament_matches.schedule_id')
                    ->limit(1)
            )
            ->latest()
            ->get();

        foreach ($matches as $match) {
            if (!isset($rows[$match->home_team_id], $rows[$match->away_team_id])) {
                continue;
            }

            $homeWon = (int) $match->winner_team_id === (int) $match->home_team_id;
            $awayWon = (int) $match->winner_team_id === (int) $match->away_team_id;
            $winnerPoints = $match->result_type === 'straight' ? 2 : 1;

            foreach ([$match->home_team_id, $match->away_team_id] as $teamId) {
                $rows[$teamId]['mp']++;
            }

            if ($homeWon) {
                $rows[$match->home_team_id]['w']++;
                $rows[$match->home_team_id]['points'] += $winnerPoints;
                $rows[$match->away_team_id]['l']++;
                array_unshift($rows[$match->home_team_id]['form'], $match->result_type === 'rubber' ? 'R' : 'W');
                array_unshift($rows[$match->away_team_id]['form'], 'L');
            } elseif ($awayWon) {
                $rows[$match->away_team_id]['w']++;
                $rows[$match->away_team_id]['points'] += $winnerPoints;
                $rows[$match->home_team_id]['l']++;
                array_unshift($rows[$match->away_team_id]['form'], $match->result_type === 'rubber' ? 'R' : 'W');
                array_unshift($rows[$match->home_team_id]['form'], 'L');
            }

            [$homeSets, $awaySets] = $this->setTotals($match);
            $rows[$match->home_team_id]['set_for'] += $homeSets;
            $rows[$match->home_team_id]['set_against'] += $awaySets;
            $rows[$match->away_team_id]['set_for'] += $awaySets;
            $rows[$match->away_team_id]['set_against'] += $homeSets;
        }

        return collect($rows)
            ->map(function (array $row) {
                $row['set_diff'] = $row['set_for'] - $row['set_against'];
                $row['form'] = array_slice($row['form'], 0, 5);

                return $row;
            })
            ->sortBy([
                ['points', 'desc'],
                ['w', 'desc'],
                ['set_diff', 'desc'],
                ['name', 'asc'],
            ])
            ->values()
            ->map(function (array $row, int $index) {
                $row['position'] = $index + 1;

                return $row;
            });
    }

    private function setTotals(TournamentMatch $match): array
    {
        $scores = collect($match->set_scores ?? [])
            ->filter(fn ($set) => isset($set['home'], $set['away']) && $set['home'] !== '' && $set['away'] !== '');

        if ($scores->isEmpty()) {
            if ($match->result_type === 'straight') {
                return (int) $match->winner_team_id === (int) $match->home_team_id ? [2, 0] : [0, 2];
            }

            return (int) $match->winner_team_id === (int) $match->home_team_id ? [2, 1] : [1, 2];
        }

        $homeSets = 0;
        $awaySets = 0;

        foreach ($scores as $set) {
            $home = (int) $set['home'];
            $away = (int) $set['away'];

            if ($home > $away) {
                $homeSets++;
            } elseif ($away > $home) {
                $awaySets++;
            }
        }

        return [$homeSets, $awaySets];
    }
}
