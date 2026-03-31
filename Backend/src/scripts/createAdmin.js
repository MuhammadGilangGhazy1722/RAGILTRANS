require('dotenv').config();
const bcrypt = require('bcrypt');
const supabase = require('../config/db');

async function createAdmin() {
  try {
    const username = 'RagilTransAdmine';
    const password = 'AdmineRagilTrans123';

    // Cek apakah admin sudah ada
    const { data: existing } = await supabase
      .from('admin')
      .select('*')
      .eq('username', username)
      .single();

    if (existing) {
      console.log('❌ Admin dengan username "admin" sudah ada!');
      console.log('��� Gunakan username dan password yang sudah terdaftar untuk login.');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert admin baru
    const { error } = await supabase
      .from('admin')
      .insert([{ username, password: hashedPassword }]);

    if (error) throw error;

    console.log('✅ Admin berhasil dibuat!');
    console.log('=================================');
    console.log('��� Detail Admin:');
    console.log('Username: ' + username);
    console.log('Password: ' + password);
    console.log('=================================');
    console.log('��� Login admin di: http://localhost:5173/admin/login');
    console.log('⚠️  PENTING: Ganti password setelah login pertama!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error membuat admin:', error.message);
    process.exit(1);
  }
}

createAdmin();
