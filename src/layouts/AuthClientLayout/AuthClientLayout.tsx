import { Outlet } from 'react-router-dom';
import { useClientAuthStore } from '@/modules/client/auth-client/stores/client-auth.store';
import LoadingLayout from '@/layouts/LoadingLayout';
import { Coffee } from "lucide-react";

const AuthClientLayout = () => {
  const authLoading = useClientAuthStore((state) => state.authLoading);

  if (authLoading) {
    return <LoadingLayout />;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=1920&h=1080&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Decorative glow blobs */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-16 w-[30rem] h-[30rem] bg-amber-800/20 rounded-full blur-3xl pointer-events-none" />

      {/* Brand header */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap flex items-center gap-2">
        <Coffee size={25} className="text-white" />
        <span className="text-xl font-extrabold text-white tracking-widest drop-shadow">BOUTIQUE BREWS</span>
      </div>

      {/* Page content – AuthCard is rendered by each page */}
      <div className="relative z-10 w-full max-w-md mt-10">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthClientLayout;
