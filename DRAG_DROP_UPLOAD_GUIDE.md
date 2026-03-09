# 📸 Fitur Upload Gambar dengan Drag & Drop

Sekarang admin bisa upload gambar mobil langsung dengan **drag & drop** dari file explorer!

## ✅ Cara Install & Setup

### 1. Install Package Multer (Backend)
```bash
cd Backend
npm install multer
```

### 2. Update Database
Pastikan kolom `image_url` sudah ada (sudah dilakukan sebelumnya):
```sql
ALTER TABLE mobil ADD COLUMN image_url VARCHAR(500) AFTER status;
```

### 3. Restart Backend & Frontend
```bash
# Terminal 1 - Backend
cd Backend
npm run dev

# Terminal 2 - Frontend  
cd Frontend
npm run dev
```

## 🎯 Cara Menggunakan

### Metode 1: Drag & Drop (Recommended)
1. Login ke admin panel → http://localhost:5173/admin/cars
2. Klik "Tambah Mobil" atau "Edit" mobil existing
3. **Drag gambar dari File Explorer** langsung ke area upload
4. Gambar otomatis upload dan preview muncul
5. Submit form

### Metode 2: Browse File
1. Buka modal Tambah/Edit Mobil
2. Klik tombol **"Pilih File"** di area upload
3. Pilih gambar dari dialog
4. Gambar otomatis upload dan preview muncul
5. Submit form

### Metode 3: Manual URL (Alternatif)
1. Buka modal Tambah/Edit Mobil
2. Scroll ke bagian bawah area gambar
3. Input URL gambar manual di field "Atau masukkan URL gambar manual"
4. Preview gambar muncul
5. Submit form

## 📋 Spesifikasi Upload

### File yang Diterima:
- **Format**: JPG, JPEG, PNG, GIF, WebP
- **Ukuran Max**: 5MB per file
- **Drag & Drop**: Satu file per kali

### Hasil Upload:
- File disimpan di folder `Backend/uploads/`
- Filename unik: `originalname-timestamp-random.ext`
- URL otomatis: `http://localhost:3000/uploads/filename.jpg`

## 🔧 Fitur Upload Zone

### Visual States:
1. **Default State**: 
   - Border abu-abu dashed
   - Icon upload
   - Teks "Drag & Drop gambar di sini"
   - Tombol "Pilih File"

2. **Dragging State**:
   - Border merah
   - Background merah transparan
   - Hover effect

3. **Uploading State**:
   - Spinner animasi
   - Teks "Uploading gambar..."

4. **Preview State**:
   - Gambar preview (max height 48)
   - Tombol "Ganti Gambar"
   - Tombol "Hapus"

### Interaksi:
- **Drag Over**: Border berubah merah
- **Drop**: Upload otomatis dimulai
- **Click "Pilih File"**: Buka file dialog
- **Click "Ganti Gambar"**: Upload gambar baru
- **Click "Hapus"**: Clear gambar dan URL
- **Input Manual URL**: Preview gambar dari URL

## 🗂️ File Structure

### Backend:
```
Backend/
├── uploads/                           # Folder gambar uploaded
│   └── innova-1234567890-123456789.jpg
├── src/
│   ├── controllers/
│   │   └── upload.controller.js       # Upload & delete logic
│   ├── middlewares/
│   │   └── upload.middleware.js       # Multer config
│   ├── routes/
│   │   └── upload.route.js            # Upload endpoints
│   └── app.js                         # Updated: serve static files
```

### Frontend:
```
Frontend/
├── src/
│   ├── config/
│   │   └── api.ts                     # Updated: uploadFile helper
│   └── pages/admin/
│       └── Cars.tsx                   # Updated: drag & drop UI
```

## 🌐 API Endpoints

### POST /api/upload
Upload single image (admin only)

**Request:**
- Method: `POST`
- Headers: `Authorization: Bearer <admin_token>`
- Content-Type: `multipart/form-data`
- Body: FormData with field `image`

**Response Success:**
```json
{
  "success": true,
  "message": "Gambar berhasil diupload",
  "data": {
    "filename": "innova-1234567890-123456789.jpg",
    "url": "http://localhost:3000/uploads/innova-1234567890-123456789.jpg"
  }
}
```

**Response Error:**
```json
{
  "success": false,
  "message": "Tidak ada file yang diupload"
}
```

### DELETE /api/upload/:filename
Delete uploaded image (admin only)

**Request:**
- Method: `DELETE`
- Headers: `Authorization: Bearer <admin_token>`
- Params: `filename` (string)

**Response:**
```json
{
  "success": true,
  "message": "Gambar berhasil dihapus"
}
```

### GET /uploads/:filename
Serve static image (public access)

**Request:**
- Method: `GET`
- URL: `http://localhost:3000/uploads/innova-1234567890-123456789.jpg`

**Response:**
- Binary image file

## 🧪 Testing

### Test 1: Upload via Drag & Drop
1. Buka admin panel cars
2. Klik "Tambah Mobil"
3. Drag image file dari desktop ke upload zone
4. Cek apakah:
   - Upload spinner muncul
   - Preview gambar muncul setelah upload
   - Alert "✅ Gambar berhasil diupload!" muncul
   - URL gambar terisi di form (bisa dicek di console)

### Test 2: Upload via File Picker
1. Buka modal Tambah Mobil
2. Klik tombol "Pilih File"
3. Pilih gambar dari dialog
4. Cek hasil sama seperti Test 1

### Test 3: Manual URL
1. Buka modal Tambah Mobil
2. Input URL gambar manual (e.g., dari internet)
3. Cek apakah preview gambar muncul

### Test 4: Edit Mobil dengan Gambar
1. Edit mobil yang sudah ada gambar
2. Cek apakah:
   - Preview gambar existing muncul
   - Bisa ganti gambar
   - Bisa hapus gambar
   - URL tetap tersimpan di database

### Test 5: Display di Sewa Page
1. Tambah mobil baru dengan gambar via upload
2. Buka http://localhost:5173/sewa
3. Cek apakah gambar mobil muncul di listing

## ⚠️ Validation & Error Handling

### Frontend Validation:
- ❌ File bukan gambar → Alert "File harus berupa gambar!"
- ❌ File > 5MB → Alert "Ukuran file maksimal 5MB!"
- ❌ Upload gagal → Alert "Gagal upload gambar: [error message]"

### Backend Validation:
- ❌ No file → 400 "Tidak ada file yang diupload"
- ❌ Invalid file type → 400 "Hanya file gambar yang diperbolehkan!"
- ❌ File too large → 400 "File too large"
- ❌ Not admin → 401 Unauthorized

## 🔒 Security

### Protected Routes:
- Upload endpoint: Admin only (adminMiddleware)
- Delete endpoint: Admin only (adminMiddleware)
- Serving files: Public (untuk display di sewa page)

### File Validation:
- File type check: Only images (jpeg, jpg, png, gif, webp)
- File size limit: 5MB
- Unique filename generation: Prevent file conflicts

## 📂 Folder Management

### Folder Creation:
- Folder `uploads/` otomatis dibuat saat backend start
- Created dengan permission `recursive: true`

### File Naming:
- Format: `basename-timestamp-random.ext`
- Example: `innova-1707123456789-987654321.jpg`
- Unique per upload untuk avoid conflicts

## 🚀 Production Considerations

### TODO sebelum production:
1. **Move uploads to cloud storage** (AWS S3, Cloudinary, etc.)
2. **Add image optimization** (resize, compress)
3. **Add thumbnail generation**
4. **Implement CDN** untuk serve images lebih cepat
5. **Add cleanup job** untuk delete unused images
6. **Increase security** (virus scan, etc.)

## 💡 Tips

### Best Practices:
- Upload gambar dengan resolusi reasonable (800x600 atau 1200x800)
- Compress gambar sebelum upload untuk loading lebih cepat
- Gunakan format WebP untuk size lebih kecil
- Beri nama file yang deskriptif (e.g., "innova-reborn-2023.jpg")

### Troubleshooting:
- **Gambar tidak upload**: Cek console browser untuk error
- **Preview tidak muncul**: Cek network tab, pastikan upload sukses
- **Gambar tidak muncul di sewa**: Cek backend serving static files dengan benar
- **413 Payload Too Large**: File lebih dari 5MB, compress dulu

## 📝 Changelog

### Fitur Baru:
- ✅ Drag & drop upload gambar
- ✅ File picker dengan button
- ✅ Real-time image preview
- ✅ Upload progress indicator
- ✅ Ganti/hapus gambar
- ✅ Manual URL input sebagai alternatif
- ✅ Backend multer integration
- ✅ Static file serving
- ✅ File validation (type & size)
- ✅ Unique filename generation
- ✅ Admin-only upload endpoint

### Updated Files:
**Backend:**
- `src/controllers/upload.controller.js` (new)
- `src/middlewares/upload.middleware.js` (new)
- `src/routes/upload.route.js` (new)
- `src/app.js` (updated)

**Frontend:**
- `src/config/api.ts` (updated)
- `src/pages/admin/Cars.tsx` (updated)

---

🎉 **Sekarang admin bisa upload gambar mobil dengan mudah!**

Drag & drop file dari file explorer → Upload otomatis → Preview muncul → Submit → Gambar tampil di sewa page!
