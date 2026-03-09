import { API_ENDPOINTS, fetchAPI } from '../config/api';
import type { Car, CreateCarData, ApiResponse } from '../types/api';
import authService from './auth.service';

class CarService {
  async getCars(): Promise<ApiResponse<Car[]>> {
    return await fetchAPI(API_ENDPOINTS.CARS);
  }

  async getCarById(id: number): Promise<ApiResponse<Car>> {
    return await fetchAPI(API_ENDPOINTS.CAR_DETAIL(id));
  }

  async createCar(data: CreateCarData): Promise<ApiResponse<Car>> {
    return await fetchAPI(API_ENDPOINTS.CREATE_CAR, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
    });
  }

  async updateCar(id: number, data: Partial<CreateCarData>): Promise<ApiResponse<Car>> {
    return await fetchAPI(API_ENDPOINTS.UPDATE_CAR(id), {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
    });
  }

  async deleteCar(id: number): Promise<ApiResponse> {
    return await fetchAPI(API_ENDPOINTS.DELETE_CAR(id), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
    });
  }
}

export default new CarService();
