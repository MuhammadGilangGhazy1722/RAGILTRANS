import { createSignal, Show, onMount, For } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import { fetchAPI, API_ENDPOINTS } from '../../config/api';
import { showToast } from '../../components/ToastContainer';

interface Booking {
  id: number;
  mobil_id: number;
  nama_mobil: string;
  plat_nomor: string;
  jenis_transmisi: string;
  tanggal_pinjam: string;
  jam_pinjam: string;
  tanggal_selesai: string;
  jam_selesai: string;
  jenis_layanan: string;
  harga_per_hari: number;
  durasi_hari: number;
  total_harga: number;
  metode_pembayaran?: string;
  status: string;
  created_at: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = createSignal<any>(null);
  const [bookings, setBookings] = createSignal<Booking[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [loadingBookings, setLoadingBookings] = createSignal(true);
  const [selectedBookingDetail, setSelectedBookingDetail] = createSignal<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = createSignal(false);
  const [showEditModal, setShowEditModal] = createSignal(false);
  const [editForm, setEditForm] = createSignal({
    nama: '',
    username: '',
    email: '',
    no_hp: ''
  });
  const [isUpdating, setIsUpdating] = createSignal(false);

  const handleShowDetail = (booking: Booking) => {
    setSelectedBookingDetail(booking);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setTimeout(() => setSelectedBookingDetail(null), 300);
  };

  const handleOpenEditModal = () => {
    if (user()) {
      setEditForm({
        nama: user().nama,
        username: user().username,
        email: user().email,
        no_hp: user().no_hp
      });
      setShowEditModal(true);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleSaveProfile = async (e: Event) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const response = await fetchAPI(API_ENDPOINTS.UPDATE_PROFILE, {
        method: 'PUT',
        body: JSON.stringify(editForm())
      });

      if (response.success) {
        setUser(response.data);
        
        // Update localStorage untuk sync dengan navbar/header
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('userName', response.data.nama);
        
        showToast('Profil berhasil diperbarui', 'success');
        handleCloseEditModal();
        
        // Reload untuk sync semua komponen yang pakai localStorage
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        showToast(response.message || 'Gagal memperbarui profil', 'error');
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      showToast(error.message || 'Gagal memperbarui profil', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  onMount(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const userData = await fetchAPI(API_ENDPOINTS.PROFILE);
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      showToast('Gagal memuat data profil', 'error');
    } finally {
      setLoading(false);
    }

    // Load bookings
    try {
      const bookingData = await fetchAPI(API_ENDPOINTS.MY_BOOKINGS);
      setBookings(bookingData.data || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    navigate('/');
  };

  const formatRupiah = (angka: number): string => {
    const numberString = angka.toString();
    const split = numberString.split('.');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/g);
    
    if (ribuan) {
      const separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }
    
    return 'Rp ' + rupiah + ',00';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('id-ID', options);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      'pending': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Menunggu' },
      'disetujui': { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Disetujui' },
      'sedang_berlangsung': { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Berlangsung' },
      'selesai': { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Selesai' },
      'dibatalkan': { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Dibatalkan' }
    };
    return statusMap[status] || statusMap['pending'];
  };

  return (
    <div class="min-h-screen bg-[#0B0B0B] py-24">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div class="mb-8">
          <A href="/home" class="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors mb-4">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Kembali
          </A>
          <h1 class="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Profil Saya
          </h1>
        </div>

        <Show when={!loading()} fallback={
          <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        }>
          <Show when={user()}>
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
                    <p class="text-white font-semibold">{new Date(user().created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-xl font-bold text-white flex items-center gap-2">
                    <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Riwayat Sewa
                  </h3>
                  <Show when={!loadingBookings() && bookings().length > 0}>
                    <span class="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm font-semibold">
                      {bookings().length} Pemesanan
                    </span>
                  </Show>
                </div>
                
                <Show when={loadingBookings()}>
                  <div class="flex justify-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                </Show>

                <Show when={!loadingBookings() && bookings().length === 0}>
                  <div class="text-center py-12">
                    <div class="text-6xl mb-4">📋</div>
                    <p class="text-gray-400">Belum ada riwayat sewa</p>
                    <A href="/sewa" class="inline-block mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold glow-purple-hover">
                      Mulai Sewa Mobil
                    </A>
                  </div>
                </Show>

                <Show when={!loadingBookings() && bookings().length > 0}>
                  <div class="relative">
                    <div class="space-y-4 max-h-[600px] overflow-y-auto pr-2 scroll-smooth">
                      <For each={bookings()}>
                        {(booking) => {
                          const statusInfo = getStatusBadge(booking.status);
                          return (
                            <div class="bg-black/50 rounded-lg border border-gray-800 p-4 hover:border-purple-600/50 transition-all">
                              <div class="flex items-start justify-between mb-3">
                                <div class="flex-1">
                                  <h4 class="text-white font-semibold text-lg mb-1">{booking.nama_mobil}</h4>
                                  <p class="text-gray-400 text-sm">{booking.plat_nomor} • {booking.jenis_transmisi}</p>
                                </div>
                                <span class={`${statusInfo.bg} ${statusInfo.text} px-3 py-1 rounded-full text-xs font-semibold`}>
                                  {statusInfo.label}
                                </span>
                              </div>
                              
                              <div class="grid grid-cols-2 gap-3 mb-3 text-sm">
                                <div>
                                  <p class="text-gray-400">Tanggal Mulai</p>
                                  <p class="text-white font-medium">{formatDate(booking.tanggal_pinjam)}</p>
                                </div>
                                <div>
                                  <p class="text-gray-400">Tanggal Selesai</p>
                                  <p class="text-white font-medium">{formatDate(booking.tanggal_selesai)}</p>
                                </div>
                                <div>
                                  <p class="text-gray-400">Durasi</p>
                                  <p class="text-white font-medium">{booking.durasi_hari} Hari</p>
                                </div>
                                <div>
                                  <p class="text-gray-400">Layanan</p>
                                  <p class="text-white font-medium">{booking.jenis_layanan === 'dengan_driver' ? 'Dengan Driver' : 'Tanpa Driver'}</p>
                                </div>
                              </div>
                              
                              <div class="border-t border-gray-800 pt-3 flex items-center justify-between">
                                <div>
                                  <p class="text-gray-400 text-sm">Total Pembayaran</p>
                                  <p class="text-purple-400 font-bold text-lg">{formatRupiah(booking.total_harga)}</p>
                                </div>
                                <button 
                                  onClick={() => handleShowDetail(booking)}
                                  class="bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                >
                                  Lihat Detail
                                </button>
                              </div>
                            </div>
                          );
                        }}
                      </For>
                    </div>
                    {/* Gradient fade at bottom to indicate scrollable content */}
                    <Show when={bookings().length > 2}>
                      <div class="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none rounded-b-lg"></div>
                    </Show>
                  </div>
                </Show>
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
                  <button 
                    onClick={handleOpenEditModal}
                    class="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-all text-left flex items-center justify-between"
                  >
                    <span>Edit Profil</span>
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          </Show>
        </Show>

        {/* Edit Profile Modal */}
        <Show when={showEditModal()}>
          <div 
            class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleCloseEditModal}
          >
            <div 
              class="bg-gradient-to-br from-gray-900 to-black border border-purple-600/30 rounded-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div class="bg-gradient-to-r from-purple-600 to-purple-800 p-6 rounded-t-2xl">
                <div class="flex items-center justify-between">
                  <h2 class="text-2xl font-bold text-white">Edit Profil</h2>
                  <button
                    onClick={handleCloseEditModal}
                    class="text-white hover:text-gray-300 transition-colors"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveProfile} class="p-6 space-y-4">
                <div>
                  <label class="block text-gray-400 text-sm font-medium mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    value={editForm().nama}
                    onInput={(e) => setEditForm({ ...editForm(), nama: e.currentTarget.value })}
                    class="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600 transition-colors"
                    pattern="^[a-zA-Z\s]+$"
                    title="Nama hanya boleh berisi huruf dan spasi"
                    required
                  />
                  <p class="text-gray-500 text-xs mt-1">Hanya huruf dan spasi</p>
                </div>

                <div>
                  <label class="block text-gray-400 text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    value={editForm().username}
                    onInput={(e) => setEditForm({ ...editForm(), username: e.currentTarget.value })}
                    class="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600 transition-colors"
                    placeholder="username"
                    pattern="^[a-zA-Z0-9_]+$"
                    title="Username hanya boleh huruf, angka, dan underscore"
                    required
                  />
                  <p class="text-gray-500 text-xs mt-1">Hanya huruf, angka, dan underscore (_)</p>
                </div>

                <div>
                  <label class="block text-gray-400 text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={editForm().email}
                    onInput={(e) => setEditForm({ ...editForm(), email: e.currentTarget.value })}
                    class="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label class="block text-gray-400 text-sm font-medium mb-2">No. WhatsApp</label>
                  <input
                    type="tel"
                    value={editForm().no_hp}
                    onInput={(e) => setEditForm({ ...editForm(), no_hp: e.currentTarget.value })}
                    class="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600 transition-colors"
                    placeholder="08123456789"
                    required
                  />
                </div>

                {/* Actions */}
                <div class="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    class="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                    disabled={isUpdating()}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isUpdating()}
                  >
                    {isUpdating() ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Show>

        {/* Detail Modal */}
        <Show when={showDetailModal()}>
          <div 
            class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleCloseDetail}
          >
            <div 
              class="bg-gradient-to-br from-gray-900 to-black border border-purple-600/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Show when={selectedBookingDetail()}>
                {(booking) => {
                  const statusInfo = getStatusBadge(booking().status);
                  return (
                    <>
                      {/* Header */}
                      <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-800 p-6 rounded-t-2xl">
                        <div class="flex items-center justify-between mb-2">
                          <h2 class="text-2xl font-bold text-white">Detail Pemesanan</h2>
                          <button
                            onClick={handleCloseDetail}
                            class="text-white hover:text-gray-300 transition-colors"
                          >
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                        <p class="text-purple-100">ID Pemesanan: #{booking().id}</p>
                      </div>

                      {/* Content */}
                      <div class="p-6 space-y-6">
                        {/* Status Badge */}
                        <div class="flex justify-center">
                          <span class={`${statusInfo.bg} ${statusInfo.text} px-6 py-2 rounded-full text-sm font-bold`}>
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* Mobil Info */}
                        <div class="bg-black/50 rounded-xl p-4 border border-gray-800">
                          <h3 class="text-white font-semibold text-lg mb-3 flex items-center gap-2">
                            <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
                            </svg>
                            Informasi Mobil
                          </h3>
                          <div class="space-y-2">
                            <div class="flex justify-between">
                              <span class="text-gray-400">Nama Mobil</span>
                              <span class="text-white font-semibold">{booking().nama_mobil}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-gray-400">Plat Nomor</span>
                              <span class="text-white font-semibold">{booking().plat_nomor}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-gray-400">Transmisi</span>
                              <span class="text-white font-semibold">{booking().jenis_transmisi}</span>
                            </div>
                          </div>
                        </div>

                        {/* Jadwal Sewa */}
                        <div class="bg-black/50 rounded-xl p-4 border border-gray-800">
                          <h3 class="text-white font-semibold text-lg mb-3 flex items-center gap-2">
                            <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            Jadwal Sewa
                          </h3>
                          <div class="grid grid-cols-2 gap-4">
                            <div>
                              <span class="text-gray-400 block mb-1">Tanggal Mulai</span>
                              <span class="text-white font-semibold block">{formatDate(booking().tanggal_pinjam)}</span>
                              <span class="text-gray-400 text-sm">{booking().jam_pinjam}</span>
                            </div>
                            <div>
                              <span class="text-gray-400 block mb-1">Tanggal Selesai</span>
                              <span class="text-white font-semibold block">{formatDate(booking().tanggal_selesai)}</span>
                              <span class="text-gray-400 text-sm">{booking().jam_selesai}</span>
                            </div>
                          </div>
                          <div class="mt-3 pt-3 border-t border-gray-800">
                            <div class="flex justify-between">
                              <span class="text-gray-400">Durasi</span>
                              <span class="text-white font-semibold">{booking().durasi_hari} Hari</span>
                            </div>
                          </div>
                        </div>

                        {/* Detail Layanan */}
                        <div class="bg-black/50 rounded-xl p-4 border border-gray-800">
                          <h3 class="text-white font-semibold text-lg mb-3 flex items-center gap-2">
                            <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                            </svg>
                            Detail Layanan
                          </h3>
                          <div class="space-y-2">
                            <div class="flex justify-between">
                              <span class="text-gray-400">Jenis Layanan</span>
                              <span class="text-white font-semibold">{booking().jenis_layanan === 'dengan_driver' ? 'Dengan Driver' : 'Tanpa Driver'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Rincian Pembayaran */}
                        <div class="bg-gradient-to-br from-purple-900/20 to-black rounded-xl p-4 border border-purple-600/30">
                          <h3 class="text-white font-semibold text-lg mb-3 flex items-center gap-2">
                            <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                            </svg>
                            Rincian Pembayaran
                          </h3>
                          <div class="space-y-2">
                            <div class="flex justify-between">
                              <span class="text-gray-400">Harga per Hari</span>
                              <span class="text-white">{formatRupiah(booking().harga_per_hari)}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-gray-400">Durasi</span>
                              <span class="text-white">{booking().durasi_hari} Hari</span>
                            </div>
                            <Show when={booking().metode_pembayaran}>
                              <div class="flex justify-between pt-2 border-t border-gray-800">
                                <span class="text-gray-400">Metode Pembayaran</span>
                                <span class="text-white font-semibold uppercase">{booking().metode_pembayaran}</span>
                              </div>
                            </Show>
                            <div class="flex justify-between pt-2 border-t border-gray-800">
                              <span class="text-gray-400">Status Pembayaran</span>
                              <span class="text-green-400 font-semibold flex items-center gap-1">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                </svg>
                                LUNAS
                              </span>
                            </div>
                            <div class="flex justify-between pt-3 border-t-2 border-purple-600/30 mt-2">
                              <span class="text-white font-bold text-lg">Total Pembayaran</span>
                              <span class="text-purple-400 font-bold text-xl">{formatRupiah(booking().total_harga)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Info Tambahan */}
                        <div class="bg-black/50 rounded-xl p-4 border border-gray-800">
                          <div class="flex justify-between text-sm">
                            <span class="text-gray-400">Tanggal Pemesanan</span>
                            <span class="text-white">{formatDate(booking().created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div class="sticky bottom-0 bg-gray-900 border-t border-gray-800 p-4 rounded-b-2xl">
                        <button
                          onClick={handleCloseDetail}
                          class="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                        >
                          Tutup
                        </button>
                      </div>
                    </>
                  );
                }}
              </Show>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}
