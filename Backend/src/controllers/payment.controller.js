const supabase = require('../config/db');
const { snap, core } = require('../config/midtrans');
const crypto = require('crypto');

exports.createPayment = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { sewa_id, rekening_admin_id, metode, bank_pengirim, nama_pengirim, jumlah_bayar, bukti_transfer, catatan } = req.body;

    const { data: sewa, error: sewaError } = await supabase.from('sewa').select('*, mobil(nama_mobil, harga_per_hari), users(nama, email, no_hp)').eq('id', sewa_id).eq('user_id', user_id).single();
    if (sewaError || !sewa) return res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });

    const { data: result, error } = await supabase.from('pembayaran').insert([{ sewa_id, rekening_admin_id, metode, bank_pengirim, nama_pengirim, jumlah_bayar, bukti_transfer, catatan, status: 'pending' }]).select().single();
    if (error) throw error;

    const { data: rekening } = await supabase.from('rekening_admin').select('nama_bank, no_rekening, atas_nama').eq('id', rekening_admin_id).single();

    res.status(201).json({ success: true, message: 'Pembayaran Berhasil Dibuat', data: {
      invoice_number: `INV-${result.id.toString().padStart(6, '0')}`,
      payment_id: result.id, status: 'pending', created_at: new Date().toISOString(),
      booking_info: { booking_id: sewa_id, mobil: sewa.mobil?.nama_mobil, tanggal_pinjam: sewa.tanggal_pinjam, tanggal_selesai: sewa.tanggal_selesai, harga_per_hari: sewa.mobil?.harga_per_hari },
      customer_info: { nama: sewa.users?.nama, email: sewa.users?.email, no_hp: sewa.users?.no_hp },
      payment_info: { metode, bank_pengirim, nama_pengirim, jumlah_bayar, catatan },
      rekening_tujuan: rekening || null
    }});
  } catch (err) { next(err); }
};

exports.getAllPayments = async (req, res, next) => {
  try {
    const { data: rows, error } = await supabase.from('pembayaran').select('*, sewa(tanggal_pinjam, tanggal_selesai, users(nama, email), mobil(nama_mobil)), rekening_admin(nama_bank, no_rekening, atas_nama)').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

exports.getPaymentById = async (req, res, next) => {
  try {
    const { data: row, error } = await supabase.from('pembayaran').select('*, sewa(tanggal_pinjam, tanggal_selesai, users(nama, email, no_hp), mobil(nama_mobil, plat_nomor)), rekening_admin(nama_bank, no_rekening, atas_nama)').eq('id', req.params.id).single();
    if (error || !row) return res.status(404).json({ success: false, message: 'Pembayaran tidak ditemukan' });
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
};

exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase.from('pembayaran').update({ status }).eq('id', id).select().single();
    if (error || !data) return res.status(404).json({ success: false, message: 'Pembayaran tidak ditemukan' });

    if (status === 'approved') {
      await supabase.from('sewa').update({ status: 'aktif' }).eq('id', data.sewa_id);
    }

    res.json({ success: true, message: `Pembayaran ${status === 'approved' ? 'disetujui' : 'ditolak'}` });
  } catch (err) { next(err); }
};

exports.getPaymentByBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const user_id = req.user.id;

    const { data: row, error } = await supabase.from('pembayaran').select('*, rekening_admin(nama_bank, no_rekening, atas_nama), sewa!inner(user_id)').eq('sewa_id', bookingId).eq('sewa.user_id', user_id).single();
    if (error || !row) return res.status(404).json({ success: false, message: 'Pembayaran tidak ditemukan' });
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
};

exports.createMidtransTransaction = async (req, res, next) => {
  try {
    const { booking_id, bank } = req.body;

    const { data: booking, error } = await supabase.from('sewa').select('*, mobil(nama_mobil)').eq('id', booking_id).single();
    if (error || !booking) return res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });
    if (booking.status === 'lunas' || booking.payment_status === 'settlement') return res.status(400).json({ success: false, message: 'Booking ini sudah dibayar' });

    const order_id = `BOOKING-${booking_id}-${Date.now()}`;
    const bankLower = (bank || 'bca').toLowerCase();

    const parameter = {
      payment_type: 'bank_transfer',
      transaction_details: { order_id, gross_amount: Math.round(booking.total_harga) },
      customer_details: { first_name: booking.nama_customer, email: booking.email, phone: booking.no_hp },
      item_details: [{ id: `mobil-${booking.mobil_id}`, price: Math.round(booking.harga_per_hari), quantity: booking.durasi_hari, name: `Sewa ${booking.mobil?.nama_mobil} (${booking.durasi_hari} hari)` }]
    };

    if (booking.biaya_driver > 0) parameter.item_details.push({ id: 'biaya-driver', price: Math.round(booking.biaya_driver), quantity: 1, name: 'Biaya Driver' });

    if (bankLower === 'mandiri') { parameter.payment_type = 'echannel'; parameter.echannel = { bill_info1: 'Payment for:', bill_info2: `Sewa ${booking.mobil?.nama_mobil}` }; }
    else { parameter.bank_transfer = { bank: ['bca','bni','bri','cimb'].includes(bankLower) ? bankLower : 'bca' }; }

    if (!process.env.MIDTRANS_SERVER_KEY || !process.env.MIDTRANS_SERVER_KEY.startsWith('SB-')) {
      const mockVaNumber = `8127${Date.now().toString().slice(-12)}`;
      await supabase.from('sewa').update({ midtrans_order_id: order_id, midtrans_transaction_id: `TEST-${Date.now()}`, payment_status: 'pending', payment_method: 'bank_transfer', payment_bank: bankLower }).eq('id', booking_id);
      return res.json({ success: true, message: '⚠️ TESTING MODE: Mock VA created', data: { order_id, va_number: mockVaNumber, bank, gross_amount: Math.round(booking.total_harga), _testing: true } });
    }

    const transaction = await core.charge(parameter);
    let vaNumber = transaction.va_numbers?.[0]?.va_number || null;
    let billKey = transaction.bill_key || null;
    let billerCode = transaction.biller_code || null;

    await supabase.from('sewa').update({ midtrans_order_id: order_id, midtrans_transaction_id: transaction.transaction_id, payment_status: 'pending', payment_method: transaction.payment_type, payment_bank: bankLower }).eq('id', booking_id);

    res.json({ success: true, message: 'Transaksi berhasil dibuat', data: { order_id, transaction_id: transaction.transaction_id, transaction_status: transaction.transaction_status, payment_type: transaction.payment_type, va_number: vaNumber, bill_key: billKey, biller_code: billerCode, bank, gross_amount: transaction.gross_amount, transaction_time: transaction.transaction_time, expiry_time: transaction.expiry_time || null } });
  } catch (err) { next(err); }
};

exports.handleMidtransNotification = async (req, res, next) => {
  try {
    const { order_id, transaction_status, fraud_status, gross_amount, payment_type, transaction_id } = req.body;
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (process.env.NODE_ENV !== 'development' && serverKey && serverKey.startsWith('SB-')) {
      const hash = crypto.createHash('sha512').update(`${order_id}${transaction_status}${gross_amount}${serverKey}`).digest('hex');
      if (hash !== req.body.signature_key) return res.status(403).json({ success: false, message: 'Invalid signature' });
    }

    const { data: booking } = await supabase.from('sewa').select('*').eq('midtrans_order_id', order_id).single();
    if (!booking) return res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });

    let newStatus = booking.status;
    let paymentStatus = transaction_status;

    if (transaction_status === 'capture' && fraud_status === 'accept' || transaction_status === 'settlement') {
      newStatus = 'menunggu_persetujuan'; paymentStatus = 'settlement';
      if (booking.status === 'menunggu_pembayaran') {
        const { data: mobil } = await supabase.from('mobil').select('stok').eq('id', booking.mobil_id).single();
        await supabase.from('mobil').update({ stok: (mobil?.stok || 1) - 1 }).eq('id', booking.mobil_id);
      }
    } else if (transaction_status === 'pending') {
      newStatus = 'menunggu_pembayaran';
    } else if (['deny','expire','cancel'].includes(transaction_status)) {
      newStatus = 'dibatalkan'; paymentStatus = 'failed';
    }

    await supabase.from('sewa').update({ status: newStatus, payment_status: paymentStatus, payment_method: payment_type, midtrans_transaction_id: transaction_id }).eq('id', booking.id);
    res.json({ success: true, message: 'Notification berhasil diproses' });
  } catch (err) { next(err); }
};

exports.checkMidtransStatus = async (req, res, next) => {
  try {
    const status = await core.transaction.status(req.params.order_id);
    res.json({ success: true, data: status });
  } catch (err) { next(err); }
};

exports.syncPaymentStatus = async (req, res, next) => {
  try {
    const { order_id } = req.params;
    const { data: booking } = await supabase.from('sewa').select('*').eq('midtrans_order_id', order_id).single();
    if (!booking) return res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });

    const midtransStatus = await core.transaction.status(order_id);
    const { transaction_status, fraud_status, payment_type, transaction_id } = midtransStatus;

    let newStatus = booking.status;
    let paymentStatus = transaction_status;

    if (transaction_status === 'capture' && fraud_status === 'accept' || transaction_status === 'settlement') {
      newStatus = 'menunggu_persetujuan'; paymentStatus = 'settlement';
      if (booking.status === 'menunggu_pembayaran') {
        const { data: mobil } = await supabase.from('mobil').select('stok').eq('id', booking.mobil_id).single();
        await supabase.from('mobil').update({ stok: (mobil?.stok || 1) - 1 }).eq('id', booking.mobil_id);
      }
    } else if (transaction_status === 'pending') {
      newStatus = 'menunggu_pembayaran';
    } else if (['deny','expire','cancel'].includes(transaction_status)) {
      newStatus = 'dibatalkan'; paymentStatus = 'failed';
    }

    await supabase.from('sewa').update({ status: newStatus, payment_status: paymentStatus, payment_method: payment_type, midtrans_transaction_id: transaction_id }).eq('id', booking.id);

    const { data: updated } = await supabase.from('sewa').select('*, mobil(nama_mobil), users(nama)').eq('id', booking.id).single();
    res.json({ success: true, message: 'Status berhasil disinkronkan dari Midtrans', data: updated });
  } catch (err) { next(err); }
};
