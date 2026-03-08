interface StoreQuoteProps {
    franchiseName: string;
}

export function StoreQuote({ franchiseName }: StoreQuoteProps) {
    return (
        <div className="bg-[var(--cf-primary)]/8 rounded-2xl p-5 border border-[var(--cf-primary)]/20">
            <p className="text-sm font-bold text-gray-900 mb-2">Lý do chúng tôi yêu thích cửa hàng này</p>
            <p className="text-sm text-[var(--cf-secondary)] italic leading-relaxed">
                "Nằm ở trung tâm Thu Đức, địa điểm {franchiseName} này mang đến một
                thiên đường cho những người yêu cà phê. Với nội thất mang phong cách công nghiệp hiện đại và quầy pha chế cà phê nhỏ giọt chuyên dụng, đây là địa điểm hoàn hảo cho cả công việc tập trung và những buổi tụ họp bạn bè."
            </p>
        </div>
    );
}
