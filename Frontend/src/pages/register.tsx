import { createSignal, Show } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import { API_ENDPOINTS, fetchAPI } from '../config/api';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = createSignal({
    nama: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    no_hp: ''
  });

  const [showPassword, setShowPassword] = createSignal(false);
  const [showConfirmPassword, setShowConfirmPassword] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [acceptTerms, setAcceptTerms] = createSignal(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validasi nama
    if (!formData().nama.trim()) {
      newErrors.nama = 'Nama lengkap harus diisi';
    } else if (formData().nama.length < 3) {
      newErrors.nama = 'Nama minimal 3 karakter';
    }

    // Validasi username
    if (!formData().username.trim()) {
      newErrors.username = 'Username harus diisi';
    } else if (formData().username.length < 4) {
      newErrors.username = 'Username minimal 4 karakter';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData().username)) {
      newErrors.username = 'Username hanya boleh huruf, angka, dan underscore';
    }

    // Validasi email
    if (!formData().email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData().email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Validasi password
    if (!formData().password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData().password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter';
    }

    // Validasi konfirmasi password
    if (formData().password !== formData().confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    // Validasi no HP
    if (!formData().no_hp.trim()) {
      newErrors.no_hp = 'Nomor HP harus diisi';
    } else if (!/^(\+62|62|0)[0-9]{9,12}$/.test(formData().no_hp.replace(/\s/g, ''))) {
      newErrors.no_hp = 'Format nomor HP tidak valid';
    }

    // Validasi terms
    if (!acceptTerms()) {
      newErrors.terms = 'Anda harus menyetujui syarat dan ketentuan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔄 Mencoba register ke:', API_ENDPOINTS.REGISTER);
      
      // Panggil API Register Backend
      const response = await fetchAPI(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        body: JSON.stringify({
          nama: formData().nama,
          username: formData().username,
          email: formData().email,
          password: formData().password,
          no_hp: formData().no_hp.replace(/\s/g, ''), // Remove spaces
        }),
      });

      console.log('✅ Registrasi berhasil:', response);
      
      // Tampilkan success message
      alert('✅ Registrasi berhasil!\n\nSilakan login dengan akun Anda.');
      
      // Redirect ke login
      navigate('/login');
    } catch (err: any) {
      console.error('❌ Registrasi gagal:', err);
      
      // Set error message
      const errorMsg = err.message || 'Registrasi gagal. Silakan coba lagi.';
      
      // Cek error spesifik
      if (errorMsg.includes('username')) {
        setErrors({ username: 'Username sudah digunakan' });
      } else if (errorMsg.includes('email')) {
        setErrors({ email: 'Email sudah terdaftar' });
      } else {
        setErrors({ general: errorMsg });
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

      <div class="w-full max-w-lg relative z-10">
        {/* Logo & Header */}
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl mb-4 glow-purple">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-2">
            Daftar Akun
          </h1>
          <p class="text-gray-400">Buat akun LuxeDrive untuk mulai menyewa</p>
        </div>

        {/* Register Card */}
        <div class="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-900/30 p-8 card-hover">
          <form onSubmit={handleSubmit} class="space-y-4">
            {/* General Error */}
            <Show when={errors().general}>
              <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                <svg class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-red-400 text-sm">{errors().general}</p>
              </div>
            </Show>

            {/* Terms Error */}
            <Show when={errors().terms}>
              <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                <svg class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-red-400 text-sm">{errors().terms}</p>
              </div>
            </Show>

            {/* Nama Lengkap */}
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Nama Lengkap <span class="text-red-500">*</span>
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
                  value={formData().nama}
                  onInput={(e) => setFormData({ ...formData(), nama: e.currentTarget.value })}
                  placeholder="Contoh: John Doe"
                  class="w-full pl-12"
                  classList={{ 'border-red-500': !!errors().nama }}
                />
              </div>
              <Show when={errors().nama}>
                <p class="text-red-400 text-xs mt-1">{errors().nama}</p>
              </Show>
            </div>

            {/* Username */}
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Username <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                  </svg>
                </div>
                <input
                  type="text"
                  required
                  value={formData().username}
                  onInput={(e) => setFormData({ ...formData(), username: e.currentTarget.value.toLowerCase() })}
                  placeholder="Contoh: johndoe123"
                  class="w-full pl-12"
                  classList={{ 'border-red-500': !!errors().username }}
                />
              </div>
              <Show when={errors().username}>
                <p class="text-red-400 text-xs mt-1">{errors().username}</p>
              </Show>
            </div>

            {/* Email */}
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Email <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <input
                  type="email"
                  required
                  value={formData().email}
                  onInput={(e) => setFormData({ ...formData(), email: e.currentTarget.value })}
                  placeholder="email@example.com"
                  class="w-full pl-12"
                  classList={{ 'border-red-500': !!errors().email }}
                />
              </div>
              <Show when={errors().email}>
                <p class="text-red-400 text-xs mt-1">{errors().email}</p>
              </Show>
            </div>

            {/* No HP */}
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                No HP <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                </div>
                <input
                  type="tel"
                  required
                  value={formData().no_hp}
                  onInput={(e) => setFormData({ ...formData(), no_hp: e.currentTarget.value })}
                  placeholder="08xxxxxxxxxx"
                  class="w-full pl-12"
                  classList={{ 'border-red-500': !!errors().no_hp }}
                />
              </div>
              <Show when={errors().no_hp}>
                <p class="text-red-400 text-xs mt-1">{errors().no_hp}</p>
              </Show>
            </div>

            {/* Password */}
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Password <span class="text-red-500">*</span>
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
                  placeholder="Minimal 8 karakter"
                  class="w-full pl-12 pr-12"
                  classList={{ 'border-red-500': !!errors().password }}
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
              <Show when={errors().password}>
                <p class="text-red-400 text-xs mt-1">{errors().password}</p>
              </Show>
            </div>

            {/* Confirm Password */}
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Konfirmasi Password <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <input
                  type={showConfirmPassword() ? 'text' : 'password'}
                  required
                  value={formData().confirmPassword}
                  onInput={(e) => setFormData({ ...formData(), confirmPassword: e.currentTarget.value })}
                  placeholder="Ulangi password"
                  class="w-full pl-12 pr-12"
                  classList={{ 'border-red-500': !!errors().confirmPassword }}
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
              <Show when={errors().confirmPassword}>
                <p class="text-red-400 text-xs mt-1">{errors().confirmPassword}</p>
              </Show>
            </div>

            {/* Terms & Conditions */}
            <div class="pt-2">
              <label class="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={acceptTerms()}
                  onChange={(e) => setAcceptTerms(e.currentTarget.checked)}
                  class="w-5 h-5 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-purple-600 focus:ring-offset-0 focus:ring-2 cursor-pointer mt-0.5"
                />
                <span class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                  Saya menyetujui syarat & ketentuan dan kebijakan privasi
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading()}
              class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold text-lg glow-purple-hover transition-all flex items-center justify-center gap-2 mt-6"
            >
              <Show when={isLoading()}>
                <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </Show>
              {isLoading() ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
          </form>
        </div>

        {/* Login Link */}
        <div class="text-center mt-6">
          <p class="text-gray-400">
            Sudah punya akun?{' '}
            <A href="/login" class="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
              Login di sini
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
