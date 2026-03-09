import { createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { API_ENDPOINTS, fetchAPI } from '../../config/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = createSignal({
    username: '',
    password: ''
  });

  const [showPassword, setShowPassword] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validasi input
    if (!formData().username || !formData().password) {
      setError('Username dan password harus diisi');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔄 Mencoba login admin ke:', API_ENDPOINTS.ADMIN_LOGIN);
      
      // Panggil API Admin Login Backend
      const response = await fetchAPI(API_ENDPOINTS.ADMIN_LOGIN, {
        method: 'POST',
        body: JSON.stringify({
          username: formData().username,
          password: formData().password,
        }),
      });

      console.log('✅ Login admin berhasil:', response);

      // Simpan data ke localStorage
      if (response.token) {
        localStorage.setItem('adminToken', response.token);  // Changed from 'authToken' to 'adminToken'
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('username', formData().username);
      }

      // Redirect ke dashboard admin
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('❌ Login admin gagal:', err);
      
      // Error lebih informatif
      if (err.message === 'Failed to fetch') {
        setError('❌ Tidak dapat terhubung ke server. Pastikan backend berjalan di ' + API_ENDPOINTS.ADMIN_LOGIN);
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
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl mb-4 shadow-lg shadow-purple-500/50">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-2">
            Admin Portal
          </h1>
          <p class="text-gray-400">Login khusus untuk administrator</p>
        </div>

        {/* Login Card */}
        <div class="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-900/30 p-8 shadow-xl">
          <form onSubmit={handleSubmit} class="space-y-5">
            {/* Error Message */}
            <Show when={error()}>
              <div class="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 flex items-start gap-3">
                <svg class="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="text-purple-300 text-sm">{error()}</span>
              </div>
            </Show>

            {/* Username Input */}
            <div>
              <label class="block text-gray-300 text-sm font-medium mb-2">
                Username Admin
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <input 
                  type="text" 
                  value={formData().username}
                  onInput={(e) => setFormData({ ...formData(), username: e.currentTarget.value })}
                  class="w-full bg-gray-950/50 border border-gray-800 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                  placeholder="Username"
                  disabled={isLoading()}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label class="block text-gray-300 text-sm font-medium mb-2">
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
                  value={formData().password}
                  onInput={(e) => setFormData({ ...formData(), password: e.currentTarget.value })}
                  class="w-full bg-gray-950/50 border border-gray-800 rounded-lg px-4 py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                  placeholder="••••••••"
                  disabled={isLoading()}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword())}
                  class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <Show when={showPassword()} fallback={
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  }>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  </Show>
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button 
              type="submit"
              disabled={isLoading()}
              class="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-3.5 rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Show when={isLoading()} fallback="Login Admin">
                <span class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Memproses...
                </span>
              </Show>
            </button>
          </form>

          {/* Back to User Login */}
          <div class="mt-6 text-center">
            <a href="/login" class="text-sm text-gray-400 hover:text-purple-400 transition-colors">
              ← Kembali ke login user
            </a>
          </div>
        </div>

        {/* Info */}
        <div class="mt-6 text-center">
          <p class="text-xs text-gray-500">
            Halaman ini khusus untuk administrator sistem
          </p>
        </div>
      </div>
    </div>
  );
}

