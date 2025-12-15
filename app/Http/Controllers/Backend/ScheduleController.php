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
            $q->whereBetween('date', [$startDate, $endDate]);
        }

        $items = $q->orderBy('date')->orderBy('start_time')->get();

        return response()->json(
            $items->map(function ($s) {

                // START WIB
                $startWib = Carbon::parse($s->date . ' ' . $s->start_time, $this->tz);

                // END WIB (support lewat tengah malam)
                $endWib = null;
                if (!empty($s->end_time)) {
                    $endWib = Carbon::parse($s->date . ' ' . $s->end_time, $this->tz);

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
            'start_time' => 'required|date_format:H:i',
            'end_time'   => 'required|date_format:H:i', // boleh < start_time (lewat tengah malam)
            'note'       => 'nullable|string',
        ]);

        if ($data['start_time'] === $data['end_time']) {
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
            'start_time' => 'required|date_format:H:i',
            'end_time'   => 'required|date_format:H:i',
            'note'       => 'nullable|string',
        ]);

        if ($data['start_time'] === $data['end_time']) {
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
}
