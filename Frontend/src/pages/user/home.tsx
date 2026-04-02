import { createSignal, For, Show, onMount } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import UserProfileDropdown from '../../components/UserProfileDropdown';
import { fetchAPI, API_ENDPOINTS, SERVER_BASE_URL } from '../../config/api';
import luxioImg from '../../assets/luxio.jpeg';
import pantherImg from '../../assets/phanter.jpeg';
import innovaImg from '../../assets/innova.jpeg';
import tragaImg from '../../assets/traga.jpeg';
import l300Img from '../../assets/l300.jpeg';

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

export default function Home() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  const [userName, setUserName] = createSignal('');
  const [cars, setCars] = createSignal<Car[]>([]);
  const [loading, setLoading] = createSignal(true);

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

  const getCarImage = (nama: string) => {
    const namaLower = nama.toLowerCase();
    if (namaLower.includes('traga')) return tragaImg;
    if (namaLower.includes('l300')) return l300Img;
    if (namaLower.includes('innova')) return innovaImg;
    if (namaLower.includes('luxio')) return luxioImg;
    if (namaLower.includes('phanter') || namaLower.includes('panther')) return pantherImg;
    return innovaImg;
  };

  onMount(async () => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Try get name from localStorage first (instant display)
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
    
    // Fetch user profile to get latest data
    try {
      const userData = await fetchAPI(API_ENDPOINTS.PROFILE);
      if (userData.success && userData.nama) {
        setUserName(userData.nama);
        localStorage.setItem('userName', userData.nama);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      if (!storedName) {
        setUserName('User');
      }
    }

    // Fetch cars from database
    try {
      setLoading(true);
      const response = await fetchAPI(API_ENDPOINTS.CARS);
      if (response.success && response.data) {
        // Take first 3 cars as featured
        setCars(response.data.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to fetch cars:', error);
    } finally {
      setLoading(false);
    }
  });

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    navigate('/');
  };

  return (
    <div class="min-h-screen bg-[#0B0B0B]">
      {/* Navbar */}
      <nav class="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-20">
            {/* Logo */}
            <div class="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div class="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center glow-purple">
                <span class="text-3xl font-bold text-white">R</span>
              </div>
              <span class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                RagilTrans
              </span>
            </div>

            {/* Desktop Menu */}
            <div class="hidden md:flex items-center space-x-8">
              <A href="/sewa" class="text-gray-300 hover:text-purple-400 transition-colors font-medium">
                Mobil
              </A>
              <button onClick={() => scrollToSection('contact')} class="text-gray-300 hover:text-purple-400 transition-colors font-medium">
                Contact
              </button>

              {/* User Profile Dropdown */}
              <UserProfileDropdown />
            </div>

            {/* Mobile Menu Button */}
            <button
              class="md:hidden text-gray-300 p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen())}
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen() ? (
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                ) : (
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen() && (
            <div class="md:hidden py-4 space-y-3 border-t border-gray-800">
              <div class="flex items-center gap-2 px-4 py-2">
                <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-white font-semibold text-sm">{userName().charAt(0).toUpperCase()}</span>
                </div>
                <span class="text-white font-medium truncate">{userName()}</span>
              </div>
              <A href="/sewa" class="block w-full text-left text-gray-300 hover:text-purple-400 transition-colors py-2 px-4">
                Mobil
              </A>
              <button onClick={() => scrollToSection('contact')} class="block w-full text-left text-gray-300 hover:text-purple-400 transition-colors py-2 px-4">
                Contact
              </button>
              <A href="/profile" class="block w-full text-left text-gray-300 hover:text-purple-400 transition-colors py-2 px-4">
                Profile
              </A>
              <button onClick={handleLogout} class="block w-full text-left text-red-400 hover:text-red-300 transition-colors py-2 px-4">
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Welcome Section */}
      <section class="pt-32 pb-16 px-6 sm:px-8 lg:px-12 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-purple-900/10"></div>
        <div class="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        
        <div class="max-w-7xl mx-auto relative z-10">
          <div class="text-center mb-12 px-4">
            <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent break-words">
              Selamat Datang, {userName()}!
            </h1>
            <p class="text-lg sm:text-xl text-gray-400 px-4">Temukan mobil pilihan Anda dan mulai perjalanan</p>
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section id="cars" class="py-16 bg-[#0B0B0B] relative">
        <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div class="text-center mb-12 px-4">
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white">
              Mobil Pilihan untuk Anda
            </h2>
            <p class="text-gray-400 text-base sm:text-lg">Pilih mobil favorit Anda dan mulai booking</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Show when={!loading()} fallback={
              <div class="col-span-full flex justify-center items-center py-20">
                <div class="text-center">
                  <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p class="text-gray-400">Memuat data mobil...</p>
                </div>
              </div>
            }>
              <For each={cars()}>
                {(car) => (
                  <div class="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden border border-purple-900/30 card-hover group">
                    <div class="relative h-56 overflow-hidden">
                      <img 
                        src={car.image_url || getCarImage(car.nama_mobil)} 
                        alt={car.nama_mobil} 
                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = getCarImage(car.nama_mobil);
                        }}
                      />
                      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                    </div>
                    
                    <div class="p-6">
                      <h3 class="text-xl sm:text-2xl font-bold text-white mb-4 break-words">{car.nama_mobil}</h3>
                      
                      <div class="grid grid-cols-2 gap-3 mb-6 text-sm">
                        <div class="flex items-center gap-2 text-gray-400">
                          <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                          </svg>
                          <span>{car.kapasitas_penumpang} Orang</span>
                        </div>
                        <div class="flex items-center gap-2 text-gray-400">
                          <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          <span>{car.jenis_transmisi}</span>
                        </div>
                      </div>

                      <div class="border-t border-gray-800 pt-4">
                        <div class="flex items-center justify-between gap-3">
                          <div class="flex-1 min-w-0">
                            <p class="text-gray-500 text-xs mb-1">Mulai dari</p>
                            <p class="text-xl sm:text-2xl font-bold text-purple-400 break-words">Rp {formatRupiah(car.harga_per_hari)}</p>
                            <p class="text-gray-500 text-xs">per hari</p>
                          </div>
                          <A href="/sewa" class="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base glow-purple-hover whitespace-nowrap">
                            Booking
                          </A>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </Show>
          </div>

          <div class="text-center mt-12 px-4">
            <A href="/sewa" class="bg-transparent border-2 border-purple-600 hover:bg-purple-600/10 text-white px-6 sm:px-10 py-3 rounded-xl font-semibold inline-flex items-center gap-2 group text-sm sm:text-base">
              Lihat Semua Mobil
              <svg class="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </A>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" class="py-24 bg-gradient-to-b from-[#0B0B0B] to-black relative overflow-hidden">
        <div class="absolute bottom-0 left-0 w-1/2 h-1/2 bg-purple-600/5 rounded-full blur-3xl"></div>

        <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div class="text-center mb-16 px-4">
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
              Hubungi Kami
            </h2>
            <p class="text-gray-400 text-base sm:text-lg">Kami siap membantu Anda 24/7</p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div class="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-purple-900/30 card-hover">
              <div class="flex items-start gap-4">
                <div class="bg-purple-600/20 p-4 rounded-xl">
                  <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-xl font-bold text-white mb-2">Telepon</h3>
                  <p class="text-gray-400 break-words">+62 812-3456-7890</p>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-purple-900/30 card-hover">
              <div class="flex items-start gap-4">
                <div class="bg-purple-600/20 p-4 rounded-xl">
                  <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-xl font-bold text-white mb-2">Email</h3>
                  <p class="text-gray-400 break-words">info@ragiltrans.com</p>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-purple-900/30 card-hover">
              <div class="flex items-start gap-4">
                <div class="bg-purple-600/20 p-4 rounded-xl">
                  <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-xl font-bold text-white mb-2">Alamat</h3>
                  <a 
                    href="https://www.google.com/maps/place/Jl.+Merdeka+No.29,+Alangamba,+Pasuruhan,+Kec.+Binangun,+Kabupaten+Cilacap,+Jawa+Tengah+53281/@-7.6704535,109.2802431,884m/data=!3m1!1e3!4m6!3m5!1s0x2e6540b2e77a5b89:0x3c3c53156ce201b9!8m2!3d-7.6707512!4d109.2816271!16s%2Fg%2F11tsjskkg5?entry=ttu&g_ep=EgoyMDI2MDMwNC4xIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    class="text-gray-400 hover:text-purple-400 transition-colors break-words"
                  >
                    Jl. Merdeka No.29 Binangun, Kroya
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Button */}
          <div class="text-center mt-12 px-4">
            <a 
              href="https://wa.me/6281234567890" 
              target="_blank" 
              class="inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg glow-purple-hover"
            >
              <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer class="bg-black border-t border-gray-800 py-12">
        <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 px-4">
            {/* Brand */}
            <div class="col-span-1 md:col-span-2">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                  <span class="text-2xl font-bold text-white">R</span>
                </div>
                <span class="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                  RagilTrans
                </span>
              </div>
              <p class="text-gray-400 mb-4 max-w-md">
                Layanan sewa mobil premium dengan armada terlengkap dan harga terjangkau. 
                Pengalaman berkendara yang tak terlupakan.
              </p>
              <div class="flex gap-4">
                <a href="#" class="w-10 h-10 bg-gray-900 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" class="w-10 h-10 bg-gray-900 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 class="text-white font-semibold mb-4">Menu</h4>
              <ul class="space-y-2">
                <li><A href="/sewa" class="text-gray-400 hover:text-purple-400 transition-colors">Mobil</A></li>
                <li><A href="/profile" class="text-gray-400 hover:text-purple-400 transition-colors">Profile</A></li>
                <li><button onClick={() => scrollToSection('contact')} class="text-gray-400 hover:text-purple-400 transition-colors">Contact</button></li>
              </ul>
            </div>

            {/* Info */}
            <div>
              <h4 class="text-white font-semibold mb-4">Informasi</h4>
              <ul class="space-y-2">
                <li><a href="#" class="text-gray-400 hover:text-purple-400 transition-colors">Tentang Kami</a></li>
                <li><a href="#" class="text-gray-400 hover:text-purple-400 transition-colors">Syarat & Ketentuan</a></li>
                <li><a href="#" class="text-gray-400 hover:text-purple-400 transition-colors">Kebijakan Privasi</a></li>
                <li><a href="#" class="text-gray-400 hover:text-purple-400 transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>

          <div class="border-t border-gray-800 pt-8 px-4 text-center text-gray-400">
            <p class="text-sm sm:text-base">&copy; 2026 RagilTrans. All rights reserved. Made with ❤️ in Indonesia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
