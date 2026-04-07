import { createSignal, Show, onMount } from 'solid-js';
import { API_ENDPOINTS, fetchAPI } from '../config/api';
import { showToast } from './ToastContainer';

interface ReviewFormProps {
  bookingId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm(props: ReviewFormProps) {
  const [rating, setRating] = createSignal(0);
  const [hoverRating, setHoverRating] = createSignal(0);
  const [reviewText, setReviewText] = createSignal('');
  const [displayName, setDisplayName] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [submitted, setSubmitted] = createSignal(false);

  // Ambil nama user dari localStorage saat mount

    onMount(() => {
      const userName = localStorage.getItem('userName');
      const username = localStorage.getItem('username');
      setDisplayName(userName || username || '');
    });

    const handleSubmit = async (e: Event) => {
      e.preventDefault();

      if (rating() === 0) {
        showToast('Pilih rating terlebih dahulu', 'warning');
        return;
      }

      if (reviewText().trim().length < 10) {
        showToast('Review minimal 10 karakter', 'warning');
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetchAPI(API_ENDPOINTS.SUBMIT_REVIEW, {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: JSON.stringify({
            booking_id: Number(props.bookingId),
            rating: rating(),
            review_text: reviewText().trim(),
            display_name: displayName().trim() || undefined
          })
        });

        if (response.success) {
          showToast('Terima kasih atas review Anda!', 'success');
          setSubmitted(true);
          setTimeout(() => {
            props.onSuccess?.();
          }, 1500);
        } else {
          showToast(response.message || 'Gagal menyimpan review', 'error');
        }
      } catch (error) {
        console.error('Error submitting review:', error);
        showToast('Terjadi kesalahan saat menyimpan review', 'error');
      } finally {
        setLoading(false);
      }
    };

    const activeRating = () => hoverRating() || rating();

    return (
      <div class="space-y-6">
        <Show when={!submitted()} fallback={
          <div class="text-center space-y-4">
            <div class="text-5xl">✨</div>
            <h3 class="text-xl font-bold text-white">Terima Kasih!</h3>
            <p class="text-gray-400">Review Anda sangat membantu</p>
          </div>
        }>
          <form onSubmit={handleSubmit} class="space-y-6">

            {/* Rating Bintang */}
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-3">
                Berapa rating untuk perjalanan Anda?
              </label>
              <div class="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    class="text-4xl transition-all duration-150 hover:scale-110 focus:outline-none"
                  >
                    <span class={star <= activeRating() ? 'text-yellow-400' : 'text-gray-600/30'}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
              <Show when={rating() > 0}>
                <p class="text-center text-sm text-purple-400 mt-2">
                  Rating: {rating()} dari 5 bintang
                </p>
              </Show>
            </div>

            {/* Review Text */}
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Tulis Review Anda *
              </label>
              <textarea
                value={reviewText()}
                onInput={e => setReviewText(e.currentTarget.value)}
                placeholder="Ceritakan pengalaman Anda menyewa mobil kami..."
                class="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none min-h-28 resize-none"
              />
              <p class={`text-xs mt-1 ${reviewText().trim().length < 10 ? 'text-red-400' : 'text-green-400'}`}>
                {reviewText().trim().length}/10 minimal
              </p>
            </div>

            {/* Nama Tampil - otomatis dari user login, tidak bisa diedit */}
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Nama Tampil
              </label>
              <input
                type="text"
                value={displayName()}
                readOnly
                class="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-gray-400 cursor-not-allowed"
              />
            </div>  

            {/* Buttons */}
            <div class="flex gap-3">
              <button
                type="button"
                onClick={() => props.onCancel?.()}
                class="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                disabled={loading()}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading() || rating() === 0 || reviewText().trim().length < 10}
                class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading() ? 'Menyimpan...' : 'Kirim Review'}
              </button>
            </div>
          </form>
        </Show>
      </div>
    );
  }