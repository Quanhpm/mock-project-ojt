import { MapPin } from 'lucide-react';
import type { FranchiseDetailResponse } from '@/apis/endpointsCLIENT/franchiseDetail.api';

export function StoreHero({ franchise }: { franchise: FranchiseDetailResponse }) {
    return (
        <div className="w-full lg:w-1/2 relative rounded-2xl overflow-hidden shadow-md flex-shrink-0">
            {franchise.logo_url ? (
                <img
                    src={franchise.logo_url}
                    alt={franchise.name}
                    className="w-full aspect-[4/3] object-cover"
                />
            ) : (
                <div className="w-full aspect-[4/3] bg-[var(--cf-surface)] flex items-center justify-center">
                    <MapPin size={64} className="text-[var(--cf-secondary)]" />
                </div>
            )}
            <span className="absolute top-3 left-3 bg-[var(--cf-primary)] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                Cửa hàng nổi bật
            </span>
        </div>
    );
}
