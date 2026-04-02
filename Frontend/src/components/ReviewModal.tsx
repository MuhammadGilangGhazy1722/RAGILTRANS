import { Show } from 'solid-js';
import ReviewForm from './ReviewForm';

interface ReviewModalProps {
  isOpen: boolean;
  bookingId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal(props: ReviewModalProps) {
  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4" onClick={props.onClose}>
        <div class="bg-gradient-to-br from-gray-900 to-black rounded-xl max-w-md w-full border border-purple-900/30 p-6" onClick={(e) => e.stopPropagation()}>
          <h2 class="text-2xl font-bold text-white mb-4">Berikan Review</h2>
          <ReviewForm 
            bookingId={props.bookingId}
            onSuccess={props.onSuccess}
            onCancel={props.onClose}
          />
        </div>
      </div>
    </Show>
  );
}
