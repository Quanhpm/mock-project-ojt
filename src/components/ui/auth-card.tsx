import type { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
}

function AuthCard({ title, description, footer, children }: AuthCardProps) {
  return (
    <div
      className="w-full rounded-[2.5rem] shadow-xl p-8"
      style={{
        background: 'rgba(255,255,255,0.18)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid rgba(255,255,255,0.30)',
      }}
    >
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-center text-3xl font-bold text-white drop-shadow mb-1.5">{title}</h1>
        <p className="text-white/55 text-sm">{description}</p>
      </div>

      {/* Form content */}
      {children}

      {/* Footer */}
      <div className="pt-5 mt-5 border-t border-white/20">
        <div className="text-sm text-white/55 text-center">{footer}</div>
      </div>
    </div>
  );
}

export default AuthCard;
export { AuthCard };
