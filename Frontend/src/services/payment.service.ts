import { API_ENDPOINTS, fetchAPI } from '../config/api';
import type { Payment, CreatePaymentData, UpdatePaymentStatusData, ApiResponse } from '../types/api';
import authService from './auth.service';

class PaymentService {
  async getAllPayments(): Promise<ApiResponse<Payment[]>> {
    return await fetchAPI(API_ENDPOINTS.PAYMENTS, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
    });
  }

  async getPaymentById(id: number): Promise<ApiResponse<Payment>> {
    return await fetchAPI(API_ENDPOINTS.PAYMENT_DETAIL(id), {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
    });
  }

  async getPaymentByBooking(bookingId: number): Promise<ApiResponse<Payment>> {
    return await fetchAPI(API_ENDPOINTS.PAYMENT_BY_BOOKING(bookingId), {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
    });
  }

  async createPayment(data: CreatePaymentData): Promise<ApiResponse<Payment>> {
    return await fetchAPI(API_ENDPOINTS.CREATE_PAYMENT, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
    });
  }

  async updatePaymentStatus(id: number, data: UpdatePaymentStatusData): Promise<ApiResponse<Payment>> {
    return await fetchAPI(API_ENDPOINTS.UPDATE_PAYMENT_STATUS(id), {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
    });
  }
}

export default new PaymentService();
