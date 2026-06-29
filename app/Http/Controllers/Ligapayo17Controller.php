<?php

namespace App\Http\Controllers;

use App\Models\TournamentMatch;
use App\Services\TournamentStandingService;
use Illuminate\Support\Carbon;

class Ligapayo17Controller extends Controller
{
    private string $tz = 'Asia/Jakarta';

    public function index()
    {
        return view('ligapayo17');
    }

    public function data(TournamentStandingService $standingService)
    {
        $matches = TournamentMatch::query()
            ->with(['schedule', 'homeTeam', 'awayTeam', 'winnerTeam'])
            ->whereHas('schedule')
            ->get()
            ->sortBy(fn (TournamentMatch $match) => ($match->schedule?->date ?? '') . ' ' . ($match->schedule?->start_time ?? ''))
            ->values();

        return response()->json([
            'league' => [
                'name' => 'Liga Payo 17',
                'subtitle' => 'Klasemen badminton ganda putra PBRT17',
                'updated_at' => now($this->tz)->format('d M Y H:i') . ' WIB',
            ],
            'standings' => $standingService->standings(),
            'matches' => $matches->map(fn (TournamentMatch $match) => $this->formatMatch($match)),
            'events' => $matches->map(fn (TournamentMatch $match) => $this->formatEvent($match)),
        ]);
    }

    private function formatMatch(TournamentMatch $match): array
    {
        return [
            'id' => $match->id,
            'event_type' => $match->event_type ?? 'match',
            'status' => $match->status,
            'result_type' => $match->result_type,
            'set_scores' => $match->set_scores ?? [],
            'notes' => $match->notes,
            'home_team' => $match->homeTeam,
            'away_team' => $match->awayTeam,
            'winner_team' => $match->winnerTeam,
            'schedule' => [
                'title' => $match->schedule?->title,
                'location' => $match->schedule?->location,
                'date' => $match->schedule?->date,
                'end_date' => $match->schedule?->end_date,
                'start_time' => $match->schedule?->start_time ? substr((string) $match->schedule->start_time, 0, 5) : null,
                'end_time' => $match->schedule?->end_time ? substr((string) $match->schedule->end_time, 0, 5) : null,
            ],
        ];
    }

    private function formatEvent(TournamentMatch $match): array
    {
        $schedule = $match->schedule;
        $eventType = $match->event_type ?? 'match';
        $title = $eventType === 'info'
            ? ($schedule?->title ?: 'Informasi Liga')
            : trim(($match->homeTeam?->name ?? 'TBD') . ' vs ' . ($match->awayTeam?->name ?? 'TBD'));
        $isMultiDayInfo = $eventType === 'info'
            && $schedule?->end_date
            && Carbon::parse($schedule->end_date)->greaterThan(Carbon::parse($schedule->date));

        if ($isMultiDayInfo) {
            return [
                'id' => $match->id,
                'title' => $title,
                'start' => $schedule->date,
                'end' => Carbon::parse($schedule->end_date, $this->tz)->addDay()->toDateString(),
                'allDay' => true,
                'display' => 'block',
                'classNames' => ['liga-calendar-event-info', 'liga-calendar-event-span'],
                'extendedProps' => [
                    'match' => $this->formatMatch($match),
                ],
            ];
        }

        $start = $schedule
            ? Carbon::parse($schedule->date . ' ' . $schedule->start_time, $this->tz)->toIso8601String()
            : null;
        $end = null;

        if ($schedule?->end_time) {
            $end = Carbon::parse($schedule->date . ' ' . $schedule->end_time, $this->tz);
            if ($start && $end->lessThanOrEqualTo(Carbon::parse($start))) {
                $end->addDay();
            }
            $end = $end->toIso8601String();
        }

        return [
            'id' => $match->id,
            'title' => $title,
            'start' => $start,
            'end' => $end,
            'classNames' => [$eventType === 'info' ? 'liga-calendar-event-info' : 'liga-calendar-event-match'],
            'extendedProps' => [
                'match' => $this->formatMatch($match),
            ],
        ];
    }
}
