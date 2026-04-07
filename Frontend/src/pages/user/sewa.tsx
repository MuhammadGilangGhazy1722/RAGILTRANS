import { createSignal, For, Show, onMount } from 'solid-js';
import { A } from '@solidjs/router';
import { fetchAPI, API_ENDPOINTS } from '../../config/api';
import { showToast } from '../../components/ToastContainer';
import { showConfirm } from '../../components/ConfirmDialogContainer';
import ReviewModal from '../../components/ReviewModal';
import tragaImg from '../../assets/traga.jpeg';
import l300Img from '../../assets/l300.jpeg';
import innovaImg from '../../assets/innova.jpeg';
import luxioImg from '../../assets/luxio.jpeg';
import pantherImg from '../../assets/phanter.jpeg';

interface Car {
  id: number;
  nama_mobil: string;
  plat_nomor: string;
  kapasitas_penumpang: number;
  jenis_transmisi: string;
  harga_per_hari: number;
  stok: number;
  status: string;
  image_url?: string;
  name?: string;
  capacity?: string;
  transmission?: string;
  price?: string;
  fuel?: string;
  image?: string;
  description?: string;
  badge?: string;
  features?: string[];
}

export default function Sewa() {
  const [showModal, setShowModal] = createSignal(false);
  const [selectedCar, setSelectedCar] = createSignal<Car | null>(null);
  const [showBookingForm, setShowBookingForm] = createSignal(false);
  const [bookingStep, setBookingStep] = createSignal(1);
  const [cars, setCars] = createSignal<Car[]>([]);
  const [loading, setLoading] = createSignal(true);

  const [dateFilterEnabled, setDateFilterEnabled] = createSignal(false);
  const [filterStartDate, setFilterStartDate] = createSignal('');
  const [filterEndDate, setFilterEndDate] = createSignal('');
  const [filteredCars, setFilteredCars] = createSignal<Car[]>([]);

  const getCarImage = (nama: string) => {
    const namaLower = nama.toLowerCase();
    if (namaLower.includes('traga')) return tragaImg;
    if (namaLower.includes('l300')) return l300Img;
    if (namaLower.includes('innova')) return innovaImg;
    if (namaLower.includes('luxio')) return luxioImg;
    if (namaLower.includes('phanter') || namaLower.includes('panther')) return pantherImg;
    return innovaImg;
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
    return rupiah + ',00';
  };

  const calculateDuration = (): number => {
    const start = bookingData().startDate;
    const end = bookingData().endDate;
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const calculateDriverFee = (): number => {
    return bookingData().withDriver === 'yes' ? 50000 : 0;
  };

  const calculateTotalPrice = (): number => {
    const car = selectedCar();
    if (!car || !car.harga_per_hari) return 0;
    return car.harga_per_hari * calculateDuration() + calculateDriverFee();
  };

  const calculateDays = () => {
    const start = new Date(bookingData().startDate);
    const end = new Date(bookingData().endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  onMount(async () => {
    try {
      setLoading(true);
      const response = await fetchAPI(API_ENDPOINTS.CARS);
      if (response.success) {
        const mappedCars = response.data.map((car: any) => {
          let imageUrl = getCarImage(car.nama_mobil);
          if (car.image_url) {
            if (car.image_url.startsWith('http')) {
              imageUrl = car.image_url;
            } else {
              const baseUrl = API_ENDPOINTS.CARS.replace('/api/cars', '');
              imageUrl = `${baseUrl}${car.image_url}`;
            }
          }
          return {
            id: car.id,
            nama_mobil: car.nama_mobil,
            plat_nomor: car.plat_nomor,
            kapasitas_penumpang: car.kapasitas_penumpang,
            jenis_transmisi: car.jenis_transmisi,
            harga_per_hari: car.harga_per_hari,
            stok: car.stok,
            status: car.status,
            name: car.nama_mobil,
            capacity: `${car.kapasitas_penumpang} Orang`,
            transmission: car.jenis_transmisi,
            price: formatRupiah(car.harga_per_hari),
            fuel: car.jenis_bahan_bakar || 'Bensin',
            description: car.nama_mobil,
            image: imageUrl,
            image_url: car.image_url
          };
        });
        setCars(mappedCars);
        setFilteredCars(mappedCars);
      }
    } catch (error) {
      showToast('Gagal memuat data mobil. Pastikan backend sudah berjalan.', 'error');
    } finally {
      setLoading(false);
    }
  });

  const fetchAvailableCars = async () => {
    const startDate = filterStartDate();
    const endDate = filterEndDate();
    if (!startDate || !endDate) { showToast('Pilih tanggal mulai dan selesai terlebih dahulu', 'error'); return; }
    if (new Date(endDate) <= new Date(startDate)) { showToast('Tanggal selesai harus setelah tanggal mulai', 'error'); return; }
    try {
      setLoading(true);
      const response = await fetchAPI(`${API_ENDPOINTS.BOOKINGS}/available-cars?start_date=${startDate}&end_date=${endDate}`);
      if (response.success) {
        const mappedCars = response.data.map((car: any) => {
          let imageUrl = getCarImage(car.nama_mobil);
          if (car.image_url) {
            if (car.image_url.startsWith('http')) { imageUrl = car.image_url; }
            else { imageUrl = `${API_ENDPOINTS.CARS.replace('/api/cars', '')}${car.image_url}`; }
          }
          return {
            id: car.id, nama_mobil: car.nama_mobil, plat_nomor: car.plat_nomor,
            kapasitas_penumpang: car.kapasitas_penumpang, jenis_transmisi: car.jenis_transmisi,
            harga_per_hari: car.harga_per_hari, stok: car.stok, status: car.status,
            name: car.nama_mobil, capacity: `${car.kapasitas_penumpang} Orang`,
            transmission: car.jenis_transmisi, price: formatRupiah(car.harga_per_hari),
            fuel: car.jenis_bahan_bakar || 'Bensin', description: car.nama_mobil,
            image: imageUrl, image_url: car.image_url
          };
        });
        setFilteredCars(mappedCars);
        setDateFilterEnabled(true);
        showToast(`Ditemukan ${mappedCars.length} mobil tersedia`, 'success');
      }
    } catch (error) {
      showToast('Gagal memuat mobil tersedia', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetDateFilter = () => {
    setDateFilterEnabled(false);
    setFilterStartDate('');
    setFilterEndDate('');
    setFilteredCars(cars());
  };

  const displayCars = () => dateFilterEnabled() ? filteredCars() : cars();

  const handleViewDetail = (car: Car) => { setSelectedCar(car); setShowModal(true); };

  const handleBookNow = (car: Car) => {
    setSelectedCar(car);
    setShowModal(false);
    setBookingStep(1);
    if (dateFilterEnabled() && filterStartDate() && filterEndDate()) {
      setBookingData({ ...bookingData(), startDate: filterStartDate(), endDate: filterEndDate() });
    }
    setShowBookingForm(true);
  };

  const [personalData, setPersonalData] = createSignal({ name: '', phone: '', email: '' });
  const [ktpData, setKtpData] = createSignal({ nama: '', nik: '', photo: null as File | null, previewUrl: '' });
  const [paymentData, setPaymentData] = createSignal({ metode: 'transfer', nama_bank: 'BCA', bank_tujuan: 'BCA', sudah_bayar: false, catatan: '' });
  const [isProcessingPayment, setIsProcessingPayment] = createSignal(false);
  const [bookingData, setBookingData] = createSignal({ startDate: '', endDate: '', withDriver: 'yes', notes: '' });
  const [availabilityCheckLoading, setAvailabilityCheckLoading] = createSignal(false);
  const [availabilityCheckResult, setAvailabilityCheckResult] = createSignal<{ available: boolean; conflictingBookings?: any[]; } | null>(null);
  const [showBookingReceipt, setShowBookingReceipt] = createSignal(false);
  const [bookingReceipt, setBookingReceipt] = createSignal<any>(null);
  const [showReviewModal, setShowReviewModal] = createSignal(false);
  const [bookingIdForReview, setBookingIdForReview] = createSignal<number | null>(null);

  const checkRealTimeAvailability = async () => {
    const car = selectedCar();
    const data = bookingData();
    if (!car || !data.startDate || !data.endDate) { setAvailabilityCheckResult(null); return; }
    setAvailabilityCheckLoading(true);
    try {
      const blockedResponse = await fetchAPI(API_ENDPOINTS.BOOKINGS + `/blocked-dates/${car.id}`, { method: 'GET' });
      if (!blockedResponse.success) throw new Error('Failed to fetch blocked dates');
      const blockedDates = blockedResponse.data.blocked_dates || [];
      const availabilityResponse = await fetchAPI(API_ENDPOINTS.BOOKINGS + `/check-availability/${car.id}?start_date=${data.startDate}&end_date=${data.endDate}`, { method: 'GET' });
      if (!availabilityResponse.success) throw new Error('Failed to check availability');
      const isAvailable = availabilityResponse.data.available;
      const conflicting = blockedDates.filter((booking: any) => {
        const bookingStart = new Date(booking.start_date);
        const bookingEnd = new Date(booking.end_date);
        const selectedStart = new Date(data.startDate);
        const selectedEnd = new Date(data.endDate);
        return (selectedStart <= bookingEnd && selectedEnd >= bookingStart);
      });
      setAvailabilityCheckResult({ available: isAvailable, conflictingBookings: conflicting });
    } catch (error) {
      setAvailabilityCheckResult(null);
    } finally {
      setAvailabilityCheckLoading(false);
    }
  };

  const handleNextStep = (e: Event) => {
    e.preventDefault();
    if (!personalData().name || !personalData().phone || !personalData().email) { showToast('Mohon lengkapi semua data diri!', 'warning'); return; }
    if (!personalData().email.includes('@') || !personalData().email.includes('.')) { showToast('Format email tidak valid!', 'warning'); return; }
    setBookingStep(2);
  };

  const handleNextToBooking = (e: Event) => {
    e.preventDefault();
    if (!ktpData().nama || !ktpData().nik || !ktpData().photo) { showToast('Mohon lengkapi semua data KTP!', 'warning'); return; }
    if (ktpData().nik.length !== 16 || !/^\d+$/.test(ktpData().nik)) { showToast('NIK harus berisi 16 angka!', 'warning'); return; }
    setBookingStep(3);
  };

  const handleNextToPayment = (e: Event) => {
    e.preventDefault();
    if (!bookingData().startDate || !bookingData().endDate) { showToast('Mohon pilih tanggal sewa!', 'warning'); return; }
    if (!bookingData().withDriver) { showToast('Mohon pilih opsi driver!', 'warning'); return; }
    const availResult = availabilityCheckResult();
    if (availResult && !availResult.available) { showToast('Mobil tidak tersedia untuk tanggal yang dipilih!', 'error'); return; }
    setBookingStep(4);
  };

  const handlePrevStep = () => {
    if (bookingStep() === 2) setBookingStep(1);
    else if (bookingStep() === 3) setBookingStep(2);
    else if (bookingStep() === 4) setBookingStep(3);
  };

  const handleKtpUpload = (e: Event) => {
    const target = e.currentTarget as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) { showToast('File harus berupa gambar!', 'warning'); return; }
      if (file.size > 5 * 1024 * 1024) { showToast('Ukuran file maksimal 5MB!', 'warning'); return; }
      const reader = new FileReader();
      reader.onload = (e) => { setKtpData({ ...ktpData(), photo: file, previewUrl: e.target?.result as string }); };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveKtp = () => {
    setKtpData({ nama: ktpData().nama, nik: ktpData().nik, photo: null, previewUrl: '' });
  };

  const handleBayarSekarang = async () => {
    if (isProcessingPayment()) return;
    try {
      setIsProcessingPayment(true);
      showToast('Memproses pembayaran...', 'info');
      const car = selectedCar();
      if (!car) { showToast('Mobil tidak ditemukan', 'error'); return; }

      const token = localStorage.getItem('authToken');
      const endpoint = token ? API_ENDPOINTS.BOOKINGS : `${API_ENDPOINTS.BOOKINGS}/guest`;

      const bookingPayload = {
        nama_customer: personalData().name,
        email: personalData().email,
        no_hp: personalData().phone,
        mobil_id: car.id,
        tanggal_mulai: bookingData().startDate,
        tanggal_selesai: bookingData().endDate,
        dengan_driver: bookingData().withDriver === 'yes' ? 'ya' : 'tidak',
        nama_ktp: ktpData().nama,
        nik: ktpData().nik,
        foto_ktp: ktpData().photo?.name || '',
        catatan_sewa: bookingData().notes,
      };

      const bookingResponse = await fetchAPI(endpoint, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: JSON.stringify(bookingPayload)
      });

      if (!bookingResponse.success) throw new Error(bookingResponse.message || 'Gagal membuat booking');
      const bookingId = bookingResponse.data.booking_id;
      showToast('Booking berhasil! Membuka halaman pembayaran...', 'success');

      const paymentResponse = await fetchAPI(`${API_ENDPOINTS.PAYMENTS}/midtrans/create`, {
        method: 'POST',
        body: JSON.stringify({ booking_id: bookingId })
      });

      if (!paymentResponse.success) throw new Error(paymentResponse.message || 'Gagal membuat transaksi');
      const { snap_token } = paymentResponse.data;

      (window as any).snap.pay(snap_token, {
        onSuccess: (result: any) => {
          showToast('Pembayaran berhasil!', 'success');
          setShowBookingForm(false);
          setBookingReceipt({
            bookingId: bookingResponse.data.order_number || `BKG${bookingId}`,
            bookingIdAngka: bookingId, 
            tanggalBooking: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            mobil: {
              nama: car.nama_mobil, plat: car.plat_nomor, transmisi: car.jenis_transmisi,
              kapasitas: `${car.kapasitas_penumpang} Orang`, hargaPerHari: car.harga_per_hari,
              image: getCarImage(car.nama_mobil)
            },
            customer: { nama: personalData().name, email: personalData().email, phone: personalData().phone, namaKTP: ktpData().nama, nik: ktpData().nik },
            sewa: { tanggalMulai: bookingData().startDate, tanggalSelesai: bookingData().endDate, durasi: calculateDays(), withDriver: bookingData().withDriver === 'yes', catatan: bookingData().notes },
            pembayaran: { metodePembayaran: result.payment_type || 'Midtrans', totalHarga: calculateTotalPrice() }
          });
          setShowBookingReceipt(true);
        },
        onPending: () => { showToast('Menunggu pembayaran, cek email kamu!', 'info'); setShowBookingForm(false); },
        onError: () => { showToast('Pembayaran gagal, silakan coba lagi', 'error'); },
        onClose: () => { showToast('Popup pembayaran ditutup', 'warning'); }
      });

    } catch (error: any) {
      showToast(error.message || 'Gagal memproses pembayaran', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div class="min-h-screen bg-[#0B0B0B]">
      {/* Navbar */}
      <nav class="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-20">
            <A href="/home" class="flex items-center space-x-3 cursor-pointer">
              <div class="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center glow-purple">
                <span class="text-3xl font-bold text-white">R</span>
              </div>
              <span class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">RagilTrans</span>
            </A>
            <div class="flex items-center space-x-8">
              <A href="/home" class="text-gray-300 hover:text-purple-400 transition-colors font-medium">Home</A>
              <A href="/sewa" class="text-purple-400 font-medium">Mobil</A>
            </div>
          </div>
        </div>
      </nav>

      <div class="py-24">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div class="text-center mb-12">
            <h1 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Sewa Mobil</h1>
            <p class="text-gray-400 text-lg">Pilih mobil sesuai kebutuhan Anda dengan harga terbaik</p>
          </div>

          {/* Date Filter */}
          <div class="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 mb-8 border border-purple-900/30">
            <div class="flex flex-col gap-4">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <h3 class="text-lg font-semibold text-white">Cari Mobil Berdasarkan Tanggal</h3>
              </div>
              <p class="text-gray-400 text-sm">
                Filter mobil yang tersedia untuk tanggal yang Anda inginkan.{' '}
                <span class="text-purple-300">Atau langsung pilih mobil, ketersediaan akan dicek saat Anda memasukkan tanggal booking.</span>
              </p>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-gray-300 text-sm mb-2">Tanggal Mulai</label>
                  <input type="date" value={filterStartDate()} onInput={(e) => setFilterStartDate(e.currentTarget.value)} min={new Date().toISOString().split('T')[0]} style="color-scheme: dark;" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-600 transition-colors"/>
                </div>
                <div>
                  <label class="block text-gray-300 text-sm mb-2">Tanggal Selesai</label>
                  <input type="date" value={filterEndDate()} onInput={(e) => setFilterEndDate(e.currentTarget.value)} min={filterStartDate() || new Date().toISOString().split('T')[0]} style="color-scheme: dark;" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-600 transition-colors"/>
                </div>
                <div class="flex items-end gap-2">
                  <button onClick={fetchAvailableCars} disabled={!filterStartDate() || !filterEndDate()} class="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-semibold transition-all">Cari</button>
                  <Show when={dateFilterEnabled()}>
                    <button onClick={resetDateFilter} class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-all">Reset</button>
                  </Show>
                </div>
              </div>
              <Show when={dateFilterEnabled()}>
                <div class="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mt-2">
                  <p class="text-purple-300 text-sm">
                    <span class="font-semibold">🗓️ Filter Aktif:</span> {new Date(filterStartDate()).toLocaleDateString('id-ID')} - {new Date(filterEndDate()).toLocaleDateString('id-ID')} ({filteredCars().length} mobil tersedia)
                  </p>
                </div>
              </Show>
            </div>
          </div>

          {/* Loading */}
          <Show when={loading()}>
            <div class="flex justify-center items-center py-20">
              <div class="text-center">
                <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p class="text-gray-400">Memuat data mobil...</p>
              </div>
            </div>
          </Show>

          {/* Cars Grid */}
          <Show when={!loading()}>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <For each={displayCars()}>
                {(car: Car) => (
                  <div class="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden border border-purple-900/30 card-hover group">
                    <div class="relative h-56 overflow-hidden">
                      <img src={getCarImage(car.nama_mobil)} alt={car.nama_mobil} class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                      <Show when={dateFilterEnabled()}>
                        <div class="absolute top-4 right-4 z-10">
                          <span class="bg-green-500/90 text-white px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm border border-green-400/30">Tersedia</span>
                        </div>
                      </Show>
                    </div>
                    <div class="p-6">
                      <h3 class="text-2xl font-bold text-white mb-3">{car.name}</h3>
                      <div class="grid grid-cols-2 gap-3 mb-6">
                        <div class="flex items-center gap-2 text-sm text-gray-400">
                          <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                          <span>{car.capacity}</span>
                        </div>
                        <div class="flex items-center gap-2 text-sm text-gray-400">
                          <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          <span>{car.transmission}</span>
                        </div>
                        <div class="flex items-center gap-2 text-sm text-gray-400">
                          <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                          <span>Asuransi</span>
                        </div>
                        <div class="flex items-center gap-2 text-sm text-gray-400">
                          <span>{car.fuel}</span>
                        </div>
                      </div>
                      <div class="border-t border-gray-800 pt-4">
                        <div class="mb-4">
                          <p class="text-gray-500 text-xs mb-1">Mulai dari</p>
                          <p class="text-2xl font-bold text-purple-400">Rp {car.price}</p>
                          <p class="text-gray-500 text-xs">per hari</p>
                        </div>
                        <div class="flex gap-2">
                          <button onClick={() => handleViewDetail(car)} class="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-all">Detail</button>
                          <button onClick={() => handleBookNow(car)} class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-all glow-purple-hover">Sewa Sekarang</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>

        {/* Detail Modal */}
        <Show when={showModal() && selectedCar()}>
          <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm px-4" onClick={() => setShowModal(false)}>
            <div class="bg-gradient-to-br from-gray-900 to-black border border-purple-900/50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto glow-purple" onClick={(e) => e.stopPropagation()}>
              <div class="relative">
                <button onClick={() => setShowModal(false)} class="absolute top-4 right-4 z-10 bg-black/80 hover:bg-black text-white w-10 h-10 rounded-full flex items-center justify-center transition-all">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
                <div class="relative h-72 overflow-hidden rounded-t-2xl">
                  <img src={getCarImage(selectedCar()!.nama_mobil)} alt={selectedCar()!.nama_mobil} class="w-full h-full object-cover"/>
                  <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                </div>
                <div class="p-8">
                  <h2 class="text-3xl font-bold text-white mb-2">{selectedCar()!.name}</h2>
                  <div class="bg-black/50 p-4 rounded-xl mb-6 border border-purple-900/30">
                    <p class="text-gray-400 text-sm mb-1">Harga Sewa</p>
                    <p class="text-3xl font-bold text-purple-400">Rp {selectedCar()!.price}</p>
                    <p class="text-gray-500 text-sm">per hari</p>
                  </div>
                  <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="bg-black/50 p-4 rounded-xl border border-gray-800">
                      <p class="text-gray-400 text-sm mb-1">Kapasitas</p>
                      <p class="text-white font-semibold">{selectedCar()!.capacity}</p>
                    </div>
                    <div class="bg-black/50 p-4 rounded-xl border border-gray-800">
                      <p class="text-gray-400 text-sm mb-1">Transmisi</p>
                      <p class="text-white font-semibold">{selectedCar()!.transmission}</p>
                    </div>
                    <div class="bg-black/50 p-4 rounded-xl border border-gray-800">
                      <p class="text-gray-400 text-sm mb-1">Bahan Bakar</p>
                      <p class="text-white font-semibold">{selectedCar()!.fuel}</p>
                    </div>
                    <div class="bg-black/50 p-4 rounded-xl border border-gray-800">
                      <p class="text-gray-400 text-sm mb-1">Asuransi</p>
                      <p class="text-white font-semibold">Termasuk</p>
                    </div>
                  </div>
                  <button onClick={() => handleBookNow(selectedCar()!)} class="w-full bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg glow-purple-hover">Sewa Sekarang</button>
                </div>
              </div>
            </div>
          </div>
        </Show>

        {/* Booking Form Modal */}
        <Show when={showBookingForm() && selectedCar()}>
          <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm px-4" onClick={() => setShowBookingForm(false)}>
            <div class="bg-gradient-to-br from-gray-900 to-black border border-purple-900/50 rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto glow-purple" onClick={(e) => e.stopPropagation()}>
              
              {/* Header */}
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-white">Form Pemesanan</h2>
                <button onClick={() => setShowBookingForm(false)} class="text-gray-400 hover:text-white">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              {/* Step Indicator */}
              <div class="mb-6 flex items-center justify-center gap-1 sm:gap-2">
                {[1,2,3,4].map((step) => (
                  <>
                    <div class={`flex items-center gap-1 sm:gap-2 ${bookingStep() === step ? 'text-purple-400' : 'text-gray-500'}`}>
                      <div class={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${bookingStep() === step ? 'bg-purple-600' : bookingStep() > step ? 'bg-green-600' : 'bg-gray-700'}`}>
                        {bookingStep() > step ? '✓' : step}
                      </div>
                      <span class="text-[10px] sm:text-xs font-medium hidden sm:inline">
                        {step === 1 ? 'Data Diri' : step === 2 ? 'KTP' : step === 3 ? 'Detail' : 'Bayar'}
                      </span>
                    </div>
                    {step < 4 && <div class="w-4 sm:w-8 h-0.5 bg-gray-700"></div>}
                  </>
                ))}
              </div>

              {/* Car Info */}
              <div class="mb-6 p-4 bg-black/50 rounded-xl border border-purple-900/30">
                <div class="flex items-center gap-4">
                  <img src={getCarImage(selectedCar()!.nama_mobil)} alt={selectedCar()!.nama_mobil} class="w-24 h-24 object-cover rounded-lg"/>
                  <div>
                    <h3 class="font-bold text-purple-400 text-lg">{selectedCar()!.nama_mobil}</h3>
                    <p class="text-xl font-bold text-white">Rp {formatRupiah(selectedCar()!.harga_per_hari)} / hari</p>
                  </div>
                </div>
              </div>

              {/* Step 1: Data Diri */}
              <Show when={bookingStep() === 1}>
                <div class="space-y-4">
                  <div class="mb-4">
                    <h3 class="text-lg font-semibold text-white mb-2">Langkah 1: Data Diri Penyewa</h3>
                    <p class="text-sm text-gray-400">Masukkan informasi pribadi Anda terlebih dahulu</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Nama Lengkap *</label>
                    <input type="text" required value={personalData().name} onInput={(e) => setPersonalData({ ...personalData(), name: e.currentTarget.value })} placeholder="Masukkan nama lengkap" class="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600"/>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">No. WhatsApp *</label>
                    <input type="tel" required value={personalData().phone} onInput={(e) => { const value = e.currentTarget.value.replace(/\D/g, ''); setPersonalData({ ...personalData(), phone: value }); }} placeholder="08xxxxxxxxxx" class="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600"/>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                    <input type="email" required value={personalData().email} onInput={(e) => setPersonalData({ ...personalData(), email: e.currentTarget.value })} placeholder="email@example.com" class="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600"/>
                  </div>
                  <div class="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowBookingForm(false)} class="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all">Batal</button>
                    <button type="button" onClick={handleNextStep} class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold glow-purple-hover transition-all">Lanjut</button>
                  </div>
                </div>
              </Show>

              {/* Step 2: KTP */}
              <Show when={bookingStep() === 2}>
                <div class="space-y-4">
                  <div class="mb-4">
                    <h3 class="text-lg font-semibold text-white mb-2">Langkah 2: Verifikasi KTP</h3>
                    <p class="text-sm text-gray-400">Upload foto KTP Anda untuk verifikasi identitas</p>
                  </div>
                  <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <p class="text-sm text-yellow-200 font-semibold mb-1">Pastikan foto KTP Anda:</p>
                    <ul class="list-disc list-inside text-sm text-yellow-300/90 space-y-1">
                      <li>Jelas dan tidak blur</li>
                      <li>Seluruh bagian KTP terlihat</li>
                      <li>Format: JPG, PNG (Max 5MB)</li>
                    </ul>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Nama Sesuai KTP *</label>
                    <input type="text" required value={ktpData().nama} onInput={(e) => setKtpData({ ...ktpData(), nama: e.currentTarget.value })} placeholder="Masukkan nama sesuai KTP" class="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600"/>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">NIK *</label>
                    <input type="text" required maxLength={16} value={ktpData().nik} onInput={(e) => { const value = e.currentTarget.value.replace(/\D/g, ''); setKtpData({ ...ktpData(), nik: value }); }} placeholder="16 digit NIK" class="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600"/>
                    <p class="text-xs text-gray-500 mt-1">{ktpData().nik.length}/16 digit</p>
                  </div>
                  <div class="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center">
                    <Show when={!ktpData().previewUrl}>
                      <label class="cursor-pointer block">
                        <input type="file" accept="image/*" onChange={handleKtpUpload} class="hidden"/>
                        <div class="flex flex-col items-center gap-3">
                          <div class="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center">
                            <svg class="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          </div>
                          <div>
                            <p class="text-white font-semibold mb-1">Upload Foto KTP</p>
                            <p class="text-sm text-gray-400">Klik untuk memilih file</p>
                          </div>
                        </div>
                      </label>
                    </Show>
                    <Show when={ktpData().previewUrl}>
                      <div class="relative">
                        <img src={ktpData().previewUrl} alt="Preview KTP" class="max-h-64 mx-auto rounded-lg border-2 border-purple-600"/>
                        <button type="button" onClick={handleRemoveKtp} class="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full flex items-center justify-center">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                        <p class="mt-3 text-sm text-green-400 font-semibold">✓ Foto KTP berhasil diupload</p>
                      </div>
                    </Show>
                  </div>
                  <div class="flex gap-3 pt-4">
                    <button type="button" onClick={handlePrevStep} class="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all">Kembali</button>
                    <button type="button" onClick={handleNextToBooking} class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold glow-purple-hover transition-all">Lanjut</button>
                  </div>
                </div>
              </Show>

              {/* Step 3: Detail Sewa */}
              <Show when={bookingStep() === 3}>
                <form onSubmit={handleNextToPayment} class="space-y-4">
                  <div class="mb-4">
                    <h3 class="text-lg font-semibold text-white mb-2">Langkah 3: Detail Peminjaman</h3>
                    <p class="text-sm text-gray-400">Tentukan periode dan opsi sewa Anda</p>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">Tanggal Mulai *</label>
                      <input type="date" required min={new Date().toISOString().split('T')[0]} value={bookingData().startDate} onInput={(e) => { setBookingData({ ...bookingData(), startDate: e.currentTarget.value }); checkRealTimeAvailability(); }} style="color-scheme: dark;" class="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600"/>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">Tanggal Selesai *</label>
                      <input type="date" required min={bookingData().startDate || new Date().toISOString().split('T')[0]} value={bookingData().endDate} onInput={(e) => { setBookingData({ ...bookingData(), endDate: e.currentTarget.value }); checkRealTimeAvailability(); }} style="color-scheme: dark;" class="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600"/>
                    </div>
                  </div>

                  <Show when={availabilityCheckLoading()}>
                    <div class="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4 flex items-center gap-3">
                      <div class="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      <p class="text-blue-400 text-sm">Mengecek ketersediaan mobil...</p>
                    </div>
                  </Show>

                  <Show when={!availabilityCheckLoading() && availabilityCheckResult()}>
                    <Show when={availabilityCheckResult()!.available}>
                      <div class="bg-green-600/10 border border-green-600/30 rounded-lg p-4">
                        <p class="text-green-400 font-semibold">✓ Mobil tersedia untuk tanggal yang dipilih!</p>
                      </div>
                    </Show>
                    <Show when={!availabilityCheckResult()!.available}>
                      <div class="bg-red-600/10 border border-red-600/30 rounded-lg p-4">
                        <p class="text-red-400 font-semibold mb-2">Mobil tidak tersedia untuk tanggal yang dipilih!</p>
                        <Show when={(availabilityCheckResult()!.conflictingBookings?.length || 0) > 0}>
                          <div class="bg-black/30 rounded-lg p-3">
                            <For each={availabilityCheckResult()!.conflictingBookings}>
                              {(booking) => (
                                <div class="text-gray-300 text-sm py-1">
                                  • {new Date(booking.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} - {new Date(booking.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                              )}
                            </For>
                          </div>
                        </Show>
                      </div>
                    </Show>
                  </Show>

                  <Show when={bookingData().startDate && bookingData().endDate}>
                    <div class="bg-purple-600/10 border border-purple-600/30 rounded-lg p-3">
                      <p class="text-purple-400 font-semibold">Durasi: {calculateDays()} hari</p>
                    </div>
                  </Show>

                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Dengan Driver? *</label>
                    <div class="flex gap-4">
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="driver" value="yes" checked={bookingData().withDriver === 'yes'} onChange={(e) => setBookingData({ ...bookingData(), withDriver: e.currentTarget.value })} class="w-4 h-4 text-purple-600"/>
                        <span class="text-gray-300">Ya, dengan driver</span>
                      </label>
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="driver" value="no" checked={bookingData().withDriver === 'no'} onChange={(e) => setBookingData({ ...bookingData(), withDriver: e.currentTarget.value })} class="w-4 h-4 text-purple-600"/>
                        <span class="text-gray-300">Lepas kunci</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Catatan (Opsional)</label>
                    <textarea rows={3} value={bookingData().notes} onInput={(e) => setBookingData({ ...bookingData(), notes: e.currentTarget.value })} placeholder="Tambahkan catatan atau permintaan khusus..." class="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600"></textarea>
                  </div>

                  <div class="flex gap-3 pt-4">
                    <button type="button" onClick={handlePrevStep} class="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all">Kembali</button>
                    <button type="submit" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold glow-purple-hover transition-all">Lanjut</button>
                  </div>
                </form>
              </Show>

              {/* Step 4: Pembayaran */}
              <Show when={bookingStep() === 4}>
                <div class="space-y-4">
                  <div class="mb-4">
                    <h3 class="text-lg font-semibold text-white mb-2">Langkah 4: Pembayaran</h3>
                    <p class="text-sm text-gray-400">Klik tombol di bawah untuk membuka halaman pembayaran</p>
                  </div>

                  {/* Rincian Pembayaran */}
                  <div class="bg-gradient-to-br from-purple-600/10 to-purple-900/10 border border-purple-600/30 rounded-xl p-4">
                    <p class="text-purple-400 font-semibold mb-3">Rincian Pembayaran</p>
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-gray-400">Harga per Hari</span>
                        <span class="text-white">Rp {formatRupiah(selectedCar()?.harga_per_hari || 0)}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-400">Durasi Sewa</span>
                        <span class="text-white">{calculateDuration()} Hari</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-400">Subtotal Sewa</span>
                        <span class="text-white">Rp {formatRupiah((selectedCar()?.harga_per_hari || 0) * calculateDuration())}</span>
                      </div>
                      <Show when={bookingData().withDriver === 'yes'}>
                        <div class="flex justify-between">
                          <span class="text-gray-400">Biaya Driver</span>
                          <span class="text-white">+ Rp {formatRupiah(50000)}</span>
                        </div>
                      </Show>
                      <div class="flex justify-between pt-2 border-t border-purple-600/30 font-bold">
                        <span class="text-purple-300">Total yang Harus Dibayar</span>
                        <span class="text-purple-300 text-lg">Rp {formatRupiah(calculateTotalPrice())}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Bayar */}
                  <button type="button" onClick={handleBayarSekarang} disabled={isProcessingPayment()} class="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Show when={isProcessingPayment()}>
                      <svg class="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Memproses...</span>
                    </Show>
                    <Show when={!isProcessingPayment()}>
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                      <span>Bayar Sekarang</span>
                    </Show>
                  </button>

                  <button type="button" onClick={handlePrevStep} class="w-full bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all">Kembali</button>
                </div>
              </Show>

            </div>
          </div>
        </Show>

        {/* Booking Receipt */}
        <Show when={showBookingReceipt() && bookingReceipt()}>
          <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div class="bg-gradient-to-br from-gray-900 to-black rounded-xl max-w-md w-full border border-purple-900/30 max-h-[90vh] overflow-y-auto">
              <div class="p-4">
                <div class="text-center mb-4">
                  <div class="w-14 h-14 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <h2 class="text-xl font-bold text-white mb-1">Pemesanan Berhasil!</h2>
                  <p class="text-sm text-gray-400">Terima kasih telah memesan</p>
                </div>

                <div class="bg-purple-600/10 border border-purple-600/30 rounded-lg p-3 mb-3">
                  <div class="flex justify-between items-center text-xs">
                    <div>
                      <p class="text-gray-400">ID Booking</p>
                      <p class="text-base font-bold text-purple-400">{bookingReceipt().bookingId}</p>
                    </div>
                    <div class="text-right">
                      <p class="text-gray-400">Tanggal</p>
                      <p class="font-semibold text-white">{bookingReceipt().tanggalBooking}</p>
                    </div>
                  </div>
                </div>

                <div class="bg-black/50 border border-gray-800 rounded-lg p-3 mb-2">
                  <h3 class="text-sm font-semibold text-purple-400 mb-2">Mobil</h3>
                  <img src={getCarImage(bookingReceipt().mobil.nama)} alt={bookingReceipt().mobil.nama} class="w-full h-32 object-cover rounded-lg mb-2"/>
                  <p class="font-bold text-white text-base">{bookingReceipt().mobil.nama}</p>
                  <p class="text-gray-400 text-xs">{bookingReceipt().mobil.plat} • {bookingReceipt().mobil.transmisi} • {bookingReceipt().mobil.kapasitas}</p>
                </div>

                <div class="bg-black/50 border border-gray-800 rounded-lg p-3 mb-2">
                  <h3 class="text-sm font-semibold text-purple-400 mb-2">Penyewa</h3>
                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <div><p class="text-gray-400">Nama</p><p class="text-white font-semibold">{bookingReceipt().customer.nama}</p></div>
                    <div><p class="text-gray-400">WhatsApp</p><p class="text-white font-semibold">{bookingReceipt().customer.phone}</p></div>
                  </div>
                </div>

                <div class="bg-black/50 border border-gray-800 rounded-lg p-3 mb-2">
                  <h3 class="text-sm font-semibold text-purple-400 mb-2">Detail Sewa</h3>
                  <div class="space-y-1 text-xs">
                    <div class="flex justify-between"><span class="text-gray-400">Mulai</span><span class="text-white font-semibold">{new Date(bookingReceipt().sewa.tanggalMulai).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">Selesai</span><span class="text-white font-semibold">{new Date(bookingReceipt().sewa.tanggalSelesai).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">Durasi</span><span class="text-white font-semibold">{bookingReceipt().sewa.durasi} Hari • {bookingReceipt().sewa.withDriver ? 'Pakai Driver' : 'Lepas Kunci'}</span></div>
                  </div>
                </div>

                <div class="bg-gradient-to-br from-purple-600/10 to-purple-900/10 border border-purple-600/30 rounded-lg p-3 mb-3">
                  <h3 class="text-sm font-semibold text-purple-400 mb-2">Pembayaran</h3>
                  <div class="space-y-1 text-xs">
                    <div class="flex justify-between"><span class="text-gray-400">Sewa Mobil ({bookingReceipt().sewa.durasi} hari)</span><span class="text-white font-semibold">Rp {formatRupiah(bookingReceipt().mobil.hargaPerHari * bookingReceipt().sewa.durasi)}</span></div>
                    <Show when={bookingReceipt().sewa.withDriver}>
                      <div class="flex justify-between"><span class="text-gray-400">Biaya Driver</span><span class="text-white font-semibold">Rp {formatRupiah(50000)}</span></div>
                    </Show>
                    <div class="flex justify-between pt-1 border-t border-purple-600/30 font-bold"><span class="text-white">Total</span><span class="text-white text-sm">Rp {formatRupiah(bookingReceipt().pembayaran.totalHarga)}</span></div>
                    <div class="flex justify-between pt-1 border-t border-purple-600/30"><span class="text-green-400 font-bold">Status</span><span class="text-green-400 text-sm font-bold">✓ LUNAS</span></div>
                    <div class="flex justify-between"><span class="text-gray-400">Metode</span><span class="text-white">{bookingReceipt().pembayaran.metodePembayaran}</span></div>
                  </div>
                </div>

                <div class="flex gap-2">
                  <button type="button" onClick={() => { setBookingIdForReview(bookingReceipt().bookingIdAngka || bookingReceipt().bookingId); setShowReviewModal(true); }} class="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all">⭐ Review</button>
                  <button type="button" onClick={() => window.print()} class="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all">🖨️ Print</button>
                  <button type="button" onClick={() => { setShowBookingReceipt(false); setBookingReceipt(null); }} class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-semibold glow-purple-hover transition-all">Selesai</button>
                </div>

                <div class="mt-3 text-center">
                  <p class="text-xs text-gray-400">Anda akan dihubungi via WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        </Show>

        {/* Review Modal */}
        <ReviewModal
          isOpen={showReviewModal()}
          bookingId={bookingIdForReview() || 0}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => { setShowBookingReceipt(false); setBookingReceipt(null); setShowReviewModal(false); }}
        />
      </div>
    </div>
  );
}