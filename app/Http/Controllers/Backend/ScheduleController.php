<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ScheduleController extends Controller
{
    private string $tz = 'Asia/Jakarta';

    public function events(Request $request)
    {
        $start = $request->query('start');
        $end   = $request->query('end');

        $q = Schedule::query();

        if ($start && $end) {
            $startDate = Carbon::parse($start)->timezone($this->tz)->toDateString();
            $endDate   = Carbon::parse($end)->timezone($this->tz)->toDateString();
            $q->where('date', '<=', $endDate)
                ->where(function ($query) use ($startDate) {
                    $query
                        ->where(function ($singleDay) use ($startDate) {
                            $singleDay->whereNull('end_date')->where('date', '>=', $startDate);
                        })
                        ->orWhere(function ($multiDay) use ($startDate) {
                            $multiDay->whereNotNull('end_date')->where('end_date', '>=', $startDate);
                        });
                });
        }

        $items = $q->orderBy('date')->orderBy('start_time')->get();

        return response()->json(
            $items->map(function ($s) {

                // START WIB
                $startWib = Carbon::parse($s->date . ' ' . $s->start_time, $this->tz);

                // END WIB (support multi-day and lewat tengah malam)
                $endWib = null;
                if (!empty($s->end_time)) {
                    $endDate = $s->end_date ?: $s->date;
                    $endWib = Carbon::parse($endDate . ' ' . $s->end_time, $this->tz);

                    if ($endWib->lessThanOrEqualTo($startWib)) {
                        $endWib->addDay();
                    }
                }

                return [
                    'id'    => $s->id,
                    'title' => $s->title,

                    // untuk FullCalendar (biar posisi event benar)
                    'start' => $startWib->toIso8601String(),
                    'end'   => $endWib ? $endWib->toIso8601String() : null,

                    // ✅ RAW DB (yang dipakai LIVE badge + modal)
                    'extendedProps' => [
                        'db_date'       => $s->date, // Y-m-d
                        'db_end_date'   => $s->end_date, // Y-m-d atau null
                        'db_start_time' => substr($s->start_time, 0, 5), // H:i
                        'db_end_time'   => $s->end_time ? substr($s->end_time, 0, 5) : null,
                        'location'      => $s->location,
                        'note'          => $s->note,
                    ],
                ];
            })
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'      => 'required|string|max:255',
            'location'   => 'nullable|string|max:255',
            'date'       => 'required|date_format:Y-m-d',
            'end_date'   => 'nullable|date_format:Y-m-d|after_or_equal:date',
            'start_time' => 'required|date_format:H:i',
            'end_time'   => 'required|date_format:H:i', // boleh < start_time (lewat tengah malam)
            'note'       => 'nullable|string',
        ]);

        $data = $this->normalizeScheduleData($data);

        if (($data['end_date'] ?? $data['date']) === $data['date'] && $data['start_time'] === $data['end_time']) {
            return response()->json(['message' => 'Jam selesai tidak boleh sama dengan jam mulai.'], 422);
        }

        Schedule::create($data);

        return response()->json(['message' => 'Jadwal berhasil ditambahkan']);
    }

    public function update(Request $request, Schedule $schedule)
    {
        $data = $request->validate([
            'title'      => 'required|string|max:255',
            'location'   => 'nullable|string|max:255',
            'date'       => 'required|date_format:Y-m-d',
            'end_date'   => 'nullable|date_format:Y-m-d|after_or_equal:date',
            'start_time' => 'required|date_format:H:i',
            'end_time'   => 'required|date_format:H:i',
            'note'       => 'nullable|string',
        ]);

        $data = $this->normalizeScheduleData($data);

        if (($data['end_date'] ?? $data['date']) === $data['date'] && $data['start_time'] === $data['end_time']) {
            return response()->json(['message' => 'Jam selesai tidak boleh sama dengan jam mulai.'], 422);
        }

        $schedule->update($data);

        return response()->json(['message' => 'Jadwal berhasil diperbarui']);
    }

    public function destroy(Schedule $schedule)
    {
        $schedule->delete();
        return response()->json(['message' => 'Jadwal berhasil dihapus']);
    }

    private function normalizeScheduleData(array $data): array
    {
        if (empty($data['end_date']) || $data['end_date'] === $data['date']) {
            $data['end_date'] = null;
        }

        return $data;
    }
}
