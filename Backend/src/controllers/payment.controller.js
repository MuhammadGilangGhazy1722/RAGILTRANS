const db = require('../config/db');
const { snap, core } = require('../config/midtrans');
const crypto = require('crypto');

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

// ============ MIDTRANS PAYMENT GATEWAY - CORE API ============

/**
 * Create Midtrans transaction dengan Core API (Bank Transfer/VA)
 */
exports.createMidtransTransaction = async (req, res, next) => {
  try {
    const { booking_id, bank } = req.body; // bank: 'bca', 'mandiri', 'bni', 'bri', 'cimb'

    // Get booking detail
    const [booking] = await db.query(`
      SELECT s.*, m.nama_mobil 
      FROM sewa s
      JOIN mobil m ON s.mobil_id = m.id
      WHERE s.id = ?
    `, [booking_id]);

    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking tidak ditemukan'
      });
    }

    const bookingData = booking[0];

    // Cek apakah sudah dibayar
    if (bookingData.status === 'lunas' || bookingData.payment_status === 'settlement') {
      return res.status(400).json({
        success: false,
        message: 'Booking ini sudah dibayar'
      });
    }

    // Generate order_id unik
    const order_id = `BOOKING-${booking_id}-${Date.now()}`;

    // Parameter untuk Midtrans Core API
    const parameter = {
      payment_type: 'bank_transfer',
      transaction_details: {
        order_id: order_id,
        gross_amount: Math.round(bookingData.total_harga), // Midtrans butuh integer
      },
      customer_details: {
        first_name: bookingData.nama_customer,
        email: bookingData.email,
        phone: bookingData.no_hp,
      },
      item_details: [
        {
          id: `mobil-${bookingData.mobil_id}`,
          price: Math.round(bookingData.harga_per_hari),
          quantity: bookingData.durasi_hari,
          name: `Sewa ${bookingData.nama_mobil} (${bookingData.durasi_hari} hari)`,
        }
      ],
    };

    // Tambahkan biaya driver ke item_details jika ada
    if (bookingData.biaya_driver > 0) {
      parameter.item_details.push({
        id: 'biaya-driver',
        price: Math.round(bookingData.biaya_driver),
        quantity: 1,
        name: 'Biaya Driver',
      });
    }

    // Set bank_transfer berdasarkan bank yang dipilih
    const bankLower = (bank || 'bca').toLowerCase();
    if (bankLower === 'bca') {
      parameter.bank_transfer = { bank: 'bca' };
    } else if (bankLower === 'mandiri') {
      // Mandiri menggunakan echannel dengan format berbeda
      parameter.payment_type = 'echannel';
      parameter.echannel = {
        bill_info1: 'Payment for:',
        bill_info2: `Sewa ${bookingData.nama_mobil}`
      };
      delete parameter.bank_transfer; // Hapus bank_transfer untuk echannel
    } else if (bankLower === 'bni') {
      parameter.bank_transfer = { bank: 'bni' };
    } else if (bankLower === 'bri') {
      parameter.bank_transfer = { bank: 'bri' };
    } else if (bankLower === 'bsi') {
      // BSI belum fully supported di Midtrans, fallback ke BCA
      parameter.bank_transfer = { bank: 'bca' };
    } else if (bankLower === 'cimb') {
      parameter.bank_transfer = { bank: 'cimb' };
    } else {
      // Default ke BCA
      parameter.bank_transfer = { bank: 'bca' };
    }

    console.log('Creating Midtrans Core API transaction:', parameter);

    // Check if Midtrans keys are configured
    if (!process.env.MIDTRANS_SERVER_KEY || process.env.MIDTRANS_SERVER_KEY.includes('YOUR_')) {
      console.warn('⚠️  Midtrans keys not configured. Returning mock data for testing.');
      
      // Return mock data untuk testing tanpa API keys
      const mockVaNumber = `8127${Date.now().toString().slice(-12)}`; // Mock VA number
      const mockTransactionId = `TEST-${Date.now()}`;
      
      // Update booking dengan mock data
      await db.query(
        `UPDATE sewa 
         SET midtrans_order_id = ?, 
             midtrans_transaction_id = ?,
             payment_status = 'pending',
             payment_method = 'bank_transfer',
             payment_bank = ?
         WHERE id = ?`,
        [order_id, mockTransactionId, bank.toLowerCase(), booking_id]
      );

      return res.json({
        success: true,
        message: '⚠️  TESTING MODE: Mock VA created (configure Midtrans keys for real VA)',
        data: {
          order_id: order_id,
          transaction_id: mockTransactionId,
          transaction_status: 'pending',
          payment_type: 'bank_transfer',
          va_number: mockVaNumber,
          bill_key: null,
          biller_code: null,
          bank: bank,
          gross_amount: Math.round(bookingData.total_harga),
          transaction_time: new Date().toISOString(),
          expiry_time: new Date(Date.now() + 24*60*60*1000).toISOString(), // 24 hours from now
          _testing: true, // Flag untuk frontend tahu ini mock data
          _instruction: 'Use webhook endpoint with this order_id to simulate payment'
        }
      });
    }

    // Create transaction di Midtrans Core API
    const transaction = await core.charge(parameter);

    console.log('Midtrans Core API response:', transaction);

    // Extract VA number atau bill key tergantung payment type
    let vaNumber = null;
    let billKey = null;
    let billerCode = null;

    if (transaction.va_numbers && transaction.va_numbers.length > 0) {
      vaNumber = transaction.va_numbers[0].va_number;
    } else if (transaction.bill_key) {
      // Untuk Mandiri echannel
      billKey = transaction.bill_key;
      billerCode = transaction.biller_code;
    }

    // Update booking dengan order_id dan transaction info
    await db.query(
      `UPDATE sewa 
       SET midtrans_order_id = ?, 
           midtrans_transaction_id = ?,
           payment_status = 'pending',
           payment_method = ?,
           payment_bank = ?
       WHERE id = ?`,
      [order_id, transaction.transaction_id, transaction.payment_type, bank.toLowerCase(), booking_id]
    );

    res.json({
      success: true,
      message: 'Transaksi berhasil dibuat',
      data: {
        order_id: order_id,
        transaction_id: transaction.transaction_id,
        transaction_status: transaction.transaction_status,
        payment_type: transaction.payment_type,
        va_number: vaNumber,
        bill_key: billKey,
        biller_code: billerCode,
        bank: bank,
        gross_amount: transaction.gross_amount,
        transaction_time: transaction.transaction_time,
        expiry_time: transaction.expiry_time || null
      }
    });

  } catch (err) {
    console.error('Error creating Midtrans transaction:', err);
    next(err);
  }
};

/**
 * Webhook handler untuk notifikasi dari Midtrans
 */
exports.handleMidtransNotification = async (req, res, next) => {
  try {
    console.log('=== MIDTRANS NOTIFICATION ===');
    console.log('Body:', req.body);

    const { order_id, transaction_status, fraud_status, gross_amount, payment_type, transaction_id } = req.body;

    // Verifikasi signature hash (keamanan)
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    
    // Skip signature verification in development mode for manual testing
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  DEVELOPMENT MODE: Skipping signature verification for testing');
    } else if (!serverKey || serverKey.includes('YOUR_')) {
      console.log('⚠️  WARNING: Midtrans keys not configured, skipping signature');
    } else {
      // Production mode - verify signature
      const hash = crypto.createHash('sha512')
        .update(`${order_id}${transaction_status}${gross_amount}${serverKey}`)
        .digest('hex');

      if (hash !== req.body.signature_key) {
        console.error('Invalid signature!');
        return res.status(403).json({
          success: false,
          message: 'Invalid signature'
        });
      }
    }

    // Get booking berdasarkan order_id
    const [booking] = await db.query(
      'SELECT * FROM sewa WHERE midtrans_order_id = ?',
      [order_id]
    );

    if (booking.length === 0) {
      console.error('Booking not found for order_id:', order_id);
      return res.status(404).json({
        success: false,
        message: 'Booking tidak ditemukan'
      });
    }

    const bookingData = booking[0];
    let newStatus = bookingData.status;
    let paymentStatus = transaction_status;

    // Update status berdasarkan transaction_status dari Midtrans
    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') {
        // Pembayaran berhasil
        newStatus = 'menunggu_persetujuan';
        paymentStatus = 'settlement';
        
        // Mark car as booked (set stok to 0)
        await db.query('UPDATE mobil SET stok = stok - 1 WHERE id = ?', [bookingData.mobil_id]);
        console.log(`✅ Mobil ID ${bookingData.mobil_id} ditandai sebagai disewa (payment success)`);
      }
    } else if (transaction_status === 'settlement') {
      // Pembayaran berhasil (untuk metode non-card)
      newStatus = 'menunggu_persetujuan';
      
      // Mark car as booked (set stok to 0) if not already done
      if (bookingData.status === 'menunggu_pembayaran') {
        await db.query('UPDATE mobil SET stok = stok - 1 WHERE id = ?', [bookingData.mobil_id]);
        console.log(`✅ Mobil ID ${bookingData.mobil_id} ditandai sebagai disewa (payment settlement)`);
      }
    } else if (transaction_status === 'pending') {
      // Pembayaran pending (menunggu user bayar)
      newStatus = 'menunggu_pembayaran';
    } else if (transaction_status === 'deny' || transaction_status === 'expire' || transaction_status === 'cancel') {
      // Pembayaran gagal/expire/dibatalkan
      newStatus = 'dibatalkan';
      paymentStatus = 'failed';
    }

    // Update booking
    await db.query(
      `UPDATE sewa 
       SET status = ?,
           payment_status = ?,
           payment_method = ?,
           midtrans_transaction_id = ?
       WHERE id = ?`,
      [newStatus, paymentStatus, payment_type, transaction_id, bookingData.id]
    );

    console.log(`✅ Booking ${bookingData.id} updated: status=${newStatus}, payment_status=${paymentStatus}`);

    res.json({
      success: true,
      message: 'Notification berhasil diproses'
    });

  } catch (err) {
    console.error('Error handling Midtrans notification:', err);
    next(err);
  }
};

/**
 * Cek status transaksi dari Midtrans
 */
exports.checkMidtransStatus = async (req, res, next) => {
  try {
    const { order_id } = req.params;

    // Get status dari Midtrans
    const status = await core.transaction.status(order_id);

    console.log('Transaction status from Midtrans:', status);

    res.json({
      success: true,
      data: status
    });

  } catch (err) {
    console.error('Error checking transaction status:', err);
    next(err);
  }
};

/**
 * Manual sync - Check dan update status dari Midtrans
 * Untuk sandbox testing karena webhook tidak bisa reach localhost
 */
exports.syncPaymentStatus = async (req, res, next) => {
  try {
    const { order_id } = req.params;

    console.log('=== MANUAL SYNC PAYMENT STATUS ===');
    console.log('Order ID:', order_id);

    // Get booking dari database
    const [booking] = await db.query(
      'SELECT * FROM sewa WHERE midtrans_order_id = ?',
      [order_id]
    );

    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking tidak ditemukan'
      });
    }

    const bookingData = booking[0];

    // Get status dari Midtrans
    const midtransStatus = await core.transaction.status(order_id);
    console.log('Status dari Midtrans:', midtransStatus);

    const { transaction_status, fraud_status, payment_type, transaction_id } = midtransStatus;

    let newStatus = bookingData.status;
    let paymentStatus = transaction_status;

    // Update status berdasarkan transaction_status dari Midtrans
    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') {
        newStatus = 'menunggu_persetujuan';
        paymentStatus = 'settlement';
        
        // Mark car as booked if not already done
        if (bookingData.status === 'menunggu_pembayaran') {
          await db.query('UPDATE mobil SET stok = stok - 1 WHERE id = ?', [bookingData.mobil_id]);
          console.log(`✅ Mobil ID ${bookingData.mobil_id} stok dikurangi`);
        }
      }
    } else if (transaction_status === 'settlement') {
      newStatus = 'menunggu_persetujuan';
      
      // Mark car as booked if not already done
      if (bookingData.status === 'menunggu_pembayaran') {
        await db.query('UPDATE mobil SET stok = stok - 1 WHERE id = ?', [bookingData.mobil_id]);
        console.log(`✅ Mobil ID ${bookingData.mobil_id} stok dikurangi`);
      }
    } else if (transaction_status === 'pending') {
      newStatus = 'menunggu_pembayaran';
    } else if (transaction_status === 'deny' || transaction_status === 'expire' || transaction_status === 'cancel') {
      newStatus = 'dibatalkan';
      paymentStatus = 'failed';
    }

    // Update booking
    await db.query(
      `UPDATE sewa 
       SET status = ?,
           payment_status = ?,
           payment_method = ?,
           midtrans_transaction_id = ?
       WHERE id = ?`,
      [newStatus, paymentStatus, payment_type, transaction_id, bookingData.id]
    );

    console.log(`✅ Booking ${bookingData.id} updated: status=${newStatus}, payment_status=${paymentStatus}`);

    // Get updated booking
    const [updatedBooking] = await db.query(
      `SELECT s.*, m.nama_mobil, u.nama as user_name
       FROM sewa s
       JOIN mobil m ON s.mobil_id = m.id
       JOIN users u ON s.user_id = u.id
       WHERE s.id = ?`,
      [bookingData.id]
    );

    res.json({
      success: true,
      message: 'Status berhasil disinkronkan dari Midtrans',
      data: updatedBooking[0]
    });

  } catch (err) {
    console.error('Error syncing payment status:', err);
    next(err);
  }
};
