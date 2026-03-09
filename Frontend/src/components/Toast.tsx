import { createSignal, Show, onMount, onCleanup } from 'solid-js';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export function Toast(props: ToastProps) {
  const [show, setShow] = createSignal(true);
  const duration = props.duration || 3000;

  let timeoutId: number;

  onMount(() => {
    if (duration > 0) {
      timeoutId = window.setTimeout(() => {
        handleClose();
      }, duration);
    }
  });

  onCleanup(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      props.onClose?.();
    }, 300);
  };

  const getIcon = () => {
    switch (props.type) {
      case 'success':
        return (
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        );
      case 'error':
        return (
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
        );
      case 'warning':
        return (
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        );
      case 'info':
      default:
        return (
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
        );
    }
  };

  const getColors = () => {
    switch (props.type) {
      case 'success':
        return 'from-green-500/20 to-green-600/20 border-green-500/50 text-green-400';
      case 'error':
        return 'from-red-500/20 to-red-600/20 border-red-500/50 text-red-400';
      case 'warning':
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50 text-yellow-400';
      case 'info':
      default:
        return 'from-purple-500/20 to-purple-600/20 border-purple-500/50 text-purple-400';
    }
  };

  return (
    <Show when={show()}>
      <div
        class={`fixed top-4 right-4 z-[9999] max-w-md animate-slide-in-right ${
          show() ? 'opacity-100' : 'opacity-0'
        } transition-opacity duration-300`}
      >
        <div
          class={`bg-gradient-to-br ${getColors()} border backdrop-blur-lg rounded-xl shadow-2xl p-4 flex items-start gap-3`}
        >
          <div class="flex-shrink-0">
            {getIcon()}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-white leading-relaxed whitespace-pre-wrap break-words">
              {props.message}
            </p>
          </div>
          <button
            onClick={handleClose}
            class="flex-shrink-0 text-white/60 hover:text-white transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </Show>
  );
}
