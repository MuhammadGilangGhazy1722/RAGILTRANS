const supabase = require('../config/db');

exports.getCars = async (req, res, next) => {
  try {
    const { data: rows, error } = await supabase.from('mobil').select('*');
    if (error) throw error;
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

exports.createCar = async (req, res, next) => {
  try {
    const { nama_mobil, plat_nomor, kapasitas_penumpang, jenis_transmisi, jenis_bahan_bakar, harga_per_hari, status, image_url } = req.body;
    const { error } = await supabase.from('mobil').insert([{
      nama_mobil, plat_nomor, kapasitas_penumpang, jenis_transmisi,
      jenis_bahan_bakar: jenis_bahan_bakar || 'Bensin',
      harga_per_hari, stok: 1,
      status: status || 'tersedia',
      image_url: image_url || null
    }]);
    if (error) throw error;
    res.status(201).json({ success: true, message: 'Mobil berhasil ditambahkan' });
  } catch (err) {
    next(err);
  }
};

exports.updateCar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama_mobil, plat_nomor, kapasitas_penumpang, jenis_transmisi, jenis_bahan_bakar, harga_per_hari, status, image_url } = req.body;
    const { data, error } = await supabase.from('mobil').update({
      nama_mobil, plat_nomor, kapasitas_penumpang, jenis_transmisi,
      jenis_bahan_bakar: jenis_bahan_bakar || 'Bensin',
      harga_per_hari, status, image_url
    }).eq('id', id).select();
    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Mobil tidak ditemukan' });
    }
    res.json({ success: true, message: 'Mobil berhasil diupdate' });
  } catch (err) {
    next(err);
  }
};

exports.deleteCar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('mobil').delete().eq('id', id).select();
    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Mobil tidak ditemukan' });
    }
    res.json({ success: true, message: 'Mobil berhasil dihapus' });
  } catch (err) {
    next(err);
  }
};
