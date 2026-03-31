const supabase = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

exports.register = async (req, res, next) => {
  try {
    const { nama, username, email, no_hp, password, confirm_password, agree_terms } = req.body;

    if (!nama || !username || !email || !no_hp || !password || !confirm_password)
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    if (!agree_terms)
      return res.status(400).json({ success: false, message: 'Anda harus menyetujui syarat & ketentuan' });
    if (password !== confirm_password)
      return res.status(400).json({ success: false, message: 'Password dan konfirmasi password tidak cocok' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ success: false, message: 'Format email tidak valid' });
    if (!/^[a-zA-Z\s]+$/.test(nama))
      return res.status(400).json({ success: false, message: 'Nama hanya boleh berisi huruf dan spasi' });

    const { data: existingEmail } = await supabase.from('users').select('id').eq('email', email).single();
    if (existingEmail) return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });

    const { data: existingUsername } = await supabase.from('users').select('id').eq('username', username).single();
    if (existingUsername) return res.status(400).json({ success: false, message: 'Username sudah digunakan' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const { error } = await supabase.from('users').insert([{ nama, email, username, password: hashedPassword, no_hp }]);
    if (error) throw error;

    res.status(201).json({ success: true, message: 'Registrasi berhasil, silakan login' });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Username/Email dan password wajib diisi' });

    const { data: users, error } = await supabase.from('users').select('*').or(`email.eq.${email},username.eq.${email}`);
    if (error) throw error;
    if (!users || users.length === 0)
      return res.status(401).json({ success: false, message: 'Email atau username tidak ditemukan' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Password salah' });

    const token = jwt.sign({ id: user.id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ success: true, message: 'Login berhasil', token, user: { id: user.id, nama: user.nama, email: user.email, username: user.username, no_hp: user.no_hp } });
  } catch (err) { next(err); }
};

exports.getProfile = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase.from('users').select('id, nama, username, email, no_hp, created_at').eq('id', req.user.id).single();
    if (error || !user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    res.json({ success: true, ...user });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { nama, username, email, no_hp } = req.body;

    if (!nama || !username || !email || !no_hp)
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ success: false, message: 'Format email tidak valid' });
    if (!/^[a-zA-Z\s]+$/.test(nama))
      return res.status(400).json({ success: false, message: 'Nama hanya boleh berisi huruf dan spasi' });

    const { data: existingUsername } = await supabase.from('users').select('id').eq('username', username).neq('id', user_id).single();
    if (existingUsername) return res.status(400).json({ success: false, message: 'Username sudah digunakan user lain' });

    const { data: existingEmail } = await supabase.from('users').select('id').eq('email', email).neq('id', user_id).single();
    if (existingEmail) return res.status(400).json({ success: false, message: 'Email sudah digunakan user lain' });

    const { error } = await supabase.from('users').update({ nama, username, email, no_hp }).eq('id', user_id);
    if (error) throw error;

    const { data: updated } = await supabase.from('users').select('id, nama, username, email, no_hp, created_at').eq('id', user_id).single();
    res.json({ success: true, message: 'Profil berhasil diperbarui', data: updated });
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password)
      return res.status(400).json({ success: false, message: 'Password lama dan password baru wajib diisi' });
    if (new_password.length < 6)
      return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter' });

    const { data: user, error } = await supabase.from('users').select('*').eq('id', user_id).single();
    if (error || !user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Password lama salah' });

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await supabase.from('users').update({ password: hashedPassword }).eq('id', user_id);

    res.json({ success: true, message: 'Password berhasil diubah' });
  } catch (err) { next(err); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email wajib diisi' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ success: false, message: 'Format email tidak valid' });

    const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
    if (!user) return res.json({ success: true, message: 'Jika email terdaftar, link reset password telah dikirim' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await supabase.from('password_resets').delete().eq('email', email).eq('used', false);
    await supabase.from('password_resets').insert([{ email, token, expires_at: expiresAt }]);

    const resetLink = `http://localhost:5173/reset-password?token=${token}`;
    console.log('\ní´ PASSWORD RESET LINK:');
    console.log('Email:', email);
    console.log('Link:', resetLink);

    res.json({ success: true, message: 'Jika email terdaftar, link reset password telah dikirim' });
  } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, new_password } = req.body;
    if (!token || !new_password)
      return res.status(400).json({ success: false, message: 'Token dan password baru wajib diisi' });
    if (new_password.length < 6)
      return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter' });

    const now = new Date().toISOString();
    const { data: reset, error } = await supabase.from('password_resets').select('*').eq('token', token).eq('used', false).gt('expires_at', now).single();
    if (error || !reset) return res.status(400).json({ success: false, message: 'Link reset password tidak valid atau sudah kadaluarsa' });

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await supabase.from('users').update({ password: hashedPassword }).eq('email', reset.email);
    await supabase.from('password_resets').update({ used: true }).eq('token', token);

    res.json({ success: true, message: 'Password berhasil direset, silakan login dengan password baru' });
  } catch (err) { next(err); }
};
