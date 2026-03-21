import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getFranchiseDetail, type FranchiseDetailResponse } from '@/apis/endpointsCLIENT/franchiseDetail.api';
import { MapContainer } from '../components/MapContainer';
import { StoreHero } from '../components/StoreHero';
import { StoreInfo, StoreNotFound } from '../components/StoreInfo';
import { StoreAmenities } from '../components/StoreAmenities';
import { StoreQuote } from '../components/StoreQuote';

const CACHE_PREFIX = 'franchise_detail_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCached(id: string): FranchiseDetailResponse | null {
    try {
        const raw = localStorage.getItem(`${CACHE_PREFIX}${id}`);
        if (!raw) return null;
        const { data, expiresAt } = JSON.parse(raw) as { data: FranchiseDetailResponse; expiresAt: number };
        if (Date.now() > expiresAt) { localStorage.removeItem(`${CACHE_PREFIX}${id}`); return null; }
        return data;
    } catch { return null; }
}

function setCached(id: string, data: FranchiseDetailResponse): void {
    try {
        localStorage.setItem(`${CACHE_PREFIX}${id}`, JSON.stringify({ data, expiresAt: Date.now() + CACHE_TTL_MS }));
    } catch { /* quota exceeded — skip silently */ }
}

export default function StorePageDetail() {
    const location = useLocation();
    const franchiseId = (location.state as { franchiseId?: string })?.franchiseId ?? '';

    const [franchise, setFranchise] = useState<FranchiseDetailResponse | null>(
        () => getCached(franchiseId),
    );
    const [loading, setLoading] = useState(!getCached(franchiseId));

    useEffect(() => {
        if (!franchiseId || franchise) return;
        setLoading(true);
        getFranchiseDetail(franchiseId)
            .then((data) => {
                if (data) { setCached(franchiseId, data); setFranchise(data); }
            })
            .finally(() => setLoading(false));
    }, [franchiseId]);

    if (loading) {
        return (
            <div className="bg-[var(--cf-bg)] min-h-screen flex items-center justify-center">
                <p className="text-[var(--cf-secondary)] text-sm animate-pulse">Đang tải cửa hàng...</p>
            </div>
        );
    }

    if (!franchise) return <StoreNotFound />;

    return (
        <div className="bg-[var(--cf-bg)] min-h-screen">
            <div className="max-w-6xl mx-auto px-4 pt-8 pb-10">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <StoreHero franchise={franchise} />
                    <StoreInfo franchise={franchise} />
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-4 pb-16">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-[340px] flex-shrink-0 flex flex-col gap-6">
                        <StoreAmenities />
                        <StoreQuote franchiseName={franchise.name} />
                    </div>
                    <div className="flex-1 rounded-2xl overflow-hidden shadow-sm h-[400px] lg:h-auto lg:min-h-[440px]">
                        <MapContainer franchise={franchise} />
                    </div>
                </div>
            </div>
        </div>
    );
}

