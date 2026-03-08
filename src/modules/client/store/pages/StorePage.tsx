import { useState, useEffect } from 'react';
import { getAllFranchises, type FranchiseResponse } from '@/apis/endpointsCLIENT/client.api';
import { StoreCard, StoreCardSkeleton } from '../components/StoreCard';
import { StoreSearch } from '../components/StoreSearch';

// ── Page — fetches light list only; each StoreCard loads its own detail ────────
export function StorePage() {
  const [list, setList] = useState<FranchiseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getAllFranchises()
      .then((data) => setList(data ?? []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = list;

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
          <StoreSearch
            value={searchQuery}
            onChange={setSearchQuery}
            resultCount={filtered.length}
          />
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <StoreCardSkeleton key={i} />)
            : filtered.map((f) => <StoreCard key={f.id} id={f.id} name={f.name} searchQuery={searchQuery} />)}
        </div>
      </div>
    </div>
  );
}
