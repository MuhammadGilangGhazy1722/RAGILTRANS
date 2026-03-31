import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { createSignal, onMount, Show, For } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import { fetchAPI } from '../../config/api';

interface MonthlyReport {
  period: {
    year: number;
    month: number;
    month_name: string;
  };
  summary: {
    total_bookings: number;
    total_revenue: string;
    paid_revenue: string;
    pending_revenue: string;
  };
  top_cars: Array<{
    id: number;
    nama_mobil: string;
    plat_nomor: string;
    total_bookings: number;
    total_revenue: string;
    avg_duration: string;
  }>;
  status_breakdown: Array<{
    status: string;
    payment_status: string;
    count: number;
    revenue: string;
  }>;
  daily_trend: Array<{
    date: string;
    bookings: number;
    revenue: string;
  }>;
}

interface YearlyData {
  year: number;
  monthly_comparison: Array<{
    month: number;
    month_name: string;
    total_bookings: number;
    total_revenue: number;
    paid_revenue: number;
  }>;
}

export default function Finance() {
  const navigate = useNavigate();
  const [loading, setLoading] = createSignal(true);
  const [selectedYear, setSelectedYear] = createSignal(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = createSignal(new Date().getMonth() + 1);
  const [username, setUsername] = createSignal('');
  
  const [monthlyReport, setMonthlyReport] = createSignal<MonthlyReport | null>(null);
  const [yearlyData, setYearlyData] = createSignal<YearlyData | null>(null);

  const fetchMonthlyReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetchAPI(
        `/api/analytics/monthly-report?year=${selectedYear()}&month=${selectedMonth()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.success) {
        setMonthlyReport(response.data);
      }
    } catch (error) {
      console.error('Error fetching monthly report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchYearlyComparison = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetchAPI(
        `/api/analytics/yearly-comparison?year=${selectedYear()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.success) {
        setYearlyData(response.data);
      }
    } catch (error) {
      console.error('Error fetching yearly comparison:', error);
    }
  };

  onMount(() => {
    // Cek apakah user sudah login dan role-nya admin
    const role = localStorage.getItem('userRole');
    const user = localStorage.getItem('username');
    
    if (role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    
    setUsername(user || 'Admin');
    fetchMonthlyReport();
    fetchYearlyComparison();
  });

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(Number(amount));
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const handleMonthChange = (e: Event) => {
    const value = (e.target as HTMLSelectElement).value;
    setSelectedMonth(parseInt(value));
    fetchMonthlyReport();
  };

  const handleYearChange = (e: Event) => {
    const value = (e.target as HTMLSelectElement).value;
    setSelectedYear(parseInt(value));
    fetchMonthlyReport();
    fetchYearlyComparison();
  };

const printPDF = () => {
  const report = monthlyReport();
  const yearly = yearlyData();
  if (!report) return;

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 20;

  // Header
  pdf.setFillColor(88, 28, 135);
  pdf.rect(0, 0, pageWidth, 14, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RAGILTRANS - Laporan Keuangan', pageWidth / 2, 10, { align: 'center' });

  // Periode
  pdf.setTextColor(180, 180, 180);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Periode: ${report.period.month_name} ${report.period.year}`, pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Summary
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.setFillColor(30, 30, 30);
  pdf.rect(10, y, pageWidth - 20, 8, 'F');
  pdf.text('Ringkasan Keuangan', 14, y + 5.5);
  y += 12;

  const summaryData = [
    ['Total Booking', `${report.summary.total_bookings} booking`],
    ['Total Pendapatan', formatCurrency(report.summary.total_revenue || 0)],
    ['Sudah Dibayar', formatCurrency(report.summary.paid_revenue || 0)],
    ['Belum Dibayar', formatCurrency(report.summary.pending_revenue || 0)],
  ];

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  summaryData.forEach(([label, value]) => {
    pdf.setTextColor(150, 150, 150);
    pdf.text(label, 14, y);
    pdf.setTextColor(255, 255, 255);
    pdf.text(value, pageWidth - 14, y, { align: 'right' });
    pdf.setDrawColor(50, 50, 50);
    pdf.line(14, y + 2, pageWidth - 14, y + 2);
    y += 10;
  });

  y += 5;

  // Top Cars
  if (report.top_cars.length > 0) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.setFillColor(30, 30, 30);
    pdf.rect(10, y, pageWidth - 20, 8, 'F');
    pdf.text('Mobil Terlaris Bulan Ini', 14, y + 5.5);
    y += 12;

    report.top_cars.forEach((car, i) => {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(200, 150, 255);
      pdf.text(`#${i + 1} ${car.nama_mobil} (${car.plat_nomor})`, 14, y);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(150, 150, 150);
      pdf.text(`${car.total_bookings}x disewa — ${formatCurrency(car.total_revenue)}`, pageWidth - 14, y, { align: 'right' });
      pdf.setDrawColor(50, 50, 50);
      pdf.line(14, y + 2, pageWidth - 14, y + 2);
      y += 10;
    });

    y += 5;
  }

  // Yearly Comparison
  if (yearly) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.setFillColor(30, 30, 30);
    pdf.rect(10, y, pageWidth - 20, 8, 'F');
    pdf.text(`Perbandingan Bulanan ${yearly.year}`, 14, y + 5.5);
    y += 12;

    yearly.monthly_comparison.forEach((month) => {
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(200, 200, 200);
      pdf.text(month.month_name, 14, y);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`${formatCurrency(month.paid_revenue)} (${month.total_bookings} booking)`, pageWidth - 14, y, { align: 'right' });
      pdf.setDrawColor(50, 50, 50);
      pdf.line(14, y + 2, pageWidth - 14, y + 2);
      y += 9;
    });
  }

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, pageWidth / 2, 290, { align: 'center' });

  pdf.save(`Laporan-Keuangan-${selectedYear()}-${selectedMonth()}.pdf`);
};

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <div class="min-h-screen bg-[#0B0B0B]">
      {/* Navbar */}
      <nav class="bg-black/90 backdrop-blur-md border-b border-gray-800/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center space-x-3">
              <A href="/admin/dashboard" class="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div class="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <text x="12" y="17" text-anchor="middle" font-size="18" font-weight="bold" fill="currentColor">R</text>
                  </svg>
                </div>
                <span class="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                  Admin Panel
                </span>
              </A>
            </div>

            <div class="flex items-center gap-4">
              <span class="text-gray-300">Halo, <span class="text-purple-400 font-semibold">{username()}</span></span>
              <button
                onClick={handleLogout}
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
<div class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-white mb-2">Kelola Keuangan</h1>
            <p class="text-gray-400">Laporan keuangan dan performa rental mobil</p>
          </div>
          <div class="flex items-center gap-3">
            <button
              onClick={printPDF}
              class="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
              </svg>
              Cetak PDF
            </button>
            <A
              href="/admin/dashboard"
              class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Kembali
            </A>
          </div>
        </div>

        {/* Filter */}
        <div class="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-900/30 p-6 mb-6">
          <div class="flex gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Tahun</label>
              <select
                value={selectedYear()}
                onChange={handleYearChange}
                class="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none hover:bg-gray-750 transition-colors"
              >
                <For each={years}>
                  {(year) => <option value={year}>{year}</option>}
                </For>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Bulan</label>
              <select
                value={selectedMonth()}
                onChange={handleMonthChange}
                class="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none hover:bg-gray-750 transition-colors"
              >
                <For each={months}>
                  {(month, index) => <option value={index() + 1}>{month}</option>}
                </For>
              </select>
            </div>
          </div>
        </div>
          
      <div id="finance-report">
        <Show when={!loading()} fallback={
          <div class="text-center py-20">
            <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto">
            </div>
            <p class="text-gray-400 mt-4">Memuat data keuangan...</p>
          </div>
        }>
          <Show when={monthlyReport()}>
            {(report) => (
              <>
                {/* Summary Cards */}
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div class="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-900/30 p-6 group hover:border-purple-600/50 transition-all">
                    <div class="flex items-center gap-3 mb-3">
                      <div class="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                      </div>
                      <div class="text-sm text-gray-400">Total Booking</div>
                    </div>
                    <div class="text-3xl font-bold text-white">{report().summary.total_bookings}</div>
                    <div class="text-xs text-gray-500 mt-1">booking bulan ini</div>
                  </div>

                  <div class="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-green-900/30 p-6 group hover:border-green-600/50 transition-all">
                    <div class="flex items-center gap-3 mb-3">
                      <div class="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <div class="text-sm text-gray-400">Total Pendapatan</div>
                    </div>
                    <div class="text-2xl font-bold text-green-400">{formatCurrency(report().summary.total_revenue || 0)}</div>
                    <div class="text-xs text-gray-500 mt-1">semua status</div>
                  </div>

                  <div class="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-blue-900/30 p-6 group hover:border-blue-600/50 transition-all">
                    <div class="flex items-center gap-3 mb-3">
                      <div class="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                      <div class="text-sm text-gray-400">Sudah Dibayar</div>
                    </div>
                    <div class="text-2xl font-bold text-blue-400">{formatCurrency(report().summary.paid_revenue || 0)}</div>
                    <div class="text-xs text-gray-500 mt-1">settlement</div>
                  </div>

                  <div class="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-orange-900/30 p-6 group hover:border-orange-600/50 transition-all">
                    <div class="flex items-center gap-3 mb-3">
                      <div class="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg class="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <div class="text-sm text-gray-400">Belum Dibayar</div>
                    </div>
                    <div class="text-2xl font-bold text-orange-400">{formatCurrency(report().summary.pending_revenue || 0)}</div>
                    <div class="text-xs text-gray-500 mt-1">pending</div>
                  </div>
                </div>

                {/* Top Cars - Mobil Terlaris */}
                <div class="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-900/30 p-6 mb-6">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 bg-yellow-600/20 rounded-xl flex items-center justify-center">
                      <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                      </svg>
                    </div>
                    <div>
                      <h2 class="text-2xl font-bold text-white">Mobil Terlaris Bulan Ini</h2>
                      <p class="text-gray-400 text-sm">Ranking mobil berdasarkan jumlah booking</p>
                    </div>
                  </div>
                  
                  <div class="space-y-4">
                    <Show when={report().top_cars.length > 0} fallback={
                      <div class="bg-gray-800/30 rounded-xl p-8 text-center">
                        <svg class="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                        </svg>
                        <p class="text-gray-500">Belum ada data booking bulan ini</p>
                      </div>
                    }>
                      <For each={report().top_cars}>
                        {(car, index) => (
                          <div class="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50 hover:border-purple-500/50 transition-all hover:bg-gray-800/70 group">
                            <div class="flex items-center justify-between">
                              <div class="flex items-center gap-4">
                                <div class={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold ${
                                  index() === 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                                  index() === 1 ? 'bg-gray-400/20 text-gray-300' : 
                                  index() === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-700/20 text-gray-500'
                                }`}>
                                  {index() === 0 ? '🥇' : index() === 1 ? '🥈' : index() === 2 ? '🥉' : `#${index() + 1}`}
                                </div>
                                <div>
                                  <h3 class="text-white font-bold text-lg group-hover:text-purple-400 transition-colors">{car.nama_mobil}</h3>
                                  <p class="text-gray-400 text-sm">{car.plat_nomor}</p>
                                </div>
                              </div>
                              <div class="text-right">
                                <div class="text-2xl font-bold text-purple-400">{car.total_bookings}<span class="text-lg text-gray-500">x</span></div>
                                <div class="text-xs text-gray-500 mb-2">disewa</div>
                                <div class="text-green-400 font-bold">
                                  {formatCurrency(car.total_revenue)}
                                </div>
                                <div class="text-xs text-gray-500 mt-1">
                                  ⏱️ Rata-rata {Math.round(Number(car.avg_duration))} hari
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </For>
                    </Show>
                  </div>
                </div>

                {/* Yearly Comparison */}
                <Show when={yearlyData()}>
                  {(yearly) => (
                    <div class="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-900/30 p-6">
                      <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
                          <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                          </svg>
                        </div>
                        <div>
                          <h2 class="text-2xl font-bold text-white">Perbandingan Bulanan {yearly().year}</h2>
                          <p class="text-gray-400 text-sm">Tren pendapatan per bulan</p>
                        </div>
                      </div>
                      
                      <div class="space-y-3">
                        <For each={yearly().monthly_comparison}>
                          {(month) => {
                            const maxRevenue = Math.max(...yearly().monthly_comparison.map(m => m.paid_revenue));
                            const percentage = maxRevenue > 0 ? (month.paid_revenue / maxRevenue) * 100 : 0;
                            
                            return (
                              <div class="bg-gray-800/30 rounded-lg p-3 hover:bg-gray-800/50 transition-colors">
                                <div class="flex justify-between text-sm mb-2">
                                  <span class="text-gray-300 font-medium">{month.month_name}</span>
                                  <div class="text-right">
                                    <span class="text-white font-bold">{formatCurrency(month.paid_revenue)}</span>
                                    <span class="text-gray-500 ml-2 text-xs">({month.total_bookings} booking)</span>
                                  </div>
                                </div>
                                <div class="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
                                  <div
                                    class="bg-gradient-to-r from-purple-500 to-purple-400 h-full transition-all duration-500 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          }}
                        </For>
                      </div>
                    </div>
                  )}
                </Show>
              </>
            )}
          </Show>
        </Show>
      </div>
    </div>
  </div>
  );
}
