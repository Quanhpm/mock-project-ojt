import { toast } from 'sonner';

export const useToast = () => {
  const success = (message: string, description?: string, duration?: number) => {
    return toast.success(message, {
      description,
      duration: duration ?? 5000,
    });
  };

  const error = (message: string, description?: string, duration?: number) => {
    return toast.error(message, {
      description,
      duration: duration ?? 5000,
    });
  };

  const warning = (message: string, description?: string, duration?: number) => {
    return toast.warning(message, {
      description,
      duration: duration ?? 5000,
    });
  };

  const info = (message: string, description?: string, duration?: number) => {
    return toast.info(message, {
      description,
      duration: duration ?? 5000,
    });
  };

  return {
    success,
    error,
    warning,
    info,
    toast,
  };
};

export default useToast;

