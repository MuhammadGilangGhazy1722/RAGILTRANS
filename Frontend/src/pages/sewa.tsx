import { createSignal, For, Show } from 'solid-js';
import { A } from '@solidjs/router';
import tragaImg from '../assets/traga.jpeg';
import l300Img from '../assets/l300.jpeg';
import innovaImg from '../assets/innova.jpeg';
import luxioImg from '../assets/luxio.jpeg';
import pantherImg from '../assets/phanter.jpeg';

interface Car {
  id: number;
  name: string;
  category: string;
  image: string;
  price: string;
  capacity: string;
  transmission: string;
  fuel: string;
  description: string;
  badge?: string;
  features: string[];
}

export default function Sewa() {
  const [showModal, setShowModal] = createSignal(false);
  const [selectedCar, setSelectedCar] = createSignal<Car | null>(null);
  const [showBookingForm, setShowBookingForm] = createSignal(false);
  const [bookingStep, setBookingStep] = createSignal(1); // 1: Data Diri, 2: Verifikasi KTP, 3: Pembayaran, 4: Detail Sewa

  const cars: Car[] = [
    {
      id: 1,
      name: 'Isuzu Traga',
      category: 'niaga',
      image: tragaImg,
      price: '400.000',
      capacity: '3 Orang',
      transmission: 'Manual',
      fuel: 'Diesel',
      description: 'Mobil niaga handal, cocok untuk angkut barang dengan kapasitas besar dan irit BBM',
      
      features: ['Kapasitas Besar', 'Irit BBM', 'Mesin Tangguh', 'Cocok Usaha']
    },
    {
      id: 2,
      name: 'Mitsubishi L300',
      category: 'niaga',
      image: l300Img,
      price: '450.000',
      capacity: '3 Orang',
      transmission: 'Manual',
      fuel: 'Diesel',
      description: 'Mobil pickup handal, cocok untuk usaha & logistik dengan daya angkut maksimal',
      features: ['Pickup Handal', 'Untuk Logistik', 'Daya Angkut Besar', 'Mesin Diesel']
    },
    {
      id: 3,
      name: 'Toyota Innova',
      category: 'mpv',
      image: innovaImg,
      price: '600.000',
      capacity: '7 Orang',
      transmission: 'Automatic',
      fuel: 'Bensin',
      description: 'Mobil keluarga premium, nyaman untuk perjalanan jauh dengan interior luas',
      
      features: ['Keluarga Premium', 'AC Dingin', 'Audio System', 'Nyaman & Luas']
    },
    {
      id: 4,
      name: 'Daihatsu Luxio',
      category: 'mpv',
      image: luxioImg,
      price: '450.000',
      capacity: '7 Orang',
      transmission: 'Manual',
      fuel: 'Bensin',
      description: 'MPV luas & praktis, cocok untuk travel & bisnis dengan harga ekonomis',
      features: ['MPV Praktis', 'Luas & Nyaman', 'Ekonomis', 'Cocok Travel']
    },
    {
      id: 5,
      name: 'Isuzu Panther',
      category: 'suv',
      image: pantherImg,
      price: '500.000',
      capacity: '8 Orang',
      transmission: 'Manual',
      fuel: 'Diesel',
      description: 'Diesel tangguh, irit dan nyaman untuk perjalanan keluarga dan bisnis',
      badge: 'Best Seller',
      features: ['Diesel Tangguh', 'Irit BBM', '8 Penumpang', 'Kokoh & Nyaman']
    },
    
  ];

  const handleViewDetail = (car: Car) => {
    setSelectedCar(car);
    setShowModal(true);
  };

  const handleBookNow = (car: Car) => {
    setSelectedCar(car);
    setShowModal(false);
    setBookingStep(1); // Reset ke step 1
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

  const [bookingData, setBookingData] = createSignal({
    startDate: '',
    endDate: '',
    withDriver: 'yes',
    notes: ''
  });

  const handleNextStep = (e: Event) => {
    e.preventDefault();
    // Validasi data diri
    if (!personalData().name || !personalData().phone || !personalData().email) {
      alert('⚠️ Mohon lengkapi semua data diri!');
      return;
    }
    // Validasi format email
    if (!personalData().email.includes('@') || !personalData().email.includes('.')) {
      alert('⚠️ Format email tidak valid! Harus menggunakan @ dan domain yang benar (contoh: nama@email.com)');
      return;
    }
    setBookingStep(2);
  };

  const handleNextToBooking = (e: Event) => {
    e.preventDefault();
    // Validasi KTP
    if (!ktpData().nama || !ktpData().nik || !ktpData().photo) {
      alert('⚠️ Mohon lengkapi semua data KTP!');
      return;
    }
    // Validasi NIK harus 16 angka
    if (ktpData().nik.length !== 16 || !/^\d+$/.test(ktpData().nik)) {
      alert('⚠️ NIK harus berisi 16 angka!');
      return;
    }
    setBookingStep(3);
  };

  const handleNextToDetailSewa = (e: Event) => {
    e.preventDefault();
    // Validasi Pembayaran
    if (!paymentData().sudah_bayar) {
      alert('⚠️ Mohon lakukan pembayaran terlebih dahulu!');
      return;
    }
    setBookingStep(4);
  };

  const handleBayarSekarang = () => {
    const bank = paymentData().bank_tujuan;
    let deeplink = '';
    
    // Deep link untuk mobile banking
    switch(bank) {
      case 'BCA':
        deeplink = 'https://m.bca.co.id';
        break;
      case 'Mandiri':
        deeplink = 'https://livin.id';
        break;
      case 'BNI':
        deeplink = 'https://bni-mbanking.bni.co.id';
        break;
      case 'BRI':
        deeplink = 'https://ib.bri.co.id/ib-bri';
        break;
      case 'BSI':
        deeplink = 'https://www.bankbsi.co.id/mobilebanking';
        break;
      default:
        deeplink = 'https://www.google.com/search?q=' + bank + '+mobile+banking';
    }
    
    // Buka mobile banking di tab baru
    window.open(deeplink, '_blank');
    
    // Tampilkan alert konfirmasi
    setTimeout(() => {
      const confirm = window.confirm('Apakah Anda sudah menyelesaikan pembayaran?');
      if (confirm) {
        setPaymentData({ ...paymentData(), sudah_bayar: true });
      }
    }, 2000);
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
        alert('⚠️ File harus berupa gambar!');
        return;
      }
      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('⚠️ Ukuran file maksimal 5MB!');
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

  const handleSubmitBooking = (e: Event) => {
    e.preventDefault();
    const days = calculateDays();
    const car = selectedCar();
    if (car) {
      alert(`✅ Booking berhasil!\n\nMobil: ${car.name}\nNama: ${personalData().name}\nKTP: ${ktpData().photo?.name}\nDurasi: ${days} hari\nDengan Driver: ${bookingData().withDriver === 'yes' ? 'Ya' : 'Tidak'}\n\nAnda akan dihubungi melalui WhatsApp.`);
      setShowBookingForm(false);
      setBookingStep(1);
      setPersonalData({
        name: '',
        phone: '',
        email: ''
      });
      setKtpData({
        nama: '',
        nik: '',
        photo: null,
        previewUrl: ''
      });
      setPaymentData({
        metode: 'transfer',
        nama_bank: 'BCA',
        bank_tujuan: 'BCA',
        sudah_bayar: false,
        catatan: ''
      });
      setBookingData({
        startDate: '',
        endDate: '',
        withDriver: 'yes',
        notes: ''
      });
    }
  };

  return (
    <div class="min-h-screen bg-[#0B0B0B]">
      {/* Navbar */}
      <nav class="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-20">
            {/* Logo */}
            <A href="/" class="flex items-center space-x-3 cursor-pointer">
              <div class="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center glow-purple">
                <span class="text-3xl font-bold text-white">R</span>
              </div>
              <span class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                RagilTrans
              </span>
            </A>

            {/* Desktop Menu */}
            <div class="flex items-center space-x-8">
              <A href="/" class="text-gray-300 hover:text-purple-400 transition-colors font-medium">
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

        {/* Cars Grid */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <For each={cars}>
            {(car: Car) => (
              <div class="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden border border-purple-900/30 card-hover group">
                {/* Image */}
                <div class="relative h-56 overflow-hidden">
                  <img 
                    src={car.image} 
                    alt={car.name} 
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                  
                  
                  
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
                      <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
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
                        class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-semibold glow-purple-hover"
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
                  src={selectedCar()!.image} 
                  alt={selectedCar()!.name} 
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
                      <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
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
                <span class="text-[10px] sm:text-xs font-medium hidden sm:inline">Bayar</span>
              </div>
              <div class="w-4 sm:w-8 h-0.5 bg-gray-700"></div>
              <div class={`flex items-center gap-1 sm:gap-2 ${bookingStep() === 4 ? 'text-purple-400' : 'text-gray-500'}`}>
                <div class={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${bookingStep() === 4 ? 'bg-purple-600' : 'bg-gray-700'}`}>
                  4
                </div>
                <span class="text-[10px] sm:text-xs font-medium hidden sm:inline">Detail</span>
              </div>
            </div>

            {/* Selected Car Info */}
            <div class="mb-6 p-4 bg-black/50 rounded-xl border border-purple-900/30">
              <div class="flex items-center gap-4">
                <img src={selectedCar()!.image} alt={selectedCar()!.name} class="w-20 h-20 object-cover rounded-lg" />
                <div>
                  <h3 class="font-bold text-purple-400 text-lg">{selectedCar()!.name}</h3>
                  <p class="text-xl font-bold text-white">
                    {selectedCar()!.price === 'Hubungi' ? 'Hubungi Kami' : `Rp ${selectedCar()!.price} / hari`}
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
                    Lanjut ke Detail Sewa →
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
                    ← Kembali
                  </button>
                  <button
                    type="button"
                    onClick={handleNextToBooking}
                    class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold glow-purple-hover transition-all"
                  >
                    Lanjut ke Pembayaran →
                  </button>
                </div>
              </div>
            </Show>

            {/* Step 3: Pembayaran */}
            <Show when={bookingStep() === 3}>
              <div class="space-y-4">
                <div class="mb-4">
                  <h3 class="text-lg font-semibold text-white mb-2">Langkah 3: Pembayaran DP</h3>
                  <p class="text-sm text-gray-400">Pilih bank dan lakukan pembayaran</p>
                </div>

                {/* Info Rekening Admin */}
                <div class="bg-gradient-to-br from-purple-600/10 to-purple-900/10 border border-purple-600/30 rounded-xl p-4">
                  <div class="flex items-start gap-3">
                    <svg class="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                    <div class="flex-1">
                      <p class="text-purple-400 font-semibold mb-2">Informasi Transfer</p>
                      <div class="space-y-1 text-sm">
                        <p class="text-white">Bank: <span class="font-semibold">BCA</span></p>
                        <p class="text-white">No. Rek: <span class="font-semibold">1234567890</span></p>
                        <p class="text-white">Atas Nama: <span class="font-semibold">PT Ragil Trans</span></p>
                        <p class="text-purple-300 mt-2">Jumlah DP: <span class="font-bold text-lg">Rp 500.000</span></p>
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
                      <div class="flex items-center justify-center gap-2">
                        <svg class="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                        </svg>
                        <span class="font-semibold text-white">BCA</span>
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
                      <div class="flex items-center justify-center gap-2">
                        <svg class="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                        </svg>
                        <span class="font-semibold text-white">Mandiri</span>
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
                      <div class="flex items-center justify-center gap-2">
                        <svg class="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                        </svg>
                        <span class="font-semibold text-white">BNI</span>
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
                      <div class="flex items-center justify-center gap-2">
                        <svg class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                        </svg>
                        <span class="font-semibold text-white">BRI</span>
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
                      <div class="flex items-center justify-center gap-2">
                        <svg class="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                        </svg>
                        <span class="font-semibold text-white">BSI</span>
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
                      <div class="flex items-center justify-center gap-2">
                        <svg class="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                        </svg>
                        <span class="font-semibold text-white">CIMB</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Tombol Bayar Sekarang */}
                <Show when={!paymentData().sudah_bayar}>
                  <button
                    type="button"
                    onClick={handleBayarSekarang}
                    class="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    Bayar via {paymentData().bank_tujuan} Mobile Banking
                  </button>
                </Show>

                {/* Status Sudah Bayar */}
                <Show when={paymentData().sudah_bayar}>
                  <div class="bg-green-600/10 border border-green-600/30 rounded-xl p-4">
                    <div class="flex items-center gap-3">
                      <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <div>
                        <p class="text-green-400 font-semibold">Pembayaran Dikonfirmasi</p>
                        <p class="text-sm text-green-300">Lanjutkan ke detail peminjaman</p>
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
                    ← Kembali
                  </button>
                  <button
                    type="button"
                    onClick={handleNextToDetailSewa}
                    class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold glow-purple-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!paymentData().sudah_bayar}
                  >
                    Lanjut ke Detail Sewa →
                  </button>
                </div>
              </div>
            </Show>

            {/* Step 4: Detail Sewa */}
            <Show when={bookingStep() === 4}>
              <form onSubmit={handleSubmitBooking} class="space-y-4">
                <div class="mb-4">
                  <h3 class="text-lg font-semibold text-white mb-2">Langkah 4: Detail Peminjaman</h3>
                  <p class="text-sm text-gray-400">Tentukan periode dan opsi sewa Anda</p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Tanggal Mulai *</label>
                    <input
                      type="date"
                      required
                      value={bookingData().startDate}
                      onInput={(e) => setBookingData({ ...bookingData(), startDate: e.currentTarget.value })}
                      class="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Tanggal Selesai *</label>
                    <input
                      type="date"
                      required
                      value={bookingData().endDate}
                      onInput={(e) => setBookingData({ ...bookingData(), endDate: e.currentTarget.value })}
                      class="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

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
                    ← Kembali
                  </button>
                  <button
                    type="submit"
                    class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold glow-purple-hover transition-all"
                  >
                    Konfirmasi Booking
                  </button>
                </div>
              </form>
            </Show>
          </div>
        </div>
      </Show>
      </div>
    </div>
  );
}
