import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Phone, ArrowLeft, ShoppingCart, Navigation } from 'lucide-react';
import type { FranchiseDetailResponse } from '@/apis/endpointsCLIENT/franchiseDetail.api';

export function StoreInfo({ franchise }: { franchise: FranchiseDetailResponse }) {
    const navigate = useNavigate();

    const openDirections = () => {
        window.open(
            `https://www.google.com/maps/search/${encodeURIComponent(franchise.address)}`,
            '_blank',
        );
    };

    return (
        <div className="flex-1 flex flex-col gap-5 pt-1">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-[var(--cf-secondary)]">
                <button onClick={() => navigate('/location')} className="hover:text-[var(--cf-primary)] transition-colors cursor-pointer">
                    Địa điểm
                </button>
                <span>›</span>
                <span className="text-[var(--cf-primary)] font-medium">{franchise.name}</span>
            </nav>

            {/* Name */}
            <h1 className="text-4xl font-black text-gray-900 leading-tight">{franchise.name}</h1>

            {/* Details */}
            <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-[var(--cf-primary)]/10 flex-shrink-0">
                        <MapPin size={16} className="text-[var(--cf-primary)]" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-900 mb-0.5">Địa chỉ</p>
                        <p className="text-sm text-[var(--cf-secondary)]">{franchise.address}</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-[var(--cf-primary)]/10 flex-shrink-0">
                        <Clock size={16} className="text-[var(--cf-primary)]" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-900 mb-0.5">Giờ hoạt động</p>
                        {franchise.opened_at && franchise.closed_at ? (
                            <p className="text-sm text-[var(--cf-secondary)]">
                                Mở ngay bây giờ: {franchise.opened_at} – {franchise.closed_at}
                            </p>
                        ) : (
                            <p className="text-sm text-[var(--cf-secondary)]">Chưa cập nhật</p>
                        )}
                    </div>
                </div>

                {franchise.hotline && (
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-[var(--cf-primary)]/10 flex-shrink-0">
                            <Phone size={16} className="text-[var(--cf-primary)]" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-900 mb-0.5">Hotline</p>
                            <p className="text-sm text-[var(--cf-secondary)]">{franchise.hotline}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-1">
                <Link
                    to="/menu"
                    className="flex items-center gap-2 bg-[var(--cf-primary)] text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-[var(--cf-dark)] transition-colors"
                >
                    <ShoppingCart size={16} />
                    Đặt hàng ngay
                </Link>
                <button
                    onClick={openDirections}
                    className="flex items-center gap-2 border-2 border-[var(--cf-primary)] text-[var(--cf-primary)] text-sm font-bold px-6 py-3 rounded-full hover:bg-[var(--cf-primary)] hover:text-white transition-colors cursor-pointer"
                >
                    <Navigation size={16} />
                    Xem chỉ đường
                </button>
            </div>
        </div>
    );
}

export function StoreNotFound() {
    return (
        <div className="bg-[var(--cf-bg)] min-h-screen flex flex-col items-center justify-center gap-4">
            <p className="text-[var(--cf-secondary)]">Không tìm thấy cửa hàng.</p>
            <Link
                to="/location"
                className="flex items-center gap-2 text-sm font-semibold text-[var(--cf-primary)] hover:underline"
            >
                <ArrowLeft size={16} /> Quay lại danh sách
            </Link>
        </div>
    );
}
