const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username dan password wajib diisi'
    });
  }

  const [rows] = await db.query(
    'SELECT * FROM admin WHERE username = ?',
    [username]
  );

  if (rows.length === 0) {
    return res.status(401).json({
      success: false,
      message: 'Admin tidak ditemukan'
    });
  }

  const admin = rows[0];

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Password salah'
    });
  }

  const token = jwt.sign(
    { id: admin.id, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({
    success: true,
    message: 'Login admin berhasil',
    token
  });
};

exports.registerAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username dan password wajib diisi'
    });
  }

  // Cek apakah username sudah ada
  const [existing] = await db.query(
    'SELECT * FROM admin WHERE username = ?',
    [username]
  );

  if (existing.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Username sudah digunakan'
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert admin baru
  await db.query(
    'INSERT INTO admin (username, password) VALUES (?, ?)',
    [username, hashedPassword]
  );

  res.status(201).json({
    success: true,
    message: 'Admin berhasil didaftarkan'
  });
};

exports.resetUserPassword = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      return res.status(400).json({
        success: false,
        message: 'Password baru wajib diisi'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter'
      });
    }

    // Cek user exists
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

    res.json({
      success: true,
      message: 'Password user berhasil direset',
      data: {
        user_id: userId,
        email: users[0].email,
        nama: users[0].nama,
        new_password: new_password // Untuk admin kasih ke user
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT id, nama, email, username, no_hp, created_at FROM users ORDER BY created_at DESC');

    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    next(err);
  }
};
