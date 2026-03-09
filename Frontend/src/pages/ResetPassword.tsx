import { createSignal, Show, onMount } from 'solid-js';
import { A, useNavigate, useSearchParams } from '@solidjs/router';
import { API_ENDPOINTS, fetchAPI } from '../config/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = createSignal({
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = createSignal(false);
  const [showConfirmPassword, setShowConfirmPassword] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal('');
  const [success, setSuccess] = createSignal(false);
  const [token, setToken] = createSignal('');

  onMount(() => {
    const tokenFromUrl = searchParams.token;
    if (!tokenFromUrl) {
      setError('Link reset password tidak valid. Token tidak ditemukan.');
    } else {
      // Handle string or string[] from searchParams
      setToken(Array.isArray(tokenFromUrl) ? tokenFromUrl[0] : tokenFromUrl);
    }
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validasi token
    if (!token()) {
      setError('Link reset password tidak valid');
      setIsLoading(false);
      return;
    }

    // Validasi input
    if (!formData().new_password || !formData().confirm_password) {
      setError('Password baru dan konfirmasi password wajib diisi');
      setIsLoading(false);
      return;
    }

    // Validasi password match
    if (formData().new_password !== formData().confirm_password) {
      setError('Password dan konfirmasi password tidak cocok');
      setIsLoading(false);
      return;
    }

    // Validasi panjang password
    if (formData().new_password.length < 6) {
      setError('Password minimal 6 karakter');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔄 Mereset password...');
      
      const response = await fetchAPI(API_ENDPOINTS.RESET_PASSWORD, {
        method: 'POST',
        body: JSON.stringify({
          token: token(),
          new_password: formData().new_password
        }),
      });

      console.log('✅ Password berhasil direset:', response);
      setSuccess(true);

      // Redirect ke login setelah 3 detik
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('❌ Reset password gagal:', err);
      setError(err.message || 'Link tidak valid atau sudah kadaluarsa');
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
            <svg class="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
              <text x="12" y="17" text-anchor="middle" font-size="18" font-weight="bold" fill="currentColor">R</text>
            </svg>
          </div>
          <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-2">
            Reset Password
          </h1>
          <p class="text-gray-400">Masukkan password baru Anda</p>
        </div>

        {/* Card */}
        <div class="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-900/30 p-8 card-hover">
          <Show
            when={!success()}
            fallback={
              <div class="text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4">
                  <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <h2 class="text-xl font-semibold text-white mb-2">Password Berhasil Direset!</h2>
                <p class="text-gray-400 mb-6">
                  Password Anda telah berhasil diubah. Anda akan diarahkan ke halaman login...
                </p>
                <A 
                  href="/login"
                  class="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all glow-purple-hover"
                >
                  Login Sekarang
                </A>
              </div>
            }
          >
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

              {/* New Password Field */}
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  Password Baru
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
                    value={formData().new_password}
                    onInput={(e) => setFormData({ ...formData(), new_password: e.currentTarget.value })}
                    placeholder="Minimal 6 karakter"
                    class="w-full pl-12 pr-12"
                    autocomplete="new-password"
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

              {/* Confirm Password Field */}
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  Konfirmasi Password Baru
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                  </div>
                  <input
                    type={showConfirmPassword() ? 'text' : 'password'}
                    required
                    value={formData().confirm_password}
                    onInput={(e) => setFormData({ ...formData(), confirm_password: e.currentTarget.value })}
                    placeholder="Ulangi password baru"
                    class="w-full pl-12 pr-12"
                    autocomplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword())}
                    class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-purple-400 transition-colors"
                  >
                    {showConfirmPassword() ? (
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

              {/* Password Requirements */}
              <div class="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <p class="text-sm text-purple-300 mb-2 font-semibold">Password harus:</p>
                <ul class="text-sm text-purple-300 space-y-1">
                  <li class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    Minimal 6 karakter
                  </li>
                  <li class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    Kedua password harus sama
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading() || !token()}
                class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold text-lg glow-purple-hover transition-all flex items-center justify-center gap-2"
              >
                <Show when={isLoading()}>
                  <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </Show>
                {isLoading() ? 'Mereset...' : 'Reset Password'}
              </button>
            </form>
          </Show>

          {/* Success State */}
          <Show when={success()}>
            <div class="text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4">
                <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-white mb-2">Password Berhasil Direset!</h2>
              <p class="text-gray-400 mb-2">
                Password Anda telah berhasil diubah.
              </p>
              <p class="text-sm text-gray-500 mb-6">
                Mengalihkan ke halaman login...
              </p>
              <A 
                href="/login"
                class="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all glow-purple-hover"
              >
                Login Sekarang
              </A>
            </div>
          </Show>
        </div>

        {/* Back to Login */}
        <div class="text-center mt-6">
          <A href="/login" class="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Kembali ke Login
          </A>
        </div>
      </div>
    </div>
  );
}
