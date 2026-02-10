import { createSignal, Show } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import { API_ENDPOINTS, fetchAPI } from '../config/api';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = createSignal({
    identifier: '', // bisa username atau email
    password: ''
  });

  const [showPassword, setShowPassword] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal('');
  const [rememberMe, setRememberMe] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validasi input
    if (!formData().identifier || !formData().password) {
      setError('Username/Email dan password harus diisi');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔄 Mencoba login ke:', API_ENDPOINTS.LOGIN);
      
      // Panggil API Login Backend
      const response = await fetchAPI(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({
          username: formData().identifier, // backend expect 'username' field
          password: formData().password,
        }),
      });

      console.log('✅ Login berhasil:', response);

      // Simpan data ke localStorage
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }
      if (response.user) {
        localStorage.setItem('userRole', response.user.role || 'user');
        localStorage.setItem('username', response.user.username || formData().identifier);
        localStorage.setItem('userId', response.user.id);
      }

      // Redirect berdasarkan role
      const userRole = response.user?.role || 'user';
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('❌ Login gagal:', err);
      
      // Error lebih informatif
      if (err.message === 'Failed to fetch') {
        setError('❌ Tidak dapat terhubung ke server. Pastikan backend berjalan di ' + API_ENDPOINTS.LOGIN);
      } else {
        setError(err.message || 'Username atau password salah');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-[#0B0B0B] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Effects */}
      <div class="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-purple-900/10"></div>
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-glow-pulse"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-800/20 rounded-full blur-3xl animate-glow-pulse" style="animation-delay: 1s"></div>

      <div class="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl mb-4 glow-purple">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-2">
            Selamat Datang
          </h1>
          <p class="text-gray-400">Login ke akun LuxeDrive Anda</p>
        </div>

        {/* Login Card */}
        <div class="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-900/30 p-8 card-hover">
          <form onSubmit={handleSubmit} class="space-y-5">
            {/* Error Message */}
            <Show when={error()}>
              <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                <svg class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-red-400 text-sm">{error()}</p>
              </div>
            </Show>

            {/* Username/Email Field */}
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Username atau Email
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  required
                  value={formData().identifier}
                  onInput={(e) => setFormData({ ...formData(), identifier: e.currentTarget.value })}
                  placeholder="Masukkan username atau email"
                  class="w-full pl-12"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input
                  type={showPassword() ? 'text' : 'password'}
                  required
                  value={formData().password}
                  onInput={(e) => setFormData({ ...formData(), password: e.currentTarget.value })}
                  placeholder="Masukkan password"
                  class="w-full pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword())}
                  class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-purple-400 transition-colors"
                >
                  {showPassword() ? (
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  ) : (
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
 
            {/* Remember Me & Forgot Password */}
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe()}
                  onChange={(e) => setRememberMe(e.currentTarget.checked)}
                  class="w-4 h-4 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-purple-600 focus:ring-offset-0 focus:ring-2 cursor-pointer"
                />
                <span class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  Ingat saya
                </span>
              </label>
              <a href="#" class="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                Lupa password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading()}
              class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold text-lg glow-purple-hover transition-all flex items-center justify-center gap-2"
            >
              <Show when={isLoading()}>
                <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </Show>
              {isLoading() ? 'Memproses...' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-800"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-gradient-to-r from-transparent via-gray-900 to-transparent text-gray-500">
                Atau login dengan
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div class="grid grid-cols-2 gap-3">
            <button class="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-all border border-gray-700 hover:border-gray-600">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span class="text-sm font-medium">Google</span>
            </button>
            <button class="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-all border border-gray-700 hover:border-gray-600">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span class="text-sm font-medium">Facebook</span>
            </button>
          </div>
        </div>

        {/* Info Backend */}
        <div class="bg-gray-900/50 rounded-lg border border-gray-800 p-4 mt-6">
          <p class="text-gray-400 text-sm mb-3 font-medium">💡 Informasi:</p>
          <div class="space-y-2 text-xs text-gray-500">
            <div>✅ Login menggunakan akun dari backend</div>
            <div>✅ Gunakan username dan password yang sudah dibuat di database</div>
          </div>
        </div>

        {/* Register Link */}
        <div class="text-center mt-6">
          <p class="text-gray-400">
            Belum punya akun?{' '}
            <A href="/register" class="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
              Daftar sekarang
            </A>
          </p>
        </div>

        {/* Back to Home */}
        <div class="text-center mt-4">
          <A href="/" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Kembali ke Beranda
          </A>
        </div>
      </div>
    </div>
  );
}
