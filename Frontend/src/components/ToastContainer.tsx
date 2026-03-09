import { createSignal, For } from 'solid-js';
import { Toast, ToastType } from './Toast';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
}

const [toasts, setToasts] = createSignal<ToastItem[]>([]);
let toastIdCounter = 0;

export function showToast(message: string, type: ToastType = 'info', duration = 3000) {
  const id = ++toastIdCounter;
  const newToast: ToastItem = { id, message, type, duration };
  
  setToasts(prev => [...prev, newToast]);
}

export function ToastContainer() {
  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div class="fixed top-0 right-0 z-[9999] p-4 space-y-2 pointer-events-none">
      <For each={toasts()}>
        {(toast, index) => (
          <div 
            class="pointer-events-auto"
            style={{ 
              'animation-delay': `${index() * 100}ms`,
              'margin-top': index() > 0 ? '8px' : '0'
            }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        )}
      </For>
    </div>
  );
}
