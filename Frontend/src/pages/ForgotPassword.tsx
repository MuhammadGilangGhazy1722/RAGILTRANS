import { createSignal, Show } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import { API_ENDPOINTS, fetchAPI } from '../config/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal('');
  const [success, setSuccess] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validasi email
    if (!email()) {
      setError('Email wajib diisi');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email())) {
      setError('Format email tidak valid');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔄 Mengirim permintaan reset password untuk:', email());
      
      const response = await fetchAPI(API_ENDPOINTS.FORGOT_PASSWORD, {
        method: 'POST',
        body: JSON.stringify({ email: email() }),
      });

      console.log('✅ Reset password berhasil:', response);
      setSuccess(true);
    } catch (err: any) {
      console.error('❌ Reset password gagal:', err);
      setError(err.message || 'Terjadi kesalahan, silakan coba lagi');
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
            Lupa Password?
          </h1>
          <p class="text-gray-400">Masukkan email Anda untuk reset password</p>
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
                <h2 class="text-xl font-semibold text-white mb-2">Email Terkirim!</h2>
                <p class="text-gray-400 mb-6">
                  Kami telah mengirimkan link reset password ke email Anda. 
                  Silakan cek inbox atau folder spam Anda.
                </p>
                <p class="text-sm text-gray-500 mb-6">
                  Link akan kadaluarsa dalam 1 jam.
                </p>
                <A 
                  href="/login"
                  class="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all glow-purple-hover"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                  </svg>
                  Kembali ke Login
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

              {/* Email Field */}
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                    </svg>
                  </div>
                  <input
                    type="email"
                    required
                    value={email()}
                    onInput={(e) => setEmail(e.currentTarget.value)}
                    placeholder="Masukkan email Anda"
                    class="w-full pl-12"
                    autocomplete="email"
                  />
                </div>
              </div>

              {/* Info Box */}
              <div class="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <p class="text-sm text-purple-300">
                  Kami akan mengirimkan link untuk reset password ke email Anda.
                </p>
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
                {isLoading() ? 'Mengirim...' : 'Kirim Link Reset'}
              </button>
            </form>
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
