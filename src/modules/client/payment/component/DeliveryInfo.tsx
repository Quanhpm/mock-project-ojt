import type { ReactNode } from "react"

interface InfoRowProps {
    icon: ReactNode;
    label: string;
    value: string;
}

interface DeliveryInfoProps {
    franchiseName: string;
    address: string;
}

function LocationIcon() {
    return (
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--cf-accent-light)] text-[var(--cf-primary)]">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                />
            </svg>
        </span>
    )
}

function TruckIcon() {
    return (
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--cf-accent-light)] text-[var(--cf-dark)]">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2.038A2 2 0 0115 11.1V14h.95a2.5 2.5 0 014.9 0H20a1 1 0 001-1V8a1 1 0 00-.293-.707l-2-2A1 1 0 0018 5h-5V4a1 1 0 00-1-1H3z" />
            </svg>
        </span>
    )
}

function InfoRow({ icon, label, value }: InfoRowProps) {
    return (
        <div className="flex items-start gap-3">
            {icon}
            <div>
                <p className="mb-0.5 text-[10px] text-[var(--cf-secondary)]">{label}</p>
                <p className="text-sm font-semibold text-[var(--cf-primary)]">
                    {value}
                </p>
            </div>
        </div>
    )
}

export function DeliveryInfo({ franchiseName, address }: DeliveryInfoProps) {
    return (
        <div className="rounded-2xl border border-[var(--cf-accent-light)] bg-[var(--cf-surface)] p-4 shadow-sm">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--cf-primary)]">
                Thông tin giao hàng
            </p>

            <div className="flex flex-col gap-3">
                {/* Đặt tại */}
                <InfoRow
                    icon={<LocationIcon />}
                    label="Đặt tại"
                    value={franchiseName}
                />

                {/* Giao đến */}
                <div className="flex items-start gap-3">
                    <InfoRow
                        icon={<TruckIcon />}
                        label="Giao đến"
                        value={address}
                    />
                </div>
            </div>
        </div>
    )
}