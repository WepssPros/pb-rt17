@extends('layouts.admin')

@section('title')
<title>Admin Dashboard - Cashflow RT 17</title>
@endsection

@section('content')
<style>
  /* =========================
              ✅ PRO Calendar (Bootstrap-friendly + Compact)
              Target: FullCalendar inside #pbrtCalendar
              ========================= */

  #pbrtCalendar {
    background: #fff;
    border: 1px solid rgba(0, 0, 0, .08);
    border-radius: 16px;
    padding: 12px;
    max-width: auto;
    /* biar nggak kelebaran */

    /* center */
  }

  /* FullCalendar base: kecilin font + warna border halus */
  #pbrtCalendar .fc {
    --fc-border-color: rgba(0, 0, 0, .08);
    --fc-today-bg-color: rgba(13, 110, 253, .08);
    /* bootstrap primary tint */
    font-size: 12px;
  }

  /* Grid/table calendar biar keliatan clean */
  #pbrtCalendar .fc .fc-scrollgrid {
    border-radius: 12px;
    overflow: hidden;
  }

  /* Toolbar: compact + rapi */
  #pbrtCalendar .fc .fc-toolbar {
    flex-wrap: wrap;
    gap: .5rem;
    margin-bottom: .75rem;
  }

  #pbrtCalendar .fc .fc-toolbar-title {
    font-size: 1.05rem;
    font-weight: 800;
    letter-spacing: .2px;
  }

  /* Buttons: bootstrap-ish tapi lebih modern */
  #pbrtCalendar .fc .fc-button {
    border-radius: 12px !important;
    padding: .32rem .55rem !important;
    font-size: .82rem !important;
    line-height: 1.1;
    box-shadow: none !important;
  }

  #pbrtCalendar .fc .fc-button:focus,
  #pbrtCalendar .fc .fc-button:active {
    box-shadow: none !important;
  }

  /* Hari header (Min/Sen/...) */
  #pbrtCalendar .fc .fc-col-header-cell {
    background: rgba(0, 0, 0, .02);
    font-weight: 800;
    padding: 6px 0;
  }

  /* Cell tanggal: lebih padat */
  #pbrtCalendar .fc .fc-daygrid-day-frame {
    padding: 4px;
    min-height: 88px;
    /* kecilin tinggi cell */
  }

  #pbrtCalendar .fc .fc-daygrid-day-number {
    font-weight: 800;
    color: rgba(0, 0, 0, .65);
    font-size: .78rem;
    padding: 4px 6px;
  }

  /* Event pill: kecil, rapi, nggak “ngeblok” */
  #pbrtCalendar .fc .fc-daygrid-event {
    border: 0;
    border-radius: 999px;
    padding: 1px 8px;
    font-size: .74rem;
    background: rgba(13, 110, 253, .12);
    /* bootstrap primary tint */
    color: #0b5ed7;
  }

  #pbrtCalendar .fc .fc-daygrid-event:hover {
    background: rgba(13, 110, 253, .18);
  }

  #pbrtCalendar .fc .fc-daygrid-event .fc-event-time {
    font-weight: 900;
  }

  /* Potong teks event biar nggak berantakan */
  #pbrtCalendar .fc .fc-daygrid-event .fc-event-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* +more link */
  #pbrtCalendar .fc .fc-daygrid-more-link {
    font-weight: 800;
    color: #0d6efd;
  }

  /* Badge LIVE: lebih halus */
  #todayLiveBadge {
    background: rgba(220, 53, 69, .08);
    border: 1px solid rgba(220, 53, 69, .18);
    color: #b02a37;
    border-radius: 12px;
  }

  .live-dot {
    position: relative;
    padding: .30rem .55rem;
    border-radius: 999px;
    letter-spacing: .3px;
  }

  .live-dot::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #fff;
    display: inline-block;
    margin-right: 6px;
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0% {
      opacity: 1
    }

    50% {
      opacity: .3
    }

    100% {
      opacity: 1
    }
  }

  /* List event item: clean */
  .day-event-item {
    border: 1px solid rgba(0, 0, 0, .08);
    border-radius: 14px;
    padding: 10px 12px;
    background: #fff;
    cursor: pointer;
    transition: .15s ease;
  }

  .day-event-item:hover {
    background: rgba(13, 110, 253, .05);
    border-color: rgba(13, 110, 253, .22);
    transform: translateY(-1px);
  }

  .day-event-time {
    font-weight: 900;
    font-size: 12px;
    color: rgba(0, 0, 0, .75);
  }

  .day-event-meta {
    font-size: 12px;
    color: #6b7280;
  }

  /* Mobile: toolbar tetap rapi */
  @media (max-width: 576px) {
    #pbrtCalendar {
      padding: 10px;
    }

    #pbrtCalendar .fc .fc-toolbar-title {
      font-size: 1rem;
    }

    #pbrtCalendar .fc .fc-daygrid-day-frame {
      min-height: 78px;
    }
  }

</style>
@php
// ==============================
// WARNA GROWTH "LAPORAN" (KANAN)
// ==============================
$incomeGrowthVal = $growthIncome ?? 0;
$expenseGrowthVal = $growthExpense ?? 0;
$profitGrowthVal = $growthProfit ?? 0;

// Pendapatan: naik = hijau, turun = merah
$incomeGrowthClass = $incomeGrowthVal >= 0 ? 'text-success' : 'text-danger';

// Pengeluaran: naik = merah (buruk), turun = hijau (bagus)
$expenseGrowthClass = $expenseGrowthVal >= 0 ? 'text-danger' : 'text-success';

// Profit: naik = hijau, turun = merah
$profitGrowthClass = $profitGrowthVal >= 0 ? 'text-success' : 'text-danger';

// ==============================
// RATA-RATA BULANAN (REAL)
// - jangan pakai totalSales/12 kalau transaksi cuma 1-2 bulan
// - hitung dari bulan yang ADA pemasukan (salesPerMonth)
// ==============================
$monthsWithIncome = isset($salesPerMonth) ? count($salesPerMonth) : 0;
$avgMonthlyIncome = ($monthsWithIncome > 0)
? ($totalSales / $monthsWithIncome)
: 0;
@endphp

{{-- FULLCALENDAR + FLATPICKR CSS --}}
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">

<div class="container-xxl flex-grow-1 container-p-y">
  <div class="row">
    <div class="col-md-12 mb-5 ">
      <div class="card-header border-0 pb-0">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div id="todayLiveBadge" class="alert alert-danger d-none mb-0 py-2 px-3">
            <span class="badge bg-danger me-2 live-dot">LIVE</span>
            <span id="todayLiveText" class="fw-semibold"></span>
          </div>

          <button type="button" id="btnAddSchedule" class="btn btn-primary btn-sm ms-auto">
            <i class="bx bx-plus me-1"></i> Tambah Jadwal
          </button>
        </div>
      </div>
    </div>

    {{-- ======= KODINGAN KAMU TETAP ======= --}}
    <div class="col-md-12 col-xxl-4 mb-6">
      <div class="card h-100 text-center shadow-sm">
        <div class="card-body d-flex flex-column align-items-center justify-content-center">
          <img src="../../be_view/assets/img/logopbrt-circle.png" class="mb-3 img-fluid" style="max-width: 91px;"
            alt="Logo PBRT" />

          <h5 class="card-title mb-1">Selamat Datang!</h5>
          <p class="card-subtitle mb-2 text-muted">Monitoring Kas PBRT 17</p>

          <h6 class="text-primary mb-2">Bapak. {{ Auth::user()->name }}</h6>

          <a href="{{ route('penjualan.index') }}" class="btn btn-sm btn-primary">Lakukan Penjualan</a>
        </div>
      </div>
    </div>

    <div class="col-xxl-8 mb-6">
      <div class="card h-100 shadow-sm position-relative">
        <div class="card-body pt-3 pb-4">
          <div id="pbrtCalendar"></div>
        </div>
        <div class="card-body p-6">
          <div class="d-flex align-items-start justify-content-between mb-4">
            <h5 class="mb-0">Target Proyek</h5>
            <small>Bulan Ini</small>
          </div>

          <div id="targetProyekCarousel" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner" id="carouselProyekInner"></div>
          </div>

          <div class="d-flex justify-content-between mt-3">
            <button class="btn btn-primary btn-sm " type="button" data-bs-target="#targetProyekCarousel"
              data-bs-slide="prev">
              <i class='bx bx-chevron-left'></i>
            </button>
            <button class="btn btn-primary btn-sm " type="button" data-bs-target="#targetProyekCarousel"
              data-bs-slide="next">
              <i class='bx bx-chevron-right'></i>
            </button>
          </div>
        </div>

      </div>
    </div>

    {{-- RINGKASAN --}}
    <div class="col-md-6 col-xl-4 mb-6">
      <div class="card h-100 overflow-hidden">
        <div class="card-header d-flex align-items-center justify-content-between">
          <h4 class="">Ringkasan Keuangan</h4>
          <img src="../../be_view/assets/img/logopbrt.png" alt="Logo" style="height:58px;">
        </div>

        <div class=" d-flex flex-column align-items-center">
          <small class="text-muted d-block">Kas Sekarang</small>
          <h5 class="mb-0 fw-bold text-primary" style="font-size: 20px;">
            Rp {{ number_format($currentCash, 0, ',', '.') }}
          </h5>
        </div>

        <div class="card-body p-3">
          <ul class="nav nav-pills nav-fill small" role="tablist">
            <li class="nav-item">
              <button class="nav-link active py-1 px-2 d-flex align-items-center justify-content-center"
                data-bs-toggle="tab" data-bs-target="#tab-income">
                <i class="bx bx-wallet me-1"></i>
                <span style="font-size: 12px;">Pendapatan</span>
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link py-1 px-2 d-flex align-items-center justify-content-center" data-bs-toggle="tab"
                data-bs-target="#tab-expenses">
                <i class="bx bx-credit-card me-1"></i>
                <span style="font-size: 12px;">Pengeluaran</span>
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link py-1 px-2 d-flex align-items-center justify-content-center" data-bs-toggle="tab"
                data-bs-target="#tab-profit">
                <i class="bx bx-trending-up me-1"></i>
                <span style="font-size: 12px;">Keuntungan</span>
              </button>
            </li>
          </ul>

          <div class="tab-content p-0 text-center">
            <div class="tab-pane fade show active" id="tab-income">
              <div id="chartIncome" style="height: 230px;"></div>
              <h5 class="mt-2 fw-bold text-success" style="font-size: 18px;">
                Rp {{ number_format($totalSales,0,',','.') }}
              </h5>
              <small class="text-success fw-medium" id="incomeGrowth"></small>
            </div>

            <div class="tab-pane fade" id="tab-expenses">
              <div id="chartExpenses" style="height: 230px;"></div>
              <h5 class="mt-2 fw-bold text-danger" style="font-size: 18px;">
                Rp {{ number_format($totalPurchase,0,',','.') }}
              </h5>
              <small class="text-danger fw-medium" id="expensesGrowth"></small>
            </div>

            <div class="tab-pane fade" id="tab-profit">
              <div id="chartProfit" style="height: 230px;"></div>

              {{-- Kalau profit minus: tampil merah biar sesuai keadaan --}}
              <h5 class="mt-2 fw-bold {{ ($profit ?? 0) >= 0 ? 'text-warning' : 'text-danger' }}"
                style="font-size: 18px;">
                Rp {{ number_format($profit,0,',','.') }}
              </h5>

              <small class="fw-medium" id="profitGrowth"></small>
            </div>
          </div>
        </div>
      </div>
    </div>

    {{-- TOTAL PENDAPATAN + LAPORAN --}}
    <div class="col-md-12 col-xxl-8 mb-6">
      <div class="card h-100">
        <div class="row row-bordered g-0">
          <div class="col-md-8">
            <div class="card-header d-flex justify-content-between">
              <div>
                <h5 class="card-title mb-1">Total Pendapatan</h5>
                <p class="card-subtitle">Ringkasan laporan tahunan</p>
              </div>
            </div>
            <div class="card-body">
              <div id="totalIncomePBrt"></div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="card-header d-flex justify-content-between">
              <div>
                <h5 class="card-title mb-1" style="font-size: 16px; font-weight: 600;">Laporan</h5>
                <p class="card-subtitle mb-0" style="font-size: 14px; color: #6e6b7b;">
                  Rata-rata Bulanan Rp{{ number_format($avgMonthlyIncome, 0, ',', '.') }}
                </p>
                <small class="text-muted" style="font-size:12px;">
                  {{ $monthsWithIncome > 0 ? 'Dihitung dari '.$monthsWithIncome.' bulan pemasukan' : 'Belum ada pemasukan' }}
                </small>
              </div>
            </div>

            <div class="card-body pt-lg-2">
              <div class="report-list">
                {{-- Pendapatan --}}
                <div class="report-list-item rounded-2 mb-4">
                  <div class="d-flex align-items-center">
                    <div class="report-list-icon shadow-xs me-4">
                      <img src="../../be_view/assets/svg/icons/paypal-icon.svg" width="22" height="22"
                        alt="Pendapatan" />
                    </div>
                    <div class="d-flex justify-content-between align-items-center w-100 flex-wrap gap-2">
                      <div class="d-flex flex-column">
                        <span style="font-size: 14px; color: #6e6b7b;">Pendapatan</span>
                        <h5 class="mb-0" style="font-size: 16px; font-weight: 600;">
                          Rp{{ number_format($totalSales ?? 0, 0, ',', '.') }}
                        </h5>
                      </div>
                      <small class="{{ $incomeGrowthClass }}" style="font-size: 13px;">
                        {{ number_format($incomeGrowthVal, 2) }}%
                      </small>
                    </div>
                  </div>
                </div>

                {{-- Pengeluaran --}}
                <div class="report-list-item rounded-2 mb-4">
                  <div class="d-flex align-items-center">
                    <div class="report-list-icon shadow-xs me-4">
                      <img src="../../be_view/assets/svg/icons/credit-card-icon.svg" width="22" height="22"
                        alt="Pengeluaran" />
                    </div>
                    <div class="d-flex justify-content-between align-items-center w-100 flex-wrap gap-2">
                      <div class="d-flex flex-column">
                        <span style="font-size: 14px; color: #6e6b7b;">Pengeluaran</span>
                        <h5 class="mb-0" style="font-size: 16px; font-weight: 600;">
                          Rp{{ number_format($totalPurchase ?? 0, 0, ',', '.') }}
                        </h5>
                      </div>
                      <small class="{{ $expenseGrowthClass }}" style="font-size: 13px;">
                        {{ number_format($expenseGrowthVal, 2) }}%
                      </small>
                    </div>
                  </div>
                </div>

                {{-- Keuntungan / Rugi --}}
                <div class="report-list-item rounded-2">
                  <div class="d-flex align-items-center">
                    <div class="report-list-icon shadow-xs me-4">
                      <img src="../../be_view/assets/svg/icons/wallet-icon.svg" width="22" height="22"
                        alt="Keuntungan" />
                    </div>
                    <div class="d-flex justify-content-between align-items-center w-100 flex-wrap gap-2">
                      <div class="d-flex flex-column">
                        <span style="font-size: 14px; color: #6e6b7b;">
                          {{ ($profit ?? 0) >= 0 ? 'Keuntungan' : 'Rugi' }}
                        </span>
                        <h5 class="mb-0" style="font-size: 16px; font-weight: 600;">
                          Rp{{ number_format($profit ?? 0, 0, ',', '.') }}
                        </h5>
                      </div>
                      <small class="{{ $profitGrowthClass }}" style="font-size: 13px;">
                        {{ number_format($profitGrowthVal, 2) }}%
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> {{-- end laporan --}}
        </div>
      </div>
    </div>
  </div>
</div>

{{-- MODAL ADD/EDIT --}}
<div class="modal fade" id="scheduleModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-body">
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>

        <div class="text-center mb-3">
          <h4 class="mb-1" id="scheduleModalTitle">Tambah Jadwal</h4>
          <p class="mb-0">Semua waktu mengikuti <b>WIB (Asia/Jakarta)</b>.</p>
        </div>

        <form id="scheduleForm" class="row g-3">
          @csrf
          <input type="hidden" id="scId" value="">

          <div class="col-12 col-md-6">
            <label class="form-label">Judul</label>
            <input type="text" class="form-control" id="scTitle" required placeholder="Contoh: Main Bulutangkis">
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label">Lokasi (opsional)</label>
            <input type="text" class="form-control" id="scLocation" placeholder="Contoh: GOR Kasamba">
          </div>

          <div class="col-12">
            <label class="form-label">Jadwal (WIB)</label>
            <input type="text" class="form-control" id="scRange" placeholder="Pilih tanggal & jam (WIB)" readonly>
            <small class="text-muted">Contoh: 15-12-2025 20:00 sampai 16-12-2025 06:00</small>
          </div>

          {{-- Hidden yang dikirim ke backend --}}
          <input type="hidden" id="scDate">
          <input type="hidden" id="scStart">
          <input type="hidden" id="scEnd">

          <div class="col-12">
            <label class="form-label">Catatan (opsional)</label>
            <textarea class="form-control" id="scNote" rows="2"></textarea>
          </div>

          <div class="col-12 d-flex justify-content-center gap-2 mt-3 flex-wrap">
            <button type="submit" class="btn btn-primary" id="btnSaveSchedule">
              <i class="bx bx-save me-1"></i> Simpan
            </button>

            <button type="button" class="btn btn-danger d-none" id="btnDeleteSchedule">
              <i class="bx bx-trash me-1"></i> Hapus
            </button>

            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>

{{-- MODAL LIST EVENT PER TANGGAL --}}
<div class="modal fade" id="dayEventsModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-md modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="dayEventsTitle">Jadwal</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body">
        <div id="dayEventsEmpty" class="text-muted small d-none">Tidak ada jadwal di tanggal ini.</div>
        <div id="dayEventsList" class="d-grid gap-2"></div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Tutup</button>
        <button type="button" class="btn btn-primary" id="btnAddScheduleFromDay">
          <i class="bx bx-plus me-1"></i> Tambah Jadwal
        </button>
      </div>
    </div>
  </div>
</div>
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/locales-all.global.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/id.js"></script>

<script>
  document.addEventListener('DOMContentLoaded', function () {
  const TZ = 'Asia/Jakarta';

  const calEl = document.getElementById('pbrtCalendar');
  if (!calEl) return;

  const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

  const scheduleModalEl = document.getElementById('scheduleModal');
  const scheduleModal = bootstrap.Modal.getOrCreateInstance(scheduleModalEl);

  const dayEventsModalEl = document.getElementById('dayEventsModal');
  const dayEventsModal = bootstrap.Modal.getOrCreateInstance(dayEventsModalEl);

  const $ = (id) => document.getElementById(id);

  const formEl = $('scheduleForm');
  const btnDelete = $('btnDeleteSchedule');
  const btnAdd = $('btnAddSchedule');
  const btnAddFromDay = $('btnAddScheduleFromDay');

  // ---------- Utils ----------
  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, s => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[s]));
  }

  function todayWibYMD(){
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: TZ, year:'numeric', month:'2-digit', day:'2-digit'
    }).format(new Date());
  }

  function setModeCreate(){
    $('scheduleModalTitle').textContent = 'Tambah Jadwal';
    $('scId').value = '';
    btnDelete?.classList.add('d-none');
  }

  function setModeEdit(){
    $('scheduleModalTitle').textContent = 'Edit Jadwal';
    btnDelete?.classList.remove('d-none');
  }

  function resetForm(){
    formEl?.reset();
    $('scId').value = '';
    $('scDate').value = '';
    $('scStart').value = '';
    $('scEnd').value = '';
    if ($('scRange')?._flatpickr) $('scRange')._flatpickr.clear();
  }

  async function doFetch(url, method, payload) {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrf,
        "Accept": "application/json"
      },
      body: payload ? JSON.stringify(payload) : null
    });

    if (!res.ok) {
      const err = await res.json().catch(()=>({message:'Request gagal'}));
      throw new Error(err.message || 'Request gagal');
    }
    return res.json().catch(()=> ({}));
  }

  // ---------- Flatpickr range ----------
  flatpickr('#scRange', {
    mode: 'range',
    enableTime: true,
    time_24hr: true,
    locale: 'id',
    dateFormat: 'd-m-Y H:i',
    minuteIncrement: 5,
    disableMobile: true,

    onChange: function(selectedDates){
      if (selectedDates.length === 2) {
        const start = selectedDates[0];
        const end   = selectedDates[1];

        const startYMD = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year:'numeric', month:'2-digit', day:'2-digit' }).format(start);
        const startHM  = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour:'2-digit', minute:'2-digit', hour12:false }).format(start);
        const endHM    = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour:'2-digit', minute:'2-digit', hour12:false }).format(end);

        $('scDate').value  = startYMD;
        $('scStart').value = startHM;
        $('scEnd').value   = endHM;
      }
    }
  });

  // ---------- LIVE badge (DB RAW) ----------
  function updateTodayBadge(events) {
    const badge = document.getElementById('todayLiveBadge');
    const text  = document.getElementById('todayLiveText');
    if (!badge || !text) return;

    const today = todayWibYMD();

    const todays = events
      .filter(ev => ev.extendedProps?.db_date === today)
      .sort((a,b)=> (a.extendedProps?.db_start_time || '99:99').localeCompare(b.extendedProps?.db_start_time || '99:99'));

    if (!todays.length) {
      badge.classList.add('d-none');
      text.textContent = '';
      return;
    }

    const ev = todays[0];
    const title = ev.title || 'Ada jadwal';
    const start = ev.extendedProps?.db_start_time || '';
    const end   = ev.extendedProps?.db_end_time || '';

    badge.classList.remove('d-none');
    text.innerHTML = `Hari ini ada jadwal <b>${escapeHtml(title)}</b> dari jam <b>${start}</b>${end ? ` - <b>${end}</b>` : ''}`;
  }

  // ---------- ✅ MODAL LIST EVENT PER TANGGAL ----------
  let clickedDayYMD = null;

  function openEditFromEvent(ev){
    resetForm();
    setModeEdit();

    $('scId').value = ev.id;
    $('scTitle').value = ev.title || '';
    $('scLocation').value = ev.extendedProps?.location || '';
    $('scNote').value = ev.extendedProps?.note || '';

    const dbDate  = ev.extendedProps?.db_date || '';
    const dbStart = ev.extendedProps?.db_start_time || '';
    const dbEnd   = ev.extendedProps?.db_end_time || '';

    $('scDate').value  = dbDate;
    $('scStart').value = dbStart;
    $('scEnd').value   = dbEnd;

    if (dbDate && dbStart && dbEnd && $('scRange')?._flatpickr) {
      const [yy,mm,dd] = dbDate.split('-').map(Number);
      const [sh,sm] = dbStart.split(':').map(Number);
      const [eh,em] = dbEnd.split(':').map(Number);

      const fakeStart = new Date(yy, mm-1, dd, sh, sm);

      let fakeEnd = new Date(yy, mm-1, dd, eh, em);
      if (dbEnd <= dbStart) {
        fakeEnd = new Date(yy, mm-1, dd + 1, eh, em);
      }

      $('scRange')._flatpickr.setDate([fakeStart, fakeEnd], true);
    }

    scheduleModal.show();
  }

  function renderDayEventsModal(ymd, events){
    clickedDayYMD = ymd;

    const titleEl = $('dayEventsTitle');
    const emptyEl = $('dayEventsEmpty');
    const listEl  = $('dayEventsList');

    const [yy,mm,dd] = ymd.split('-').map(Number);
    const pretty = new Intl.DateTimeFormat('id-ID', { day:'2-digit', month:'long', year:'numeric' })
      .format(new Date(yy, mm-1, dd));

    titleEl.textContent = `Jadwal - ${pretty}`;
    listEl.innerHTML = '';

    if (!events.length) {
      emptyEl.classList.remove('d-none');
    } else {
      emptyEl.classList.add('d-none');

      events.sort((a,b)=> (a.extendedProps?.db_start_time || '99:99')
        .localeCompare(b.extendedProps?.db_start_time || '99:99'));

      events.forEach((ev) => {
        const dbStart = ev.extendedProps?.db_start_time || '';
        const dbEnd   = ev.extendedProps?.db_end_time || '';
        const loc     = ev.extendedProps?.location || '';
        const note    = ev.extendedProps?.note || '';

        const div = document.createElement('div');
        div.className = 'day-event-item';
        div.innerHTML = `
          <div class="d-flex justify-content-between align-items-center mb-1">
            <div class="day-event-time">${escapeHtml(dbStart)}${dbEnd ? ' - ' + escapeHtml(dbEnd) : ''}</div>
            <span class="badge bg-primary-subtle text-primary fw-semibold">Detail</span>
          </div>
          <div class="fw-bold">${escapeHtml(ev.title || 'Tanpa Judul')}</div>
          ${loc ? `<div class="day-event-meta mt-1"><i class="bx bx-map me-1"></i>${escapeHtml(loc)}</div>` : ''}
          ${note ? `<div class="day-event-meta"><i class="bx bx-note me-1"></i>${escapeHtml(note)}</div>` : ''}
        `;

        div.addEventListener('click', function(){
          dayEventsModal.hide();
          openEditFromEvent(ev);
        });

        listEl.appendChild(div);
      });
    }

    dayEventsModal.show();
  }

  // ---------- FullCalendar ----------
  const calendar = new FullCalendar.Calendar(calEl, {
    timeZone: TZ,
    locale: 'id',

    buttonText: { today: 'Hari ini' },
    initialView: 'dayGridMonth',

    dayMaxEvents: true,
    displayEventTime: true,
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },

    headerToolbar: {
      left: 'today',
      center: 'title',
      right: 'dayGridMonth'
    },

    selectable: true,
    selectMirror: true,

    events: "{{ route('schedule.events') }}",

    // ✅ klik tanggal => buka modal list event
    dateClick: function(info){
      const ymd = info.dateStr; // YYYY-MM-DD sesuai timezone calendar
      const all = calendar.getEvents();
      const dayEvents = all.filter(e => e.extendedProps?.db_date === ymd);
      renderDayEventsModal(ymd, dayEvents);
    },

    // klik event => edit
    eventClick: function(info){
      info.jsEvent.preventDefault();
      openEditFromEvent(info.event);
    },

    // klik & drag select masih buat create
   

    eventsSet: function(events){
      updateTodayBadge(events);
    }
  });

  calendar.render();

  // tombol tambah dari header
  btnAdd?.addEventListener('click', function(){
    resetForm();
    setModeCreate();

    const today = todayWibYMD();
    $('scDate').value  = today;
    $('scStart').value = '18:00';
    $('scEnd').value   = '23:00';

    const [yy,mm,dd] = today.split('-').map(Number);
    const fakeStart = new Date(yy, mm-1, dd, 18, 0);
    const fakeEnd   = new Date(yy, mm-1, dd, 23, 0);
    if ($('scRange')?._flatpickr) $('scRange')._flatpickr.setDate([fakeStart, fakeEnd], true);

    scheduleModal.show();
  });

  // tombol tambah dari modal tanggal
  btnAddFromDay?.addEventListener('click', function(){
    if (!clickedDayYMD) return;

    resetForm();
    setModeCreate();

    $('scDate').value  = clickedDayYMD;
    $('scStart').value = '18:00';
    $('scEnd').value   = '23:00';

    const [yy,mm,dd] = clickedDayYMD.split('-').map(Number);
    const fakeStart = new Date(yy, mm-1, dd, 18, 0);
    const fakeEnd   = new Date(yy, mm-1, dd, 23, 0);
    if ($('scRange')?._flatpickr) $('scRange')._flatpickr.setDate([fakeStart, fakeEnd], true);

    dayEventsModal.hide();
    scheduleModal.show();
  });

  // submit create/update
  formEl?.addEventListener('submit', async function(e){
    e.preventDefault();

    const id = $('scId').value;

    const payload = {
      title: ($('scTitle').value || '').trim(),
      location: ($('scLocation').value || '').trim(),
      date: $('scDate').value,
      start_time: $('scStart').value,
      end_time: $('scEnd').value,
      note: ($('scNote').value || '').trim(),
    };

    if (!payload.title) return alert('Judul wajib diisi');
    if (!payload.date) return alert('Tanggal wajib diisi');
    if (!payload.start_time) return alert('Jam mulai wajib diisi');
    if (!payload.end_time) return alert('Jam selesai wajib diisi');
    if (payload.start_time === payload.end_time) return alert('Jam selesai tidak boleh sama dengan jam mulai');

    try {
      if (id) {
        await doFetch(`{{ url('/schedule') }}/${id}`, 'PUT', payload);
      } else {
        await doFetch(`{{ route('schedule.store') }}`, 'POST', payload);
      }
      scheduleModal.hide();
      calendar.refetchEvents();
    } catch(err) {
      alert(err.message);
    }
  });

  // delete
  btnDelete?.addEventListener('click', async function(){
    const id = $('scId').value;
    if (!id) return;
    if (!confirm('Yakin hapus jadwal ini?')) return;

    try {
      await doFetch(`{{ url('/schedule') }}/${id}`, 'DELETE');
      scheduleModal.hide();
      calendar.refetchEvents();
    } catch(err) {
      alert(err.message);
    }
  });

});
</script>

{{-- AREA CHART (PUNYA KAMU) - TIDAK DIUBAH --}}
<script>
  document.addEventListener('DOMContentLoaded', function() {
  const totalIncomeEl = document.querySelector('#totalIncomePBrt');
  const actualIncomeData = @json($salesPerMonth);

  const incomeData = [];
  for (let month = 1; month <= 12; month++) {
    incomeData.push(actualIncomeData[month] ?? 0);
  }

  const maxY = Math.max(...Object.values(actualIncomeData), 0) * 1.2 || 10000;

  const totalIncomeConfig = {
    chart: {
      height: 290,
      type: 'area',
      toolbar: false,
      dropShadow: {
        enabled: true,
        top: 14,
        left: 2,
        blur: 3,
        color: '#28a745',
        opacity: 0.15
      },
      fontFamily: 'Inter, sans-serif'
    },
    series: [{ data: incomeData }],
    dataLabels: { enabled: false },
    stroke: { width: 3, curve: 'smooth' },
    colors: ['#28a745'],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        shadeIntensity: 0.8,
        opacityFrom: 0.7,
        opacityTo: 0.25,
        stops: [0, 95, 100]
      }
    },
    tooltip: {
      style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' },
      y: {
        formatter: function(val) {
          return 'Rp ' + new Intl.NumberFormat('id-ID').format(val);
        }
      }
    },
    grid: {
      show: true,
      strokeDashArray: 10,
      borderColor: '#e0e0e0',
      padding: { top: -15, bottom: -10, left: 0, right: 0 }
    },
    xaxis: {
      categories: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],
      labels: {
        style: {
          colors: '#6e6b7b',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px'
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      min: 0,
      max: maxY,
      tickAmount: 5,
      labels: {
        offsetX: -15,
        formatter: function(val) {
          return 'Rp ' + new Intl.NumberFormat('id-ID').format(val);
        },
        style: { fontSize: '13px', fontFamily: 'Inter, sans-serif', colors: '#6e6b7b' }
      }
    }
  };

  if (totalIncomeEl) {
    new ApexCharts(totalIncomeEl, totalIncomeConfig).render();
  }
});
</script>

{{-- RADIAL + TEXT FIX (PUNYA KAMU) - TIDAK DIUBAH --}}
<script>
  document.addEventListener('DOMContentLoaded', function() {
  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

  function renderRadialChart(selector, value, max, color) {
    const el = document.querySelector(selector);
    if (!el) return 0;

    const safeMax = (max && max > 0) ? max : 0;
    const percentRaw = safeMax > 0 ? (Math.abs(value) / safeMax) * 100 : 0;
    const percent = clamp(Math.round(percentRaw), 0, 100);

    const options = {
      chart: { type: 'radialBar', height: 230 },
      series: [percent],
      plotOptions: {
        radialBar: {
          startAngle: -160,
          endAngle: 160,
          hollow: { size: '60%' },
          track: { background: '#f0f0f0', strokeWidth: '100%' },
          dataLabels: {
            name: { show: false },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 600,
              formatter: function(val) { return val + '%'; }
            }
          }
        }
      },
      colors: [color],
      stroke: { lineCap: 'round' },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'horizontal',
          gradientToColors: [color],
          opacityFrom: 0.5,
          opacityTo: 0.2
        }
      },
      responsive: [{ breakpoint: 768, options: { chart: { height: 200 } } }]
    };

    new ApexCharts(el, options).render();
    return percent;
  }

  const maxIncome   = {{ max($totalSales, 1) * 1.2 }};
  const maxExpenses = {{ max($totalPurchase, 1) * 1.2 }};
  const maxProfit   = {{ max(abs($profit), 1) * 1.2 }};

  const incomeVal  = {{ $totalSales ?? 0 }};
  const expenseVal = {{ $totalPurchase ?? 0 }};
  const profitVal  = {{ $profit ?? 0 }};

  const incomePercent  = renderRadialChart('#chartIncome', incomeVal, maxIncome, '#28a745');
  const expensePercent = renderRadialChart('#chartExpenses', expenseVal, maxExpenses, '#dc3545');

  const profitColor = (profitVal >= 0) ? '#28a745' : '#dc3545';
  const profitPercent = renderRadialChart('#chartProfit', profitVal, maxProfit, profitColor);

  const incomeTextEl  = document.querySelector('#incomeGrowth');
  const expenseTextEl = document.querySelector('#expensesGrowth');
  const profitTextEl  = document.querySelector('#profitGrowth');

  if (incomeTextEl) {
    incomeTextEl.innerHTML = `<i class="bx bx-trending-up"></i> Pendapatan mencapai ${incomePercent}% dari batas`;
  }
  if (expenseTextEl) {
    expenseTextEl.innerHTML = `<i class="bx bx-trending-up"></i> Pengeluaran mencapai ${expensePercent}% dari batas`;
  }

  if (profitTextEl) {
    if (profitVal >= 0) {
      profitTextEl.classList.remove('text-danger');
      profitTextEl.classList.add('text-success');
      profitTextEl.innerHTML = `<i class="bx bx-trending-up"></i> Keuntungan mencapai ${profitPercent}% dari batas`;
    } else {
      profitTextEl.classList.remove('text-success');
      profitTextEl.classList.add('text-danger');
      profitTextEl.innerHTML = `<i class="bx bx-trending-down"></i> Rugi mencapai ${profitPercent}% dari batas`;
    }
  }
});
</script>

{{-- CAROUSEL --}}
<script>
  const proyekList = @json($projectTargets);
const carouselInner = document.getElementById('carouselProyekInner');
const perSlide = 2;

for (let i = 0; i < proyekList.length; i += perSlide) {
    const slice = proyekList.slice(i, i + perSlide);
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('carousel-item');
    if (i === 0) itemDiv.classList.add('active');

    let innerHTML = '';
    slice.forEach(p => {
        innerHTML += `
            <div class="mb-4 border rounded p-3 shadow-sm">
                <div class="d-flex justify-content-between text-muted small mb-2">
                    <span><i class='bx bx-calendar-event me-1'></i> ${p.target_date}</span>
                    <span><i class='bx bx-bullseye me-1'></i> Rp ${p.target_amount}</span>
                    <span><i class='bx bx-wallet-alt me-1'></i> Rp ${p.saldo}</span>
                </div>

                <div class="progress mb-3" style="height: 8px;">
                    <div class="progress-bar bg-${p.status} rounded-pill"
                        role="progressbar" style="width: ${p.progress}%;"></div>
                </div>

                <div class="d-flex justify-content-between align-items-center">
                    <p class="fw-semibold mb-0 text-truncate" style="max-width: 70%;">
                        <i class='bx bx-briefcase-alt-2 me-1 text-primary'></i> ${p.name}
                    </p>
                    <small class="text-${p.status} fw-semibold">
                        <i class='bx bx-line-chart me-1'></i>${p.progress}% (${p.status_text})
                    </small>
                </div>
            </div>
        `;
    });

    itemDiv.innerHTML = innerHTML;
    carouselInner.appendChild(itemDiv);
}
</script>
@endpush