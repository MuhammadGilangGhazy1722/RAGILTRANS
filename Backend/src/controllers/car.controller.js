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
    const { nama_mobil, plat_nomor, kapasitas_penumpang, jenis_transmisi, harga_per_hari, stok, status } = req.body;

    await db.query(
      'INSERT INTO mobil (nama_mobil, plat_nomor, kapasitas_penumpang, jenis_transmisi, harga_per_hari, stok, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nama_mobil, plat_nomor, kapasitas_penumpang, jenis_transmisi, harga_per_hari, stok, status || 'tersedia']
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
    const { nama_mobil, plat_nomor, kapasitas_penumpang, jenis_transmisi, harga_per_hari, stok, status } = req.body;

    const [result] = await db.query(
      'UPDATE mobil SET nama_mobil = ?, plat_nomor = ?, kapasitas_penumpang = ?, jenis_transmisi = ?, harga_per_hari = ?, stok = ?, status = ? WHERE id = ?',
      [nama_mobil, plat_nomor, kapasitas_penumpang, jenis_transmisi, harga_per_hari, stok, status, id]
    );

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
