const db = require('../config/db');

// User submit payment
exports.createPayment = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { 
      sewa_id, 
      rekening_admin_id, 
      metode, 
      bank_pengirim, 
      nama_pengirim, 
      jumlah_bayar, 
      bukti_transfer, 
      catatan 
    } = req.body;

    // Cek apakah sewa milik user ini
    const [sewa] = await db.query(`
      SELECT s.*, m.nama_mobil, m.harga_per_hari, u.nama, u.email, u.no_hp
      FROM sewa s
      JOIN mobil m ON s.mobil_id = m.id
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ? AND s.user_id = ?
    `, [sewa_id, user_id]);
    
    if (sewa.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking tidak ditemukan'
      });
    }

    // Insert pembayaran
    const [result] = await db.query(
      `INSERT INTO pembayaran 
       (sewa_id, rekening_admin_id, metode, bank_pengirim, nama_pengirim, jumlah_bayar, bukti_transfer, catatan, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sewa_id, rekening_admin_id, metode, bank_pengirim, nama_pengirim, jumlah_bayar, bukti_transfer, catatan, 'pending']
    );

    // Get rekening admin info
    const [rekening] = await db.query(
      'SELECT nama_bank, no_rekening, atas_nama FROM rekening_admin WHERE id = ?',
      [rekening_admin_id]
    );

    // Return detail lengkap untuk ditampilkan (invoice style)
    res.status(201).json({
      success: true,
      message: 'Pembayaran Berhasil Dibuat',
      data: {
        invoice_number: `INV-${result.insertId.toString().padStart(6, '0')}`,
        payment_id: result.insertId,
        status: 'pending',
        created_at: new Date().toISOString(),
        booking_info: {
          booking_id: sewa_id,
          mobil: sewa[0].nama_mobil,
          tanggal_pinjam: sewa[0].tanggal_pinjam,
          tanggal_selesai: sewa[0].tanggal_selesai,
          alamat_sewa: sewa[0].alamat_sewa,
          harga_per_hari: sewa[0].harga_per_hari
        },
        customer_info: {
          nama: sewa[0].nama,
          email: sewa[0].email,
          no_hp: sewa[0].no_hp
        },
        payment_info: {
          metode: metode,
          bank_pengirim: bank_pengirim,
          nama_pengirim: nama_pengirim,
          jumlah_bayar: jumlah_bayar,
          catatan: catatan
        },
        rekening_tujuan: rekening.length > 0 ? {
          nama_bank: rekening[0].nama_bank,
          no_rekening: rekening[0].no_rekening,
          atas_nama: rekening[0].atas_nama
        } : null
      }
    });
  } catch (err) {
    next(err);
  }
};

// Admin get all payments
exports.getAllPayments = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.*,
        s.tanggal_pinjam,
        s.tanggal_selesai,
        u.nama as nama_user,
        u.email,
        m.nama_mobil,
        ra.nama_bank as nama_bank_tujuan,
        ra.no_rekening as no_rekening_tujuan,
        ra.atas_nama as atas_nama_tujuan
      FROM pembayaran p
      JOIN sewa s ON p.sewa_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN mobil m ON s.mobil_id = m.id
      LEFT JOIN rekening_admin ra ON p.rekening_admin_id = ra.id
      ORDER BY p.created_at DESC
    `);

    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    next(err);
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`
      SELECT 
        p.*,
        s.tanggal_pinjam,
        s.tanggal_selesai,
        s.alamat_sewa,
        u.nama as nama_user,
        u.email,
        u.no_hp,
        m.nama_mobil,
        m.plat_nomor,
        ra.nama_bank as nama_bank_tujuan,
        ra.no_rekening as no_rekening_tujuan,
        ra.atas_nama as atas_nama_tujuan
      FROM pembayaran p
      JOIN sewa s ON p.sewa_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN mobil m ON s.mobil_id = m.id
      LEFT JOIN rekening_admin ra ON p.rekening_admin_id = ra.id
      WHERE p.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pembayaran tidak ditemukan'
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

// Admin update payment status
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' atau 'rejected'

    const [result] = await db.query(
      'UPDATE pembayaran SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pembayaran tidak ditemukan'
      });
    }

    // Jika approved, update status sewa
    if (status === 'approved') {
      const [payment] = await db.query('SELECT sewa_id FROM pembayaran WHERE id = ?', [id]);
      if (payment.length > 0) {
        await db.query('UPDATE sewa SET status = ? WHERE id = ?', ['aktif', payment[0].sewa_id]);
      }
    }

    res.json({
      success: true,
      message: `Pembayaran ${status === 'approved' ? 'disetujui' : 'ditolak'}`
    });
  } catch (err) {
    next(err);
  }
};

// User get payment by booking/sewa ID
exports.getPaymentByBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const user_id = req.user.id;

    const [rows] = await db.query(`
      SELECT 
        p.*,
        ra.nama_bank as nama_bank_tujuan,
        ra.no_rekening as no_rekening_tujuan,
        ra.atas_nama as atas_nama_tujuan
      FROM pembayaran p
      JOIN sewa s ON p.sewa_id = s.id
      LEFT JOIN rekening_admin ra ON p.rekening_admin_id = ra.id
      WHERE p.sewa_id = ? AND s.user_id = ?
    `, [bookingId, user_id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pembayaran tidak ditemukan'
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
