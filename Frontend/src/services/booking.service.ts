import { API_ENDPOINTS, fetchAPI } from '../config/api';
import type { Booking, CreateBookingData, UpdateBookingStatusData, ApiResponse } from '../types/api';
import authService from './auth.service';

class BookingService {
  async getMyBookings(): Promise<ApiResponse<Booking[]>> {
    return await fetchAPI(API_ENDPOINTS.MY_BOOKINGS, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
    });
  }

  async getAllBookings(): Promise<ApiResponse<Booking[]>> {
    return await fetchAPI(API_ENDPOINTS.BOOKINGS, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
    });
  }

  async getBookingById(id: number): Promise<ApiResponse<Booking>> {
    return await fetchAPI(API_ENDPOINTS.BOOKING_DETAIL(id), {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
    });
  }

  async createBooking(data: CreateBookingData): Promise<ApiResponse<Booking>> {
    return await fetchAPI(API_ENDPOINTS.CREATE_BOOKING, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
    });
  }

  async cancelBooking(id: number): Promise<ApiResponse> {
    return await fetchAPI(API_ENDPOINTS.CANCEL_BOOKING(id), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
    });
  }

  async updateBookingStatus(id: number, data: UpdateBookingStatusData): Promise<ApiResponse<Booking>> {
    return await fetchAPI(API_ENDPOINTS.UPDATE_BOOKING_STATUS(id), {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
    });
  }
}

export default new BookingService();
