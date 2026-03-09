/**
 * Script untuk membuat akun admin default
 * Jalankan dengan: node src/scripts/createAdmin.js
 */

const bcrypt = require('bcrypt');
const db = require('../config/db');

async function createAdmin() {
  try {
    const username = 'admin';
    const password = 'admin123'; // Password default

    // Cek apakah admin sudah ada
    const [existing] = await db.query('SELECT * FROM admin WHERE username = ?', [username]);
    
    if (existing.length > 0) {
      console.log('❌ Admin dengan username "admin" sudah ada!');
      console.log('💡 Gunakan username dan password yang sudah terdaftar untuk login.');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert admin baru
    await db.query(
      'INSERT INTO admin (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );

    console.log('✅ Admin berhasil dibuat!');
    console.log('');
    console.log('=================================');
    console.log('📋 Detail Admin:');
    console.log('Username: ' + username);
    console.log('Password: ' + password);
    console.log('=================================');
    console.log('');
    console.log('🔐 Login admin di: http://localhost:5173/admin/login');
    console.log('');
    console.log('⚠️  PENTING: Ganti password setelah login pertama!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error membuat admin:', error.message);
    process.exit(1);
  }
}

createAdmin();
