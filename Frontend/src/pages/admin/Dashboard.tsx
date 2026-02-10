import { createSignal, onMount } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = createSignal('');

  onMount(() => {
    // Cek apakah user sudah login dan role-nya admin
    const role = localStorage.getItem('userRole');
    const user = localStorage.getItem('username');
    
    if (role !== 'admin') {
      // Jika bukan admin, redirect ke login
      navigate('/login');
      return;
    }
    
    setUsername(user || 'Admin');
  });

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div class="min-h-screen bg-[#0B0B0B]">
      {/* Navbar */}
      <nav class="bg-black/90 backdrop-blur-md border-b border-gray-800/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <span class="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                Admin Panel
              </span>
            </div>

            <div class="flex items-center gap-4">
              <span class="text-gray-300">Halo, <span class="text-purple-400 font-semibold">{username()}</span></span>
              <button
                onClick={handleLogout}
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-white mb-2">Dashboard Admin</h1>
          <p class="text-gray-400">Kelola sistem sewa mobil RagilTrans</p>
        </div>

        {/* Menu Cards */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <A href="/admin/cars" class="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-900/30 p-6 card-hover group">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-purple-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg class="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-white mb-1">Kelola Mobil</h3>
                <p class="text-gray-400 text-sm">Tambah, edit, hapus mobil</p>
              </div>
            </div>
          </A>

          <A href="/admin/rentals" class="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-900/30 p-6 card-hover group">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-green-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg class="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-white mb-1">Kelola Booking</h3>
                <p class="text-gray-400 text-sm">Lihat & kelola booking</p>
              </div>
            </div>
          </A>

          <A href="/admin/users" class="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-900/30 p-6 card-hover group">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-blue-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg class="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-white mb-1">Kelola User</h3>
                <p class="text-gray-400 text-sm">Manajemen pengguna</p>
              </div>
            </div>
          </A>
        </div>

        {/* Back to Home */}
        <div class="mt-8 text-center">
          <A href="/" class="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Kembali ke Halaman Utama
          </A>
        </div>
      </div>
    </div>
  );
}
