const nodemailer = require('nodemailer');

// Konfigurasi transporter Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'lankghzy@gmail.com', // Ganti dengan email pengirim
    pass: process.env.GMAIL_APP_PASSWORD // Gunakan App Password, bukan password biasa
  }
});

/**
 * Kirim email notifikasi booking disetujui
 * @param {string} to - Email tujuan
 * @param {string} nama - Nama user
 * @param {string} namaMobil - Nama mobil
 * @param {string} tanggalPinjam - Tanggal mulai sewa
 * @param {string} tanggalSelesai - Tanggal selesai sewa
 */
async function sendBookingApprovedEmail(to, nama, namaMobil, tanggalPinjam, tanggalSelesai) {
  const mailOptions = {
    from: 'lankghzy@gmail.com',
    to,
    subject: 'Booking Mobil Anda Disetujui',
    html: `<p>Halo <b>${nama}</b>,</p>
      <p>Booking mobil <b>${namaMobil}</b> Anda telah <b>disetujui</b> oleh admin.</p>
      <ul>
        <li>Tanggal Pinjam: <b>${tanggalPinjam}</b></li>
        <li>Tanggal Selesai: <b>${tanggalSelesai}</b></li>
      </ul>
      <p>Silakan lanjutkan proses pembayaran atau hubungi admin jika ada pertanyaan.</p>
      <p>Terima kasih telah menggunakan layanan kami.</p>`
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendBookingApprovedEmail };