// Konfigurasi API Backend
// Menggunakan localhost untuk development
// Vite proxy akan forward request /api ke http://localhost:3000

export const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV ? '' : 'http://localhost:3000'
);

// Server Base URL untuk static files (images, uploads)
// Gunakan environment variable untuk production
export const SERVER_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

// Midtrans Configuration (Core API - tidak butuh snapUrl)
export const MIDTRANS_CONFIG = {
  clientKey: import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '',
  isProduction: import.meta.env.VITE_MIDTRANS_PRODUCTION === 'true'
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  PROFILE: `${API_BASE_URL}/api/auth/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/api/auth/profile`,
  CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/change-password`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  
  // Admin Auth
  ADMIN_LOGIN: `${API_BASE_URL}/api/admin/login`,
  
  // Cars
  CARS: `${API_BASE_URL}/api/cars`,
  CAR_DETAIL: (id: number) => `${API_BASE_URL}/api/cars/${id}`,
  CREATE_CAR: `${API_BASE_URL}/api/cars`,
  UPDATE_CAR: (id: number) => `${API_BASE_URL}/api/cars/${id}`,
  DELETE_CAR: (id: number) => `${API_BASE_URL}/api/cars/${id}`,
  
  // Bookings (renamed from Rentals)
  BOOKINGS: `${API_BASE_URL}/api/bookings`,
  MY_BOOKINGS: `${API_BASE_URL}/api/bookings/my-bookings`,
  BOOKING_DETAIL: (id: number) => `${API_BASE_URL}/api/bookings/${id}`,
  CREATE_BOOKING: `${API_BASE_URL}/api/bookings`,
  CANCEL_BOOKING: (id: number) => `${API_BASE_URL}/api/bookings/${id}/cancel`,
  UPDATE_BOOKING_STATUS: (id: number) => `${API_BASE_URL}/api/bookings/${id}/status`,
  
  // Payments
  PAYMENTS: `${API_BASE_URL}/api/payments`,
  CREATE_PAYMENT: `${API_BASE_URL}/api/payments`,
  PAYMENT_BY_BOOKING: (bookingId: number) => `${API_BASE_URL}/api/payments/booking/${bookingId}`,
  PAYMENT_DETAIL: (id: number) => `${API_BASE_URL}/api/payments/${id}`,
  UPDATE_PAYMENT_STATUS: (id: number) => `${API_BASE_URL}/api/payments/${id}/status`,
  
  // Admin User Management
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  ADMIN_RESET_PASSWORD: (userId: number) => `${API_BASE_URL}/api/admin/users/${userId}/reset-password`,
  
  // Upload
  UPLOAD_IMAGE: `${API_BASE_URL}/api/upload`,
  DELETE_IMAGE: (filename: string) => `${API_BASE_URL}/api/upload/${filename}`,
  
  // Reviews & Testimonials
  REVIEWS_PUBLIC: `${API_BASE_URL}/api/reviews/public`,
  SUBMIT_REVIEW: `${API_BASE_URL}/api/reviews/submit`,
  MY_REVIEWS: `${API_BASE_URL}/api/reviews/my-reviews`,
  BOOKING_REVIEW_STATUS: (bookingId: number) => `${API_BASE_URL}/api/reviews/booking/${bookingId}/status`,
  
  // Analytics & Reports (Admin)
  ANALYTICS_MONTHLY: `${API_BASE_URL}/api/analytics/monthly-report`,
  ANALYTICS_YEARLY: `${API_BASE_URL}/api/analytics/yearly-comparison`,
  ANALYTICS_CAR_PERFORMANCE: `${API_BASE_URL}/api/analytics/car-performance`,
};

// Helper function untuk fetch dengan error handling
export async function fetchAPI(url: string, options?: RequestInit) {
  // Check adminToken dulu, kalau gak ada baru cek authToken (untuk backward compatibility)
  const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options?.headers,
      },
      credentials: 'include', // Include cookies
    });

    const data = await response.json().catch(() => ({ message: 'Terjadi kesalahan parsing response' }));

    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error: any) {
    console.error('API Error:', error);
    throw error;
  }
}

// Helper function untuk upload file (FormData)
export async function uploadFile(url: string, file: File) {
  // Check adminToken dulu, kalau gak ada baru cek authToken (untuk backward compatibility)
  const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
  
  console.log('Upload - Token dari localStorage:', token ? 'Ada' : 'Tidak ada');
  console.log('Upload - Token length:', token?.length || 0);
  
  if (!token) {
    throw new Error('Anda harus login sebagai admin terlebih dahulu');
  }
  
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
      credentials: 'include',
    });

    const data = await response.json().catch(() => ({ message: 'Terjadi kesalahan parsing response' }));

    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error: any) {
    console.error('Upload Error:', error);
    throw error;
  }
}
