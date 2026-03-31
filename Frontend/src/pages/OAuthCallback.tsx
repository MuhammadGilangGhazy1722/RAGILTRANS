import { useNavigate, useSearchParams } from '@solidjs/router';
import { onMount } from 'solid-js';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  onMount(() => {
    const token = Array.isArray(searchParams.token) ? searchParams.token[0] : searchParams.token;
    const userStr = Array.isArray(searchParams.user) ? searchParams.user[0] : searchParams.user;
    const error = Array.isArray(searchParams.error) ? searchParams.error[0] : searchParams.error;

    if (error) {
      console.error('OAuth Error:', error);
      alert('Login gagal. Silakan coba lagi.');
      navigate('/login');
      return;
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));

        console.log('OAuth token:', token);
        console.log('OAuth user:', user);

        localStorage.setItem('authToken', token);
        localStorage.setItem('userId', user.id.toString());
        localStorage.setItem('username', user.username);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.nama);

        if (user.profile_picture) {
          localStorage.setItem('userProfilePicture', user.profile_picture);
        }

        navigate('/user/home');

      } catch (error) {
        console.error('Token parsing error:', error);
        alert('Terjadi kesalahan saat login. Silakan coba lagi.');
        navigate('/login');
      }
    } else {
      console.log('Token:', token);
      console.log('UserStr:', userStr);
      alert('Login gagal. Data tidak lengkap.');
      navigate('/login');
    }
  });

  return (
    <div class="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
      <div class="text-center">
        <div class="inline-block w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-white text-lg">Memproses login...</p>
        <p class="text-gray-400 text-sm mt-2">Mohon tunggu sebentar</p>
      </div>
    </div>
  );
}