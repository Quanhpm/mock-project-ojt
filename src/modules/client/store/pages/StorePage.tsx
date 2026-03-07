import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Map } from 'lucide-react';
import { getAllFranchises } from '@/apis/endpointsCLIENT/client.api';
import { getFranchiseDetail, type FranchiseDetailResponse } from '@/apis/endpointsCLIENT/franchiseDetail.api';

// ── Card skeleton ─────────────────────────────────────────────────────────────
function StoreCardSkeleton() {
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

// ── Pure display card ─────────────────────────────────────────────────────────
function StoreCard({ detail }: { detail: FranchiseDetailResponse }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
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
        onClick={() => navigate(`/location/${detail._id}`)}
        className="mt-auto flex items-center gap-2 bg-[var(--cf-dark)] text-white rounded-full px-6 py-2.5 text-sm font-semibold w-fit hover:bg-[var(--cf-primary)] transition-colors cursor-pointer"
      >
        <Map size={16} />
        Xem bản đồ
      </button>
    </div>
  );
}

// ── Page — 1 list call + N detail calls in parallel (single batch) ────────────
export function StorePage() {
  const [franchises, setFranchises] = useState<FranchiseDetailResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchAll() {
      try {
        const list = await getAllFranchises();
        if (!list?.length) return;

        const results = await Promise.allSettled(
          list.map((f) => getFranchiseDetail(f.id)),
        );

        const details = results
          .filter(
            (r): r is PromiseFulfilledResult<FranchiseDetailResponse> =>
              r.status === 'fulfilled' && r.value !== null && r.value.is_active,
          )
          .map((r) => r.value);

        setFranchises(details);
      } catch {
        // network failure — shows empty grid
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return franchises;
    const q = searchQuery.toLowerCase();
    return franchises.filter(
      (f) => f.name.toLowerCase().includes(q) || f.address.toLowerCase().includes(q),
    );
  }, [franchises, searchQuery]);

  return (
    <div className="bg-[var(--cf-bg)] min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[var(--cf-dark)] mb-2">
            Tìm cửa hàng gần bạn
          </h1>
          <p className="text-[var(--cf-secondary)] text-sm mb-6">
            Khám phá các không gian cà phê tinh tế của chúng tôi trên khắp Việt Nam
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--cf-secondary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên cửa hàng..."
              className="w-full bg-white border border-gray-200 rounded-full pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cf-primary)]/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-[var(--cf-secondary)] mt-2">
              {filtered.length > 0
                ? `Tìm thấy ${filtered.length} cửa hàng`
                : 'Không tìm thấy cửa hàng nào'}
            </p>
          )}
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <StoreCardSkeleton key={i} />)
            : filtered.map((detail) => <StoreCard key={detail._id} detail={detail} />)}
        </div>
      </div>
    </div>
  );
}
