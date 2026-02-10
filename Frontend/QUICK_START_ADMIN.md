# 🚀 Quick Start - Panel Admin

## ⚡ Akses Cepat

### 1️⃣ Login Admin
```
URL: http://localhost:5173/admin/login
Email: admin@sewamobil.com
Password: admin123
```

### 2️⃣ Menu Admin Panel

| Menu | URL | Fungsi |
|------|-----|--------|
| 🏠 Dashboard | `/admin/dashboard` | Statistik & ringkasan |
| 🚗 Data Mobil | `/admin/cars` | CRUD mobil |
| 📋 Data Sewa | `/admin/rentals` | Kelola transaksi |
| 👥 Data User | `/admin/users` | Kelola pengguna |
| 📊 Laporan | `/admin/reports` | Analisis bisnis |

## 🎯 Testing Features

### ✅ Dashboard
1. Login sebagai admin
2. Lihat 4 kartu statistik
3. Check transaksi terbaru
4. Klik quick actions

### ✅ Manajemen Mobil
1. Klik "Tambah Mobil"
2. Isi form (nama, merk, harga, dll)
3. Submit → mobil baru muncul
4. Klik "Edit" → ubah data
5. Klik "Hapus" → konfirmasi delete

### ✅ Manajemen Sewa
1. Lihat daftar transaksi
2. Filter by status (Pending/Aktif/Selesai)
3. Klik icon mata → detail transaksi
4. Jika status "Pending" → Konfirmasi atau Batalkan
5. Jika status "Aktif" → Selesaikan

### ✅ Manajemen User
1. Search user by nama/email
2. Klik "Detail" → lihat info lengkap
3. Klik "Blokir" → user diblokir
4. Klik "Aktifkan" → user aktif kembali

### ✅ Laporan
1. Pilih periode (Minggu/Bulan/Tahun)
2. Lihat summary cards
3. Check top cars
4. Review laporan bulanan
5. Export PDF (coming soon)

## 🎨 Tema

**Dark Mode dengan Aksen Ungu**
- Background: Hitam (`#0B0B0B`)
- Primary: Purple (`#7C3AED` - `#6D28D9`)
- Accent: Glow effects & blur backdrop
- Cards: Rounded dengan border gray

## 🔒 Security

- ✅ Protected routes (hanya admin)
- ✅ Auto-redirect jika tidak login
- ✅ Role-based access control
- ✅ Session management (localStorage)

## 🛠️ Development

### Run Dev Server
```bash
npm run dev
```

### Build Production
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

## 📱 Responsive

Panel admin fully responsive:
- Desktop: Full sidebar + grid layout
- Tablet: Collapsible sidebar
- Mobile: Mobile-optimized views

## 🔥 Keyboard Shortcuts

- `Ctrl + K` → Search (coming soon)
- `Esc` → Close modal
- `Tab` → Navigate form fields

## 💡 Tips

1. **Data dummy**: Semua data saat ini dummy (untuk testing)
2. **Backend**: Hubungkan dengan API untuk data real
3. **Foto mobil**: Implement upload foto nanti
4. **Notifications**: Real-time notif coming soon
5. **Charts**: Grafik statistik akan ditambahkan

---

**Happy Testing! 🎉**
