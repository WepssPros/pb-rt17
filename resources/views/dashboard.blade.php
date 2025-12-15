@extends('layouts.admin')
@section('title')
<title>Admin Dashboard - Cashflow RT 17</title>
@endsection

@section('content')
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

<div class="container-xxl flex-grow-1 container-p-y">
    <div class="row">
        <div class="col-md-12 col-xxl-4 mb-6">
            <div class="card h-100 text-center shadow-sm">
                <div class="card-body d-flex flex-column align-items-center justify-content-center">
                    <img src="../../be_view/assets/img/logopbrt-circle.png" class="mb-3 img-fluid"
                        style="max-width: 91px;" alt="Logo PBRT" />

                    <h5 class="card-title mb-1">Selamat Datang!</h5>
                    <p class="card-subtitle mb-2 text-muted">Monitoring Kas PBRT 17</p>

                    <h6 class="text-primary mb-2">Bapak. {{ Auth::user()->name }}</h6>

                    <a href="{{ route('penjualan.index') }}" class="btn btn-sm btn-primary">Lakukan Penjualan</a>
                </div>
            </div>
        </div>

        <div class="col-xxl-8 mb-6">
            <div class="card h-100 shadow-sm position-relative">
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
                            <button class="nav-link py-1 px-2 d-flex align-items-center justify-content-center"
                                data-bs-toggle="tab" data-bs-target="#tab-expenses">
                                <i class="bx bx-credit-card me-1"></i>
                                <span style="font-size: 12px;">Pengeluaran</span>
                            </button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link py-1 px-2 d-flex align-items-center justify-content-center"
                                data-bs-toggle="tab" data-bs-target="#tab-profit">
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
                                    {{-- Rata-rata bulanan sesuai keadaan (bulan yang ada pemasukan) --}}
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
                                            <img src="../../be_view/assets/svg/icons/paypal-icon.svg" width="22"
                                                height="22" alt="Pendapatan" />
                                        </div>
                                        <div
                                            class="d-flex justify-content-between align-items-center w-100 flex-wrap gap-2">
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
                                            <img src="../../be_view/assets/svg/icons/credit-card-icon.svg" width="22"
                                                height="22" alt="Pengeluaran" />
                                        </div>
                                        <div
                                            class="d-flex justify-content-between align-items-center w-100 flex-wrap gap-2">
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
                                            <img src="../../be_view/assets/svg/icons/wallet-icon.svg" width="22"
                                                height="22" alt="Keuntungan" />
                                        </div>
                                        <div
                                            class="d-flex justify-content-between align-items-center w-100 flex-wrap gap-2">
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
@endsection

@push('scripts')
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

{{-- RADIAL + TEXT FIX (Biar gak -8833333%) --}}
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