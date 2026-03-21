import type { FranchiseResponse } from '@/apis/endpointsCLIENT/client.api';
import { StoreCard } from './StoreCard';

export function StoreCardList({ franchises }: { franchises: FranchiseResponse[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {franchises.map((f) => (
        <StoreCard key={f.id} id={f.id} name={f.name} />
      ))}
    </div>
  );
}
