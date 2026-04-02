import { createSignal, Show } from 'solid-js';
import { API_ENDPOINTS, fetchAPI } from '../config/api';
import { showToast } from './ToastContainer';

interface ReviewFormProps {
  bookingId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm(props: ReviewFormProps) {
  const [rating, setRating] = createSignal(0);
  const [reviewText, setReviewText] = createSignal('');
  const [displayName, setDisplayName] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [submitted, setSubmitted] = createSignal(false);

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
      const response = await fetchAPI(API_ENDPOINTS.SUBMIT_REVIEW, {
        method: 'POST',
        body: JSON.stringify({
          booking_id: props.bookingId,
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
          {/* Rating */}
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-3">
              Berapa rating untuk perjalanan Anda?
            </label>
            <div class="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  onClick={() => setRating(star)}
                  class={`text-4xl transition-all ${
                    star <= rating() ? 'text-yellow-400 scale-110' : 'text-gray-600 hover:text-gray-400'
                  }`}
                >
                  ⭐
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
            <div class="flex justify-between items-center mt-2">
              <p class={`text-xs ${reviewText().trim().length < 10 ? 'text-red-400' : 'text-green-400'}`}>
                {reviewText().trim().length}/10 minimal
              </p>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Nama Tampil (opsional)
            </label>
            <input
              type="text"
              value={displayName()}
              onInput={e => setDisplayName(e.currentTarget.value)}
              placeholder="Biarkan kosong untuk menggunakan nama profil Anda"
              class="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
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
