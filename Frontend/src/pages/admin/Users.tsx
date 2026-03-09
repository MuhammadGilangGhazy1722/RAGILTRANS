import { createSignal, onMount, Show, For } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import { fetchAPI, API_ENDPOINTS } from '../../config/api';
import { showToast } from '../../components/ToastContainer';
import { showConfirm } from '../../components/ConfirmDialogContainer';

interface User {
  id: number;
  nama: string;
  email: string;
  username: string;
  no_hp: string;
  created_at: string;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = createSignal<User[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [searchQuery, setSearchQuery] = createSignal('');
  const [selectedUser, setSelectedUser] = createSignal<User | null>(null);
  const [showDetailModal, setShowDetailModal] = createSignal(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = createSignal(false);
  const [newPassword, setNewPassword] = createSignal('');
  const [isResetting, setIsResetting] = createSignal(false);

  onMount(async () => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    await loadUsers();
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetchAPI(API_ENDPOINTS.ADMIN_USERS);
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      showToast('Gagal memuat data user', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Format tanggal
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('id-ID', options);
  };

  // Filter users by search
  const filteredUsers = () => {
    const query = searchQuery().toLowerCase();
    if (!query) return users();
    
    return users().filter(u => 
      u.nama.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query) ||
      u.no_hp.includes(query)
    );
  };

  const handleViewDetail = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowResetPasswordModal(true);
  };

  const handleResetPasswordSubmit = async () => {
    const user = selectedUser();
    if (!user) return;

    if (!newPassword() || newPassword().length < 6) {
      showToast('Password minimal 6 karakter', 'warning');
      return;
    }

    const confirmed = await showConfirm({
      title: 'Reset Password User',
      message: `Yakin ingin reset password user "${user.nama}"?`,
      confirmText: 'Ya, Reset',
      cancelText: 'Batal',
      confirmType: 'danger'
    });

    if (!confirmed) return;

    try {
      setIsResetting(true);
      await fetchAPI(API_ENDPOINTS.ADMIN_RESET_PASSWORD(user.id), {
        method: 'PUT',
        body: JSON.stringify({ new_password: newPassword() })
      });
      
      showToast(`Password user "${user.nama}" berhasil direset`, 'success');
      setShowResetPasswordModal(false);
      setNewPassword('');
    } catch (error: any) {
      console.error('Failed to reset password:', error);
      showToast(error.message || 'Gagal reset password', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    navigate('/');
  };

  return (
    <div class="min-h-screen bg-[#0B0B0B]">
      {/* Navbar */}
      <nav class="bg-black/90 backdrop-blur-md border-b border-purple-900/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
              <span class="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                Kelola User
              </span>
            </div>

            <div class="flex items-center gap-4">
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

      {/* Main Content */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header & Search */}
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-white mb-2">Kelola User</h1>
            <p class="text-gray-400 mb-6">Manajemen dan monitoring pengguna</p>
          </div>
          <A 
            href="/admin/dashboard" 
            class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Kembali
          </A>
        </div>

        {/* Search & Stats */}
        <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
          {/* Search */}
          <div class="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Cari nama, email, username, atau no hp..."
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                class="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600"
              />
              <svg class="w-5 h-5 text-gray-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>

          {/* Stats */}
          <div class="flex items-center gap-4">
            <div class="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-600/30 rounded-lg px-4 py-2">
              <span class="text-purple-400 font-semibold">{filteredUsers().length}</span>
              <span class="text-gray-400 text-sm ml-2">User</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        <Show when={loading()}>
          <div class="flex justify-center items-center py-20">
            <div class="text-center">
              <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p class="text-gray-400">Memuat data user...</p>
            </div>
          </div>
        </Show>

        {/* Users Table */}
        <Show when={!loading()}>
          <div class="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-900/30 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-purple-600/10 border-b border-gray-800">
                  <tr>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">No</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Nama</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Username</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Email</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">No HP</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Terdaftar</th>
                    <th class="px-6 py-4 text-center text-xs font-semibold text-purple-400 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-800">
                  <Show when={filteredUsers().length === 0}>
                    <tr>
                      <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                        <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                        </svg>
                        <p class="text-lg">Tidak ada user ditemukan</p>
                      </td>
                    </tr>
                  </Show>
                  <For each={filteredUsers()}>
                    {(user, index) => (
                      <tr class="hover:bg-purple-900/10 transition-colors">
                        <td class="px-6 py-4 text-gray-300">{index() + 1}</td>
                        <td class="px-6 py-4">
                          <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                              <span class="text-white font-semibold text-sm">{user.nama.charAt(0).toUpperCase()}</span>
                            </div>
                            <span class="text-white font-medium">{user.nama}</span>
                          </div>
                        </td>
                        <td class="px-6 py-4 text-gray-300">{user.username}</td>
                        <td class="px-6 py-4 text-gray-300">{user.email}</td>
                        <td class="px-6 py-4 text-gray-300">{user.no_hp}</td>
                        <td class="px-6 py-4 text-gray-400 text-sm">{formatDate(user.created_at)}</td>
                        <td class="px-6 py-4">
                          <div class="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetail(user)}
                              class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                              title="Lihat Detail"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => handleResetPassword(user)}
                              class="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                              title="Reset Password"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </div>
        </Show>
      </div>

      {/* Detail Modal */}
      <Show when={showDetailModal() && selectedUser()}>
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4" onClick={() => setShowDetailModal(false)}>
          <div class="bg-gradient-to-br from-gray-900 to-black border border-purple-900/50 rounded-2xl max-w-2xl w-full p-8 glow-purple" onClick={(e) => e.stopPropagation()}>
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-white">Detail User</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                class="text-gray-400 hover:text-white"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="space-y-4">
              <div class="flex items-center gap-4 mb-6">
                <div class="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                  <span class="text-white font-bold text-2xl">{selectedUser()!.nama.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-white">{selectedUser()!.nama}</h3>
                  <p class="text-gray-400">@{selectedUser()!.username}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4">
                <div class="bg-black/50 p-4 rounded-xl border border-gray-800">
                  <p class="text-gray-400 text-sm mb-1">Email</p>
                  <p class="text-white font-medium">{selectedUser()!.email}</p>
                </div>

                <div class="bg-black/50 p-4 rounded-xl border border-gray-800">
                  <p class="text-gray-400 text-sm mb-1">No HP</p>
                  <p class="text-white font-medium">{selectedUser()!.no_hp}</p>
                </div>

                <div class="bg-black/50 p-4 rounded-xl border border-gray-800">
                  <p class="text-gray-400 text-sm mb-1">User ID</p>
                  <p class="text-white font-medium">#{selectedUser()!.id}</p>
                </div>

                <div class="bg-black/50 p-4 rounded-xl border border-gray-800">
                  <p class="text-gray-400 text-sm mb-1">Terdaftar Sejak</p>
                  <p class="text-white font-medium">{formatDate(selectedUser()!.created_at)}</p>
                </div>
              </div>

              <div class="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleResetPassword(selectedUser()!);
                  }}
                  class="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Reset Password
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  class="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>

      {/* Reset Password Modal */}
      <Show when={showResetPasswordModal() && selectedUser()}>
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4" onClick={() => setShowResetPasswordModal(false)}>
          <div class="bg-gradient-to-br from-gray-900 to-black border border-purple-900/50 rounded-2xl max-w-md w-full p-8 glow-purple" onClick={(e) => e.stopPropagation()}>
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-white">Reset Password</h2>
              <button
                onClick={() => setShowResetPasswordModal(false)}
                class="text-gray-400 hover:text-white"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="mb-6">
              <div class="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  <div class="text-sm">
                    <p class="text-orange-200 font-semibold mb-1">Perhatian!</p>
                    <p class="text-orange-300/90">Password akan direset untuk user: <span class="font-semibold">{selectedUser()!.nama}</span></p>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-gray-300 text-sm font-medium mb-2">Password Baru *</label>
                <input
                  type="text"
                  value={newPassword()}
                  onInput={(e) => setNewPassword(e.currentTarget.value)}
                  placeholder="Minimal 6 karakter"
                  class="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600"
                />
                <p class="text-gray-500 text-xs mt-2">Password akan terlihat untuk memudahkan admin memberitahu user</p>
              </div>
            </div>

            <div class="flex gap-3">
              <button
                onClick={handleResetPasswordSubmit}
                disabled={isResetting()}
                class="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                {isResetting() ? 'Mereset...' : 'Reset Password'}
              </button>
              <button
                onClick={() => setShowResetPasswordModal(false)}
                disabled={isResetting()}
                class="flex-1 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
