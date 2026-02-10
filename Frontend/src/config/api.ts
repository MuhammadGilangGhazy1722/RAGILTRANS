// Konfigurasi API Backend
// Ganti dengan IP laptop Anda yang menjalankan backend
// Contoh: 'http://192.168.1.100:3000' atau 'http://localhost:3000'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://10.212.74.152:3000';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  
  // Cars
  CARS: `${API_BASE_URL}/api/cars`,
  CAR_DETAIL: (id: number) => `${API_BASE_URL}/api/cars/${id}`,
  
  // Rentals
  RENTALS: `${API_BASE_URL}/api/rentals`,
  RENTAL_DETAIL: (id: number) => `${API_BASE_URL}/api/rentals/${id}`,
  CREATE_RENTAL: `${API_BASE_URL}/api/rentals`,
  
  // User
  PROFILE: `${API_BASE_URL}/api/user/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/api/user/profile`,
};

// Helper function untuk fetch dengan error handling
export async function fetchAPI(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
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
