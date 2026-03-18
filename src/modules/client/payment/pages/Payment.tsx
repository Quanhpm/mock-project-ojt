import { useState, type ReactNode } from "react";

type Product = {
  id: number;
  name: string;
  note: string;
  price: number;
  qty: number;
};

type PaymentMethod = {
  id: string;
  label: string;
  icon: ReactNode;
};

const products: Product[] = [
  {
    id: 1,
    name: "Cà phê sữa đá",
    note: "Ít đường, nhiều đá",
    price: 45000,
    qty: 2,
  },
  {
    id: 2,
    name: "Bánh mì thịt",
    note: "Không hành, thêm bơ",
    price: 35000,
    qty: 1,
  },
];

const paymentMethods: PaymentMethod[] = [
  {
    id: "CASH",
    label: "Tiền mặt",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 9V7a4 4 0 00-8 0v2M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
  },
  {
    id: "CARD",
    label: "Chuyển khoản",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

const fmt = (n: number): string =>
  n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

export default function Payment() {
  const [paying, setPaying] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<string>("CASH");

  const subtotal = products.reduce((s, p) => s + p.price * p.qty, 0);
  const discount = 15000;
  const total = subtotal - discount;

  return (
    <div className="h-full w-full bg-[var(--cf-bg)] px-4 py-6">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr] lg:items-start">
        {/* Cột trái */}
        <div className="flex flex-col gap-4">
          {/* ── Block 1: Địa điểm ── */}
          <div className="rounded-2xl border border-[var(--cf-accent-light)] bg-[var(--cf-surface)] p-4 shadow-sm">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--cf-primary)]">
              Thông tin giao hàng
            </p>

            <div className="flex flex-col gap-3">
              {/* Đặt tại */}
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--cf-accent-light)] text-[var(--cf-primary)]">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>

                <div>
                  <p className="mb-0.5 text-[10px] text-[var(--cf-secondary)]">Đặt tại</p>
                  <p className="text-sm font-semibold text-[var(--cf-primary)]">
                    Highlands Coffee – Nguyễn Huệ
                  </p>
                </div>
              </div>

              {/* Giao đến */}
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--cf-accent-light)] text-[var(--cf-dark)]">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2.038A2 2 0 0115 11.1V14h.95a2.5 2.5 0 014.9 0H20a1 1 0 001-1V8a1 1 0 00-.293-.707l-2-2A1 1 0 0018 5h-5V4a1 1 0 00-1-1H3z" />
                  </svg>
                </span>

                <div>
                  <p className="mb-0.5 text-[10px] text-[var(--cf-secondary)]">Giao đến</p>
                  <p className="text-sm font-semibold text-[var(--cf-primary)]">
                    123 Lê Lợi, Quận 1, TP.HCM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Block 2: Đơn hàng ── */}
          <div className="rounded-2xl border border-[var(--cf-accent-light)] bg-[var(--cf-surface)] p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--cf-secondary)]">
                Đơn hàng
              </p>

              <span className="rounded-full bg-[var(--cf-accent-light)] px-2 py-0.5 text-[10px] font-bold text-[var(--cf-primary)]">
                {products.length} món
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex items-start gap-3 rounded-xl border border-[var(--cf-accent-light)] bg-[var(--cf-bg)] p-3"
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--cf-primary)] text-xs font-bold text-white">
                    {p.qty}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight text-[var(--cf-primary)]">
                      {p.name}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-[var(--cf-secondary)]">
                      {p.note}
                    </p>
                  </div>

                  <p className="flex-shrink-0 text-sm font-bold text-[var(--cf-dark)]">
                    {fmt(p.price * p.qty)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cột phải */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-6">
          {/* ── Block 3: Tóm tắt giá ── */}
          <div className="rounded-2xl border border-[var(--cf-accent-light)] bg-[var(--cf-surface)] p-4 shadow-sm">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--cf-secondary)]">
              Chi tiết thanh toán
            </p>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm text-[var(--cf-secondary)]">
                <span>Giá gốc</span>
                <span>{fmt(subtotal)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="font-medium text-[#4A7C59]">Giảm giá</span>
                <span className="font-semibold text-[#4A7C59]">− {fmt(discount)}</span>
              </div>

              <div className="my-1 h-px bg-[var(--cf-accent-light)]" />

              <div className="flex justify-between">
                <span className="text-base font-bold text-[var(--cf-primary)]">Tổng cộng</span>
                <span className="text-base font-extrabold text-[var(--cf-dark)]">
                  {fmt(total)}
                </span>
              </div>
            </div>
          </div>

          {/* ── Block 4: Phương thức thanh toán ── */}
          <div className="rounded-2xl border border-[var(--cf-accent-light)] bg-[var(--cf-surface)] p-4 shadow-sm">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--cf-secondary)]">
              Phương thức thanh toán
            </p>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {paymentMethods.map((method) => {
                const isSelected = selectedPayment === method.id;

                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-3 text-left transition-all duration-200 ${
                      isSelected
                        ? "border-[var(--cf-primary)] bg-[var(--cf-primary)] text-white"
                        : "border-[var(--cf-accent-light)] bg-[var(--cf-bg)] text-[var(--cf-primary)]"
                    }`}
                  >
                    <span className="flex-shrink-0">{method.icon}</span>
                    <span className="text-sm font-semibold leading-tight">{method.label}</span>

                    {isSelected && (
                      <span className="ml-auto flex-shrink-0">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Nút Thanh toán ── */}
          <button
            onClick={() => {
              setPaying(true);
              setTimeout(() => setPaying(false), 2000);
            }}
            disabled={paying}
            className={`w-full rounded-2xl py-4 text-sm font-bold uppercase tracking-widest text-white shadow-sm transition-all duration-300 ${
              paying ? "bg-[#4A7C59] opacity-90" : "bg-[var(--cf-primary)] opacity-100"
            }`}
          >
            {paying ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Đang xử lý...
              </span>
            ) : (
              `Thanh toán · ${fmt(total)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}