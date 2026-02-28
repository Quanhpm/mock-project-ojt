import type { ButtonHTMLAttributes } from 'react';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
}

function AuthButton({
  children,
  isLoading = false,
  loadingText = 'Loading...',
  className = '',
  disabled,
  ...props
}: AuthButtonProps) {
  return (
    <button
      {...props}
      disabled={isLoading || disabled}
      className={`w-full py-3 font-bold text-white uppercase tracking-wider rounded-xl bg-primary hover:bg-dark-shade active:scale-[0.98] shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? loadingText : children}
    </button>
  );
}

export default AuthButton;
export { AuthButton };
