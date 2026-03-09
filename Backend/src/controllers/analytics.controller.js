const db = require('../config/db');

/**
 * Get financial summary per month
 * Rekapan keuangan bulanan: total booking, total revenue, mobil terlaris
 */
exports.getMonthlyFinancialReport = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    
    // Default to current year/month if not specified
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();
    const targetMonth = month || (currentDate.getMonth() + 1);

    // 1. Total revenue per month (berdasarkan tanggal pinjam)
    const [revenueData] = await db.query(`
      SELECT 
        YEAR(tanggal_pinjam) as year,
        MONTH(tanggal_pinjam) as month,
        COUNT(*) as total_bookings,
        SUM(total_harga) as total_revenue,
        SUM(CASE WHEN payment_status = 'settlement' THEN total_harga ELSE 0 END) as paid_revenue,
        SUM(CASE WHEN payment_status = 'pending' THEN total_harga ELSE 0 END) as pending_revenue
      FROM sewa
      WHERE YEAR(tanggal_pinjam) = ? AND MONTH(tanggal_pinjam) = ?
      GROUP BY YEAR(tanggal_pinjam), MONTH(tanggal_pinjam)
    `, [targetYear, targetMonth]);

    // 2. Mobil paling sering disewa per bulan (ranking berdasarkan tanggal pinjam)
    const [topCars] = await db.query(`
      SELECT 
        m.id,
        m.nama_mobil,
        m.plat_nomor,
        COUNT(s.id) as total_bookings,
        SUM(s.total_harga) as total_revenue,
        AVG(s.durasi_hari) as avg_duration
      FROM sewa s
      JOIN mobil m ON s.mobil_id = m.id
      WHERE YEAR(s.tanggal_pinjam) = ? AND MONTH(s.tanggal_pinjam) = ?
      GROUP BY m.id, m.nama_mobil, m.plat_nomor
      ORDER BY total_bookings DESC, total_revenue DESC
    `, [targetYear, targetMonth]);

    // 3. Breakdown by payment status (berdasarkan tanggal pinjam)
    const [statusBreakdown] = await db.query(`
      SELECT 
        status,
        payment_status,
        COUNT(*) as count,
        SUM(total_harga) as revenue
      FROM sewa
      WHERE YEAR(tanggal_pinjam) = ? AND MONTH(tanggal_pinjam) = ?
      GROUP BY status, payment_status
    `, [targetYear, targetMonth]);

    // 4. Daily revenue trend for the month (berdasarkan tanggal pinjam)
    const [dailyTrend] = await db.query(`
      SELECT 
        DATE(tanggal_pinjam) as date,
        COUNT(*) as bookings,
        SUM(total_harga) as revenue
      FROM sewa
      WHERE YEAR(tanggal_pinjam) = ? AND MONTH(tanggal_pinjam) = ?
      GROUP BY DATE(tanggal_pinjam)
      ORDER BY date ASC
    `, [targetYear, targetMonth]);

    res.json({
      success: true,
      data: {
        period: {
          year: targetYear,
          month: targetMonth,
          month_name: getMonthName(targetMonth)
        },
        summary: revenueData[0] || {
          year: targetYear,
          month: targetMonth,
          total_bookings: 0,
          total_revenue: 0,
          paid_revenue: 0,
          pending_revenue: 0
        },
        top_cars: topCars,
        status_breakdown: statusBreakdown,
        daily_trend: dailyTrend
      }
    });

  } catch (err) {
    console.error('Error getting monthly report:', err);
    next(err);
  }
};

/**
 * Get yearly comparison
 * Perbandingan per bulan dalam setahun
 */
exports.getYearlyComparison = async (req, res, next) => {
  try {
    const { year } = req.query;
    const targetYear = year || new Date().getFullYear();

    const [monthlyData] = await db.query(`
      SELECT 
        MONTH(tanggal_pinjam) as month,
        COUNT(*) as total_bookings,
        SUM(total_harga) as total_revenue,
        SUM(CASE WHEN payment_status = 'settlement' THEN total_harga ELSE 0 END) as paid_revenue
      FROM sewa
      WHERE YEAR(tanggal_pinjam) = ?
      GROUP BY MONTH(tanggal_pinjam)
      ORDER BY month ASC
    `, [targetYear]);

    // Fill missing months with 0
    const completeData = [];
    for (let i = 1; i <= 12; i++) {
      const monthData = monthlyData.find(m => m.month === i);
      completeData.push({
        month: i,
        month_name: getMonthName(i),
        total_bookings: monthData ? monthData.total_bookings : 0,
        total_revenue: monthData ? parseFloat(monthData.total_revenue) : 0,
        paid_revenue: monthData ? parseFloat(monthData.paid_revenue) : 0
      });
    }

    res.json({
      success: true,
      data: {
        year: targetYear,
        monthly_comparison: completeData
      }
    });

  } catch (err) {
    console.error('Error getting yearly comparison:', err);
    next(err);
  }
};

/**
 * Get car performance report
 * Performa masing-masing mobil (total disewa, revenue, rating)
 */
exports.getCarPerformance = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    
    let whereClause = '1=1';
    const params = [];

    if (year) {
      whereClause += ' AND YEAR(s.created_at) = ?';
      params.push(year);
    }
    
    if (month) {
      whereClause += ' AND MONTH(s.created_at) = ?';
      params.push(month);
    }

    const [carData] = await db.query(`
      SELECT 
        m.id,
        m.nama_mobil,
        m.plat_nomor,
        m.harga_per_hari,
        COUNT(s.id) as total_bookings,
        SUM(s.total_harga) as total_revenue,
        AVG(s.durasi_hari) as avg_rental_days,
        SUM(s.durasi_hari) as total_rental_days,
        MIN(s.created_at) as first_booking,
        MAX(s.created_at) as last_booking
      FROM mobil m
      LEFT JOIN sewa s ON m.id = s.mobil_id AND ${whereClause}
      GROUP BY m.id, m.nama_mobil, m.plat_nomor, m.harga_per_hari
      ORDER BY total_bookings DESC, total_revenue DESC
    `, params);

    res.json({
      success: true,
      data: carData
    });

  } catch (err) {
    console.error('Error getting car performance:', err);
    next(err);
  }
};

// Helper function
function getMonthName(month) {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[month - 1] || '';
}

/**
 * Get landing page stats (public - no auth required)
 * Stats untuk ditampilkan di landing page
 */
exports.getLandingPageStats = async (req, res, next) => {
  try {
    // 1. Total bookings yang sudah selesai
    const [totalBookingsData] = await db.query(`
      SELECT COUNT(*) as total
      FROM sewa
      WHERE status = 'selesai'
    `);

    // 2. Total mobil yang tersedia
    const [totalCarsData] = await db.query(`
      SELECT COUNT(*) as total
      FROM mobil
      WHERE status = 'tersedia'
    `);

    // 3. Total pelanggan unik (count distinct user_id dari sewa)
    const [totalCustomersData] = await db.query(`
      SELECT COUNT(DISTINCT user_id) as total
      FROM sewa
    `);

    const stats = {
      total_bookings: totalBookingsData[0]?.total || 0,
      total_cars: totalCarsData[0]?.total || 0,
      total_customers: totalCustomersData[0]?.total || 0,
      support_hours: '24/7',
      satisfaction_rate: 98 // Could be calculated from reviews/ratings if you have that feature
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching landing page stats:', error);
    next(error);
  }
};

module.exports = exports;
