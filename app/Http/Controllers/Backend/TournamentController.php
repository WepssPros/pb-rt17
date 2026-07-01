<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\TournamentMatch;
use App\Models\TournamentTeam;
use App\Services\TournamentStandingService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class TournamentController extends Controller
{
    public function index()
    {
        return view('tournament.index');
    }

    public function data(TournamentStandingService $standingService)
    {
        return response()->json([
            'teams' => TournamentTeam::query()
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(),
            'matches' => TournamentMatch::query()
                ->with(['schedule', 'homeTeam', 'awayTeam', 'winnerTeam'])
                ->latest()
                ->get()
                ->map(fn (TournamentMatch $match) => $this->formatMatch($match)),
            'schedules' => Schedule::query()
                ->withCount('tournamentMatches')
                ->orderByDesc('date')
                ->orderByDesc('start_time')
                ->limit(120)
                ->get()
                ->map(fn (Schedule $schedule) => $this->formatSchedule($schedule)),
            'standings' => $standingService->standings(),
        ]);
    }

    public function storeTeam(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'player_one' => ['nullable', 'string', 'max:255'],
            'player_two' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $team = TournamentTeam::create([
            ...$data,
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        return response()->json(['message' => 'Pasangan berhasil ditambahkan.', 'data' => $team]);
    }

    public function updateTeam(Request $request, TournamentTeam $team)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'player_one' => ['nullable', 'string', 'max:255'],
            'player_two' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $team->update([
            ...$data,
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        return response()->json(['message' => 'Pasangan berhasil diperbarui.', 'data' => $team]);
    }

    public function destroyTeam(TournamentTeam $team)
    {
        $team->delete();

        return response()->json(['message' => 'Pasangan berhasil dihapus.']);
    }

    public function storeMatch(Request $request)
    {
        $data = $this->validateMatch($request);

        $match = TournamentMatch::create($data);

        return response()->json([
            'message' => 'Match berhasil ditambahkan.',
            'data' => $this->formatMatch($match->load(['schedule', 'homeTeam', 'awayTeam', 'winnerTeam'])),
        ]);
    }

    public function updateMatch(Request $request, TournamentMatch $match)
    {
        $data = $this->validateMatch($request, $match);

        $match->update($data);

        return response()->json([
            'message' => 'Match berhasil diperbarui.',
            'data' => $this->formatMatch($match->fresh(['schedule', 'homeTeam', 'awayTeam', 'winnerTeam'])),
        ]);
    }

    public function destroyMatch(TournamentMatch $match)
    {
        $match->delete();

        return response()->json(['message' => 'Match berhasil dihapus.']);
    }

    private function validateMatch(Request $request, ?TournamentMatch $match = null): array
    {
        $data = $request->validate([
            'schedule_id' => [
                'required',
                'exists:schedules,id',
            ],
            'event_type' => ['nullable', Rule::in(['match', 'info'])],
            'home_team_id' => ['nullable', Rule::requiredIf($request->input('event_type', 'match') === 'match'), 'exists:tournament_teams,id'],
            'away_team_id' => ['nullable', Rule::requiredIf($request->input('event_type', 'match') === 'match'), 'exists:tournament_teams,id', 'different:home_team_id'],
            'status' => ['required', Rule::in(['scheduled', 'finished'])],
            'result_type' => ['nullable', Rule::requiredIf($request->input('event_type', 'match') === 'match' && $request->input('status') === 'finished'), Rule::in(['straight', 'rubber'])],
            'winner_team_id' => ['nullable', Rule::requiredIf($request->input('event_type', 'match') === 'match' && $request->input('status') === 'finished'), 'exists:tournament_teams,id'],
            'set_scores' => ['nullable', 'array', 'max:3'],
            'set_scores.*.home' => ['nullable', 'integer', 'min:0', 'max:99'],
            'set_scores.*.away' => ['nullable', 'integer', 'min:0', 'max:99'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $data['event_type'] = $data['event_type'] ?? 'match';

        if ($data['event_type'] === 'info') {
            $data['home_team_id'] = null;
            $data['away_team_id'] = null;
            $data['winner_team_id'] = null;
            $data['result_type'] = null;
            $data['status'] = 'scheduled';
            $data['set_scores'] = [];

            return $data;
        }

        if ($this->pairAlreadyExists((int) $data['home_team_id'], (int) $data['away_team_id'], $match)) {
            throw ValidationException::withMessages([
                'away_team_id' => 'Pasangan ini sudah pernah dijadwalkan bertanding.',
            ]);
        }

        if (($data['status'] ?? 'scheduled') === 'finished') {
            $winnerId = (int) ($data['winner_team_id'] ?? 0);
            $teamIds = [(int) $data['home_team_id'], (int) $data['away_team_id']];

            if (!in_array($winnerId, $teamIds, true)) {
                throw ValidationException::withMessages([
                    'winner_team_id' => 'Pemenang harus salah satu pasangan yang bertanding.',
                ]);
            }
        } else {
            $data['winner_team_id'] = null;
            $data['result_type'] = null;
        }

        $data['set_scores'] = collect($data['set_scores'] ?? [])
            ->map(fn ($set) => [
                'home' => $set['home'] ?? '',
                'away' => $set['away'] ?? '',
            ])
            ->filter(fn ($set) => $set['home'] !== '' || $set['away'] !== '')
            ->values()
            ->all();

        return $data;
    }

    private function pairAlreadyExists(int $homeTeamId, int $awayTeamId, ?TournamentMatch $currentMatch = null): bool
    {
        return TournamentMatch::query()
            ->where('event_type', 'match')
            ->when($currentMatch, fn ($query) => $query->whereKeyNot($currentMatch->id))
            ->where(function ($query) use ($homeTeamId, $awayTeamId) {
                $query
                    ->where(function ($direct) use ($homeTeamId, $awayTeamId) {
                        $direct
                            ->where('home_team_id', $homeTeamId)
                            ->where('away_team_id', $awayTeamId);
                    })
                    ->orWhere(function ($reverse) use ($homeTeamId, $awayTeamId) {
                        $reverse
                            ->where('home_team_id', $awayTeamId)
                            ->where('away_team_id', $homeTeamId);
                    });
            })
            ->exists();
    }

    private function formatMatch(TournamentMatch $match): array
    {
        return [
            'id' => $match->id,
            'schedule_id' => $match->schedule_id,
            'event_type' => $match->event_type ?? 'match',
            'home_team_id' => $match->home_team_id,
            'away_team_id' => $match->away_team_id,
            'winner_team_id' => $match->winner_team_id,
            'status' => $match->status,
            'result_type' => $match->result_type,
            'set_scores' => $match->set_scores ?? [],
            'notes' => $match->notes,
            'schedule' => $match->schedule ? $this->formatSchedule($match->schedule) : null,
            'home_team' => $match->homeTeam,
            'away_team' => $match->awayTeam,
            'winner_team' => $match->winnerTeam,
        ];
    }

    private function formatSchedule(Schedule $schedule): array
    {
        return [
            'id' => $schedule->id,
            'title' => $schedule->title,
            'location' => $schedule->location,
            'date' => $schedule->date,
            'end_date' => $schedule->end_date,
            'start_time' => substr((string) $schedule->start_time, 0, 5),
            'end_time' => $schedule->end_time ? substr((string) $schedule->end_time, 0, 5) : null,
            'note' => $schedule->note,
            'tournament_match_count' => (int) ($schedule->tournament_matches_count ?? 0),
            'has_tournament_match' => (int) ($schedule->tournament_matches_count ?? 0) > 0,
        ];
    }
}
