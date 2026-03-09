# RagilTrans - Sinkronisasi Frontend & Backend

## ✅ Endpoints yang Sudah Disinkronkan

### Authentication
- **POST** `/api/auth/register` - Registrasi user baru
- **POST** `/api/auth/login` - Login user
- **POST** `/api/auth/change-password` - Ganti password (auth required)

### Admin Authentication
- **POST** `/api/admin/login` - Login admin
- **POST** `/api/admin/register` - Registrasi admin baru
- **GET** `/api/admin/users` - Get all users (admin only)
- **PUT** `/api/admin/users/:userId/reset-password` - Reset password user (admin only)

### Cars
- **GET** `/api/cars` - Get semua mobil (public)
- **POST** `/api/cars` - Tambah mobil baru (admin only)
- **PUT** `/api/cars/:id` - Update mobil (admin only)
- **DELETE** `/api/cars/:id` - Hapus mobil (admin only)

### Bookings
- **POST** `/api/bookings` - Buat booking baru (user)
- **GET** `/api/bookings/my-bookings` - Get booking user sendiri (user)
- **DELETE** `/api/bookings/:id/cancel` - Cancel booking (user)
- **GET** `/api/bookings` - Get semua booking (admin)
- **GET** `/api/bookings/:id` - Get detail booking
- **PUT** `/api/bookings/:id/status` - Update status booking (admin)

### Payments
- **POST** `/api/payments` - Buat payment (user)
- **GET** `/api/payments/booking/:bookingId` - Get payment by booking (user)
- **GET** `/api/payments` - Get semua payment (admin)
- **GET** `/api/payments/:id` - Get detail payment (admin)
- **PUT** `/api/payments/:id/status` - Update status payment (admin)

## 📁 Struktur Frontend Baru

```
Frontend/src/
├── config/
│   └── api.ts                 # API endpoints & fetch helper
├── services/
│   ├── auth.service.ts        # Authentication service
│   ├── car.service.ts         # Car service
│   ├── booking.service.ts     # Booking service
│   └── payment.service.ts     # Payment service
├── types/
│   └── api.ts                 # TypeScript types/interfaces
└── pages/
    └── admin/
        └── Dashboard.tsx      # Updated: /admin/rentals → /admin/bookings
```

## 🔧 Cara Penggunaan

### Setup Backend
1. Copy `.env.example` ke `.env`
2. Konfigurasikan database di `.env`
3. Install dependencies: `npm install`
4. Jalankan server: `npm run dev`

### Setup Frontend
1. Copy `.env.example` ke `.env`
2. Sesuaikan `VITE_API_URL` dengan IP backend
3. Install dependencies: `npm install --force`
4. Jalankan dev server: `npm run dev`

### Contoh Penggunaan Services

#### Login User
```typescript
import authService from './services/auth.service';

const handleLogin = async () => {
  try {
    const response = await authService.login({
      username: 'user123',
      password: 'password123'
    });
    
    if (response.success) {
      // User logged in, data stored in localStorage
      console.log('User:', authService.getUser());
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

#### Get Cars
```typescript
import carService from './services/car.service';

const loadCars = async () => {
  try {
    const response = await carService.getCars();
    if (response.success) {
      setCars(response.data);
    }
  } catch (error) {
    console.error('Failed to load cars:', error);
  }
};
```

#### Create Booking
```typescript
import bookingService from './services/booking.service';

const createBooking = async () => {
  try {
    const response = await bookingService.createBooking({
      id_car: 1,
      tanggal_mulai: '2026-02-15',
      tanggal_selesai: '2026-02-17',
      catatan: 'Untuk liburan'
    });
    
    if (response.success) {
      console.log('Booking created:', response.data);
    }
  } catch (error) {
    console.error('Booking failed:', error);
  }
};
```

## 🔐 Authentication

Token JWT disimpan di `localStorage` dengan key `token`. Semua request yang butuh autentikasi akan otomatis include token di header `Authorization: Bearer <token>`.

## 🚀 Development Tips

1. **CORS**: Pastikan IP frontend ditambahkan di `Backend/src/app.js` dalam CORS config
2. **TypeScript**: Semua types sudah didefinisikan di `types/api.ts`
3. **Error Handling**: fetchAPI helper sudah handle error secara otomatis
4. **Auth Check**: Gunakan `authService.isAuthenticated()` dan `authService.isAdmin()` untuk cek status

## ⚠️ Breaking Changes

- `/api/rentals` → `/api/bookings`
- `/admin/rentals` route → `/admin/bookings`
- Endpoint `LOGOUT` dihapus (belum ada di backend)
- Endpoint `PROFILE` & `UPDATE_PROFILE` dihapus (belum ada di backend)
