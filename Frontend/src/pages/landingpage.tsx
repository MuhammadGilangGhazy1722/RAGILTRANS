import { createSignal, For, Show } from 'solid-js';
import { A } from '@solidjs/router';
import luxioImg from '../assets/luxio.jpeg';
import pantherImg from '../assets/phanter.jpeg';
import innovaImg from '../assets/innova.jpeg';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  const [showProfileDropdown, setShowProfileDropdown] = createSignal(false);

  const features = [
    {
      icon: (
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
      ),
      title: 'Asuransi Lengkap',
      description: 'Semua mobil dilengkapi asuransi all risk untuk keamanan perjalanan Anda'
    },
    {
      icon: (
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
      title: 'Layanan 24/7',
      description: 'Customer support siap membantu Anda kapan saja, dimana saja'
    },
    {
      icon: (
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
        </svg>
      ),
      title: 'Mobil Premium',
      description: 'Armada terawat dan selalu dalam kondisi prima'
    },
    {
      icon: (
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
      title: 'Harga Terjangkau',
      description: 'Harga kompetitif dengan kualitas layanan terbaik'
    }
  ];

  const featuredCars = [
    {
      name: 'Daihatsu Luxio',
      image: luxioImg,
      price: '350.000',
      capacity: '7 Orang',
      transmission: 'Manual',
      category: 'MPV'
    },
    {
      name: 'Isuzu Panther',
      image: pantherImg,
      price: '300.000',
      capacity: '8 Orang',
      transmission: 'Manual',
      category: 'MPV'
    },
    {
      name: 'Toyota Innova',
      image: innovaImg,
      price: '450.000',
      capacity: '7 Orang',
      transmission: 'Manual',
      category: 'MPV'
    }
  ];

  const testimonials = [
    {
      name: 'Budi Santoso',
      role: 'Business Owner',
      comment: 'Pelayanan sangat memuaskan! Mobil bersih dan terawat. Proses booking mudah dan cepat.',
      rating: 5,
      avatar: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=7C3AED&color=fff'
    },
    {
      name: 'Siti Rahma',
      role: 'Travel Enthusiast',
      comment: 'Pengalaman sewa mobil terbaik yang pernah saya alami. Harga reasonable dengan kualitas premium.',
      rating: 5,
      avatar: 'https://ui-avatars.com/api/?name=Siti+Rahma&background=7C3AED&color=fff'
    },
    {
      name: 'Andi Wijaya',
      role: 'Entrepreneur',
      comment: 'Customer service responsif dan profesional. Mobil sesuai dengan deskripsi. Highly recommended!',
      rating: 5,
      avatar: 'https://ui-avatars.com/api/?name=Andi+Wijaya&background=7C3AED&color=fff'
    }
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div class="min-h-screen bg-[#0B0B0B]">
      {/* Navbar */}
      <nav class="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-20">
            {/* Logo */}
            <div class="flex items-center space-x-3 cursor-pointer" onClick={() => scrollToSection('hero')}>
              <div class="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center glow-purple">
                <span class="text-3xl font-bold text-white">R</span>
              </div>
              <span class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                RagilTrans
              </span>
            </div>

            {/* Desktop Menu */}
            <div class="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('hero')} class="text-gray-300 hover:text-purple-400 transition-colors font-medium">
                Home
              </button>
              <A href="/sewa" class="text-gray-300 hover:text-purple-400 transition-colors font-medium">
                Mobil
              </A>
              <button onClick={() => scrollToSection('testimonials')} class="text-gray-300 hover:text-purple-400 transition-colors font-medium">
                Testimoni
              </button>
              <button onClick={() => scrollToSection('contact')} class="text-gray-300 hover:text-purple-400 transition-colors font-medium">
                Contact
              </button>
              
              <A href="/login" class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-semibold glow-purple-hover">
                Login
              </A>
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
              <button onClick={() => scrollToSection('hero')} class="block w-full text-left text-gray-300 hover:text-purple-400 transition-colors py-2">
                Home
              </button>
              <A href="/sewa" class="block w-full text-left text-gray-300 hover:text-purple-400 transition-colors py-2">
                Mobil
              </A>
              <button onClick={() => scrollToSection('testimonials')} class="block w-full text-left text-gray-300 hover:text-purple-400 transition-colors py-2">
                Testimoni
              </button>
              <button onClick={() => scrollToSection('contact')} class="block w-full text-left text-gray-300 hover:text-purple-400 transition-colors py-2">
                Contact
              </button>
              
              <A href="/login" class="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-semibold mt-2 block text-center">
                Login
              </A>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" class="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Effects */}
        <div class="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-purple-900/10"></div>
        
        {/* Animated Glow Effects */}
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-glow-pulse"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-800/20 rounded-full blur-3xl animate-glow-pulse" style="animation-delay: 1s"></div>

        {/* Content */}
        <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div class="animate-float">
            <h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent leading-tight">
              Ragil trans rental
              <br />
              Experience
            </h1>
          </div>
          
          <p class="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Nikmati perjalanan mewah dengan armada terbaik kami. 
            <span class="text-purple-400 font-semibold">Layanan berkualitas tinggi</span>, harga terjangkau.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <A href="/sewa" class="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-xl text-lg font-semibold glow-purple-hover shadow-xl text-center">
              Sewa Sekarang
            </A>
            <button onClick={() => scrollToSection('contact')} class="bg-transparent border-2 border-purple-600 hover:bg-purple-600/10 text-white px-10 py-4 rounded-xl text-lg font-semibold">
              Hubungi Kami
            </button>
          </div>

          {/* Stats */}
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div class="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm p-6 rounded-xl border border-purple-900/30">
              <div class="text-4xl font-bold text-purple-400 mb-2">500+</div>
              <div class="text-gray-400 text-sm">Happy Customers</div>
            </div>
            <div class="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm p-6 rounded-xl border border-purple-900/30">
              <div class="text-4xl font-bold text-purple-400 mb-2">50+</div>
              <div class="text-gray-400 text-sm">Premium Cars</div>
            </div>
            <div class="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm p-6 rounded-xl border border-purple-900/30">
              <div class="text-4xl font-bold text-purple-400 mb-2">24/7</div>
              <div class="text-gray-400 text-sm">Support</div>
            </div>
            <div class="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm p-6 rounded-xl border border-purple-900/30">
              <div class="text-4xl font-bold text-purple-400 mb-2">100%</div>
              <div class="text-gray-400 text-sm">Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button onClick={() => scrollToSection('features')} class="animate-bounce">
            <svg class="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" class="py-24 bg-gradient-to-b from-black to-[#0B0B0B]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Mengapa Memilih Kami?
            </h2>
            <p class="text-gray-400 text-lg">Layanan terbaik untuk perjalanan Anda</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <For each={features}>
              {(feature: typeof features[0]) => (
                <div class="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-purple-900/30 card-hover group">
                  <div class="text-purple-500 mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 class="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                  <p class="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section id="cars" class="py-24 bg-[#0B0B0B] relative">
        {/* Background decoration */}
        <div class="absolute top-0 right-0 w-1/3 h-1/3 bg-purple-600/5 rounded-full blur-3xl"></div>
        
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold mb-4 text-white">
              Mobil Pilihan
            </h2>
            <p class="text-gray-400 text-lg">Armada premium dengan kualitas terbaik</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <For each={featuredCars}>
              {(car: typeof featuredCars[0]) => (
                <div class="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden border border-purple-900/30 card-hover group">
                  <div class="relative h-56 overflow-hidden">
                    <img 
                      src={car.image} 
                      alt={car.name} 
                      class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                  </div>
                  
                  <div class="p-6">
                    <h3 class="text-2xl font-bold text-white mb-4">{car.name}</h3>
                    
                    <div class="grid grid-cols-2 gap-3 mb-6 text-sm">
                      <div class="flex items-center gap-2 text-gray-400">
                        <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                        </svg>
                        <span>{car.capacity}</span>
                      </div>
                      <div class="flex items-center gap-2 text-gray-400">
                        <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span>{car.transmission}</span>
                      </div>
                    </div>

                    <div class="border-t border-gray-800 pt-4">
                      <div class="flex items-center justify-between">
                        <div>
                          <p class="text-gray-500 text-xs mb-1">Mulai dari</p>
                          <p class="text-2xl font-bold text-purple-400">Rp {car.price}</p>
                          <p class="text-gray-500 text-xs">per hari</p>
                        </div>
                        <button class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold glow-purple-hover">
                          Booking
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>

          <div class="text-center mt-12">
            <A href="/sewa" class="bg-transparent border-2 border-purple-600 hover:bg-purple-600/10 text-white px-10 py-3 rounded-xl font-semibold inline-flex items-center gap-2 group">
              Lihat Semua Mobil
              <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </A>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" class="py-24 bg-gradient-to-b from-[#0B0B0B] to-black">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Apa Kata Mereka?
            </h2>
            <p class="text-gray-400 text-lg">Testimoni dari pelanggan kami</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <For each={testimonials}>
              {(testimonial: typeof testimonials[0]) => (
                <div class="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-purple-900/30 card-hover">
                  {/* Stars */}
                  <div class="flex gap-1 mb-4">
                    <For each={Array(testimonial.rating)}>
                      {() => (
                        <svg class="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      )}
                    </For>
                  </div>

                  <p class="text-gray-300 mb-6 leading-relaxed italic">
                    "{testimonial.comment}"
                  </p>

                  <div class="flex items-center gap-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      class="w-12 h-12 rounded-full border-2 border-purple-600"
                    />
                    <div>
                      <div class="font-semibold text-white">{testimonial.name}</div>
                      <div class="text-sm text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" class="py-24 bg-black relative overflow-hidden">
        {/* Background decoration */}
        <div class="absolute bottom-0 left-0 w-1/2 h-1/2 bg-purple-600/5 rounded-full blur-3xl"></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold mb-4 text-white">
              Hubungi Kami
            </h2>
            <p class="text-gray-400 text-lg">Kami siap membantu Anda 24/7</p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div class="space-y-6">
              <div class="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-purple-900/30">
                <div class="flex items-start gap-4">
                  <div class="bg-purple-600/20 p-4 rounded-xl">
                    <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-white mb-2">Telepon</h3>
                    <p class="text-gray-400">+62 812-3456-7890</p>
                  </div>
                </div>
              </div>

              <div class="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-purple-900/30">
                <div class="flex items-start gap-4">
                  <div class="bg-purple-600/20 p-4 rounded-xl">
                    <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-white mb-2">Email</h3>
                    <p class="text-gray-400">info@ragiltrans.com</p>
                  </div>
                </div>
              </div>

              <div class="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-purple-900/30">
                <div class="flex items-start gap-4">
                  <div class="bg-purple-600/20 p-4 rounded-xl">
                    <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-white mb-2">Alamat</h3>
                    <p class="text-gray-400">Jl. Premium No. 123, Jakarta Selatan</p>
                  </div>
                </div>
              </div>

              {/* WhatsApp Button */}
              <a 
                href="https://wa.me/6281234567890" 
                target="_blank" 
                class="flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-xl font-semibold text-lg glow-purple-hover w-full"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat via WhatsApp
              </a>
            </div>

            {/* Contact Form */}
            <div class="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-purple-900/30">
              <h3 class="text-2xl font-bold text-white mb-6">Kirim Pesan</h3>
              <form class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    class="w-full"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    class="w-full"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">No. Telepon</label>
                  <input
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    class="w-full"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Pesan</label>
                  <textarea
                    rows="4"
                    placeholder="Tulis pesan Anda..."
                    class="w-full"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  class="w-full bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg glow-purple-hover"
                >
                  Kirim Pesan
                </button>
              </form>
            </div>
          </div>

          {/* Map */}
          <div class="mt-12">
            <div class="bg-gradient-to-br from-gray-900 to-black p-2 rounded-2xl border border-purple-900/30 overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d106.8195613!3d-6.1751171!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5d2e764b12d%3A0x3d2ad6e1e0e9bcc8!2sJakarta!5e0!3m2!1sen!2sid!4v1234567890"
                width="100%" 
                height="400" 
                style="border:0; border-radius: 12px;" 
                allowfullscreen={true}
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section class="py-24 bg-gradient-to-br from-purple-900/20 via-black to-purple-900/10 relative overflow-hidden">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzdjM2FlZCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>
        
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 class="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
            Siap Memulai Perjalanan Anda?
          </h2>
          <p class="text-xl text-gray-300 mb-10 leading-relaxed">
            Dapatkan pengalaman sewa mobil terbaik bersama kami. 
            <br class="hidden sm:block" />
            Booking sekarang dan nikmati perjalanan yang tak terlupakan!
          </p>
          <button onClick={() => scrollToSection('cars')} class="bg-purple-600 hover:bg-purple-700 text-white px-12 py-4 rounded-xl text-lg font-semibold glow-purple-hover inline-flex items-center gap-3 shadow-2xl">
            Mulai Sekarang
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer class="bg-black border-t border-gray-800 py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
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
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
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
                <li><button onClick={() => scrollToSection('hero')} class="text-gray-400 hover:text-purple-400 transition-colors">Home</button></li>
                <li><button onClick={() => scrollToSection('cars')} class="text-gray-400 hover:text-purple-400 transition-colors">Mobil</button></li>
                <li><button onClick={() => scrollToSection('testimonials')} class="text-gray-400 hover:text-purple-400 transition-colors">Testimoni</button></li>
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

          <div class="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 RagilTrans. All rights reserved. Made with ❤️ in Indonesia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
