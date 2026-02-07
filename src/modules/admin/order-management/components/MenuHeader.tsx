import React from 'react';
import { Search, ChevronDown, MapPin } from 'lucide-react';

interface MenuHeaderProps {
  selectedLocation: string;
  searchQuery: string;
  onLocationChange: (location: string) => void;
  onSearchChange: (query: string) => void;
}

export const MenuHeader: React.FC<MenuHeaderProps> = ({
  selectedLocation,
  searchQuery,
  onLocationChange,
  onSearchChange,
}) => {
  return (
    <div className="px-6 pt-6 pb-2 shrink-0 flex flex-col gap-4 bg-white">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Location Selector */}
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 rounded-lg border border-amber-700 transition-colors text-amber-800 font-semibold">
            <MapPin size={20} />
            <span>{selectedLocation}</span>
            <ChevronDown size={18} />
          </button>

          {/* Search */}
          <div className="relative max-w-sm w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-amber-700 focus:border-transparent transition-all shadow-sm"
              placeholder="Search menu items..."
              type="text"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuHeader;
