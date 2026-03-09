import { createSignal, Show } from 'solid-js';

interface ConfirmDialogProps {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmType?: 'primary' | 'danger' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog(props: ConfirmDialogProps) {
  const [show, setShow] = createSignal(true);

  const handleConfirm = () => {
    setShow(false);
    setTimeout(() => {
      props.onConfirm();
    }, 200);
  };

  const handleCancel = () => {
    setShow(false);
    setTimeout(() => {
      props.onCancel();
    }, 200);
  };

  const getConfirmButtonClass = () => {
    switch (props.confirmType) {
      case 'danger':
        return 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800';
      case 'success':
        return 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800';
      case 'primary':
      default:
        return 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800';
    }
  };

  return (
    <Show when={show()}>
      <div
        class={`fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
          show() ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleCancel}
      >
        <div
          class={`bg-gradient-to-br from-gray-900 to-black border border-purple-900/50 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300 ${
            show() ? 'scale-100' : 'scale-95'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <div class="flex justify-center mb-4">
            <div class={`w-16 h-16 rounded-full flex items-center justify-center ${
              props.confirmType === 'danger' 
                ? 'bg-red-500/20 text-red-400' 
                : props.confirmType === 'success'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-purple-500/20 text-purple-400'
            }`}>
              <Show when={props.confirmType === 'danger'}>
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </Show>
              <Show when={props.confirmType === 'success'}>
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </Show>
              <Show when={!props.confirmType || props.confirmType === 'primary'}>
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </Show>
            </div>
          </div>

          {/* Title */}
          <Show when={props.title}>
            <h3 class="text-xl font-bold text-white text-center mb-2">
              {props.title}
            </h3>
          </Show>

          {/* Message */}
          <p class="text-gray-300 text-center mb-6 leading-relaxed">
            {props.message}
          </p>

          {/* Buttons */}
          <div class="flex gap-3">
            <button
              onClick={handleCancel}
              class="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all"
            >
              {props.cancelText || 'Batal'}
            </button>
            <button
              onClick={handleConfirm}
              class={`flex-1 px-4 py-2.5 text-white rounded-lg font-semibold transition-all shadow-lg ${getConfirmButtonClass()}`}
            >
              {props.confirmText || 'Konfirmasi'}
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
}
