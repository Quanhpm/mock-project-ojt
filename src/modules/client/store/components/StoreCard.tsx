import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Map } from 'lucide-react';
import { slugify } from '@/utils/slugify.util';
import { getFranchiseDetail, type FranchiseDetailResponse } from '@/apis/endpointsCLIENT/franchiseDetail.api';

const CACHE_PREFIX = 'franchise_detail_';

// ── Card skeleton ─────────────────────────────────────────────────────────────
export function StoreCardSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="w-full aspect-[4/3] rounded-2xl bg-gray-200 mb-4" />
      <div className="h-5 w-3/4 bg-gray-200 rounded-full mb-3" />
      <div className="h-4 w-full bg-gray-200 rounded-full mb-2" />
      <div className="h-4 w-1/2 bg-gray-200 rounded-full mb-4" />
      <div className="h-9 w-36 bg-gray-200 rounded-full" />
    </div>
  );
}

// ── Self-fetching card with sessionStorage cache ───────────────────────────────
export function StoreCard({ id, name, searchQuery = '' }: { id: string; name: string; searchQuery?: string }) {
  const navigate = useNavigate();
  const [detail, setDetail] = useState<FranchiseDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const cacheKey = `${CACHE_PREFIX}${id}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setDetail(JSON.parse(cached));
      setLoading(false);
      return;
    }

    getFranchiseDetail(id)
      .then((data) => {
        if (!isMounted) return;
        if (data) {
          sessionStorage.setItem(cacheKey, JSON.stringify(data));
          setDetail(data);
        }
      })
      .catch(() => {
        if (isMounted) setDetail(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) return <StoreCardSkeleton />;
  if (!detail) return null;

  // filter by name or address once detail is loaded
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    const matchesName = detail.name.toLowerCase().includes(q);
    const matchesAddress = detail.address?.toLowerCase().includes(q) ?? false;
    if (!matchesName && !matchesAddress) return null;
  }

  const handleNavigate = () => navigate(`/location/${slugify(name)}`, { state: { franchiseId: id } });

  return (
    <div className="flex flex-col h-full cursor-pointer group" onClick={handleNavigate}>
      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-gray-100">
        {detail.logo_url ? (
          <img
            src={detail.logo_url}
            alt={detail.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <MapPin size={48} />
          </div>
        )}
      </div>

      <h2 className="text-lg font-black text-[var(--cf-dark)] mb-2 leading-snug">{detail.name}</h2>

      <div className="flex items-start gap-2 mb-2">
        <MapPin size={16} className="text-[var(--cf-primary)] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600 leading-snug">{detail.address}</p>
      </div>

      {detail.opened_at && detail.closed_at && (
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-[var(--cf-primary)] flex-shrink-0" />
          <p className="text-sm text-gray-600">{detail.opened_at} – {detail.closed_at}</p>
        </div>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); handleNavigate(); }}
        className="mt-auto flex items-center gap-2 bg-[var(--cf-dark)] text-white rounded-full px-6 py-2.5 text-sm font-semibold w-fit hover:bg-[var(--cf-primary)] transition-colors cursor-pointer"
      >
        <Map size={16} />
        Xem bản đồ
      </button>
    </div>
  );
}
