import { Toaster, toast } from 'sonner';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  description?: string;
}

export const showToast = (message: string, type: ToastType, options?: ToastOptions) => {
  const { duration = 5000, description, position = 'top-right' } = options || {};

  switch (type) {
    case 'success':
      return toast.success(message, {
        duration,
        description,
        position,
      });
    case 'error':
      return toast.error(message, {
        duration,
        description,
        position,
      });
    case 'warning':
      return toast.warning(message, {
        duration,
        description,
        position,
      });
    case 'info':
      return toast.info(message, {
        duration,
        description,
        position,
      });
    default:
      return toast(message, {
        duration,
        description,
        position,
      });
  }
};

export const ToasterComponent = () => (
  <Toaster
    position="top-right"
    richColors
    closeButton
    theme="light"
    toastOptions={{
      style: {
        marginTop: '70px',
      },
    }}
  />
);

export default ToasterComponent;

