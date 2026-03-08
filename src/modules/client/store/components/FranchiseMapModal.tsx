import { X, MapPin, Clock, Phone } from 'lucide-react';
import type { FranchiseDetailResponse } from '@/apis/endpointsCLIENT/franchiseDetail.api';
import { MapContainer } from './MapContainer';

interface Props {
  franchise: FranchiseDetailResponse | null;
  onClose: () => void;
}

export const FranchiseMapModal = ({ franchise, onClose }: Props) => {
  if (!franchise) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-black text-[var(--cf-dark)] truncate pr-4">
            {franchise.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Info panel */}
          <div className="md:w-[280px] flex-shrink-0 p-5 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-gray-100 overflow-y-auto">
            {franchise.logo_url && (
              <img
                src={franchise.logo_url}
                alt={franchise.name}
                className="w-full aspect-video object-cover rounded-2xl"
              />
            )}

            <div className="flex items-start gap-2.5">
              <MapPin size={16} className="text-[var(--cf-primary)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600 leading-relaxed">{franchise.address}</p>
            </div>

            {franchise.hotline && (
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-[var(--cf-primary)] flex-shrink-0" />
                <p className="text-sm text-gray-600">{franchise.hotline}</p>
              </div>
            )}

            {franchise.opened_at && franchise.closed_at && (
              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-[var(--cf-primary)] flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  {franchise.opened_at} – {franchise.closed_at}
                </p>
              </div>
            )}
          </div>

          {/* Map panel */}
          <div className="flex-1 h-64 md:h-auto">
            <MapContainer franchise={franchise} />
          </div>
        </div>
      </div>
    </div>
  );
};
