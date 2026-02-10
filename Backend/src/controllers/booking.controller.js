const db = require('../config/db');

exports.createBooking = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { 
      mobil_id, 
      tanggal_pinjam, 
      jam_pinjam,
      tanggal_selesai, 
      jam_selesai,
      alamat_sewa,
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

    if (mobil[0].stok <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Mobil tidak tersedia'
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

    // Insert booking
    const [result] = await db.query(
      `INSERT INTO sewa
       (user_id, mobil_id, tanggal_pinjam, jam_pinjam, tanggal_selesai, jam_selesai, 
        alamat_sewa, jenis_layanan, harga_per_hari, durasi_hari, total_harga, catatan, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, mobil_id, tanggal_pinjam, jam_pinjam, tanggal_selesai, jam_selesai,
       alamat_sewa, jenis_layanan, harga_per_hari, durasi_hari, total_harga, catatan, 'menunggu_pembayaran']
    );

    // Kurangi stok mobil
    await db.query('UPDATE mobil SET stok = stok - 1 WHERE id = ?', [mobil_id]);

    res.status(201).json({
      success: true,
      message: 'Booking berhasil, silakan lakukan pembayaran',
      data: {
        booking_id: result.insertId,
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

    const [rows] = await db.query(`
      SELECT 
        s.*,
        m.nama_mobil,
        m.plat_nomor,
        m.jenis_transmisi
      FROM sewa s
      JOIN mobil m ON s.mobil_id = m.id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
    `, [user_id]);

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
        u.nama as nama_customer,
        u.email,
        u.no_hp,
        m.nama_mobil,
        m.plat_nomor
      FROM sewa s
      JOIN users u ON s.user_id = u.id
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
        u.nama as nama_customer,
        u.email,
        u.no_hp,
        m.nama_mobil,
        m.plat_nomor,
        m.kapasitas_penumpang,
        m.jenis_transmisi
      FROM sewa s
      JOIN users u ON s.user_id = u.id
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

    res.json({
      success: true,
      message: 'Status booking berhasil diupdate'
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

    // Kembalikan stok mobil
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
