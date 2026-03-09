import { API_ENDPOINTS, fetchAPI } from '../config/api';
import type { LoginData, RegisterData, LoginResponse, User } from '../types/api';

class AuthService {
  // User Authentication
  async login(data: LoginData): Promise<LoginResponse> {
    const response = await fetchAPI(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Store user info in localStorage
    if (response.success && response.data) {
      this.setUser(response.data.user);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
    }
    
    return response;
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    return await fetchAPI(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async changePassword(oldPassword: string, newPassword: string) {
    return await fetchAPI(API_ENDPOINTS.CHANGE_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });
  }

  // Admin Authentication
  async adminLogin(data: LoginData): Promise<LoginResponse> {
    const response = await fetchAPI(API_ENDPOINTS.ADMIN_LOGIN, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Store admin info in localStorage
    if (response.success && response.data) {
      this.setUser(response.data.user);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
    }
    
    return response;
  }

  // Local Storage Management
  setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('username', user.username);
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('token');
  }
}

export default new AuthService();
