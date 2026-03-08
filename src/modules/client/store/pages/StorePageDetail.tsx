import { use, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { getFranchiseDetail, type FranchiseDetailResponse } from '@/apis/endpointsCLIENT/franchiseDetail.api';
import { MapContainer } from '../components/MapContainer';
import { StoreHero } from '../components/StoreHero';
import { StoreInfo, StoreNotFound } from '../components/StoreInfo';
import { StoreAmenities } from '../components/StoreAmenities';
import { StoreQuote } from '../components/StoreQuote';

function FranchiseDetail({ promise }: { promise: Promise<FranchiseDetailResponse | null> }) {
    const franchise = use(promise);

    if (!franchise) {
        return <StoreNotFound />;
    }

    return (
        <div className="bg-[var(--cf-bg)] min-h-screen">
            {/* ── Hero ── */}
            <div className="max-w-6xl mx-auto px-4 pt-8 pb-10">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Left – image */}
                    <StoreHero franchise={franchise} />

                    {/* Right – info */}
                    <StoreInfo franchise={franchise} />
                </div>
            </div>

            {/* ── Details ── */}
            <div className="max-w-6xl mx-auto px-4 pb-16">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left – amenities + quote */}
                    <div className="lg:w-[340px] flex-shrink-0 flex flex-col gap-6">
                        <StoreAmenities />
                        <StoreQuote franchiseName={franchise.name} />
                    </div>

                    {/* Right – map */}
                    <div className="flex-1 rounded-2xl overflow-hidden shadow-sm h-[400px] lg:h-auto lg:min-h-[440px]">
                        <MapContainer franchise={franchise} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function StorePageDetail() {
    const location = useLocation();
    const franchiseId = (location.state as { franchiseId?: string })?.franchiseId ?? '';
    const promise = getFranchiseDetail(franchiseId);

    return (
        <Suspense
            fallback={
                <div className="bg-[var(--cf-bg)] min-h-screen flex items-center justify-center">
                    <p className="text-[var(--cf-secondary)] text-sm animate-pulse">Đang tải cửa hàng...</p>
                </div>
            }
        >
            <FranchiseDetail promise={promise} />
        </Suspense>
    );
}

