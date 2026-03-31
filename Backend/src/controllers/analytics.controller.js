const supabase = require('../config/db');

function getMonthName(month) {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return months[month - 1] || '';
}

exports.getMonthlyFinancialReport = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const targetYear = parseInt(req.query.year || currentDate.getFullYear());
    const targetMonth = parseInt(req.query.month || (currentDate.getMonth() + 1));

    const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
    const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];

    const { data: sewas, error } = await supabase.from('sewa').select('*, mobil(id, nama_mobil, plat_nomor)').gte('tanggal_pinjam', startDate).lte('tanggal_pinjam', endDate);
    if (error) throw error;

    const total_bookings = sewas.length;
    const total_revenue = sewas.reduce((sum, s) => sum + (s.total_harga || 0), 0);
    const paid_revenue = sewas.filter(s => s.payment_status === 'settlement').reduce((sum, s) => sum + (s.total_harga || 0), 0);
    const pending_revenue = sewas.filter(s => s.payment_status === 'pending').reduce((sum, s) => sum + (s.total_harga || 0), 0);

    // Top cars
    const carMap = {};
    for (const s of sewas) {
      const id = s.mobil?.id;
      if (!id) continue;
      if (!carMap[id]) carMap[id] = { id, nama_mobil: s.mobil.nama_mobil, plat_nomor: s.mobil.plat_nomor, total_bookings: 0, total_revenue: 0, total_days: 0 };
      carMap[id].total_bookings++;
      carMap[id].total_revenue += s.total_harga || 0;
      carMap[id].total_days += s.durasi_hari || 0;
    }
    const top_cars = Object.values(carMap).map(c => ({ ...c, avg_duration: c.total_days / c.total_bookings })).sort((a, b) => b.total_bookings - a.total_bookings);

    // Status breakdown
    const statusMap = {};
    for (const s of sewas) {
      const key = `${s.status}_${s.payment_status}`;
      if (!statusMap[key]) statusMap[key] = { status: s.status, payment_status: s.payment_status, count: 0, revenue: 0 };
      statusMap[key].count++;
      statusMap[key].revenue += s.total_harga || 0;
    }

    // Daily trend
    const dailyMap = {};
    for (const s of sewas) {
      const date = s.tanggal_pinjam?.split('T')[0];
      if (!date) continue;
      if (!dailyMap[date]) dailyMap[date] = { date, bookings: 0, revenue: 0 };
      dailyMap[date].bookings++;
      dailyMap[date].revenue += s.total_harga || 0;
    }
    const daily_trend = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    res.json({ success: true, data: { period: { year: targetYear, month: targetMonth, month_name: getMonthName(targetMonth) }, summary: { year: targetYear, month: targetMonth, total_bookings, total_revenue, paid_revenue, pending_revenue }, top_cars, status_breakdown: Object.values(statusMap), daily_trend } });
  } catch (err) { next(err); }
};

exports.getYearlyComparison = async (req, res, next) => {
  try {
    const targetYear = parseInt(req.query.year || new Date().getFullYear());
    const startDate = `${targetYear}-01-01`;
    const endDate = `${targetYear}-12-31`;

    const { data: sewas, error } = await supabase.from('sewa').select('tanggal_pinjam, total_harga, payment_status').gte('tanggal_pinjam', startDate).lte('tanggal_pinjam', endDate);
    if (error) throw error;

    const completeData = [];
    for (let i = 1; i <= 12; i++) {
      const monthSewas = sewas.filter(s => new Date(s.tanggal_pinjam).getMonth() + 1 === i);
      completeData.push({
        month: i, month_name: getMonthName(i),
        total_bookings: monthSewas.length,
        total_revenue: monthSewas.reduce((sum, s) => sum + (s.total_harga || 0), 0),
        paid_revenue: monthSewas.filter(s => s.payment_status === 'settlement').reduce((sum, s) => sum + (s.total_harga || 0), 0)
      });
    }

    res.json({ success: true, data: { year: targetYear, monthly_comparison: completeData } });
  } catch (err) { next(err); }
};

exports.getCarPerformance = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    let query = supabase.from('sewa').select('*, mobil(id, nama_mobil, plat_nomor, harga_per_hari)');
    if (year) { const s = `${year}-01-01`; const e = `${year}-12-31`; query = query.gte('created_at', s).lte('created_at', e); }
    if (month && year) { const s = `${year}-${String(month).padStart(2,'0')}-01`; const e = new Date(year, month, 0).toISOString().split('T')[0]; query = query.gte('created_at', s).lte('created_at', e); }

    const { data: sewas, error } = await query;
    if (error) throw error;

    const { data: allCars } = await supabase.from('mobil').select('id, nama_mobil, plat_nomor, harga_per_hari');
    const carMap = {};
    for (const car of allCars || []) {
      carMap[car.id] = { ...car, total_bookings: 0, total_revenue: 0, total_rental_days: 0, avg_rental_days: 0, first_booking: null, last_booking: null };
    }
    for (const s of sewas || []) {
      const id = s.mobil?.id;
      if (!id || !carMap[id]) continue;
      carMap[id].total_bookings++;
      carMap[id].total_revenue += s.total_harga || 0;
      carMap[id].total_rental_days += s.durasi_hari || 0;
      if (!carMap[id].first_booking || s.created_at < carMap[id].first_booking) carMap[id].first_booking = s.created_at;
      if (!carMap[id].last_booking || s.created_at > carMap[id].last_booking) carMap[id].last_booking = s.created_at;
    }
    const carData = Object.values(carMap).map(c => ({ ...c, avg_rental_days: c.total_bookings ? c.total_rental_days / c.total_bookings : 0 })).sort((a, b) => b.total_bookings - a.total_bookings);

    res.json({ success: true, data: carData });
  } catch (err) { next(err); }
};

exports.getLandingPageStats = async (req, res, next) => {
  try {
    const { count: total_bookings } = await supabase.from('sewa').select('*', { count: 'exact', head: true }).eq('status', 'selesai');
    const { count: total_cars } = await supabase.from('mobil').select('*', { count: 'exact', head: true }).eq('status', 'tersedia');
    const { data: customers } = await supabase.from('sewa').select('user_id');
    const total_customers = new Set(customers?.map(c => c.user_id).filter(Boolean)).size;

    res.json({ success: true, data: { total_bookings: total_bookings || 0, total_cars: total_cars || 0, total_customers, support_hours: '24/7', satisfaction_rate: 98 } });
  } catch (err) { next(err); }
};

module.exports = exports;
