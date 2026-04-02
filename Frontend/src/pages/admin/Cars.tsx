import { createSignal, onMount, Show, For } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import { fetchAPI, API_ENDPOINTS, uploadFile, SERVER_BASE_URL } from '../../config/api';
import { showToast } from '../../components/ToastContainer';
import { showConfirm } from '../../components/ConfirmDialogContainer';

interface Car {
  id: number;
  nama_mobil: string;
  plat_nomor: string;
  kapasitas_penumpang: number;
  jenis_transmisi: string;
  jenis_bahan_bakar?: string;
  harga_per_hari: number;
  stok: number;
  status: string;
  image_url?: string;
}

export default function AdminCars() {
  const navigate = useNavigate();
  const [cars, setCars] = createSignal<Car[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [showModal, setShowModal] = createSignal(false);
  const [editingCar, setEditingCar] = createSignal<Car | null>(null);
  const [searchQuery, setSearchQuery] = createSignal('');
  
  // Format harga ke Rupiah dengan format lengkap
  const formatRupiah = (angka: number): string => {
    // Manual formatting untuk memastikan format yang konsisten
    const numberString = angka.toString();
    const split = numberString.split('.');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/g);
    
    if (ribuan) {
      const separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }
    
    return rupiah + ',00';
  };
  
  // Format input untuk display (menambahkan titik pemisah ribuan)
  const [displayHarga, setDisplayHarga] = createSignal('');
  
  const formatInputRupiah = (value: string): string => {
    // Remove non-digit characters
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    
    // Format with thousand separators
    return parseInt(numbers).toLocaleString('id-ID');
  };
  
  const handleHargaInput = (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    const rawValue = input.value.replace(/\D/g, ''); // Remove non-digits
    const numericValue = parseInt(rawValue) || 0;
    
    // Update form data with raw number
    setFormData({...formData(), harga_per_hari: numericValue});
    
    // Update display with formatted value
    setDisplayHarga(formatInputRupiah(rawValue));
  };
  
  // Form state
  const [formData, setFormData] = createSignal({
    nama_mobil: '',
    plat_nomor: '',
    kapasitas_penumpang: 0,
    jenis_transmisi: '',
    jenis_bahan_bakar: 'Bensin',
    harga_per_hari: 0,
    stok: 1,
    status: 'tersedia',
    image_url: ''
  });

  // Upload state
  const [isDragging, setIsDragging] = createSignal(false);
  const [uploading, setUploading] = createSignal(false);
  const [imagePreview, setImagePreview] = createSignal<string>('');

  onMount(async () => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    await loadCars();
  });

  const loadCars = async () => {
    try {
      setLoading(true);
      const response = await fetchAPI(API_ENDPOINTS.CARS);
      setCars(response.data || []);
    } catch (error) {
      console.error('Failed to load cars:', error);
      showToast('Gagal memuat data mobil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredCars = () => {
    const query = searchQuery().toLowerCase();
    return cars().filter(car => 
      car.nama_mobil.toLowerCase().includes(query) ||
      car.plat_nomor.toLowerCase().includes(query)
    );
  };

  const handleOpenModal = (car?: Car) => {
    if (car) {
      setEditingCar(car);
      console.log('Data mobil dari database:', car);
      console.log('jenis_transmisi dari database:', car.jenis_transmisi);
      setFormData({
        nama_mobil: car.nama_mobil,
        plat_nomor: car.plat_nomor,
        kapasitas_penumpang: car.kapasitas_penumpang,
        jenis_transmisi: car.jenis_transmisi,
        jenis_bahan_bakar: car.jenis_bahan_bakar || 'Bensin',
        harga_per_hari: car.harga_per_hari,
        stok: car.stok,
        status: car.status,
        image_url: car.image_url || ''
      });
      // Set display harga untuk edit mode
      setDisplayHarga(formatInputRupiah(car.harga_per_hari.toString()));
      if (car.image_url) {
        setImagePreview(`${SERVER_BASE_URL}${car.image_url}`);
      }
    } else {
      setEditingCar(null);
      setFormData({
        nama_mobil: '',
        plat_nomor: '',
        kapasitas_penumpang: 0,
        jenis_transmisi: '',
        jenis_bahan_bakar: 'Bensin',
        harga_per_hari: 0,
        stok: 1,
        status: 'tersedia',
        image_url: ''
      });
      setDisplayHarga('');
      setImagePreview('');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCar(null);
    setImagePreview('');
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validasi file type
    if (!file.type.startsWith('image/')) {
      showToast('File harus berupa gambar!', 'warning');
      return;
    }

    // Validasi file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran file maksimal 5MB!', 'warning');
      return;
    }

    try {
      setUploading(true);

      // Cek token dulu
      const token = localStorage.getItem('adminToken');
      console.log('Admin upload - Token ada?', !!token);
      
      if (!token) {
        showToast('Anda harus login terlebih dahulu!', 'error');
        setUploading(false);
        return;
      }

      // Preview image
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to backend
      console.log('Uploading file:', file.name);
      const response = await uploadFile(API_ENDPOINTS.UPLOAD_IMAGE, file);
      console.log('Upload response:', response);
      
      if (response.success && response.data.url) {
        // Set image URL ke form
        setFormData({...formData(), image_url: response.data.url});
        showToast('Gambar berhasil diupload!', 'success');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      showToast('Gagal upload gambar: ' + error.message, 'error');
      setImagePreview('');
    } finally {
      setUploading(false);
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  // File input handler
  const handleFileInput = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    try {
      const data = formData();
      console.log('=== DATA YANG AKAN DIKIRIM ===');
      console.log('Full data:', data);
      console.log('jenis_transmisi:', data.jenis_transmisi);
      console.log('Type of jenis_transmisi:', typeof data.jenis_transmisi);
      
      if (editingCar()) {
        // Update
        await fetchAPI(API_ENDPOINTS.UPDATE_CAR(editingCar()!.id), {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        showToast('Mobil berhasil diupdate', 'success');
      } else {
        // Create
        await fetchAPI(API_ENDPOINTS.CREATE_CAR, {
          method: 'POST',
          body: JSON.stringify(data)
        });
        showToast('Mobil berhasil ditambahkan', 'success');
      }
      
      handleCloseModal();
      await loadCars();
    } catch (error: any) {
      console.error('Failed to save car:', error);
      showToast(error.message || 'Gagal menyimpan data mobil', 'error');
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    const confirmed = await showConfirm({
      title: 'Hapus Mobil',
      message: `Yakin ingin menghapus mobil "${nama}"?\n\nData yang sudah dihapus tidak dapat dikembalikan.`,
      confirmText: 'Hapus',
      cancelText: 'Batal',
      confirmType: 'danger'
    });
    
    if (!confirmed) return;
    
    try {
      await fetchAPI(API_ENDPOINTS.DELETE_CAR(id), {
        method: 'DELETE'
      });
      showToast('Mobil berhasil dihapus', 'success');
      await loadCars();
    } catch (error) {
      console.error('Failed to delete car:', error);
      showToast('Gagal menghapus mobil', 'error');
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
            <h1 class="text-4xl font-bold text-white mb-2">Kelola Mobil</h1>
            <p class="text-gray-400">Tambah, edit, dan hapus data mobil</p>
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

        {/* Actions Bar */}
        <div class="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div class="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Cari mobil..."
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              class="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600"
            />
          </div>
          
          <button
            onClick={() => handleOpenModal()}
            class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 justify-center"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Tambah Mobil
          </button>
        </div>

        {/* Cars Table */}
        <div class="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-purple-900/30 overflow-hidden">
          <Show when={!loading()} fallback={
            <div class="flex justify-center items-center h-64">
              <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          }>
            <Show when={filteredCars().length > 0} fallback={
              <div class="text-center py-12 text-gray-400">
                <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Tidak ada data mobil
              </div>
            }>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-black/50 border-b border-gray-800">
                    <tr>
                      <th class="text-left px-6 py-4 text-gray-400 font-semibold">Nama Mobil</th>
                      <th class="text-left px-6 py-4 text-gray-400 font-semibold">Plat Nomor</th>
                      <th class="text-left px-6 py-4 text-gray-400 font-semibold">Kapasitas</th>
                      <th class="text-left px-6 py-4 text-gray-400 font-semibold">Transmisi</th>
                      <th class="text-left px-6 py-4 text-gray-400 font-semibold">Harga/Hari</th>
                      <th class="text-left px-6 py-4 text-gray-400 font-semibold">Status</th>
                      <th class="text-center px-6 py-4 text-gray-400 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={filteredCars()}>
                      {(car) => (
                        <tr class="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
                          <td class="px-6 py-4 text-white font-medium">{car.nama_mobil}</td>
                          <td class="px-6 py-4 text-gray-300">{car.plat_nomor}</td>
                          <td class="px-6 py-4 text-gray-300">{car.kapasitas_penumpang} Orang</td>
                          <td class="px-6 py-4 text-gray-300">{car.jenis_transmisi}</td>
                          <td class="px-6 py-4 text-gray-300 font-semibold">Rp {formatRupiah(car.harga_per_hari)}</td>
                          <td class="px-6 py-4">
                            <span class={`px-3 py-1 rounded-full text-xs font-semibold ${
                              car.status.toLowerCase() === 'tersedia' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {car.status === 'tersedia' ? 'Tersedia' : car.status === 'disewa' ? 'Disewa' : car.status}
                            </span>
                          </td>
                          <td class="px-6 py-4">
                            <div class="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenModal(car)}
                                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-all"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(car.id, car.nama_mobil)}
                                class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-all"
                              >
                                Hapus
                              </button>
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

      {/* Modal Form */}
      <Show when={showModal()}>
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div class="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-900/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
              {/* Modal Header */}
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-white">
                  {editingCar() ? 'Edit Mobil' : 'Tambah Mobil Baru'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  class="text-gray-400 hover:text-white transition-colors"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} class="space-y-4">
                <div>
                  <label class="block text-gray-300 mb-2 font-medium">Nama Mobil *</label>
                  <input
                    type="text"
                    required
                    value={formData().nama_mobil}
                    onInput={(e) => setFormData({...formData(), nama_mobil: e.currentTarget.value})}
                    class="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-600"
                    placeholder="Toyota Innova"
                  />
                </div>

                <div>
                  <label class="block text-gray-300 mb-2 font-medium">Plat Nomor *</label>
                  <input
                    type="text"
                    required
                    value={formData().plat_nomor}
                    onInput={(e) => setFormData({...formData(), plat_nomor: e.currentTarget.value})}
                    class="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-600"
                    placeholder="B 1234 XYZ"
                  />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-gray-300 mb-2 font-medium">Kapasitas Penumpang *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData().kapasitas_penumpang}
                      onInput={(e) => setFormData({...formData(), kapasitas_penumpang: parseInt(e.currentTarget.value) || 0})}
                      class="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-600"
                      placeholder="7"
                    />
                  </div>

                  <div>
                    <label class="block text-gray-300 mb-2 font-medium">Transmisi *</label>
                    <select
                      required
                      value={formData().jenis_transmisi}
                      onChange={(e) => {
                        console.log('Transmisi dipilih:', e.currentTarget.value);
                        setFormData({...formData(), jenis_transmisi: e.currentTarget.value});
                        console.log('FormData setelah update transmisi:', formData());
                      }}
                      class="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-600"
                    >
                      <option value="">Pilih Transmisi</option>
                      <option value="manual">Manual</option>
                      <option value="matic">Matic</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-gray-300 mb-2 font-medium">Bahan Bakar *</label>
                    <select
                      required
                      value={formData().jenis_bahan_bakar}
                      onChange={(e) => setFormData({...formData(), jenis_bahan_bakar: e.currentTarget.value})}
                      class="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-600"
                    >
                      <option value="Bensin">Bensin</option>
                      <option value="Solar">Solar</option>
                      <option value="Listrik">Listrik</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-gray-300 mb-2 font-medium">Harga per Hari (Rp) *</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                        Rp
                      </div>
                      <input
                        type="text"
                        required
                        value={displayHarga()}
                        onInput={handleHargaInput}
                        class="w-full bg-gray-900 border border-gray-800 rounded-lg pl-12 pr-4 py-2 text-white focus:outline-none focus:border-purple-600"
                        placeholder="350.000"
                      />
                    </div>
                    <p class="text-xs text-gray-500 mt-1">Format: 350.000 (tanpa desimal)</p>
                  </div>
                </div>

                <div>
                  <label class="block text-gray-300 mb-2 font-medium">Status *</label>
                  <select
                    required
                    value={formData().status}
                    onChange={(e) => setFormData({...formData(), status: e.currentTarget.value})}
                    class="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-600"
                  >
                    <option value="tersedia">Tersedia</option>
                    <option value="disewa">Disewa</option>
                  </select>
                </div>

                {/* Gambar Mobil Section */}
                <div class="space-y-3">
                  <label class="block text-gray-300 font-medium">Gambar Mobil</label>
                  
                  {/* Drag & Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    class={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                      isDragging() 
                        ? 'border-purple-500 bg-purple-500/10' 
                        : 'border-gray-700 hover:border-purple-500/50 bg-gray-900'
                    }`}
                  >
                    <Show when={uploading()}>
                      <div class="flex flex-col items-center gap-2">
                        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                        <p class="text-gray-400">Uploading gambar...</p>
                      </div>
                    </Show>

                    <Show when={!uploading() && !imagePreview() && !formData().image_url}>
                      <div class="flex flex-col items-center gap-3">
                        <svg class="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        <div>
                          <p class="text-gray-300 font-medium mb-1">Drag & Drop gambar di sini</p>
                          <p class="text-gray-500 text-sm">atau klik tombol di bawah</p>
                        </div>
                        <label class="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all">
                          Pilih File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileInput}
                            class="hidden"
                          />
                        </label>
                        <p class="text-gray-600 text-xs">Max 5MB (JPG, PNG, GIF, WebP)</p>
                      </div>
                    </Show>

                    <Show when={!uploading() && (imagePreview() || formData().image_url)}>
                      <div class="flex flex-col items-center gap-3">
                        <img 
                          src={imagePreview() || formData().image_url} 
                          alt="Preview" 
                          class="max-h-48 rounded-lg object-contain"
                        />
                        <div class="flex gap-2">
                          <label class="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm">
                            Ganti Gambar
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileInput}
                              class="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({...formData(), image_url: ''});
                              setImagePreview('');
                            }}
                            class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </Show>
                  </div>

                  {/* Manual URL Input */}
                  <div>
                    <label class="block text-gray-400 text-sm mb-2">Atau masukkan URL gambar manual:</label>
                    <input
                      type="url"
                      value={formData().image_url}
                      onInput={(e) => {
                        setFormData({...formData(), image_url: e.currentTarget.value});
                        setImagePreview('');
                      }}
                      class="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-600 text-sm"
                      placeholder="https://example.com/mobil.jpg"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div class="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    class="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    {editingCar() ? 'Update' : 'Tambah'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
