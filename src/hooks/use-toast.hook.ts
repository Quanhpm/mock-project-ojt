import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';

export const useToast = () => {
  const success = useCallback((message: string, description?: string, duration?: number) => {
    return toast.success(message, {
      description,
      duration: duration ?? 5000,
    });
  }, []);

  const error = useCallback((message: string, description?: string, duration?: number) => {
    return toast.error(message, {
      description,
      duration: duration ?? 5000,
    });
  }, []);

  const warning = useCallback((message: string, description?: string, duration?: number) => {
    return toast.warning(message, {
      description,
      duration: duration ?? 5000,
    });
  }, []);

  const info = useCallback((message: string, description?: string, duration?: number) => {
    return toast.info(message, {
      description,
      duration: duration ?? 5000,
    });
  }, []);

  return useMemo(() => ({
    success,
    error,
    warning,
    info,
    toast,
  }), [error, info, success, warning]);
};

export default useToast;
