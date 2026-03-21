import { useState, useEffect } from 'react';
import { getAllFranchises, type FranchiseResponse } from '@/apis/endpointsCLIENT/client.api';
import { StoreCard, StoreCardSkeleton } from '../components/StoreCard';
import { StoreSearch } from '../components/StoreSearch';

// ── Page — fetch all once on mount; filter client-side on search submit ───────
export function StorePage() {
  const [allList, setAllList] = useState<FranchiseResponse[]>([]);
  const [list, setList] = useState<FranchiseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  useEffect(() => {
    getAllFranchises()
      .then((data) => {
        const all = data ?? [];
        setAllList(all);
        setList(all);
      })
      .catch(() => { setAllList([]); setList([]); })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    const q = searchQuery.trim().toLowerCase();
    setSubmittedQuery(searchQuery);
    setIsSearching(true);
    const filtered = q
      ? allList.filter((f) => f.name.toLowerCase().includes(q))
      : allList;
    setList(filtered);
    setIsSearching(false);
  };

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
            onSearch={handleSearch}
            submittedQuery={submittedQuery}
            resultCount={list.length}
            isSearching={isSearching}
          />
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <StoreCardSkeleton key={i} />)
            : list.map((f) => <StoreCard key={f.id} id={f.id} name={f.name} searchQuery={submittedQuery} />)}
        </div>
      </div>
    </div>
  );
}
