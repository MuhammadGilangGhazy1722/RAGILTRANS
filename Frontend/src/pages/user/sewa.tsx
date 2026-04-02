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
import bcaLogo from '../../assets/logo/Logo-BCA.png';
import mandiriLogo from '../../assets/logo/LOGO-MANDIRI.png';
import bniLogo from '../../assets/logo/LOGO-BNI.png';
import briLogo from '../../assets/logo/LOGO-BRI.png';
import bsiLogo from '../../assets/logo/LOGO-BSI.png';
import cimbLogo from '../../assets/logo/LOGO-CIMB.png';

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
  // Properties untuk kompatibilitas dengan UI
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
  
  // Date filter state
  const [dateFilterEnabled, setDateFilterEnabled] = createSignal(false);
  const [filterStartDate, setFilterStartDate] = createSignal('');
  const [filterEndDate, setFilterEndDate] = createSignal('');
  const [filteredCars, setFilteredCars] = createSignal<Car[]>([]);

  // Mapping image berdasarkan nama mobil
  const getCarImage = (nama: string) => {
    const namaLower = nama.toLowerCase();
    if (namaLower.includes('traga')) return tragaImg;
    if (namaLower.includes('l300')) return l300Img;
    if (namaLower.includes('innova')) return innovaImg;
    if (namaLower.includes('luxio')) return luxioImg;
    // Support both spelling: Phanter and Panther
    if (namaLower.includes('phanter') || namaLower.includes('panther')) return pantherImg;
    return innovaImg; // default
  };

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

  // Hitung DP (50% dari harga per hari)
  const calculateDuration = (): number => {
    const start = bookingData().startDate;
    const end = bookingData().endDate;
    if (!start || !end) return 0;
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1; // Minimal 1 hari
  };

  const calculateDriverFee = (): number => {
    // Biaya driver 50ribu jika pakai driver
    return bookingData().withDriver === 'yes' ? 50000 : 0;
  };

  const calculateTotalPrice = (): number => {
    const car = selectedCar();
    if (!car || !car.harga_per_hari) return 0;
    const duration = calculateDuration();
    const rentalPrice = car.harga_per_hari * duration;
    const driverFee = calculateDriverFee();
    return rentalPrice + driverFee;
  };

  onMount(async () => {
    try {
      setLoading(true);
      const response = await fetchAPI(API_ENDPOINTS.CARS);
      
      if (response.success) {
        console.log('Data mobil dari API:', response.data);
        
        // Map data dari backend
        const mappedCars = response.data.map((car: any) => {
          // Cek apakah image_url sudah full URL atau hanya path
          let imageUrl = getCarImage(car.nama_mobil); // default fallback
          if (car.image_url) {
            // Jika sudah ada http/https, pakai langsung
            if (car.image_url.startsWith('http')) {
              imageUrl = car.image_url;
            } else {
              // Jika hanya path, tambahkan base URL dari API_BASE_URL
              const baseUrl = API_ENDPOINTS.CARS.replace('/api/cars', '');
              imageUrl = `${baseUrl}${car.image_url}`;
            }
          }
          console.log(`Mobil: ${car.nama_mobil}, Image URL: ${imageUrl}`);
          
          return {
            id: car.id,
            nama_mobil: car.nama_mobil,
            plat_nomor: car.plat_nomor,
            kapasitas_penumpang: car.kapasitas_penumpang,
            jenis_transmisi: car.jenis_transmisi,
            harga_per_hari: car.harga_per_hari,
            stok: car.stok,
            status: car.status,
            // Untuk kompatibilitas dengan komponen yang sudah ada
            name: car.nama_mobil,
            capacity: `${car.kapasitas_penumpang} Orang`,
            transmission: car.jenis_transmisi,
            price: formatRupiah(car.harga_per_hari),
            fuel: car.jenis_bahan_bakar || 'Bensin',
            description: car.nama_mobil,
            // Gunakan image_url dari database, fallback ke gambar lokal
            image: imageUrl,
            image_url: car.image_url
          };
        });
        
        setCars(mappedCars);
        setFilteredCars(mappedCars); // Initialize filtered cars
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      showToast('Gagal memuat data mobil. Pastikan backend sudah berjalan.', 'error');
    } finally {
      setLoading(false);
    }
  });
  
  // Function to fetch available cars based on date range
  const fetchAvailableCars = async () => {
    const startDate = filterStartDate();
    const endDate = filterEndDate();
    
    if (!startDate || !endDate) {
      showToast('Pilih tanggal mulai dan selesai terlebih dahulu', 'error');
      return;
    }
    
    if (new Date(endDate) <= new Date(startDate)) {
      showToast('Tanggal selesai harus setelah tanggal mulai', 'error');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetchAPI(
        `${API_ENDPOINTS.BOOKINGS}/available-cars?start_date=${startDate}&end_date=${endDate}`
      );
      
      if (response.success) {
        console.log('Available cars:', response.data);
        
        // Map data from backend
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
        
        setFilteredCars(mappedCars);
        setDateFilterEnabled(true);
        showToast(`Ditemukan ${mappedCars.length} mobil tersedia`, 'success');
      }
    } catch (error) {
      console.error('Error fetching available cars:', error);
      showToast('Gagal memuat mobil tersedia', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Reset date filter
  const resetDateFilter = () => {
    setDateFilterEnabled(false);
    setFilterStartDate('');
    setFilterEndDate('');
    setFilteredCars(cars());
  };
  
  // Get cars to display (filtered or all)
  const displayCars = () => dateFilterEnabled() ? filteredCars() : cars();

  const handleViewDetail = (car: Car) => {
    setSelectedCar(car);
    setShowModal(true);
  };

  const handleBookNow = (car: Car) => {
    console.log('Booking car:', car);
    console.log('Car image URL:', car.image);
    setSelectedCar(car);
    setShowModal(false);
    setBookingStep(1); // Reset ke step 1
    
    // Pre-fill dates if user already filtered by date
    if (dateFilterEnabled() && filterStartDate() && filterEndDate()) {
      setBookingData({
        ...bookingData(),
        startDate: filterStartDate(),
        endDate: filterEndDate()
      });
    }
    
    setShowBookingForm(true);
  };

  const [personalData, setPersonalData] = createSignal({
    name: '',
    phone: '',
    email: ''
  });

  const [ktpData, setKtpData] = createSignal({
    nama: '',
    nik: '',
    photo: null as File | null,
    previewUrl: ''
  });

  const [paymentData, setPaymentData] = createSignal({
    metode: 'transfer',
    nama_bank: 'BCA',
    bank_tujuan: 'BCA',
    sudah_bayar: false,
    catatan: ''
  });

  const [paymentInstructions, setPaymentInstructions] = createSignal<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = createSignal(false);

  const [bookingData, setBookingData] = createSignal({
    startDate: '',
    endDate: '',
    withDriver: 'yes',
    notes: ''
  });

  // Real-time availability check state
  const [availabilityCheckLoading, setAvailabilityCheckLoading] = createSignal(false);
  const [availabilityCheckResult, setAvailabilityCheckResult] = createSignal<{
    available: boolean;
    conflictingBookings?: any[];
  } | null>(null);

  const [showBookingReceipt, setShowBookingReceipt] = createSignal(false);
  const [bookingReceipt, setBookingReceipt] = createSignal<any>(null);
  const [showReviewModal, setShowReviewModal] = createSignal(false);
  const [bookingIdForReview, setBookingIdForReview] = createSignal<number | null>(null);

  // Check real-time availability when dates change
  const checkRealTimeAvailability = async () => {
    const car = selectedCar();
    const data = bookingData();
    
    if (!car || !data.startDate || !data.endDate) {
      setAvailabilityCheckResult(null);
      return;
    }

    setAvailabilityCheckLoading(true);
    try {
      // First, fetch blocked dates to show detailed info
      const blockedResponse = await fetchAPI(
        API_ENDPOINTS.BOOKINGS + `/blocked-dates/${car.id}`,
        { method: 'GET' }
      );
      
      if (!blockedResponse.success) {
        throw new Error('Failed to fetch blocked dates');
      }

      const blockedDates = blockedResponse.data.blocked_dates || [];
      
      // Then check if selected dates are available
      const availabilityResponse = await fetchAPI(
        API_ENDPOINTS.BOOKINGS + `/check-availability/${car.id}?start_date=${data.startDate}&end_date=${data.endDate}`,
        { method: 'GET' }
      );
      
      if (!availabilityResponse.success) {
        throw new Error('Failed to check availability');
      }

      const isAvailable = availabilityResponse.data.available;
      
      // Find conflicting bookings
      const conflicting = blockedDates.filter((booking: any) => {
        const bookingStart = new Date(booking.start_date);
        const bookingEnd = new Date(booking.end_date);
        const selectedStart = new Date(data.startDate);
        const selectedEnd = new Date(data.endDate);
        
        // Check for overlap
        return (selectedStart <= bookingEnd && selectedEnd >= bookingStart);
      });

      setAvailabilityCheckResult({
        available: isAvailable,
        conflictingBookings: conflicting
      });
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailabilityCheckResult(null);
    } finally {
      setAvailabilityCheckLoading(false);
    }
  };

  const handleNextStep = (e: Event) => {
    e.preventDefault();
    // Validasi data diri
    if (!personalData().name || !personalData().phone || !personalData().email) {
      showToast('Mohon lengkapi semua data diri!', 'warning');
      return;
    }
    // Validasi format email
    if (!personalData().email.includes('@') || !personalData().email.includes('.')) {
      showToast('Format email tidak valid! Harus menggunakan @ dan domain yang benar (contoh: nama@email.com)', 'warning');
      return;
    }
    setBookingStep(2);
  };

  const handleNextToBooking = (e: Event) => {
    e.preventDefault();
    // Validasi KTP
    if (!ktpData().nama || !ktpData().nik || !ktpData().photo) {
      showToast('Mohon lengkapi semua data KTP!', 'warning');
      return;
    }
    // Validasi NIK harus 16 angka
    if (ktpData().nik.length !== 16 || !/^\d+$/.test(ktpData().nik)) {
      showToast('NIK harus berisi 16 angka!', 'warning');
      return;
    }
    setBookingStep(3);
  };

  const handleNextToDetailSewa = (e: Event) => {
    e.preventDefault();
    // Validasi Pembayaran
    if (!paymentData().sudah_bayar) {
      showToast('Mohon lakukan pembayaran terlebih dahulu!', 'warning');
      return;
    }
    setBookingStep(4);
  };

  const handleNextToPayment = (e: Event) => {
    e.preventDefault();
    // Validasi Detail Sewa
    if (!bookingData().startDate || !bookingData().endDate) {
      showToast('Mohon pilih tanggal sewa!', 'warning');
      return;
    }
    if (!bookingData().withDriver) {
      showToast('Mohon pilih opsi driver!', 'warning');
      return;
    }
    // Check availability before proceeding
    const availResult = availabilityCheckResult();
    if (availResult && !availResult.available) {
      showToast('Mobil tidak tersedia untuk tanggal yang dipilih! Silakan pilih tanggal lain.', 'error');
      return;
    }
    setBookingStep(4);
  };

  const handleBayarSekarang = async () => {
    if (isProcessingPayment()) return;
    
    try {
      setIsProcessingPayment(true);
      showToast('Membuat Virtual Account...', 'info');

      // Get current booking first (if exists)
      const existingBooking = paymentInstructions()?.booking_id;
      let bookingId = existingBooking;
      let bookingResponse: any = null; // Declare outside if block

      // Jika belum ada booking, buat dulu
      if (!bookingId) {
        const car = selectedCar();
        if (!car) {
          showToast('Mobil tidak ditemukan', 'error');
          setIsProcessingPayment(false);
          return;
        }

        // Check if user is logged in
        const userId = localStorage.getItem('userId');
        
        const bookingPayload = {
          ...(userId && { user_id: parseInt(userId) }), // Include user_id if logged in
          nama_customer: personalData().name,
          email: personalData().email,
          no_hp: personalData().phone,
          nama_ktp: ktpData().nama,
          nik: ktpData().nik,
          foto_ktp: ktpData().photo?.name || '',
          mobil_id: car.id,
          tanggal_mulai: bookingData().startDate,
          tanggal_selesai: bookingData().endDate,
          dengan_driver: bookingData().withDriver === 'yes' ? 'ya' : 'tidak',
          catatan_sewa: bookingData().notes,
          catatan_pembayaran: paymentData().catatan
        };

        bookingResponse = await fetchAPI(`${API_ENDPOINTS.BOOKINGS}/guest`, {
          method: 'POST',
          body: JSON.stringify(bookingPayload)
        });

        if (!bookingResponse.success) {
          throw new Error(bookingResponse.message || 'Gagal membuat booking');
        }

        bookingId = bookingResponse.data.booking_id;
        const orderNumber = bookingResponse.data.order_number; // Get order_number from backend
        showToast('Booking berhasil dibuat!', 'success');
      }

      // Call Midtrans untuk generate VA
      const paymentResponse = await fetchAPI(`${API_ENDPOINTS.PAYMENTS}/midtrans/create`, {
        method: 'POST',
        body: JSON.stringify({
          booking_id: bookingId,
          bank: paymentData().bank_tujuan.toLowerCase()
        })
      });

      if (paymentResponse.success) {
        setPaymentInstructions({
          ...paymentResponse.data,
          booking_id: bookingId,
          order_number: bookingResponse?.data?.order_number || null // Save order_number
        });
        showToast('Virtual Account berhasil dibuat!', 'success');
      } else {
        throw new Error(paymentResponse.message || 'Gagal membuat Virtual Account');
      }

    } catch (error: any) {
      console.error('Error creating payment:', error);
      showToast(error.message || 'Gagal membuat pembayaran', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePrevStep = () => {
    if (bookingStep() === 2) {
      setBookingStep(1);
    } else if (bookingStep() === 3) {
      setBookingStep(2);
    } else if (bookingStep() === 4) {
      setBookingStep(3);
    }
  };

  const handleKtpUpload = (e: Event) => {
    const target = e.currentTarget as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      // Validasi tipe file
      if (!file.type.startsWith('image/')) {
        showToast('File harus berupa gambar!', 'warning');
        return;
      }
      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Ukuran file maksimal 5MB!', 'warning');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setKtpData({
          ...ktpData(),
          photo: file,
          previewUrl: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveKtp = () => {
    setKtpData({
      nama: ktpData().nama,
      nik: ktpData().nik,
      photo: null,
      previewUrl: ''
    });
  };

  const calculateDays = () => {
    const start = new Date(bookingData().startDate);
    const end = new Date(bookingData().endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const handleSubmitBooking = async (e: Event) => {
    e.preventDefault();
    const days = calculateDays();
    const car = selectedCar();
    const totalAmount = calculateTotalPrice();
    const instructions = paymentInstructions();
    
    if (!car) return;

    if (!instructions) {
      showToast('Silakan buat Virtual Account terlebih dahulu', 'warning');
      return;
    }

    try {
      showToast('Booking berhasil dikonfirmasi! Silakan selesaikan pembayaran.', 'success');
      
      // Buat data receipt
      const receiptData = {
        bookingId: instructions.order_number || `BKG${instructions.booking_id}`, // Use order_number from backend
        orderId: instructions.order_id,
        tanggalBooking: new Date().toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        // Data Mobil
        mobil: {
          nama: car.name || car.nama_mobil,
          plat: car.plat_nomor,
          transmisi: car.transmission || car.jenis_transmisi,
          kapasitas: car.capacity || `${car.kapasitas_penumpang} Orang`,
          hargaPerHari: car.harga_per_hari,
          image: getCarImage(car.nama_mobil)
        },
        // Data Customer
        customer: {
          nama: personalData().name,
          email: personalData().email,
          phone: personalData().phone,
          namaKTP: ktpData().nama,
          nik: ktpData().nik
        },
        // Data Sewa
        sewa: {
          tanggalMulai: bookingData().startDate,
          tanggalSelesai: bookingData().endDate,
          durasi: days,
          withDriver: bookingData().withDriver === 'yes',
          catatan: bookingData().notes
        },
        // Data Pembayaran
        pembayaran: {
          metodePembayaran: 'Bank Transfer - ' + paymentData().bank_tujuan,
          totalHarga: totalAmount,
          vaNumber: instructions.va_number,
          billKey: instructions.bill_key,
          billerCode: instructions.biller_code,
          bank: instructions.bank,
          expiryTime: instructions.expiry_time,
          catatanPembayaran: `Transfer ke Virtual Account ${instructions.bank?.toUpperCase()}`
        }
      };
      
      // Simpan receipt dan tampilkan
      setBookingReceipt(receiptData);
      setShowBookingForm(false);
      setShowBookingReceipt(true);
      
      // Reset form
      setTimeout(() => {
        setBookingStep(1);
        setPersonalData({ name: '', phone: '', email: '' });
        setKtpData({ nama: '', nik: '', photo: null, previewUrl: '' });
        setPaymentData({ metode: 'transfer', nama_bank: 'BCA', bank_tujuan: 'BCA', sudah_bayar: false, catatan: '' });
        setBookingData({ startDate: '', endDate: '', withDriver: 'yes', notes: '' });
        setPaymentInstructions(null);
      }, 100);
    } catch (error) {
      console.error('Error submitting booking:', error);
      showToast('Gagal mengkonfirmasi booking.', 'error');
    }
  };

  return (
    <div class="min-h-screen bg-[#0B0B0B]">
      {/* Navbar */}
      <nav class="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-20">
            {/* Logo */}
            <A href="/home" class="flex items-center space-x-3 cursor-pointer">
              <div class="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center glow-purple">
                <span class="text-3xl font-bold text-white">R</span>
              </div>
              <span class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                RagilTrans
              </span>
            </A>

            {/* Desktop Menu */}
            <div class="flex items-center space-x-8">
              <A href="/home" class="text-gray-300 hover:text-purple-400 transition-colors font-medium">
                Home
              </A>
              <A href="/sewa" class="text-purple-400 font-medium">
                Mobil
              </A>
            </div>
          </div>
        </div>
      </nav>

      <div class="py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div class="text-center mb-12">
          <h1 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Sewa Mobil
          </h1>
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
              Filter mobil yang tersedia untuk tanggal yang Anda inginkan. 
              <span class="text-purple-300">Atau langsung pilih mobil, ketersediaan akan dicek saat Anda memasukkan tanggal booking.</span>
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-gray-300 text-sm mb-2">Tanggal Mulai</label>
                <div class="relative">
                  <input
                    type="date"
                    id="filterStartDate"
                    value={filterStartDate()}
                    onInput={(e) => setFilterStartDate(e.currentTarget.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style="color-scheme: dark;"
                    class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 pr-10 text-white focus:outline-none focus:border-purple-600 transition-colors cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-0 [&::-webkit-calendar-picker-indicator]:h-0"
                  />
                  <div 
                    class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer pointer-events-none"
                  >
                    <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label class="block text-gray-300 text-sm mb-2">Tanggal Selesai</label>
                <div class="relative">
                  <input
                    type="date"
                    id="filterEndDate"
                    value={filterEndDate()}
                    onInput={(e) => setFilterEndDate(e.currentTarget.value)}
                    min={filterStartDate() || new Date().toISOString().split('T')[0]}
                    style="color-scheme: dark;"
                    class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 pr-10 text-white focus:outline-none focus:border-purple-600 transition-colors cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-0 [&::-webkit-calendar-picker-indicator]:h-0"
                  />
                  <div 
                    class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer pointer-events-none"
                  >
                    <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div class="flex items-end gap-2">
                <button
                  onClick={fetchAvailableCars}
                  disabled={!filterStartDate() || !filterEndDate()}
                  class="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-semibold transition-all glow-purple-hover"
                >
                  Cari
                </button>
                
                <Show when={dateFilterEnabled()}>
                  <button
                    onClick={resetDateFilter}
                    class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-all"
                  >
                    Reset
                  </button>
                </Show>
              </div>
            </div>
            
            <Show when={dateFilterEnabled()}>
              <div class="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mt-2">
                <p class="text-purple-300 text-sm">
                  <span class="font-semibold">🗓️ Filter Aktif:</span> {new Date(filterStartDate()).toLocaleDateString('id-ID')} - {new Date(filterEndDate()).toLocaleDateString('id-ID')}
                  {' '}({filteredCars().length} mobil tersedia)
                </p>
              </div>
            </Show>
          </div>
        </div>

        {/* Loading State */}
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
                {/* Image */}
                <div class="relative h-56 overflow-hidden">
                  <img 
                    src={getCarImage(car.nama_mobil)} 
                    alt={car.nama_mobil} 
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                  
                  {/* Availability Badge - Only show when date filter is active */}
                  <Show when={dateFilterEnabled()}>
                    <div class="absolute top-4 right-4 z-10">
                      <span class="bg-green-500/90 text-white px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm border border-green-400/30">
                        Tersedia
                      </span>
                    </div>
                  </Show>
                </div>
                
                {/* Content */}
                <div class="p-6">
                  <h3 class="text-2xl font-bold text-white mb-3">{car.name}</h3>
                  <p class="text-gray-400 text-sm mb-4 line-clamp-2">{car.description}</p>
                  
                  {/* Specs */}
                  <div class="grid grid-cols-2 gap-3 mb-6">
                    <div class="flex items-center gap-2 text-sm text-gray-400">
                      <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                      </svg>
                      <span>{car.capacity}</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-400">
                      <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <span>{car.transmission}</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-400">
                      <svg class="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 2a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H6zm0 2h7v16H6V4zm10 3a1 1 0 0 1 1 1v7a1 1 0 0 1-2 0V8h-1V7h2zm-1 10a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2z" />
                      </svg>
                      <span>{car.fuel}</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-400">
                      <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                      </svg>
                      <span>Asuransi</span>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div class="border-t border-gray-800 pt-4">
                    <div class="flex items-center justify-between mb-4">
                      <div>
                        <p class="text-gray-500 text-xs mb-1">Mulai dari</p>
                        <p class="text-2xl font-bold text-purple-400">
                          {car.price === 'Hubungi' ? 'Hubungi' : `Rp ${car.price}`}
                        </p>
                        <Show when={car.price !== 'Hubungi'}>
                          <p class="text-gray-500 text-xs">per hari</p>
                        </Show>
                      </div>
                    </div>
                    
                    <div class="flex gap-2">
                      <button
                        onClick={() => handleViewDetail(car)}
                        class="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-all"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => handleBookNow(car)}
                        class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-all glow-purple-hover"
                      >
                        Sewa Sekarang
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
        </Show>

        {/* No Results */}
        
      </div>

      {/* Detail Modal */}
      <Show when={showModal() && selectedCar()}>
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm px-4" onClick={() => setShowModal(false)}>
          <div class="bg-gradient-to-br from-gray-900 to-black border border-purple-900/50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto glow-purple" onClick={(e) => e.stopPropagation()}>
            <div class="relative">
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                class="absolute top-4 right-4 z-10 bg-black/80 hover:bg-black text-white w-10 h-10 rounded-full flex items-center justify-center transition-all"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>

              {/* Image */}
              <div class="relative h-72 overflow-hidden rounded-t-2xl">
                <img 
                  src={getCarImage(selectedCar()!.nama_mobil)} 
                  alt={selectedCar()!.nama_mobil} 
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                
                <Show when={selectedCar()!.badge}>
                  <div class={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-sm font-bold ${
                    selectedCar()!.badge === 'Best Seller' 
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  }`}>
                    {selectedCar()!.badge}
                  </div>
                </Show>
              </div>

              {/* Content */}
              <div class="p-8">
                <h2 class="text-3xl font-bold text-white mb-2">{selectedCar()!.name}</h2>
                <p class="text-gray-400 mb-6">{selectedCar()!.description}</p>

                {/* Price */}
                <div class="bg-black/50 p-4 rounded-xl mb-6 border border-purple-900/30">
                  <p class="text-gray-400 text-sm mb-1">Harga Sewa</p>
                  <p class="text-3xl font-bold text-purple-400">
                    {selectedCar()!.price === 'Hubungi' ? 'Hubungi Kami' : `Rp ${selectedCar()!.price}`}
                  </p>
                  <Show when={selectedCar()!.price !== 'Hubungi'}>
                    <p class="text-gray-500 text-sm">per hari</p>
                  </Show>
                </div>

                {/* Specs Grid */}
                <div class="grid grid-cols-2 gap-4 mb-6">
                  <div class="bg-black/50 p-4 rounded-xl border border-gray-800">
                    <div class="flex items-center gap-3 mb-2">
                      <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                      </svg>
                      <span class="text-gray-400 text-sm">Kapasitas</span>
                    </div>
                    <p class="text-white font-semibold">{selectedCar()!.capacity}</p>
                  </div>

                  <div class="bg-black/50 p-4 rounded-xl border border-gray-800">
                    <div class="flex items-center gap-3 mb-2">
                      <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <span class="text-gray-400 text-sm">Transmisi</span>
                    </div>
                    <p class="text-white font-semibold">{selectedCar()!.transmission}</p>
                  </div>

                  <div class="bg-black/50 p-4 rounded-xl border border-gray-800">
                    <div class="flex items-center gap-3 mb-2">
                      <svg class="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                        <text x="12" y="17" text-anchor="middle" font-size="16" font-weight="bold" fill="currentColor">R</text>
                      </svg>
                      <span class="text-gray-400 text-sm">Bahan Bakar</span>
                    </div>
                    <p class="text-white font-semibold">{selectedCar()!.fuel}</p>
                  </div>

                  <div class="bg-black/50 p-4 rounded-xl border border-gray-800">
                    <div class="flex items-center gap-3 mb-2">
                      <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                      </svg>
                      <span class="text-gray-400 text-sm">Asuransi</span>
                    </div>
                    <p class="text-white font-semibold">Termasuk</p>
                  </div>
                </div>

                {/* Features */}
                <div class="mb-6">
                  <h3 class="text-lg font-bold text-white mb-3">Fitur & Keunggulan</h3>
                  <div class="grid grid-cols-2 gap-2">
                    <For each={selectedCar()!.features}>
                      {(feature: string) => (
                        <div class="flex items-center gap-2 text-gray-300">
                          <svg class="w-5 h-5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                          </svg>
                          <span class="text-sm">{feature}</span>
                        </div>
                      )}
                    </For>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleBookNow(selectedCar()!)}
                  class="w-full bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg glow-purple-hover"
                >
                  Sewa Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>

      {/* Booking Form Modal */}
      <Show when={showBookingForm() && selectedCar()}>
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm px-4" onClick={() => setShowBookingForm(false)}>
          <div class="bg-gradient-to-br from-gray-900 to-black border border-purple-900/50 rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto glow-purple" onClick={(e) => e.stopPropagation()}>
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-white">Form Pemesanan</h2>
              <button
                onClick={() => setShowBookingForm(false)}
                class="text-gray-400 hover:text-white"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Step Indicator */}
            <div class="mb-6 flex items-center justify-center gap-1 sm:gap-2">
              <div class={`flex items-center gap-1 sm:gap-2 ${bookingStep() === 1 ? 'text-purple-400' : 'text-gray-500'}`}>
                <div class={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${bookingStep() === 1 ? 'bg-purple-600' : bookingStep() > 1 ? 'bg-green-600' : 'bg-gray-700'}`}>
                  {bookingStep() > 1 ? '✓' : '1'}
                </div>
                <span class="text-[10px] sm:text-xs font-medium hidden sm:inline">Data Diri</span>
              </div>
              <div class="w-4 sm:w-8 h-0.5 bg-gray-700"></div>
              <div class={`flex items-center gap-1 sm:gap-2 ${bookingStep() === 2 ? 'text-purple-400' : 'text-gray-500'}`}>
                <div class={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${bookingStep() === 2 ? 'bg-purple-600' : bookingStep() > 2 ? 'bg-green-600' : 'bg-gray-700'}`}>
                  {bookingStep() > 2 ? '✓' : '2'}
                </div>
                <span class="text-[10px] sm:text-xs font-medium hidden sm:inline">KTP</span>
              </div>
              <div class="w-4 sm:w-8 h-0.5 bg-gray-700"></div>
              <div class={`flex items-center gap-1 sm:gap-2 ${bookingStep() === 3 ? 'text-purple-400' : 'text-gray-500'}`}>
                <div class={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${bookingStep() === 3 ? 'bg-purple-600' : bookingStep() > 3 ? 'bg-green-600' : 'bg-gray-700'}`}>
                  {bookingStep() > 3 ? '✓' : '3'}
                </div>
                <span class="text-[10px] sm:text-xs font-medium hidden sm:inline">Detail</span>
              </div>
              <div class="w-4 sm:w-8 h-0.5 bg-gray-700"></div>
              <div class={`flex items-center gap-1 sm:gap-2 ${bookingStep() === 4 ? 'text-purple-400' : 'text-gray-500'}`}>
                <div class={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${bookingStep() === 4 ? 'bg-purple-600' : 'bg-gray-700'}`}>
                  4
                </div>
                <span class="text-[10px] sm:text-xs font-medium hidden sm:inline">Bayar</span>
              </div>
            </div>

            {/* Selected Car Info */}
            <div class="mb-6 p-4 bg-black/50 rounded-xl border border-purple-900/30">
              <div class="flex items-center gap-4">
                <img 
                  src={getCarImage(selectedCar()!.nama_mobil)} 
                  alt={selectedCar()!.nama_mobil} 
                  class="w-24 h-24 object-cover rounded-lg"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.src = getCarImage(selectedCar()!.nama_mobil);
                  }}
                />
                <div>
                  <h3 class="font-bold text-purple-400 text-lg">{selectedCar()!.nama_mobil}</h3>
                  <p class="text-xl font-bold text-white">
                    Rp {formatRupiah(selectedCar()!.harga_per_hari)} / hari
                  </p>
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
                  <input
                    type="text"
                    required
                    value={personalData().name}
                    onInput={(e) => setPersonalData({ ...personalData(), name: e.currentTarget.value })}
                    placeholder="Masukkan nama lengkap"
                    pattern="^[a-zA-Z\s]+$"
                    title="Nama hanya boleh berisi huruf dan spasi"
                    class="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">No. WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={personalData().phone}
                    onInput={(e) => {
                      const value = e.currentTarget.value.replace(/\D/g, '');
                      setPersonalData({ ...personalData(), phone: value });
                    }}
                    placeholder="08xxxxxxxxxx"
                    class="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={personalData().email}
                    onInput={(e) => setPersonalData({ ...personalData(), email: e.currentTarget.value })}
                    placeholder="email@example.com"
                    class="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div class="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    class="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold glow-purple-hover transition-all"
                  >
                    Lanjut
                  </button>
                </div>
              </div>
            </Show>

            {/* Step 2: Verifikasi KTP */}
            <Show when={bookingStep() === 2}>
              <div class="space-y-4">
                <div class="mb-4">
                  <h3 class="text-lg font-semibold text-white mb-2">Langkah 2: Verifikasi KTP</h3>
                  <p class="text-sm text-gray-400">Upload foto KTP Anda untuk verifikasi identitas</p>
                </div>

                <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                  <div class="flex items-start gap-2">
                    <svg class="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <div class="text-sm text-yellow-200">
                      <p class="font-semibold mb-1">Pastikan foto KTP Anda:</p>
                      <ul class="list-disc list-inside space-y-1 text-yellow-300/90">
                        <li>Jelas dan tidak blur</li>
                        <li>Seluruh bagian KTP terlihat</li>
                        <li>Format: JPG, PNG (Max 5MB)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Nama Sesuai KTP *</label>
                  <input
                    type="text"
                    required
                    value={ktpData().nama}
                    onInput={(e) => setKtpData({ ...ktpData(), nama: e.currentTarget.value })}
                    placeholder="Masukkan nama sesuai KTP"
                    pattern="^[a-zA-Z\s]+$"
                    title="Nama hanya boleh berisi huruf dan spasi"
                    class="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Nomor Induk Kependudukan (NIK) *</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={ktpData().nik}
                    onInput={(e) => {
                      const value = e.currentTarget.value.replace(/\D/g, '');
                      setKtpData({ ...ktpData(), nik: value });
                    }}
                    placeholder="16 digit NIK"
                    class="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    {ktpData().nik.length}/16 digit
                  </p>
                </div>

                <div class="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center">
                  <Show when={!ktpData().previewUrl}>
                    <label class="cursor-pointer block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleKtpUpload}
                        class="hidden"
                      />
                      <div class="flex flex-col items-center gap-3">
                        <div class="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center">
                          <svg class="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
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
                      <img 
                        src={ktpData().previewUrl} 
                        alt="Preview KTP" 
                        class="max-h-64 mx-auto rounded-lg border-2 border-purple-600"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveKtp}
                        class="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                      <div class="mt-3 flex items-center justify-center gap-2 text-green-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span class="text-sm font-semibold">Foto KTP berhasil diupload</span>
                      </div>
                    </div>
                  </Show>
                </div>

                <div class="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    class="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                  >
                    Kembali
                  </button>
                  <button
                    type="button"
                    onClick={handleNextToBooking}
                    class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold glow-purple-hover transition-all"
                  >
                    Lanjut
                  </button>
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
                    <div class="relative">
                      <input
                        type="date"
                        id="startDate"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={bookingData().startDate}
                        onInput={(e) => {
                          setBookingData({ ...bookingData(), startDate: e.currentTarget.value });
                          checkRealTimeAvailability();
                        }}
                        style="-webkit-appearance: none; -moz-appearance: none; appearance: none; color-scheme: dark;"
                        class="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:border-purple-600 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-0 [&::-webkit-calendar-picker-indicator]:h-0"
                      />
                      <div 
                        class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                        onClick={() => (document.getElementById('startDate') as HTMLInputElement)?.showPicker?.()}
                      >
                        <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Tanggal Selesai *</label>
                    <div class="relative">
                      <input
                        type="date"
                        id="endDate"
                        required
                        min={bookingData().startDate || new Date().toISOString().split('T')[0]}
                        value={bookingData().endDate}
                        onInput={(e) => {
                          setBookingData({ ...bookingData(), endDate: e.currentTarget.value });
                          checkRealTimeAvailability();
                        }}
                        style="-webkit-appearance: none; -moz-appearance: none; appearance: none; color-scheme: dark;"
                        class="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:border-purple-600 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-0 [&::-webkit-calendar-picker-indicator]:h-0"
                      />
                      <div 
                        class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                        onClick={() => (document.getElementById('endDate') as HTMLInputElement)?.showPicker?.()}
                      >
                        <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-time availability check loading */}
                <Show when={availabilityCheckLoading()}>
                  <div class="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
                    <div class="flex items-center gap-3">
                      <div class="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      <p class="text-blue-400 text-sm">Mengecek ketersediaan mobil...</p>
                    </div>
                  </div>
                </Show>

                {/* Availability check result */}
                <Show when={!availabilityCheckLoading() && availabilityCheckResult()}>
                  <Show when={availabilityCheckResult()!.available}>
                    <div class="bg-green-600/10 border border-green-600/30 rounded-lg p-4">
                      <div class="flex items-center gap-3">
                        <svg class="w-6 h-6 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <p class="text-green-400 font-semibold">Mobil tersedia untuk tanggal yang dipilih!</p>
                      </div>
                    </div>
                  </Show>
                  <Show when={!availabilityCheckResult()!.available}>
                    <div class="bg-red-600/10 border border-red-600/30 rounded-lg p-4">
                      <div class="flex items-start gap-3">
                        <svg class="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <div class="flex-1">
                          <p class="text-red-400 font-semibold mb-2">Mobil tidak tersedia untuk tanggal yang dipilih!</p>
                          <Show when={availabilityCheckResult()!.conflictingBookings && availabilityCheckResult()!.conflictingBookings!.length > 0}>
                            <div class="space-y-2">
                              <p class="text-red-300 text-sm">Tanggal yang sudah dibooking:</p>
                              <div class="bg-black/30 rounded-lg p-3">
                                <For each={availabilityCheckResult()!.conflictingBookings}>
                                  {(booking) => (
                                    <div class="text-gray-300 text-sm py-1">
                                      • {new Date(booking.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                      {' - '}
                                      {new Date(booking.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                  )}
                                </For>
                              </div>
                              <p class="text-red-300 text-sm mt-2">Silakan pilih tanggal lain atau hubungi admin untuk info lebih lanjut.</p>
                            </div>
                          </Show>
                        </div>
                      </div>
                    </div>
                  </Show>
                </Show>

                {/* Duration Display */}
                <Show when={bookingData().startDate && bookingData().endDate}>
                  <div class="bg-purple-600/10 border border-purple-600/30 rounded-lg p-3">
                    <p class="text-purple-400 font-semibold">
                      Durasi: {calculateDays()} hari
                    </p>
                  </div>
                </Show>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Dengan Driver? *</label>
                  <div class="flex gap-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="driver"
                        value="yes"
                        checked={bookingData().withDriver === 'yes'}
                        onChange={(e) => setBookingData({ ...bookingData(), withDriver: e.currentTarget.value })}
                        class="w-4 h-4 text-purple-600"
                      />
                      <span class="text-gray-300">Ya, dengan driver</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="driver"
                        value="no"
                        checked={bookingData().withDriver === 'no'}
                        onChange={(e) => setBookingData({ ...bookingData(), withDriver: e.currentTarget.value })}
                        class="w-4 h-4 text-purple-600"
                      />
                      <span class="text-gray-300">Lepas kunci</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Catatan (Opsional)</label>
                  <textarea
                    rows={3}
                    value={bookingData().notes}
                    onInput={(e) => setBookingData({ ...bookingData(), notes: e.currentTarget.value })}
                    placeholder="Tambahkan catatan atau permintaan khusus..."
                    class="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600"
                  ></textarea>
                </div>

                <div class="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    class="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold glow-purple-hover transition-all"
                  >
                    Lanjut
                  </button>
                </div>
              </form>
            </Show>

            {/* Step 4: Pembayaran */}
            <Show when={bookingStep() === 4}>
              <div class="space-y-4">
                <div class="mb-4">
                  <h3 class="text-lg font-semibold text-white mb-2">Langkah 4: Pembayaran Penuh</h3>
                  <p class="text-sm text-gray-400">Pilih bank dan lakukan pembayaran</p>
                </div>

                {/* Info Rekening Admin */}
                <div class="bg-gradient-to-br from-purple-600/10 to-purple-900/10 border border-purple-600/30 rounded-xl p-4">
                  <div class="flex items-start gap-3">
                    <svg class="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                    <div class="flex-1">
                      <p class="text-purple-400 font-semibold mb-3">Informasi Transfer</p>
                      <div class="space-y-1 text-sm mb-3">
                        <p class="text-white">Bank: <span class="font-semibold">BCA</span></p>
                        <p class="text-white">No. Rek: <span class="font-semibold">1234567890</span></p>
                        <p class="text-white">Atas Nama: <span class="font-semibold">PT Ragil Trans</span></p>
                      </div>
                      
                      {/* Rincian Pembayaran */}
                      <div class="border-t border-purple-600/30 pt-3 space-y-2">
                        <p class="text-purple-300 font-semibold text-sm mb-2">Rincian Pembayaran:</p>
                        <div class="flex justify-between text-sm">
                          <span class="text-gray-400">Harga per Hari</span>
                          <span class="text-white font-medium">{formatRupiah(selectedCar()?.harga_per_hari || 0)}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                          <span class="text-gray-400">Durasi Sewa</span>
                          <span class="text-white font-medium">{calculateDuration()} Hari</span>
                        </div>
                        <div class="flex justify-between text-sm">
                          <span class="text-gray-400">Subtotal Sewa</span>
                          <span class="text-white font-medium">{formatRupiah((selectedCar()?.harga_per_hari || 0) * calculateDuration())}</span>
                        </div>
                        <Show when={bookingData().withDriver === 'yes'}>
                          <div class="flex justify-between text-sm">
                            <span class="text-gray-400">Biaya Driver</span>
                            <span class="text-white font-medium">+ {formatRupiah(50000)}</span>
                          </div>
                        </Show>
                        <div class="flex justify-between text-sm bg-purple-600/20 rounded-lg p-2 mt-2">
                          <span class="text-purple-300 font-semibold">Total yang Harus Dibayar</span>
                          <span class="text-purple-300 font-bold text-lg">{formatRupiah(calculateTotalPrice())}</span>
                        </div>
                        <div class="flex items-center gap-2 text-xs text-green-400 italic mt-2">
                          <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                          </svg>
                          <span>Pembayaran penuh - Langsung lunas!</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-3">Pilih Metode Pembayaran *</label>
                  <div class="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentData({ ...paymentData(), bank_tujuan: 'BCA' })}
                      class={`p-4 rounded-xl border-2 transition-all ${
                        paymentData().bank_tujuan === 'BCA'
                          ? 'border-purple-600 bg-purple-600/20'
                          : 'border-gray-700 bg-black/30 hover:border-purple-600/50'
                      }`}
                    >
                      <div class="flex items-center justify-center">
                        <img src={bcaLogo} alt="BCA" class="h-14 w-auto object-contain" />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentData({ ...paymentData(), bank_tujuan: 'Mandiri' })}
                      class={`p-4 rounded-xl border-2 transition-all ${
                        paymentData().bank_tujuan === 'Mandiri'
                          ? 'border-purple-600 bg-purple-600/20'
                          : 'border-gray-700 bg-black/30 hover:border-purple-600/50'
                      }`}
                    >
                      <div class="flex items-center justify-center">
                        <img src={mandiriLogo} alt="Mandiri" class="h-16 w-auto object-contain" />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentData({ ...paymentData(), bank_tujuan: 'BNI' })}
                      class={`p-4 rounded-xl border-2 transition-all ${
                        paymentData().bank_tujuan === 'BNI'
                          ? 'border-purple-600 bg-purple-600/20'
                          : 'border-gray-700 bg-black/30 hover:border-purple-600/50'
                      }`}
                    >
                      <div class="flex items-center justify-center">
                        <img src={bniLogo} alt="BNI" class="h-14 w-auto object-contain" />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentData({ ...paymentData(), bank_tujuan: 'BRI' })}
                      class={`p-4 rounded-xl border-2 transition-all ${
                        paymentData().bank_tujuan === 'BRI'
                          ? 'border-purple-600 bg-purple-600/20'
                          : 'border-gray-700 bg-black/30 hover:border-purple-600/50'
                      }`}
                    >
                      <div class="flex items-center justify-center">
                        <img src={briLogo} alt="BRI" class="h-14 w-auto object-contain" />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentData({ ...paymentData(), bank_tujuan: 'BSI' })}
                      class={`p-4 rounded-xl border-2 transition-all ${
                        paymentData().bank_tujuan === 'BSI'
                          ? 'border-purple-600 bg-purple-600/20'
                          : 'border-gray-700 bg-black/30 hover:border-purple-600/50'
                      }`}
                    >
                      <div class="flex items-center justify-center">
                        <img src={bsiLogo} alt="BSI" class="h-20 w-auto object-contain" />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentData({ ...paymentData(), bank_tujuan: 'CIMB' })}
                      class={`p-4 rounded-xl border-2 transition-all ${
                        paymentData().bank_tujuan === 'CIMB'
                          ? 'border-purple-600 bg-purple-600/20'
                          : 'border-gray-700 bg-black/30 hover:border-purple-600/50'
                      }`}
                    >
                      <div class="flex items-center justify-center">
                        <img src={cimbLogo} alt="CIMB2" class="h-20 w-auto object-contain" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Tombol Bayar Sekarang */}
                <Show when={!paymentInstructions()}>
                  <button
                    type="button"
                    onClick={handleBayarSekarang}
                    disabled={isProcessingPayment()}
                    class="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
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
                      <span>Buat Virtual Account {paymentData().bank_tujuan}</span>
                    </Show>
                  </button>
                </Show>

                {/* Virtual Account Info */}
                <Show when={paymentInstructions()}>
                  <div class="bg-gradient-to-br from-green-600/10 to-green-900/10 border border-green-600/30 rounded-xl p-5 space-y-4">
                    <div class="flex items-center gap-3 border-b border-green-600/30 pb-3">
                      <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <div>
                        <p class="text-green-400 font-bold text-lg">Virtual Account Berhasil Dibuat!</p>
                        <p class="text-sm text-green-300">Silakan transfer sesuai nominal di bawah</p>
                      </div>
                    </div>

                    <div class="space-y-3">
                      <div>
                        <p class="text-gray-400 text-sm mb-1">Bank</p>
                        <p class="text-white font-bold text-xl">{paymentInstructions()?.bank?.toUpperCase()}</p>
                      </div>

                      <Show when={paymentInstructions()?.va_number}>
                        <div>
                          <p class="text-gray-400 text-sm mb-1">Nomor Virtual Account</p>
                          <div class="flex items-center gap-2">
                            <p class="text-white font-mono font-bold text-2xl tracking-wider flex-1">
                              {paymentInstructions()?.va_number}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(paymentInstructions()?.va_number || '');
                                showToast('Nomor VA berhasil disalin!', 'success');
                              }}
                              class="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-all"
                              title="Salin nomor VA"
                            >
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </Show>

                      <Show when={paymentInstructions()?.bill_key}>
                        <div>
                          <p class="text-gray-400 text-sm mb-1">Kode Bayar (Bill Key)</p>
                          <div class="flex items-center gap-2">
                            <p class="text-white font-mono font-bold text-2xl tracking-wider flex-1">
                              {paymentInstructions()?.bill_key}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(paymentInstructions()?.bill_key || '');
                                showToast('Bill Key berhasil disalin!', 'success');
                              }}
                              class="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-all"
                            >
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </Show>

                      <Show when={paymentInstructions()?.biller_code}>
                        <div>
                          <p class="text-gray-400 text-sm mb-1">Biller Code</p>
                          <p class="text-white font-mono font-bold text-xl tracking-wider">
                            {paymentInstructions()?.biller_code}
                          </p>
                        </div>
                      </Show>

                      <div>
                        <p class="text-gray-400 text-sm mb-1">Total yang Harus Dibayar</p>
                        <p class="text-green-400 font-bold text-3xl">
                          Rp {formatRupiah(paymentInstructions()?.gross_amount || calculateTotalPrice())}
                        </p>
                      </div>

                      <Show when={paymentInstructions()?.expiry_time}>
                        <div class="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-3">
                          <p class="text-yellow-400 text-sm">
                            ⏰ Batas waktu pembayaran: {new Date(paymentInstructions()?.expiry_time).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </Show>

                      <div class="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3 space-y-2">
                        <p class="text-blue-400 font-semibold text-sm">📝 Cara Bayar:</p>
                        <ol class="text-blue-300 text-xs space-y-1 list-decimal list-inside">
                          <li>Buka aplikasi mobile banking {paymentData().bank_tujuan}</li>
                          <li>Pilih menu Transfer / Bayar</li>
                          <li>Pilih Virtual Account atau Transfer Bank</li>
                          <li>Masukkan nomor VA di atas</li>
                          <li>Konfirmasi dan selesaikan pembayaran</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </Show>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Catatan (Opsional)</label>
                  <textarea
                    rows={2}
                    value={paymentData().catatan}
                    onInput={(e) => setPaymentData({ ...paymentData(), catatan: e.currentTarget.value })}
                    placeholder="Catatan tambahan..."
                    class="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600"
                  ></textarea>
                </div>

                <div class="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    class="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                  >
                    Kembali
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitBooking}
                    class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold glow-purple-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!paymentInstructions()}
                  >
                    Konfirmasi Booking
                  </button>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </Show>

      {/* Booking Receipt / Struk Pemesanan */}
      <Show when={showBookingReceipt() && bookingReceipt()}>
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-gradient-to-br from-gray-900 to-black rounded-xl max-w-md w-full border border-purple-900/30 max-h-[90vh] overflow-y-auto">
            <div class="p-4">
              {/* Header Success */}
              <div class="text-center mb-4">
                <div class="w-14 h-14 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h2 class="text-xl font-bold text-white mb-1">Pemesanan Berhasil!</h2>
                <p class="text-sm text-gray-400">Terima kasih telah memesan</p>
              </div>

              {/* Booking ID & Date */}
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

              {/* Car Info */}
              <div class="bg-black/50 border border-gray-800 rounded-lg p-3 mb-2">
                <h3 class="text-sm font-semibold text-purple-400 mb-2">Mobil</h3>
                <div class="flex flex-col gap-2">
                  <img 
                    src={getCarImage(bookingReceipt().mobil.nama)} 
                    alt={bookingReceipt().mobil.nama}
                    class="w-full h-32 object-cover rounded-lg"
                  />
                  <div>
                    <p class="font-bold text-white text-base mb-1">{bookingReceipt().mobil.nama}</p>
                    <div class="space-y-0.5 text-xs">
                      <p class="text-gray-400">{bookingReceipt().mobil.plat} • {bookingReceipt().mobil.transmisi}</p>
                      <p class="text-gray-400">{bookingReceipt().mobil.kapasitas}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div class="bg-black/50 border border-gray-800 rounded-lg p-3 mb-2">
                <h3 class="text-sm font-semibold text-purple-400 mb-2">Penyewa</h3>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p class="text-gray-400">Nama</p>
                    <p class="text-white font-semibold">{bookingReceipt().customer.nama}</p>
                  </div>
                  <div>
                    <p class="text-gray-400">WhatsApp</p>
                    <p class="text-white font-semibold">{bookingReceipt().customer.phone}</p>
                  </div>
                </div>
              </div>

              {/* Rental Details */}
              <div class="bg-black/50 border border-gray-800 rounded-lg p-3 mb-2">
                <h3 class="text-sm font-semibold text-purple-400 mb-2">Detail Sewa</h3>
                <div class="space-y-1 text-xs">
                  <div class="flex justify-between">
                    <span class="text-gray-400">Mulai</span>
                    <span class="text-white font-semibold">{new Date(bookingReceipt().sewa.tanggalMulai).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-400">Selesai</span>
                    <span class="text-white font-semibold">{new Date(bookingReceipt().sewa.tanggalSelesai).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-400">Durasi</span>
                    <span class="text-white font-semibold">{bookingReceipt().sewa.durasi} Hari • {bookingReceipt().sewa.withDriver ? 'Pakai Driver' : 'Lepas Kunci'}</span>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div class="bg-gradient-to-br from-purple-600/10 to-purple-900/10 border border-purple-600/30 rounded-lg p-3 mb-3">
                <h3 class="text-sm font-semibold text-purple-400 mb-2">Pembayaran</h3>
                <div class="space-y-1 text-xs">
                  <div class="flex justify-between">
                    <span class="text-gray-400">Sewa Mobil ({bookingReceipt().sewa.durasi} hari)</span>
                    <span class="text-white font-semibold">Rp {formatRupiah(bookingReceipt().mobil.hargaPerHari * bookingReceipt().sewa.durasi)}</span>
                  </div>
                  <Show when={bookingReceipt().sewa.withDriver}>
                    <div class="flex justify-between">
                      <span class="text-gray-400">Biaya Driver</span>
                      <span class="text-white font-semibold">Rp {formatRupiah(50000)}</span>
                    </div>
                  </Show>
                  <div class="flex justify-between pt-1 border-t border-purple-600/30 font-bold">
                    <span class="text-white">Total</span>
                    <span class="text-white text-sm">Rp {formatRupiah(bookingReceipt().pembayaran.totalHarga)}</span>
                  </div>
                  <div class="flex justify-between pt-1 border-t border-purple-600/30">
                    <span class="text-green-400 font-bold">Status</span>
                    <span class="text-green-400 text-sm font-bold flex items-center gap-1">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                      LUNAS
                    </span>
                  </div>
                  <div class="flex justify-between text-xs">
                    <span class="text-gray-400">Metode</span>
                    <span class="text-white">{bookingReceipt().pembayaran.metodePembayaran}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div class="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBookingIdForReview(bookingReceipt().bookingId);
                    setShowReviewModal(true);
                  }}
                  class="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Berikan Review
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  class="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                  </svg>
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingReceipt(false);
                    setBookingReceipt(null);
                  }}
                  class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-semibold glow-purple-hover transition-all"
                >
                  Selesai
                </button>
              </div>

              {/* Footer Note */}
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
        onSuccess={() => {
          setShowBookingReceipt(false);
          setBookingReceipt(null);
          setShowReviewModal(false);
        }}
      />
      </div>
    </div>
  );
}
