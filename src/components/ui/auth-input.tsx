import type { InputHTMLAttributes, ReactNode } from 'react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: ReactNode;
  suffix?: ReactNode;
  error?: string;
}

// Fix autofill text color issue
const autofillStyles = `
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px rgba(255, 255, 255, 0.15) inset !important;
    -webkit-text-fill-color: #fff !important;
    caret-color: #fff !important;
  }
`;

function AuthInput({ icon, suffix, error, className = '', ...props }: AuthInputProps) {
  return (
    <>
      <style>{autofillStyles}</style>
      <div className="flex flex-col gap-1">
        <div
          className="flex items-center gap-3 bg-white/15 rounded-xl px-4 py-2.5 border border-white/25 focus-within:border-[var(--cf-accent-light)] focus-within:bg-white/22 transition-all"
          style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
        >
          <span className="text-white/60 flex-shrink-0">{icon}</span>
          <input
            {...props}
            className={`w-full bg-transparent text-white placeholder:text-white/40 focus:outline-none text-sm ${className}`}
          />
          {suffix && <span className="text-white/60 flex-shrink-0">{suffix}</span>}
        </div>
        {error && <p className="text-xs text-red-300 ml-1">{error}</p>}
      </div>
    </>
  );
}

export default AuthInput;
export { AuthInput };
