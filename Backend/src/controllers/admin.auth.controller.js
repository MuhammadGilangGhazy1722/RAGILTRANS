const supabase = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
  }

  const { data: admin, error } = await supabase
    .from('admin')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !admin) {
    return res.status(401).json({ success: false, message: 'Admin tidak ditemukan' });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Password salah' });
  }

  const token = jwt.sign(
    { id: admin.id, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({ success: true, message: 'Login admin berhasil', token });
};

exports.registerAdmin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
  }

  const { data: existing } = await supabase
    .from('admin')
    .select('*')
    .eq('username', username)
    .single();

  if (existing) {
    return res.status(400).json({ success: false, message: 'Username sudah digunakan' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { error } = await supabase
    .from('admin')
    .insert([{ username, password: hashedPassword }]);

  if (error) throw error;

  res.status(201).json({ success: true, message: 'Admin berhasil didaftarkan' });
};

exports.resetUserPassword = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      return res.status(400).json({ success: false, message: 'Password baru wajib diisi' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', userId);

    res.json({
      success: true,
      message: 'Password user berhasil direset',
      data: { user_id: userId, email: user.email, nama: user.nama, new_password }
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { data: rows, error } = await supabase
      .from('users')
      .select('id, nama, email, username, no_hp, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};
