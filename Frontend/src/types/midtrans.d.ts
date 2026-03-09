// Midtrans Snap type declarations
declare global {
  interface Window {
    snap: {
      pay: (
        snapToken: string,
        options?: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export {};
