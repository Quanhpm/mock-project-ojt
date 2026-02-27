import { useState, useMemo } from 'react';
import type { Store } from '@/types';
import { StoreList } from '../components/StoreList';
import { StoreMap } from '../components/StoreMap';

interface StorePageProps {
  stores: Store[];
}

export const StorePage = ({ stores }: StorePageProps) => {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store);
  };

  // Filter stores based on search query
  const filteredStores = useMemo(() => {
    if (!searchQuery.trim()) {
      return stores;
    }

    const query = searchQuery.toLowerCase();
    return stores.filter((store) => {
      return (
        store.name.toLowerCase().includes(query) ||
        store.address.toLowerCase().includes(query) ||
        store.phone.includes(query)
      );
    });
  }, [stores, searchQuery]);

  return (
    <div className="h-[600px] overflow-hidden bg-[var(--cf-bg)] flex flex-col">
      {/* Page Header */}
      <section className="max-w-[1400px] mx-auto w-full px-6 pt-3 pb-3 text-center flex-shrink-0">
        <h1 className="text-[var(--cf-dark)] text-2xl md:text-3xl font-black tracking-tight mb-1.5">
          Tìm Boutique Brews Gần Bạn
        </h1>
        <p className="text-[var(--cf-secondary)] text-xs md:text-sm font-light max-w-2xl mx-auto mb-3">
          Khám phá các không gian cà phê tinh tế của chúng tôi trên khắp Việt Nam
        </p>

        {/* Search Bar */}
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
            placeholder="Tìm kiếm theo tên, địa chỉ hoặc số điện thoại..."
            className="w-full bg-[var(--cf-surface)]/50 border-none rounded-lg pl-10 pr-10 py-2 text-xs focus:ring-2 focus:ring-[var(--cf-primary)]/20 transition-all placeholder:text-[var(--cf-secondary)]/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--cf-secondary)] hover:text-[var(--cf-primary)] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Results Count */}
        {searchQuery && (
          <p className="text-[var(--cf-secondary)] text-xs mt-1.5">
            {filteredStores.length > 0
              ? `Tìm thấy ${filteredStores.length} cửa hàng`
              : 'Không tìm thấy cửa hàng nào'}
          </p>
        )}
      </section>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto w-full px-6 pb-3 flex flex-col lg:flex-row gap-3 flex-1 min-h-0 overflow-hidden">
        {/* Store List (1/3) */}
        <aside className="w-full lg:w-1/3 min-h-0 overflow-hidden">
          <StoreList
            stores={filteredStores}
            selectedStore={selectedStore}
            onSelect={handleStoreSelect}
          />
        </aside>

        {/* Map Section (2/3) */}
        <section className="w-full lg:w-2/3 relative min-h-0 overflow-hidden">
          <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
            <StoreMap
              stores={filteredStores}
              selectedStore={selectedStore}
              onSelect={handleStoreSelect}
            />
          </div>
        </section>
      </main>
    </div>
  );
};
