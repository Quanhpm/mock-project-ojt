import type { OrderStatItem } from '../hooks/useOrders';

interface OrderStatsCardsProps {
  stats: OrderStatItem[];
}

function OrderStatsCards({ stats }: OrderStatsCardsProps) {
  const lgColsClass =
    stats.length >= 4
      ? 'lg:grid-cols-4'
      : stats.length === 3
      ? 'lg:grid-cols-3'
      : stats.length === 2
      ? 'lg:grid-cols-2'
      : 'lg:grid-cols-1';

  return (
    <section className={`grid grid-cols-1 sm:grid-cols-2 ${lgColsClass} gap-6`}>
      {stats.map((stat) => (
        <div
          key={stat.key}
          className="bg-white/50 backdrop-blur-sm border border-zinc-200/50 p-6 rounded-2xl flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shrink-0 ${stat.iconClass}`}>
            <span className="material-symbols-outlined text-3xl">{stat.icon}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
            <p className="text-2xl font-black text-[#161413]">{stat.value}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export default OrderStatsCards;
