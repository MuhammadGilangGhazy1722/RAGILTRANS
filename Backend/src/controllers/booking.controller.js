const supabase = require('../config/db');
const { sendBookingApprovedEmail } = require('../utils/email');

const checkCarAvailability = async (mobil_id, tanggal_mulai, tanggal_selesai, exclude_booking_id = null) => {
  try {
    let query = supabase
      .from('sewa')
      .select('id, order_number, tanggal_pinjam, tanggal_selesai, status')
      .eq('mobil_id', mobil_id)
      .not('status', 'in', '("dibatalkan","selesai")')
      .or(`and(tanggal_pinjam.lte.${tanggal_mulai},tanggal_selesai.gte.${tanggal_mulai}),and(tanggal_pinjam.lte.${tanggal_selesai},tanggal_selesai.gte.${tanggal_selesai}),and(tanggal_pinjam.gte.${tanggal_mulai},tanggal_selesai.lte.${tanggal_selesai})`);

    if (exclude_booking_id) {
      query = query.neq('id', exclude_booking_id);
    }

    const { data: overlappingBookings, error } = await query;
    if (error) throw error;

    if (overlappingBookings.length > 0) {
      console.log(`❌ Car ${mobil_id} NOT available: ${overlappingBookings.length} overlapping booking(s)`);
      return false;
    }

    console.log(`✅ Car ${mobil_id} available for ${tanggal_mulai} - ${tanggal_selesai}`);
    return true;
  } catch (error) {
    console.error('Error checking car availability:', error);
    throw error;
  }
};

const generateRandomOrderNumber = async () => {
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return `BKG-${code}`;
  };

  let attempts = 0;
  while (attempts < 5) {
    const order_number = generateRandomCode();
    const { data: existing } = await supabase.from('sewa').select('id').eq('order_number', order_number).single();
    if (!existing) return order_number;
    attempts++;
    console.log(`Order number collision, retrying... (${attempts}/5)`);
  }
  throw new Error('Failed to generate unique order number after multiple attempts');
};

exports.createBooking = async (req, res, next) => {
  try {
    console.log('=== CREATE BOOKING ===');
    console.log('REQ BODY:', JSON.stringify(req.body));

    const user_id = req.user.id;
  const {
        mobil_id, tanggal_pinjam, jam_pinjam, tanggal_selesai, jam_selesai,
        jenis_layanan, catatan, nama_ktp, nik, nik_ocr, foto_ktp,
        nama_customer, email, no_hp
      } = req.body;

    const dengan_driver = req.body.dengan_driver || 'tidak';
    const biaya_driver = dengan_driver === 'ya' ? 50000 : 0;

    const { data: mobil, error: mobilError } = await supabase.from('mobil').select('harga_per_hari, stok').eq('id', mobil_id).single();
    if (mobilError || !mobil) return res.status(404).json({ success: false, message: 'Mobil tidak ditemukan' });

    const isAvailable = await checkCarAvailability(mobil_id, tanggal_pinjam, tanggal_selesai);
    if (!isAvailable) return res.status(400).json({ success: false, message: 'Mobil tidak tersedia untuk tanggal yang dipilih.' });

    const durasi_hari = Math.ceil((new Date(tanggal_selesai) - new Date(tanggal_pinjam)) / (1000 * 60 * 60 * 24)) || 1;
    const total_harga = (mobil.harga_per_hari * durasi_hari) + biaya_driver;

    await supabase.from('verifikasi_ktp').upsert([{ user_id, nik_input: nik, nik_ocr, foto_ktp, status: 'pending' }], { onConflict: 'user_id' });

    const order_number = await generateRandomOrderNumber();

    const { data: result, error } = await supabase.from('sewa').insert([{
      user_id, mobil_id, tanggal_pinjam, jam_pinjam, tanggal_selesai, jam_selesai,
      jenis_layanan, harga_per_hari: mobil.harga_per_hari, durasi_hari, total_harga,
      dengan_driver, biaya_driver, nama_ktp, nik, foto_ktp,
      nama_customer, email, no_hp,
      catatan, order_number, status: 'menunggu_pembayaran'
    }]).select().single();
    if (error) throw error;

    await supabase.from('mobil').update({ stok: mobil.stok - 1 }).eq('id', mobil_id);

    res.status(201).json({
      success: true,
      message: 'Booking berhasil, silakan lakukan pembayaran',
      data: { booking_id: result.id, order_number, durasi_hari, total_harga, status: 'menunggu_pembayaran' }
    });
  } catch (err) { next(err); }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { data: userRow } = await supabase.from('users').select('email').eq('id', user_id).single();
    const userEmail = userRow?.email;

    const { data: rows, error } = await supabase.from('sewa').select('*, mobil(nama_mobil, plat_nomor, jenis_transmisi)').or(`user_id.eq.${user_id},and(user_id.is.null,email.eq.${userEmail})`).order('created_at', { ascending: false });
    if (error) throw error;

    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const { data: rows, error } = await supabase.from('sewa').select('*, users(nama, email, no_hp), mobil(nama_mobil, plat_nomor)').order('created_at', { ascending: false });
    if (error) throw error;

    const mapped = rows.map(r => ({
      ...r,
      nama_customer: r.nama_customer || r.users?.nama,
      email: r.email || r.users?.email,
      no_hp: r.no_hp || r.users?.no_hp,
      nama_mobil: r.mobil?.nama_mobil,
      plat_nomor: r.mobil?.plat_nomor,
    }));

    res.json({ success: true, data: mapped });
  } catch (err) { next(err); }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: row, error } = await supabase.from('sewa').select('*, users(nama, email, no_hp), mobil(nama_mobil, plat_nomor, kapasitas_penumpang, jenis_transmisi)').eq('id', id).single();
    if (error || !row) return res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });

    res.json({ success: true, data: { ...row, nama_customer: row.nama_customer || row.users?.nama, email: row.email || row.users?.email, no_hp: row.no_hp || row.users?.no_hp, nama_mobil: row.mobil?.nama_mobil, plat_nomor: row.mobil?.plat_nomor } });
  } catch (err) { next(err); }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data: booking, error: fetchError } = await supabase.from('sewa').select('mobil_id, status').eq('id', id).single();
    if (fetchError || !booking) return res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });

    const oldStatus = booking.status;
    const mobil_id = booking.mobil_id;

    const { error } = await supabase.from('sewa').update({ status }).eq('id', id);
    if (error) throw error;

    if ((status === 'selesai' || status === 'dibatalkan') && (oldStatus !== 'selesai' && oldStatus !== 'dibatalkan')) {
      const { data: mobil } = await supabase.from('mobil').select('stok').eq('id', mobil_id).single();
      await supabase.from('mobil').update({ stok: (mobil?.stok || 0) + 1 }).eq('id', mobil_id);
    }

    if ((status === 'disetujui' || status === 'confirmed') && oldStatus !== status) {
      const { data: row } = await supabase.from('sewa').select('*, users(nama, email), mobil(nama_mobil)').eq('id', id).single();
      if (row) {
        try {
          await sendBookingApprovedEmail(
            row.email || row.users?.email,
            row.nama_customer || row.users?.nama,
            row.mobil?.nama_mobil,
            row.tanggal_pinjam,
            row.tanggal_selesai
          );
        } catch (e) { console.error('Gagal mengirim email:', e); }
      }
      return res.json({ success: true, message: 'Booking Anda telah disetujui! Silakan cek email Anda.', status });
    }

    res.json({ success: true, message: 'Status booking berhasil diupdate', status });
  } catch (err) { next(err); }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const { data: booking, error } = await supabase.from('sewa').select('*').eq('id', id).eq('user_id', user_id).single();
    if (error || !booking) return res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });
    if (booking.status !== 'menunggu_pembayaran') return res.status(400).json({ success: false, message: 'Booking tidak bisa dibatalkan' });

    await supabase.from('sewa').update({ status: 'dibatalkan' }).eq('id', id);
    const { data: mobil } = await supabase.from('mobil').select('stok').eq('id', booking.mobil_id).single();
    await supabase.from('mobil').update({ stok: (mobil?.stok || 0) + 1 }).eq('id', booking.mobil_id);

    res.json({ success: true, message: 'Booking berhasil dibatalkan' });
  } catch (err) { next(err); }
};

exports.createGuestBooking = async (req, res, next) => {
  try {
    const { user_id, nama_customer, email, no_hp, nama_ktp, nik, foto_ktp, mobil_id, tanggal_mulai, tanggal_selesai, dengan_driver, catatan_sewa } = req.body;

    if (!nama_customer || !email || !no_hp || !nama_ktp || !nik || !mobil_id || !tanggal_mulai || !tanggal_selesai) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }

    const namaRegex = /^[a-zA-Z\s]+$/;
    if (!namaRegex.test(nama_customer)) return res.status(400).json({ success: false, message: 'Nama customer hanya boleh berisi huruf dan spasi' });
    if (!namaRegex.test(nama_ktp)) return res.status(400).json({ success: false, message: 'Nama KTP hanya boleh berisi huruf dan spasi' });

    const { data: mobil, error: mobilError } = await supabase.from('mobil').select('harga_per_hari, stok, nama_mobil').eq('id', mobil_id).single();
    if (mobilError || !mobil) return res.status(404).json({ success: false, message: 'Mobil tidak ditemukan' });

    const isAvailable = await checkCarAvailability(mobil_id, tanggal_mulai, tanggal_selesai);
    if (!isAvailable) return res.status(400).json({ success: false, message: 'Mobil tidak tersedia untuk tanggal yang dipilih.' });

    const durasi_hari = Math.ceil((new Date(tanggal_selesai) - new Date(tanggal_mulai)) / (1000 * 60 * 60 * 24)) || 1;
    const biaya_driver = dengan_driver === 'ya' ? 50000 : 0;
    const total_harga = (mobil.harga_per_hari * durasi_hari) + biaya_driver;

    const order_number = await generateRandomOrderNumber();

    const { data: result, error } = await supabase.from('sewa').insert([{
      user_id: user_id || null, mobil_id, nama_customer, email, no_hp, nama_ktp, nik, foto_ktp,
      tanggal_pinjam: tanggal_mulai, tanggal_selesai, dengan_driver, biaya_driver,
      harga_per_hari: mobil.harga_per_hari, durasi_hari, total_harga,
      catatan: catatan_sewa, order_number, status: 'menunggu_pembayaran'
    }]).select().single();
    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Booking berhasil dibuat, silakan lanjutkan pembayaran',
      data: { booking_id: result.id, order_number, nama_mobil: mobil.nama_mobil, durasi_hari, biaya_driver, total_harga, status: 'menunggu_pembayaran' }
    });
  } catch (err) { next(err); }
};

exports.searchBookingByOrderNumber = async (req, res, next) => {
  try {
    const { order_number } = req.params;
    const { data: row, error } = await supabase.from('sewa').select('*, users(nama, email, no_hp), mobil(nama_mobil, plat_nomor, kapasitas_penumpang, jenis_transmisi, harga_per_hari)').eq('order_number', order_number).single();
    if (error || !row) return res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });

    res.json({ success: true, data: { ...row, nama_customer: row.nama_customer || row.users?.nama, email: row.email || row.users?.email, no_hp: row.no_hp || row.users?.no_hp } });
  } catch (err) { next(err); }
};

exports.checkAvailability = async (req, res, next) => {
  try {
    const { mobil_id } = req.params;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) return res.status(400).json({ success: false, message: 'start_date dan end_date harus diisi' });

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const today = new Date(); today.setHours(0, 0, 0, 0);

    if (startDate < today) return res.status(400).json({ success: false, message: 'Tanggal mulai tidak boleh di masa lalu' });
    if (endDate <= startDate) return res.status(400).json({ success: false, message: 'Tanggal selesai harus setelah tanggal mulai' });

    const { data: mobil, error } = await supabase.from('mobil').select('id, nama_mobil, plat_nomor').eq('id', mobil_id).single();
    if (error || !mobil) return res.status(404).json({ success: false, message: 'Mobil tidak ditemukan' });

    const isAvailable = await checkCarAvailability(mobil_id, start_date, end_date);
    res.json({ success: true, data: { mobil_id: parseInt(mobil_id), nama_mobil: mobil.nama_mobil, plat_nomor: mobil.plat_nomor, start_date, end_date, available: isAvailable } });
  } catch (err) { next(err); }
};

exports.getBlockedDates = async (req, res, next) => {
  try {
    const { mobil_id } = req.params;
    const { data: mobil, error: mobilError } = await supabase.from('mobil').select('id, nama_mobil, plat_nomor').eq('id', mobil_id).single();
    if (mobilError || !mobil) return res.status(404).json({ success: false, message: 'Mobil tidak ditemukan' });

    const today = new Date().toISOString().split('T')[0];
    const { data: bookings, error } = await supabase.from('sewa').select('id, order_number, tanggal_pinjam, tanggal_selesai, status').eq('mobil_id', mobil_id).not('status', 'in', '("dibatalkan","ditolak")').gte('tanggal_selesai', today).order('tanggal_pinjam', { ascending: true });
    if (error) throw error;

    const blockedDates = bookings.map(b => ({ booking_id: b.id, order_number: b.order_number, start_date: b.tanggal_pinjam, end_date: b.tanggal_selesai, status: b.status }));
    res.json({ success: true, data: { mobil_id: parseInt(mobil_id), nama_mobil: mobil.nama_mobil, plat_nomor: mobil.plat_nomor, blocked_dates: blockedDates, count: blockedDates.length } });
  } catch (err) { next(err); }
};

exports.getAvailableCars = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    if (!start_date || !end_date) return res.status(400).json({ success: false, message: 'start_date dan end_date harus diisi' });

    const { data: allCars, error } = await supabase.from('mobil').select('*').eq('status', 'tersedia');
    if (error) throw error;

    const availableCars = [];
    for (const car of allCars) {
      const isAvailable = await checkCarAvailability(car.id, start_date, end_date);
      if (isAvailable) availableCars.push({ ...car, available: true });
    }

    res.json({ success: true, data: availableCars, count: availableCars.length, filter: { start_date, end_date } });
  } catch (err) { next(err); }
};