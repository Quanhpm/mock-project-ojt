import { Wifi, Wind, Car, Armchair } from 'lucide-react';

const AMENITIES = [
    { icon: <Wifi size={20} />, label: 'Wifi miễn phí' },
    { icon: <Wind size={20} />, label: 'Điều hòa không khí' },
    { icon: <Car size={20} />, label: 'Bãi đậu xe' },
    { icon: <Armchair size={20} />, label: 'Chỗ ngồi ngoài trời' },
];

export function StoreAmenities() {
    return (
        <div>
            <div className="flex items-center gap-3 mb-4">
                <span className="w-6 h-0.5 bg-[var(--cf-primary)] rounded-full" />
                <h2 className="text-base font-black text-gray-900">Tiện ích cửa hàng</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {AMENITIES.map((a) => (
                    <div
                        key={a.label}
                        className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-3 shadow-sm"
                    >
                        <span className="text-[var(--cf-primary)]">{a.icon}</span>
                        <span className="text-sm font-medium text-gray-700">{a.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
