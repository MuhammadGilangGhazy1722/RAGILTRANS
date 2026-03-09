// API Response Types

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// User Types
export interface User {
  id_user: number;
  username: string;
  nama: string;
  email: string;
  no_hp: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token?: string;
  };
}

export interface RegisterData {
  username: string;
  nama: string;
  email: string;
  no_hp: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

// Car Types
export interface Car {
  id_car: number;
  nama_mobil: string;
  merek: string;
  tahun: number;
  nomor_plat: string;
  harga_sewa: number;
  status: 'tersedia' | 'disewa' | 'maintenance';
  foto_url?: string;
  deskripsi?: string;
  created_at: string;
}

export interface CreateCarData {
  nama_mobil: string;
  merek: string;
  tahun: number;
  nomor_plat: string;
  harga_sewa: number;
  status?: 'tersedia' | 'disewa' | 'maintenance';
  foto_url?: string;
  deskripsi?: string;
}

// Booking Types
export interface Booking {
  id_booking: number;
  id_user: number;
  id_car: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  total_harga: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  catatan?: string;
  created_at: string;
  
  // Relations (optional, populated in some responses)
  user?: User;
  car?: Car;
}

export interface CreateBookingData {
  id_car: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  catatan?: string;
}

export interface UpdateBookingStatusData {
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
}

// Payment Types
export interface Payment {
  id_payment: number;
  id_booking: number;
  jumlah: number;
  metode_pembayaran: 'cash' | 'transfer' | 'debit' | 'credit';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  tanggal_pembayaran?: string;
  bukti_pembayaran?: string;
  created_at: string;
  
  // Relations (optional)
  booking?: Booking;
}

export interface CreatePaymentData {
  id_booking: number;
  jumlah: number;
  metode_pembayaran: 'cash' | 'transfer' | 'debit' | 'credit';
  bukti_pembayaran?: string;
}

export interface UpdatePaymentStatusData {
  status: 'pending' | 'paid' | 'failed' | 'refunded';
}
