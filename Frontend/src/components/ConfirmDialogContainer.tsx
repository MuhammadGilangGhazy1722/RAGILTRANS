import { createSignal, Show } from 'solid-js';
import { ConfirmDialog } from './ConfirmDialog';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmType?: 'primary' | 'danger' | 'success';
}

const [confirmState, setConfirmState] = createSignal<{
  show: boolean;
  options: ConfirmOptions;
  resolve: ((value: boolean) => void) | null;
}>({
  show: false,
  options: { message: '' },
  resolve: null
});

export function showConfirm(options: string | ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const opts = typeof options === 'string' 
      ? { message: options }
      : options;

    setConfirmState({
      show: true,
      options: opts,
      resolve
    });
  });
}

export function ConfirmDialogContainer() {
  const handleConfirm = () => {
    const state = confirmState();
    setConfirmState({ ...state, show: false });
    state.resolve?.(true);
  };

  const handleCancel = () => {
    const state = confirmState();
    setConfirmState({ ...state, show: false });
    state.resolve?.(false);
  };

  return (
    <Show when={confirmState().show}>
      <ConfirmDialog
        title={confirmState().options.title}
        message={confirmState().options.message}
        confirmText={confirmState().options.confirmText}
        cancelText={confirmState().options.cancelText}
        confirmType={confirmState().options.confirmType}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </Show>
  );
}
