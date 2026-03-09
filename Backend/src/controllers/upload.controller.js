const path = require('path');
const fs = require('fs');

// Pastikan folder uploads ada
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Upload single image
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada file yang diupload'
      });
    }

    // Return URL gambar yang bisa diakses
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Gambar berhasil diupload',
      data: {
        filename: req.file.filename,
        url: imageUrl
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal upload gambar',
      error: error.message
    });
  }
};

// Delete image
const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({
        success: true,
        message: 'Gambar berhasil dihapus'
      });
    }

    res.status(404).json({
      success: false,
      message: 'File tidak ditemukan'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus gambar',
      error: error.message
    });
  }
};

module.exports = {
  uploadImage,
  deleteImage
};
