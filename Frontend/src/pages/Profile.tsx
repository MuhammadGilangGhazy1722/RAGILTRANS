import { createSignal, Show } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';

export default function Profile() {
  const navigate = useNavigate();
  const [user] = createSignal({
    nama: 'Demo User',
    username: 'demouser',
    email: 'demo@ragiltrans.com',
    no_hp: '081234567890'
  });

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div class="min-h-screen bg-[#0B0B0B] py-24">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div class="mb-8">
          <A href="/" class="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors mb-4">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Kembali
          </A>
          <h1 class="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Profil Saya
          </h1>
        </div>

        <Show when={true}>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div class="lg:col-span-1">
              <div class="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-900/30 p-6 card-hover">
                {/* Avatar */}
                <div class="flex flex-col items-center mb-6">
                  <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-600 glow-purple mb-4">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${user().nama}&background=7C3AED&color=fff&size=128`}
                      alt={user().nama}
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <h2 class="text-2xl font-bold text-white mb-1">{user().nama}</h2>
                  <p class="text-purple-400 mb-2">@{user().username}</p>
                  <div class="flex items-center gap-2">
                    <span class="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      Terverifikasi
                    </span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div class="space-y-3 mb-6">
                  <div class="bg-black/50 p-3 rounded-lg border border-gray-800">
                    <p class="text-gray-400 text-xs mb-1">Member Sejak</p>
                    <p class="text-white font-semibold">1 Januari 2026</p>
                  </div>
                  <div class="bg-black/50 p-3 rounded-lg border border-gray-800">
                    <p class="text-gray-400 text-xs mb-1">Role</p>
                    <p class="text-white font-semibold capitalize">User</p>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  class="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  Logout
                </button>
              </div>
            </div>

            {/* Info Details */}
            <div class="lg:col-span-2 space-y-6">
              {/* Personal Info */}
              <div class="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-900/30 p-6 card-hover">
                <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  Informasi Personal
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="bg-black/50 p-4 rounded-lg border border-gray-800">
                    <label class="text-gray-400 text-sm block mb-2">Nama Lengkap</label>
                    <p class="text-white font-semibold">{user().nama}</p>
                  </div>
                  <div class="bg-black/50 p-4 rounded-lg border border-gray-800">
                    <label class="text-gray-400 text-sm block mb-2">Username</label>
                    <p class="text-white font-semibold">@{user().username}</p>
                  </div>
                  <div class="bg-black/50 p-4 rounded-lg border border-gray-800">
                    <label class="text-gray-400 text-sm block mb-2">Email</label>
                    <p class="text-white font-semibold">{user().email}</p>
                  </div>
                  <div class="bg-black/50 p-4 rounded-lg border border-gray-800">
                    <label class="text-gray-400 text-sm block mb-2">No. WhatsApp</label>
                    <p class="text-white font-semibold">{user().no_hp}</p>
                  </div>
                </div>
              </div>

              {/* Booking History */}
              <div class="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-900/30 p-6 card-hover">
                <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Riwayat Sewa
                </h3>
                <div class="text-center py-12">
                  <div class="text-6xl mb-4">📋</div>
                  <p class="text-gray-400">Belum ada riwayat sewa</p>
                  <A href="/sewa" class="inline-block mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold glow-purple-hover">
                    Mulai Sewa Mobil
                  </A>
                </div>
              </div>

              {/* Settings */}
              <div class="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-900/30 p-6 card-hover">
                <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  Pengaturan
                </h3>
                <div class="space-y-3">
                  <button class="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-all text-left flex items-center justify-between">
                    <span>Edit Profil</span>
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                  <button class="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-all text-left flex items-center justify-between">
                    <span>Ubah Password</span>
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                  <Show when={!user()!.is_verified}>
                    <button class="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-all text-left flex items-center justify-between glow-purple-hover">
                      <span>Verifikasi Akun</span>
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </Show>
                </div>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}
