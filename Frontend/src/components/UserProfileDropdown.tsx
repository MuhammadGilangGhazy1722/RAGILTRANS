import { createSignal } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';

export default function UserProfileDropdown() {
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = createSignal(false);
  const userName = localStorage.getItem('username') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    navigate('/');
  };

  return (
    <div class="relative">
      <button 
        onClick={() => setShowProfileDropdown(!showProfileDropdown())}
        class="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 px-4 py-2 rounded-lg transition-colors"
      >
        <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
          <span class="text-white font-semibold text-sm">{userName.charAt(0).toUpperCase()}</span>
        </div>
        <span class="text-white font-medium">{userName}</span>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {showProfileDropdown() && (
        <div class="absolute right-0 mt-2 w-48 bg-gray-900 border border-purple-900/30 rounded-lg shadow-xl py-2">
          <A href="/profile" class="block px-4 py-2 text-gray-300 hover:bg-purple-600/20 hover:text-purple-400 transition-colors">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Profile
            </div>
          </A>
          <button 
            onClick={handleLogout}
            class="w-full text-left px-4 py-2 text-red-400 hover:bg-red-600/20 transition-colors"
          >
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Logout
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
