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
    <div className="min-h-screen bg-[#F6EFE7] dark:bg-[#1d1815]">
      {/* Page Header */}
      <section className="max-w-[1440px] mx-auto w-full px-10 pt-16 pb-12 text-center">
        <h1 className="text-[#5C3A21] dark:text-[#FFF8F1] text-5xl md:text-6xl font-black tracking-tight mb-4">
          Tìm Boutique Brews Gần Bạn
        </h1>
        <p className="text-[#8B6A4E] dark:text-[#8B6A4E]/80 text-lg md:text-xl font-light max-w-2xl mx-auto mb-8">
          Khám phá các không gian cà phê tinh tế của chúng tôi trên khắp Việt Nam
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B6A4E]"
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
            className="w-full bg-white/50 dark:bg-neutral-800/50 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#8b5e3c]/20 transition-all placeholder:text-[#8B6A4E]/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B6A4E] hover:text-[#8b5e3c] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Results Count */}
        {searchQuery && (
          <p className="text-[#8B6A4E] text-sm mt-4">
            {filteredStores.length > 0
              ? `Tìm thấy ${filteredStores.length} cửa hàng`
              : 'Không tìm thấy cửa hàng nào'}
          </p>
        )}
      </section>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto w-full px-10 pb-20 flex flex-col lg:flex-row gap-8 h-[calc(100vh-380px)] min-h-[600px]">
        {/* Store List (1/3) */}
        <aside className="w-full lg:w-1/3">
          <StoreList
            stores={filteredStores}
            selectedStore={selectedStore}
            onSelect={handleStoreSelect}
          />
        </aside>

        {/* Map Section (2/3) */}
        <section className="w-full lg:w-2/3 relative h-full min-h-[400px]">
          <div className="w-full h-full rounded-xl overflow-hidden shadow-lg">
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
