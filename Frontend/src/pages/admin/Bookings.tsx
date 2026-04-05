import { createSignal, onMount, Show, For } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import { fetchAPI, API_ENDPOINTS } from '../../config/api';
import { showToast } from '../../components/ToastContainer';
import { showConfirm } from '../../components/ConfirmDialogContainer';

interface Booking {
  id: number;
  order_number?: string;
  user_id: number;
  mobil_id: number;
  nama_mobil: string;
  plat_nomor: string;
  nama_customer: string;
  email: string;
  no_hp: string;
  tanggal_pinjam: string;
  jam_pinjam: string;
  tanggal_selesai: string;
  jam_selesai: string;
  jenis_layanan: string;
  harga_per_hari: number;
  durasi_hari: number;
  total_harga: number;
  catatan?: string;
  nama_ktp?: string;
  nik?: string;
  foto_ktp?: string;
  status: string;
  payment_status?: string;
  midtrans_order_id?: string;
  created_at: string;
}

export default function AdminBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = createSignal<Booking[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [filterStatus, setFilterStatus] = createSignal('all');
  const [searchQuery, setSearchQuery] = createSignal('');
  const [selectedBooking, setSelectedBooking] = createSignal<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = createSignal(false);

  onMount(async () => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    await loadBookings();
  });

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await fetchAPI(API_ENDPOINTS.BOOKINGS);
      setBookings(response.data || []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      showToast('Gagal memuat data booking', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Format Rupiah
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

  // Format tanggal
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('id-ID', options);
  };

  // Filter bookings
  const filteredBookings = () => {
    let filtered = bookings();
    
    // Filter by status
    if (filterStatus() !== 'all') {
      filtered = filtered.filter(b => b.status === filterStatus());
    }
    
    // Filter by search
    const query = searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(b => 
        b.nama_mobil.toLowerCase().includes(query) ||
        b.nama_customer.toLowerCase().includes(query) ||
        b.plat_nomor.toLowerCase().includes(query) ||
        (b.order_number && b.order_number.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      'pending': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Menunggu' },
      'menunggu_pembayaran': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Menunggu Pembayaran' },
      'dibayar': { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Dibayar' },
      'lunas': { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Lunas' },
      'menunggu_persetujuan': { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Menunggu Persetujuan' },
      'disetujui': { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Disetujui' },
      'sedang_berlangsung': { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Sedang Berlangsung' },
      'selesai': { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Selesai' },
      'dibatalkan': { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Dibatalkan' },
    };
    
    const badge = badges[status] || { bg: 'bg-gray-500/20', text: 'text-gray-400', label: status };
    return badge;
  };

  // Update status
  const handleUpdateStatus = async (bookingId: number, newStatus: string) => {
    const statusLabel = getStatusBadge(newStatus).label;
    const confirmed = await showConfirm({
      title: 'Konfirmasi Perubahan Status',
      message: `Ubah status booking menjadi "${statusLabel}"?`,
      confirmText: 'Ya, Ubah',
      cancelText: 'Batal',
      confirmType: 'primary'
    });
    
    if (!confirmed) return;
    
    try {
      await fetchAPI(API_ENDPOINTS.UPDATE_BOOKING_STATUS(bookingId), {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      showToast('Status booking berhasil diupdate', 'success');
      await loadBookings();
      setShowDetailModal(false);
    } catch (error: any) {
      console.error('Failed to update status:', error);
      showToast(error.message || 'Gagal mengupdate status booking', 'error');
    }
  };

  // Sync payment status dari Midtrans (untuk sandbox testing)
  const syncPaymentStatus = async (booking: Booking) => {
    if (!booking.midtrans_order_id) {
      showToast('Order ID Midtrans tidak ditemukan', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetchAPI(
        `/api/payments/midtrans/sync/${booking.midtrans_order_id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.success) {
        showToast('Status pembayaran berhasil disinkronkan', 'success');
        await loadBookings();
      } else {
        showToast(response.message || 'Gagal sinkronasi status', 'error');
      }
    } catch (error: any) {
      console.error('Error syncing payment status:', error);
      showToast(error.message || 'Gagal sinkronasi status pembayaran', 'error');
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

  // Statistics
  const getStats = () => {
    const all = bookings();
    return {
      total: all.length,
      menunggu: all.filter(b => b.status === 'menunggu_pembayaran' || b.status === 'pending').length,
      dibayar: all.filter(b => b.status === 'dibayar' || b.status === 'lunas' || b.status === 'menunggu_persetujuan').length,
      disetujui: all.filter(b => b.status === 'disetujui').length,
      berlangsung: all.filter(b => b.status === 'sedang_berlangsung').length,
      selesai: all.filter(b => b.status === 'selesai').length,
    };
  };

  return (
    <div class="min-h-screen bg-[#0B0B0B]">
      {/* Navbar */}
      <nav class="bg-black/90 backdrop-blur-md border-b border-purple-900/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center gap-8">
              <A href="/admin/dashboard" class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <text x="12" y="17" text-anchor="middle" font-size="18" font-weight="bold" fill="currentColor">R</text>
                  </svg>
                </div>
                <span class="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                  Admin Panel
                </span>
              </A>
            </div>

            <button
              onClick={handleLogout}
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-white mb-2">Kelola Booking</h1>
            <p class="text-gray-400">Pantau dan kelola semua booking pelanggan</p>
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

        {/* Statistics Cards */}
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div class="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-purple-900/30 p-4">
            <div class="text-gray-400 text-sm mb-1">Total Booking</div>
            <div class="text-2xl font-bold text-white">{getStats().total}</div>
          </div>
          <div class="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-yellow-900/30 p-4">
            <div class="text-gray-400 text-sm mb-1">Menunggu</div>
            <div class="text-2xl font-bold text-yellow-400">{getStats().menunggu}</div>
          </div>
          <div class="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-blue-900/30 p-4">
            <div class="text-gray-400 text-sm mb-1">Dibayar</div>
            <div class="text-2xl font-bold text-blue-400">{getStats().dibayar}</div>
          </div>
          <div class="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-green-900/30 p-4">
            <div class="text-gray-400 text-sm mb-1">Disetujui</div>
            <div class="text-2xl font-bold text-green-400">{getStats().disetujui}</div>
          </div>
          <div class="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-purple-900/30 p-4">
            <div class="text-gray-400 text-sm mb-1">Berlangsung</div>
            <div class="text-2xl font-bold text-purple-400">{getStats().berlangsung}</div>
          </div>
          <div class="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-800 p-4">
            <div class="text-gray-400 text-sm mb-1">Selesai</div>
            <div class="text-2xl font-bold text-gray-400">{getStats().selesai}</div>
          </div>
        </div>

        {/* Filters */}
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <div class="flex-1">
            <input
              type="text"
              placeholder="Cari booking (kode booking, nama mobil, nama user, plat nomor)..."
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              class="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600"
            />
          </div>
          <div>
            <select
              value={filterStatus()}
              onChange={(e) => setFilterStatus(e.currentTarget.value)}
              class="w-full md:w-auto bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-600"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="menunggu_pembayaran">Menunggu Pembayaran</option>
              <option value="menunggu_persetujuan">Menunggu Persetujuan</option>
              <option value="dibayar">Dibayar</option>
              <option value="lunas">Lunas</option>
              <option value="disetujui">Disetujui</option>
              <option value="sedang_berlangsung">Sedang Berlangsung</option>
              <option value="selesai">Selesai</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div class="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-purple-900/30 overflow-hidden">
          <Show when={!loading()} fallback={
            <div class="flex justify-center items-center h-64">
              <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          }>
            <Show when={filteredBookings().length > 0} fallback={
              <div class="text-center py-12 text-gray-400">
                <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <p class="font-medium">Tidak ada booking</p>
                <p class="text-sm mt-1">Belum ada booking yang sesuai dengan filter</p>
              </div>
            }>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-black/50 border-b border-gray-800">
                    <tr>
                      <th class="text-left px-4 py-4 text-gray-400 font-semibold text-sm">Kode Booking</th>
                      <th class="text-left px-4 py-4 text-gray-400 font-semibold text-sm">User</th>
                      <th class="text-left px-4 py-4 text-gray-400 font-semibold text-sm">Mobil</th>
                      <th class="text-left px-4 py-4 text-gray-400 font-semibold text-sm">Tanggal Pinjam</th>
                      <th class="text-left px-4 py-4 text-gray-400 font-semibold text-sm">Tanggal Selesai</th>
                      <th class="text-left px-4 py-4 text-gray-400 font-semibold text-sm">Durasi</th>
                      <th class="text-left px-4 py-4 text-gray-400 font-semibold text-sm">Total</th>
                      <th class="text-left px-4 py-4 text-gray-400 font-semibold text-sm">Status</th>
                      <th class="text-center px-4 py-4 text-gray-400 font-semibold text-sm">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={filteredBookings()}>
                      {(booking) => (
                        <tr class="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
                          <td class="px-4 py-4">
                            <div class="text-white font-medium">#{booking.order_number || booking.id}</div>
                            {booking.order_number && <div class="text-xs text-gray-500">ID: {booking.id}</div>}
                          </td>
                          <td class="px-4 py-4">
                            <div class="text-white font-medium">{booking.nama_customer}</div>
                            <div class="text-xs text-gray-500">{booking.no_hp}</div>
                          </td>
                          <td class="px-4 py-4">
                            <div class="text-white font-medium">{booking.nama_mobil}</div>
                            <div class="text-xs text-gray-500">{booking.plat_nomor}</div>
                          </td>
                          <td class="px-4 py-4 text-gray-300 text-sm">
                            {formatDate(booking.tanggal_pinjam)}
                            <div class="text-xs text-gray-500">{booking.jam_pinjam}</div>
                          </td>
                          <td class="px-4 py-4 text-gray-300 text-sm">
                            {formatDate(booking.tanggal_selesai)}
                            <div class="text-xs text-gray-500">{booking.jam_selesai}</div>
                          </td>
                          <td class="px-4 py-4 text-gray-300">{booking.durasi_hari} hari</td>
                          <td class="px-4 py-4 text-white font-semibold text-sm">{formatRupiah(booking.total_harga)}</td>
                          <td class="px-4 py-4">
                            <div class="flex items-center justify-center gap-2">
                              <span class={`w-3 h-3 rounded-full ${getStatusBadge(booking.status).bg.replace('/20', '')}`}></span>
                              <span class={`px-3 py-1 rounded-full text-xs font-semibold text-center ${getStatusBadge(booking.status).bg} ${getStatusBadge(booking.status).text}`}>
                                {getStatusBadge(booking.status).label}
                              </span>
                            </div>
                          </td>
                          <td class="px-4 py-4">
                            <div class="flex gap-2 justify-center">
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowDetailModal(true);
                                }}
                                class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-all"
                              >
                                Detail
                              </button>
                              
                              {/* Tombol Refresh Status untuk Midtrans payment yang pending */}
                              <Show when={booking.status === 'menunggu_pembayaran' && booking.midtrans_order_id}>
                                <button
                                  onClick={() => syncPaymentStatus(booking)}
                                  class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-all flex items-center gap-1"
                                  title="Refresh status pembayaran dari Midtrans"
                                >
                                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                  </svg>
                                  Sync
                                </button>
                              </Show>
                            </div>
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>
          </Show>
        </div>
      </div>

      {/* Detail Modal */}
      <Show when={showDetailModal() && selectedBooking()}>
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div class="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-900/30 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
              {/* Modal Header */}
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-white">Detail Booking</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  class="text-gray-400 hover:text-white transition-colors"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <Show when={selectedBooking()}>
                {(booking) => (
                  <div class="space-y-6">
                    {/* Booking Code Info */}
                    <Show when={booking().order_number}>
                      <div class="bg-purple-900/20 border border-purple-800/30 rounded-lg p-4">
                        <div class="flex items-center justify-between">
                          <div>
                            <div class="text-gray-400 text-sm mb-1">Kode Booking</div>
                            <div class="text-purple-400 font-bold text-xl">{booking().order_number}</div>
                          </div>
                          <div class="text-gray-500 text-sm">ID: {booking().id}</div>
                        </div>
                      </div>
                    </Show>

                    {/* Status Badge */}
                    <div class="flex items-center gap-3">
                      <span class="text-gray-400">Status:</span>
                      <span class={`px-4 py-2 rounded-lg font-semibold ${getStatusBadge(booking().status).bg} ${getStatusBadge(booking().status).text}`}>
                        {getStatusBadge(booking().status).label}
                      </span>
                    </div>

                    {/* Info Grid */}
                    <div class="grid md:grid-cols-2 gap-6">
                      {/* Customer Info */}
                      <div class="space-y-3">
                        <h3 class="text-lg font-semibold text-white border-b border-gray-800 pb-2">Informasi Pelanggan</h3>
                        <div>
                          <div class="text-gray-400 text-sm">Nama</div>
                          <div class="text-white font-medium">{booking().nama_customer}</div>
                        </div>
                        <div>
                          <div class="text-gray-400 text-sm">Email</div>
                          <div class="text-white">{booking().email}</div>
                        </div>
                        <div>
                          <div class="text-gray-400 text-sm">No. HP</div>
                          <div class="text-white">{booking().no_hp}</div>
                        </div>
                      </div>

                      {/* Car Info */}
                      <div class="space-y-3">
                        <h3 class="text-lg font-semibold text-white border-b border-gray-800 pb-2">Informasi Mobil</h3>
                        <div>
                          <div class="text-gray-400 text-sm">Nama Mobil</div>
                          <div class="text-white font-medium">{booking().nama_mobil}</div>
                        </div>
                        <div>
                          <div class="text-gray-400 text-sm">Plat Nomor</div>
                          <div class="text-white">{booking().plat_nomor}</div>
                        </div>
                        <div>
                          <div class="text-gray-400 text-sm">Harga per Hari</div>
                          <div class="text-white">{formatRupiah(booking().harga_per_hari)}</div>
                        </div>
                      </div>
                    </div>
{/* KTP Section */}
                    <div class="space-y-3">
                      <h3 class="text-lg font-semibold text-white border-b border-gray-800 pb-2">Verifikasi KTP</h3>
                      <div class="grid md:grid-cols-2 gap-4">
                        <div>
                          <div class="text-gray-400 text-sm">Nama Sesuai KTP</div>
                          <div class="text-white font-medium">{booking().nama_ktp || '-'}</div>
                        </div>
                        <div>
                          <div class="text-gray-400 text-sm">NIK</div>
                          <div class="text-white font-medium">{booking().nik || '-'}</div>
                        </div>
                      </div>
                      <Show when={booking().foto_ktp}>
                        <div>
                          <div class="text-gray-400 text-sm mb-2">Foto KTP</div>
                          <img 
                            src={booking().foto_ktp} 
                            alt="Foto KTP" 
                            class="w-full max-w-md rounded-lg border border-gray-700"
                          />
                        </div>
                      </Show>
                      <Show when={!booking().foto_ktp}>
                        <div class="bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-3">
                          <p class="text-yellow-400 text-sm">⚠️ Foto KTP belum diupload</p>
                        </div>
                      </Show>
                    </div>
                    
                    {/* Rental Details */}
                    <div class="space-y-3">
                      <h3 class="text-lg font-semibold text-white border-b border-gray-800 pb-2">Detail Sewa</h3>
                      <div class="grid md:grid-cols-2 gap-4">
                        <div>
                          <div class="text-gray-400 text-sm">Tanggal & Jam Pinjam</div>
                          <div class="text-white font-medium">{formatDate(booking().tanggal_pinjam)} - {booking().jam_pinjam}</div>
                        </div>
                        <div>
                          <div class="text-gray-400 text-sm">Tanggal & Jam Selesai</div>
                          <div class="text-white font-medium">{formatDate(booking().tanggal_selesai)} - {booking().jam_selesai}</div>
                        </div>
                        <div>
                          <div class="text-gray-400 text-sm">Durasi</div>
                          <div class="text-white font-medium">{booking().durasi_hari} hari</div>
                        </div>
                        <div>
                          <div class="text-gray-400 text-sm">Jenis Layanan</div>
                          <div class="text-white font-medium">{booking().jenis_layanan === 'supir' ? 'Dengan Supir' : 'Lepas Kunci'}</div>
                        </div>
                      </div>
                      <Show when={booking().catatan}>
                        <div>
                          <div class="text-gray-400 text-sm">Catatan</div>
                          <div class="text-white">{booking().catatan}</div>
                        </div>
                      </Show>
                    </div>

                    {/* Total */}
                    <div class="bg-purple-900/20 border border-purple-800/40 rounded-lg p-4">
                      <div class="flex justify-between items-center">
                        <span class="text-gray-300 text-lg">Total Pembayaran</span>
                        <span class="text-2xl font-bold text-white">{formatRupiah(booking().total_harga)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div class="space-y-3">
                      <h3 class="text-lg font-semibold text-white border-b border-gray-800 pb-2">Ubah Status</h3>
                      <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <button
                          onClick={() => handleUpdateStatus(booking().id, 'disetujui')}
                          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                          disabled={booking().status === 'disetujui'}
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(booking().id, 'sedang_berlangsung')}
                          class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                          disabled={booking().status === 'sedang_berlangsung'}
                        >
                          Sedang Berlangsung
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(booking().id, 'selesai')}
                          class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                          disabled={booking().status === 'selesai'}
                        >
                          Selesai
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(booking().id, 'dibatalkan')}
                          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                          disabled={booking().status === 'dibatalkan'}
                        >
                          Batalkan
                        </button>
                      </div>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={() => setShowDetailModal(false)}
                      class="w-full bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                    >
                      Tutup
                    </button>
                  </div>
                )}
              </Show>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
