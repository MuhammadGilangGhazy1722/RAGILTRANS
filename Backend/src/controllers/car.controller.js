const db = require('../config/db');

exports.getCars = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM mobil');
    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    next(err);
  }
};

exports.createCar = async (req, res, next) => {
  try {
    const { nama_mobil, plat_nomor, kapasitas_penumpang, jenis_transmisi, jenis_bahan_bakar, harga_per_hari, status, image_url } = req.body;

    // Individual unit tracking: stok always = 1 (one physical vehicle per record)
    await db.query(
      'INSERT INTO mobil (nama_mobil, plat_nomor, kapasitas_penumpang, jenis_transmisi, jenis_bahan_bakar, harga_per_hari, stok, status, image_url) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)',
      [nama_mobil, plat_nomor, kapasitas_penumpang, jenis_transmisi, jenis_bahan_bakar || 'Bensin', harga_per_hari, status || 'tersedia', image_url || null]
    );

    res.status(201).json({
      success: true,
      message: 'Mobil berhasil ditambahkan'
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama_mobil, plat_nomor, kapasitas_penumpang, jenis_transmisi, jenis_bahan_bakar, harga_per_hari, status, image_url } = req.body;

    console.log('=== BACKEND MENERIMA DATA UPDATE ===');
    console.log('ID:', id);
    console.log('jenis_transmisi:', jenis_transmisi);
    console.log('jenis_bahan_bakar:', jenis_bahan_bakar);
    console.log('Full data:', {
      id,
      nama_mobil,
      plat_nomor,
      kapasitas_penumpang,
      jenis_transmisi,
      jenis_bahan_bakar,
      harga_per_hari,
      status,
      image_url
    });

    // Individual unit tracking: stok always = 1 (not editable)
    const queryParams = [nama_mobil, plat_nomor, kapasitas_penumpang, jenis_transmisi, jenis_bahan_bakar || 'Bensin', harga_per_hari, status, image_url, id];
    console.log('Query parameters:', queryParams);
    
    const [result] = await db.query(
      'UPDATE mobil SET nama_mobil = ?, plat_nomor = ?, kapasitas_penumpang = ?, jenis_transmisi = ?, jenis_bahan_bakar = ?, harga_per_hari = ?, status = ?, image_url = ? WHERE id = ?',
      queryParams
    );
    
    console.log('Update result:', result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mobil tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Mobil berhasil diupdate'
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteCar = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await db.query('DELETE FROM mobil WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mobil tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Mobil berhasil dihapus'
    });
  } catch (err) {
    next(err);
  }
};
