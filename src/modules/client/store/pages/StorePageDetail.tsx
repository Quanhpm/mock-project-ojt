import { use, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Phone, ArrowLeft, ShoppingBag, Navigation, Wifi, Wind, Car, Armchair } from 'lucide-react';
import { getFranchiseDetail, type FranchiseDetailResponse } from '@/apis/endpointsCLIENT/franchiseDetail.api';
import { MapContainer } from '../components/MapContainer';

const AMENITIES = [
    { icon: <Wifi size={20} />, label: 'Wifi miễn phí' },
    { icon: <Wind size={20} />, label: 'Điều hòa không khí' },
    { icon: <Car size={20} />, label: 'Bãi đậu xe' },
    { icon: <Armchair size={20} />, label: 'Chỗ ngồi ngoài trời' },
];

function FranchiseDetail({ promise }: { promise: Promise<FranchiseDetailResponse | null> }) {
    const franchise = use(promise);
    const navigate = useNavigate();

    if (!franchise) {
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

    const openDirections = () => {
        window.open(
            `https://www.google.com/maps/search/${encodeURIComponent(franchise.address)}`,
            '_blank',
        );
    };

    return (
        <div className="bg-[var(--cf-bg)] min-h-screen">
            {/* ── Hero ── */}
            <div className="max-w-6xl mx-auto px-4 pt-8 pb-10">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Left – image */}
                    <div className="w-full lg:w-1/2 relative rounded-2xl overflow-hidden shadow-md flex-shrink-0">
                        {franchise.logo_url ? (
                            <img
                                src={franchise.logo_url}
                                alt={franchise.name}
                                className="w-full aspect-[4/3] object-cover"
                            />
                        ) : (
                            <div className="w-full aspect-[4/3] bg-[var(--cf-surface)] flex items-center justify-center">
                                <MapPin size={64} className="text-[var(--cf-secondary)]" />
                            </div>
                        )}
                        {/* Featured badge */}
                        <span className="absolute top-3 left-3 bg-[var(--cf-primary)] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                            Cửa hàng nổi bật
                        </span>
                    </div>

                    {/* Right – info */}
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
                                        <p className="text-xs font-bold text-gray-900 mb-0.5">Điện thoại</p>
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
                                <ShoppingBag size={16} />
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
                </div>
            </div>

            {/* ── Details ── */}
            <div className="max-w-6xl mx-auto px-4 pb-16">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left – amenities + quote */}
                    <div className="lg:w-[340px] flex-shrink-0 flex flex-col gap-6">
                        {/* Amenities */}
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

                        {/* Quote */}
                        <div className="bg-[var(--cf-primary)]/8 rounded-2xl p-5 border border-[var(--cf-primary)]/20">
                            <p className="text-sm font-bold text-gray-900 mb-2">Lý do chúng tôi yêu thích cửa hàng này</p>
                            <p className="text-sm text-[var(--cf-secondary)] italic leading-relaxed">
                                "Nằm ở trung tâm Thu Đức, địa điểm {franchise.name} này mang đến một
                                thiên đường cho những người yêu cà phê. Với nội thất mang phong cách công nghiệp hiện đại và quầy pha chế cà phê nhỏ giọt chuyên dụng, đây là địa điểm hoàn hảo cho cả công việc tập trung và những buổi tụ họp bạn bè."
                            </p>
                        </div>
                    </div>

                    {/* Right – map */}
                    <div className="flex-1 rounded-2xl overflow-hidden shadow-sm h-[400px] lg:h-auto lg:min-h-[440px]">
                        <MapContainer franchise={franchise} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function StorePageDetail() {
    const { franchiseId } = useParams<{ franchiseId: string }>();
    const promise = getFranchiseDetail(franchiseId ?? '');

    return (
        <Suspense
            fallback={
                <div className="bg-[var(--cf-bg)] min-h-screen flex items-center justify-center">
                    <p className="text-[var(--cf-secondary)] text-sm animate-pulse">Đang tải cửa hàng...</p>
                </div>
            }
        >
            <FranchiseDetail promise={promise} />
        </Suspense>
    );
}

