const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

exports.register = async (req, res, next) => {
  try {
    const { nama, username, email, no_hp, password, confirm_password, agree_terms } = req.body;

    // Validasi semua field wajib diisi
    if (!nama || !username || !email || !no_hp || !password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi'
      });
    }

    // Validasi persetujuan syarat & ketentuan
    if (!agree_terms) {
      return res.status(400).json({
        success: false,
        message: 'Anda harus menyetujui syarat & ketentuan dan kebijakan privasi'
      });
    }

    // Validasi password match
    if (password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Password dan konfirmasi password tidak cocok'
      });
    }

    // Validasi panjang password
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter'
      });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid'
      });
    }

    // Validasi nama hanya boleh huruf dan spasi
    const namaRegex = /^[a-zA-Z\s]+$/;
    if (!namaRegex.test(nama)) {
      return res.status(400).json({
        success: false,
        message: 'Nama hanya boleh berisi huruf dan spasi'
      });
    }

    // Cek email sudah terdaftar
    const [existingEmail] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
    }

    // Cek username sudah dipakai
    const [existingUsername] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUsername.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username sudah digunakan'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user baru
    await db.query(
      'INSERT INTO users (nama, email, username, password, no_hp) VALUES (?, ?, ?, ?, ?)',
      [nama, email, username, hashedPassword, no_hp]
    );

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil, silakan login'
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username/Email dan password wajib diisi'
      });
    }

    // Cek apakah login menggunakan email atau username
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email atau username tidak ditemukan'
      });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Password salah'
      });
    }

    const token = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        username: user.username,
        no_hp: user.no_hp
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const [users] = await db.query('SELECT id, nama, username, email, no_hp, created_at FROM users WHERE id = ?', [user_id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    res.json({
      success: true,
      ...users[0]
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { nama, username, email, no_hp } = req.body;

    // Validasi input
    if (!nama || !username || !email || !no_hp) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi'
      });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid'
      });
    }

    // Validasi nama hanya boleh huruf dan spasi
    const namaRegex = /^[a-zA-Z\s]+$/;
    if (!namaRegex.test(nama)) {
      return res.status(400).json({
        success: false,
        message: 'Nama hanya boleh berisi huruf dan spasi'
      });
    }

    // Cek apakah username sudah digunakan user lain
    const [existingUsername] = await db.query(
      'SELECT id FROM users WHERE username = ? AND id != ?',
      [username, user_id]
    );

    if (existingUsername.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username sudah digunakan user lain'
      });
    }

    // Cek apakah email sudah digunakan user lain
    const [existingEmail] = await db.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, user_id]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah digunakan user lain'
      });
    }

    // Update profile
    const [result] = await db.query(
      'UPDATE users SET nama = ?, username = ?, email = ?, no_hp = ? WHERE id = ?',
      [nama, username, email, no_hp, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Get updated user data
    const [users] = await db.query(
      'SELECT id, nama, username, email, no_hp, created_at FROM users WHERE id = ?',
      [user_id]
    );

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: users[0]
    });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Password lama dan password baru wajib diisi'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru minimal 6 karakter'
      });
    }

    // Get user data
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [user_id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    const user = users[0];

    // Verify old password
    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Password lama salah'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user_id]);

    res.json({
      success: true,
      message: 'Password berhasil diubah'
    });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email wajib diisi'
      });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid'
      });
    }

    // Cek apakah email terdaftar
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    // Untuk keamanan, selalu return success message meskipun email tidak ditemukan
    // Ini mencegah attacker mengetahui email mana yang terdaftar
    if (users.length === 0) {
      return res.json({
        success: true,
        message: 'Jika email terdaftar, link reset password telah dikirim'
      });
    }

    // Generate token unik
    const token = crypto.randomBytes(32).toString('hex');

    // Set expired 1 jam dari sekarang
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Hapus token lama yang belum digunakan untuk email ini
    await db.query('DELETE FROM password_resets WHERE email = ? AND used = 0', [email]);

    // Simpan token baru
    await db.query(
      'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
      [email, token, expiresAt]
    );

    // TODO: Kirim email dengan nodemailer
    // Untuk development, tampilkan link di console
    const resetLink = `http://localhost:5173/reset-password?token=${token}`;
    console.log('\n🔐 PASSWORD RESET LINK:');
    console.log('Email:', email);
    console.log('Link:', resetLink);
    console.log('Expires:', expiresAt.toLocaleString('id-ID'));
    console.log('');

    res.json({
      success: true,
      message: 'Jika email terdaftar, link reset password telah dikirim'
    });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Token dan password baru wajib diisi'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru minimal 6 karakter'
      });
    }

    // Cek token valid, belum expired, dan belum digunakan
    const [resets] = await db.query(
      'SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > NOW()',
      [token]
    );

    if (resets.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Link reset password tidak valid atau sudah kadaluarsa'
      });
    }

    const resetData = resets[0];
    const email = resetData.email;

    // Hash password baru
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password user
    await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

    // Tandai token sebagai sudah digunakan
    await db.query('UPDATE password_resets SET used = 1 WHERE token = ?', [token]);

    res.json({
      success: true,
      message: 'Password berhasil direset, silakan login dengan password baru'
    });
  } catch (err) {
    next(err);
  }
};
