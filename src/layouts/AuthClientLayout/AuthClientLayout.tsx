import { Outlet} from 'react-router-dom';

const AuthClientLayout = () => {
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
              <span className="font-bold text-white">☕ BOUTIQUE BREWS</span>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Start Your<br />Morning Right
          </h1>
          
          <p className="text-gray-300 mb-8 leading-relaxed">
            Join our community of coffee lovers and earn rewards with every sip. Experience the finest beans sourced ethically from around the globe.
          </p>
          
          <div className="border-t border-orange-500 pt-6">
            <p className="text-orange-500 font-semibold tracking-wider">PREMIUM EXPERIENCE</p>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center min-h-screen p-6 lg:p-12 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Sign In</h1>
            <p className="text-gray-600 text-sm">Enter your details to access your account.</p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
            <Outlet />
          </div>

          <div className="pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-8">
              Don't have an account? <a href="/client/register" className="text-orange-500 hover:text-orange-600 font-semibold">Create an Account</a>
            </p>

            <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
              <a href="#" className="hover:text-gray-900">Terms of Service</a>
              <a href="#" className="hover:text-gray-900">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900">Help Center</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthClientLayout;

