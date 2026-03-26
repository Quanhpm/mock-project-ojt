import { Coffee } from 'lucide-react';

function LoadingLayout() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="text-center">
        {/* Coffee Cup Animation */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
          <div className="absolute inset-2 flex items-center justify-center text-4xl">
            <Coffee />
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-amber-900 mb-2">
          BOUTIQUE BREWS
        </h2>
        <p className="text-amber-700 animate-pulse">
          Đang pha chế...
        </p>
      </div>
    </div>
  );
}

export default LoadingLayout;
