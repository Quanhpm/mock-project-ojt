interface OrderSummaryCardsProps {
  total: number;
  draft: number;
  confirmed: number;
  preparing: number;
  ready: number;
}

const cardClass =
  "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5";

export const OrderSummaryCards = ({
  total,
  draft,
  confirmed,
  preparing,
  ready,
}: OrderSummaryCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <div className={cardClass}>
        <p className="text-sm text-gray-500">Tổng đơn</p>
        <p className="mt-3 text-3xl font-bold text-gray-900">{total}</p>
      </div>
      <div className={cardClass}>
        <p className="text-sm text-gray-500">Draft</p>
        <p className="mt-3 text-3xl font-bold text-slate-700">{draft}</p>
      </div>
      <div className={cardClass}>
        <p className="text-sm text-gray-500">Confirmed</p>
        <p className="mt-3 text-3xl font-bold text-blue-700">{confirmed}</p>
      </div>
      <div className={cardClass}>
        <p className="text-sm text-gray-500">Preparing</p>
        <p className="mt-3 text-3xl font-bold text-amber-700">{preparing}</p>
      </div>
      <div className={cardClass}>
        <p className="text-sm text-gray-500">Ready for pickup</p>
        <p className="mt-3 text-3xl font-bold text-emerald-700">{ready}</p>
      </div>
    </div>
  );
};

export default OrderSummaryCards;
