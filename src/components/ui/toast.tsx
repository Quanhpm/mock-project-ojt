import { useEffect } from 'react';
import { Toaster, toast } from 'sonner';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  description?: string;
}

export const showToast = (message: string, type: ToastType, options?: ToastOptions) => {
  const { duration = 5000, description, position = 'top-right' } = options || {};

  const id = Date.now().toString();
  const opts = { id, duration, description, position };

  switch (type) {
    case 'success': return toast.success(message, opts);
    case 'error':   return toast.error(message, opts);
    case 'warning': return toast.warning(message, opts);
    case 'info':    return toast.info(message, opts);
    default:        return toast(message, opts);
  }
};

export const ToasterComponent = () => {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const toastEl = (e.target as Element).closest('[data-sonner-toast]');
      if (toastEl) toast.dismiss();
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      theme="light"
      toastOptions={{
        style: {
          marginTop: '70px',
          cursor: 'pointer',
        },
      }}
    />
  );
};

export default ToasterComponent;

