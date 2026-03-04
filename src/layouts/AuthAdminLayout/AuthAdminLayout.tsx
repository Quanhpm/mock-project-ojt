import { Outlet } from 'react-router-dom';
import { useAdminAuthStore } from '@/modules/admin/auth-admin/stores/admin-auth.store';
import { GlobalLoadingOverlay } from '@/components/GlobalLoadingOverlay';

const AuthAdminLayout = () => {
  const authLoading = useAdminAuthStore((state) => state.isLoading);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Banner */}
      <div 
        className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 bg-cover bg-center relative"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=1000&h=1200&fit=crop")',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>
        
        {/* Content */}
        <div className="relative z-10 text-center text-white max-w-md">
          <div className="mb-8">
            <div className="inline-block px-4 py-2 mb-6">
              <span className="font-bold text-white">☕ BREWBASE ADMIN</span>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Manage Your<br />Coffee Empire
          </h1>
          
          <p className="text-gray-300 mb-8 leading-relaxed">
            Access powerful tools to manage products, franchises, customers, and orders. Control your entire coffee chain from one secure dashboard.
          </p>
          
          <div className="border-t border-orange-500 pt-6">
            <p className="text-orange-500 font-semibold tracking-wider">ADMIN PORTAL</p>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center min-h-screen p-6 lg:p-12 bg-[var(--cf-bg)]">
        <div className="w-full max-w-sm">
          <div className="bg-[var(--cf-surface)] rounded-lg p-8 shadow-sm">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Loading overlay — đè lên layout thay vì thay thế layout */}
      {authLoading && <GlobalLoadingOverlay forceShow />}
    </div>
  );
};

export default AuthAdminLayout;
