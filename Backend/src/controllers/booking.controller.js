const db = require('../config/db');
const { sendBookingApprovedEmail } = require('../utils/email');

/**
 * INDIVIDUAL UNIT TRACKING WITH DATE-BASED AVAILABILITY:
 * - Each car record = 1 physical vehicle with unique plate number
 * - Availability checked based on date overlap, not just stok flag
 * - Multiple bookings allowed for same car on different dates
 * - stok field kept for backward compatibility (1 = generally available, 0 = currently rented)
 */

/**
 * Check if a car is available for specific date range
 * Returns true if car is available (no overlapping bookings)
 */
const checkCarAvailability = async (mobil_id, tanggal_mulai, tanggal_selesai, exclude_booking_id = null) => {
  try {
    let query = `
      SELECT id, order_number, tanggal_pinjam, tanggal_selesai, status
      FROM sewa 
      WHERE mobil_id = ? 
      AND status NOT IN ('dibatalkan', 'selesai')
      AND (
        (tanggal_pinjam <= ? AND tanggal_selesai >= ?) OR
        (tanggal_pinjam <= ? AND tanggal_selesai >= ?) OR
        (tanggal_pinjam >= ? AND tanggal_selesai <= ?)
      )
    `;
    
    const params = [
      mobil_id,
      tanggal_mulai, tanggal_mulai,
      tanggal_selesai, tanggal_selesai,
      tanggal_mulai, tanggal_selesai
    ];
    
    // Exclude specific booking (for updates)
    if (exclude_booking_id) {
      query += ' AND id != ?';
      params.push(exclude_booking_id);
    }
    
    const [overlappingBookings] = await db.query(query, params);
    
    if (overlappingBookings.length > 0) {
      console.log(`❌ Car ${mobil_id} NOT available: ${overlappingBookings.length} overlapping booking(s)`);
      console.log('Overlapping bookings:', overlappingBookings.map(b => 
        `${b.order_number} (${b.tanggal_pinjam} - ${b.tanggal_selesai})`
      ).join(', '));
      return false;
    }
    
    console.log(`✅ Car ${mobil_id} available for ${tanggal_mulai} - ${tanggal_selesai}`);
    return true;
  } catch (error) {
    console.error('Error checking car availability:', error);
    throw error;
  }
};

// Helper function to generate random order number
const generateRandomOrderNumber = async () => {
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `BKG-${code}`;
  };

  // Generate unique order_number (retry if collision)
  let order_number;
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    order_number = generateRandomCode();
    
    // Check if already exists
    const [existing] = await db.query(
      'SELECT id FROM sewa WHERE order_number = ?',
      [order_number]
    );
    
    if (existing.length === 0) {
      return order_number; // Unique, use it!
    }
    
    attempts++;
    console.log(`Order number collision, retrying... (${attempts}/${maxAttempts})`);
  }

  throw new Error('Failed to generate unique order number after multiple attempts');
};

exports.createBooking = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { 
      mobil_id, 
      tanggal_pinjam, 
      jam_pinjam,
      tanggal_selesai, 
      jam_selesai,
      jenis_layanan,
      catatan,
      // Data verifikasi KTP
      nama_ktp,
      nik,
      nik_ocr,
      foto_ktp
    } = req.body;

    // Get harga mobil
    const [mobil] = await db.query('SELECT harga_per_hari, stok FROM mobil WHERE id = ?', [mobil_id]);
    
    if (mobil.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mobil tidak ditemukan'
      });
    }

    // Check car availability using date-based overlap checking
    const isAvailable = await checkCarAvailability(mobil_id, tanggal_pinjam, tanggal_selesai);
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Mobil tidak tersedia untuk tanggal yang dipilih. Silakan pilih tanggal lain atau pilih mobil lain.'
      });
    }

    const harga_per_hari = mobil[0].harga_per_hari;

    // Calculate durasi hari
    const date1 = new Date(tanggal_pinjam);
    const date2 = new Date(tanggal_selesai);
    const durasi_hari = Math.ceil((date2 - date1) / (1000 * 60 * 60 * 24)) || 1;
    const total_harga = harga_per_hari * durasi_hari;

    // Insert/Update verifikasi KTP
    await db.query(
      `INSERT INTO verifikasi_ktp (user_id, nik_input, nik_ocr, foto_ktp, status)
       VALUES (?, ?, ?, ?, 'pending')
       ON DUPLICATE KEY UPDATE nik_input = ?, nik_ocr = ?, foto_ktp = ?, status = 'pending'`,
      [user_id, nik, nik_ocr, foto_ktp, nik, nik_ocr, foto_ktp]
    );

    // Generate random order number
    const order_number = await generateRandomOrderNumber();

    // Insert booking
    const [result] = await db.query(
      `INSERT INTO sewa
       (user_id, mobil_id, tanggal_pinjam, jam_pinjam, tanggal_selesai, jam_selesai, 
        jenis_layanan, harga_per_hari, durasi_hari, total_harga, catatan, order_number, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, mobil_id, tanggal_pinjam, jam_pinjam, tanggal_selesai, jam_selesai,
       jenis_layanan, harga_per_hari, durasi_hari, total_harga, catatan, order_number, 'menunggu_pembayaran']
    );

    // Mark car as booked (set stok to 0)
    await db.query('UPDATE mobil SET stok = stok - 1 WHERE id = ?', [mobil_id]);

    res.status(201).json({
      success: true,
      message: 'Booking berhasil, silakan lakukan pembayaran',
      data: {
        booking_id: result.insertId,
        order_number: order_number,
        durasi_hari: durasi_hari,
        total_harga: total_harga,
        status: 'menunggu_pembayaran'
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    // Get user's email
    const [userRows] = await db.query('SELECT email FROM users WHERE id = ?', [user_id]);
    const userEmail = userRows[0]?.email;

    // Get bookings where user_id matches OR email matches (for guest bookings)
    const [rows] = await db.query(`
      SELECT 
        s.*,
        m.nama_mobil,
        m.plat_nomor,
        m.jenis_transmisi
      FROM sewa s
      JOIN mobil m ON s.mobil_id = m.id
      WHERE s.user_id = ? OR (s.user_id IS NULL AND s.email = ?)
      ORDER BY s.created_at DESC
    `, [user_id, userEmail]);

    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.*,
        COALESCE(s.nama_customer, u.nama) as nama_customer,
        COALESCE(s.email, u.email) as email,
        COALESCE(s.no_hp, u.no_hp) as no_hp,
        m.nama_mobil,
        m.plat_nomor
      FROM sewa s
      LEFT JOIN users u ON s.user_id = u.id
      JOIN mobil m ON s.mobil_id = m.id
      ORDER BY s.created_at DESC
    `);

    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    next(err);
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`
      SELECT 
        s.*,
        COALESCE(s.nama_customer, u.nama) as nama_customer,
        COALESCE(s.email, u.email) as email,
        COALESCE(s.no_hp, u.no_hp) as no_hp,
        m.nama_mobil,
        m.plat_nomor,
        m.kapasitas_penumpang,
        m.jenis_transmisi
      FROM sewa s
      LEFT JOIN users u ON s.user_id = u.id
      JOIN mobil m ON s.mobil_id = m.id
      WHERE s.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    next(err);
  }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Get booking info untuk ambil mobil_id dan status lama
    const [booking] = await db.query('SELECT mobil_id, status FROM sewa WHERE id = ?', [id]);
    
    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking tidak ditemukan'
      });
    }

    const oldStatus = booking[0].status;
    const mobil_id = booking[0].mobil_id;

    // Update status booking
    const [result] = await db.query(
      'UPDATE sewa SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking tidak ditemukan'
      });
    }

    // Return car availability (set stok back to 1) if status changed to completed/cancelled
    // AND previous status was neither completed nor cancelled (avoid double return)
    if ((status === 'selesai' || status === 'dibatalkan') && 
        (oldStatus !== 'selesai' && oldStatus !== 'dibatalkan')) {
      await db.query('UPDATE mobil SET stok = stok + 1 WHERE id = ?', [mobil_id]);
      console.log(`✅ Mobil ID ${mobil_id} tersedia kembali (status: ${oldStatus} → ${status})`);
    }


    // Jika status booking disetujui admin (misal: 'disetujui' atau 'confirmed'), kirim email notifikasi ke user
    if ((status === 'disetujui' || status === 'confirmed') && oldStatus !== status) {
      // Ambil data booking lengkap (termasuk email user)
      const [rows] = await db.query(`
        SELECT s.*, COALESCE(s.nama_customer, u.nama) as nama_customer, COALESCE(s.email, u.email) as email_user, m.nama_mobil
        FROM sewa s
        LEFT JOIN users u ON s.user_id = u.id
        JOIN mobil m ON s.mobil_id = m.id
        WHERE s.id = ?
      `, [id]);
      if (rows.length > 0) {
        const booking = rows[0];
        try {
          await sendBookingApprovedEmail(
            booking.email_user,
            booking.nama_customer,
            booking.nama_mobil,
            booking.tanggal_pinjam,
            booking.tanggal_selesai
          );
        } catch (e) {
          console.error('Gagal mengirim email notifikasi booking disetujui:', e);
        }
      }
      return res.json({
        success: true,
        message: 'Booking Anda telah disetujui oleh admin! Silakan cek email Anda.',
        status: status
      });
    }

    res.json({
      success: true,
      message: 'Status booking berhasil diupdate',
      status: status
    });
  } catch (err) {
    next(err);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Get booking info
    const [booking] = await db.query(
      'SELECT * FROM sewa WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking tidak ditemukan'
      });
    }

    if (booking[0].status !== 'menunggu_pembayaran') {
      return res.status(400).json({
        success: false,
        message: 'Booking tidak bisa dibatalkan'
      });
    }

    // Update status
    await db.query('UPDATE sewa SET status = ? WHERE id = ?', 
      ['dibatalkan', id]);

    // Return car availability (set stok back to 1)
    await db.query('UPDATE mobil SET stok = stok + 1 WHERE id = ?',
       [booking[0].mobil_id]);

    res.json({
      success: true,
      message: 'Booking berhasil dibatalkan'
    });
  } catch (err) {
    next(err);
  }
};

// Guest Booking (tanpa login)
exports.createGuestBooking = async (req, res, next) => {
  try {
    console.log('=== GUEST BOOKING REQUEST ===');
    console.log('Body:', req.body);
    
    const { 
      // Optional user_id (for logged-in users)
      user_id,
      // Data customer
      nama_customer,
      email,
      no_hp,
      // Data KTP
      nama_ktp,
      nik,
      foto_ktp,
      // Data mobil & sewa
      mobil_id, 
      tanggal_mulai, 
      tanggal_selesai,
      dengan_driver,
      catatan_sewa,
      catatan_pembayaran
    } = req.body;

    // Validasi required fields
    if (!nama_customer || !email || !no_hp || !nama_ktp || !nik || !mobil_id || !tanggal_mulai || !tanggal_selesai) {
      console.log('Validasi gagal - data tidak lengkap');
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap',
        missing: {
          nama_customer: !nama_customer,
          email: !email,
          no_hp: !no_hp,
          nama_ktp: !nama_ktp,
          nik: !nik,
          mobil_id: !mobil_id,
          tanggal_mulai: !tanggal_mulai,
          tanggal_selesai: !tanggal_selesai
        }
      });
    }

    // Validasi nama hanya boleh huruf dan spasi
    const namaRegex = /^[a-zA-Z\s]+$/;
    if (!namaRegex.test(nama_customer)) {
      return res.status(400).json({
        success: false,
        message: 'Nama customer hanya boleh berisi huruf dan spasi'
      });
    }
    if (!namaRegex.test(nama_ktp)) {
      return res.status(400).json({
        success: false,
        message: 'Nama KTP hanya boleh berisi huruf dan spasi'
      });
    }

    // Get harga mobil
    const [mobil] = await db.query('SELECT harga_per_hari, stok, nama_mobil FROM mobil WHERE id = ?', [mobil_id]);
    
    if (mobil.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mobil tidak ditemukan'
      });
    }

    // Check car availability using date-based overlap checking
    const isAvailable = await checkCarAvailability(mobil_id, tanggal_mulai, tanggal_selesai);
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Mobil tidak tersedia untuk tanggal yang dipilih. Silakan pilih tanggal lain atau pilih mobil lain.'
      });
    }

    const harga_per_hari = mobil[0].harga_per_hari;

    // Calculate durasi hari
    const date1 = new Date(tanggal_mulai);
    const date2 = new Date(tanggal_selesai);
    const durasi_hari = Math.ceil((date2 - date1) / (1000 * 60 * 60 * 24)) || 1;
    
    // Calculate biaya driver (50000 jika dengan driver)
    const biaya_driver = dengan_driver === 'ya' ? 50000 : 0;
    
    // Total harga = (harga_per_hari * durasi) + biaya_driver
    const total_harga = (harga_per_hari * durasi_hari) + biaya_driver;

    console.log('Data yang akan diinsert:', {
      mobil_id, nama_customer, email, no_hp, nama_ktp, nik, foto_ktp,
      tanggal_mulai, tanggal_selesai, dengan_driver, biaya_driver,
      harga_per_hari, durasi_hari, total_harga, catatan_sewa
    });

    // Generate random order number
    const order_number = await generateRandomOrderNumber();
    console.log('Order number generated:', order_number);

    // Insert booking ke table sewa (dengan user_id jika user sudah login)
    // Status awal: 'menunggu_pembayaran' - user harus bayar dulu via Midtrans
    const [result] = await db.query(
      `INSERT INTO sewa
       (user_id, mobil_id, nama_customer, email, no_hp, nama_ktp, nik, foto_ktp,
        tanggal_pinjam, tanggal_selesai, dengan_driver, biaya_driver,
        harga_per_hari, durasi_hari, total_harga,
        catatan, order_number, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id || null, mobil_id, nama_customer, email, no_hp, nama_ktp, nik, foto_ktp,
        tanggal_mulai, tanggal_selesai, dengan_driver, biaya_driver,
        harga_per_hari, durasi_hari, total_harga,
        catatan_sewa, order_number, 'menunggu_pembayaran'
      ]
    );

    console.log('Insert berhasil, booking_id:', result.insertId);

    // NOTE: Car is NOT marked as booked yet (stok stays at 1)
    // Car will be marked as booked (stok = 0) after payment success (via Midtrans webhook)

    console.log('Booking berhasil dibuat, status: menunggu_pembayaran');

    res.status(201).json({
      success: true,
      message: 'Booking berhasil dibuat, silakan lanjutkan pembayaran',
      data: {
        booking_id: result.insertId,
        order_number: order_number,
        nama_mobil: mobil[0].nama_mobil,
        durasi_hari: durasi_hari,
        biaya_driver: biaya_driver,
        total_harga: total_harga,
        status: 'menunggu_pembayaran'
      }
    });
  } catch (err) {
    console.error('=== ERROR CREATING GUEST BOOKING ===');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Error code:', err.code);
    console.error('SQL Message:', err.sqlMessage);
    next(err);
  }
};

// Search booking by order_number (e.g., BKG0001)
exports.searchBookingByOrderNumber = async (req, res, next) => {
  try {
    const { order_number } = req.params;

    const [rows] = await db.query(`
      SELECT 
        s.*,
        COALESCE(s.nama_customer, u.nama) as nama_customer,
        COALESCE(s.email, u.email) as email,
        COALESCE(s.no_hp, u.no_hp) as no_hp,
        m.nama_mobil,
        m.plat_nomor,
        m.kapasitas_penumpang,
        m.jenis_transmisi,
        m.harga_per_hari
      FROM sewa s
      LEFT JOIN users u ON s.user_id = u.id
      JOIN mobil m ON s.mobil_id = m.id
      WHERE s.order_number = ?
    `, [order_number]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Check if a specific car is available for given date range
 * GET /api/bookings/check-availability/:mobil_id?start_date=2026-03-10&end_date=2026-03-15
 */
exports.checkAvailability = async (req, res, next) => {
  try {
    const { mobil_id } = req.params;
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'start_date dan end_date harus diisi'
      });
    }
    
    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal mulai tidak boleh di masa lalu'
      });
    }
    
    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal selesai harus setelah tanggal mulai'
      });
    }
    
    // Check if car exists
    const [mobil] = await db.query('SELECT id, nama_mobil, plat_nomor FROM mobil WHERE id = ?', [mobil_id]);
    if (mobil.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mobil tidak ditemukan'
      });
    }
    
    const isAvailable = await checkCarAvailability(mobil_id, start_date, end_date);
    
    res.json({
      success: true,
      data: {
        mobil_id: parseInt(mobil_id),
        nama_mobil: mobil[0].nama_mobil,
        plat_nomor: mobil[0].plat_nomor,
        start_date,
        end_date,
        available: isAvailable
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get blocked dates for a specific car
 * GET /api/bookings/blocked-dates/:mobil_id
 * Returns list of date ranges that are unavailable for booking
 */
exports.getBlockedDates = async (req, res, next) => {
  try {
    const { mobil_id } = req.params;
    
    // Check if car exists
    const [mobil] = await db.query('SELECT id, nama_mobil, plat_nomor FROM mobil WHERE id = ?', [mobil_id]);
    if (mobil.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mobil tidak ditemukan'
      });
    }
    
    // Get all bookings for this car (except rejected and cancelled)
    const [bookings] = await db.query(`
      SELECT 
        id,
        order_number,
        tanggal_pinjam,
        tanggal_selesai,
        status
      FROM sewa 
      WHERE mobil_id = ? 
        AND status NOT IN ('dibatalkan', 'ditolak')
        AND tanggal_selesai >= CURDATE()
      ORDER BY tanggal_pinjam ASC
    `, [mobil_id]);
    
    // Format the blocked dates
    const blockedDates = bookings.map(booking => ({
      booking_id: booking.id,
      order_number: booking.order_number,
      start_date: booking.tanggal_pinjam,
      end_date: booking.tanggal_selesai,
      status: booking.status
    }));
    
    res.json({
      success: true,
      data: {
        mobil_id: parseInt(mobil_id),
        nama_mobil: mobil[0].nama_mobil,
        plat_nomor: mobil[0].plat_nomor,
        blocked_dates: blockedDates,
        count: blockedDates.length
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all available cars for given date range
 * GET /api/bookings/available-cars?start_date=2026-03-10&end_date=2026-03-15
 */
exports.getAvailableCars = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'start_date dan end_date harus diisi'
      });
    }
    
    // Get all cars
    const [allCars] = await db.query('SELECT * FROM mobil WHERE status = "tersedia"');
    
    // Check availability for each car
    const availableCars = [];
    for (const car of allCars) {
      const isAvailable = await checkCarAvailability(car.id, start_date, end_date);
      if (isAvailable) {
        availableCars.push({
          ...car,
          available: true
        });
      }
    }
    
    res.json({
      success: true,
      data: availableCars,
      count: availableCars.length,
      filter: {
        start_date,
        end_date
      }
    });
  } catch (err) {
    next(err);
  }
};
