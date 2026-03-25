import { TriangleAlert } from 'lucide-react';

interface OrderFailedReasonProps {
	status:
		| 'PREPARING'
		| 'COMPLETED'
		| 'CANCELLED'
		| 'CONFIRMED'
		| 'READY_FOR_PICKUP'
		| 'OUT_FOR_DELIVERY'
		| 'DRAFT';
	reason?: string | null;
}

function OrderFailedReason({ status, reason }: OrderFailedReasonProps) {
	if (status !== 'CANCELLED') {
		return null;
	}

	return (
		<div className="p-4 rounded-lg border border-rose-200 bg-rose-50/80">
			<div className="flex items-start gap-3">
				<TriangleAlert className="size-5 text-rose-600 shrink-0" />
				<div className="flex-1">
					<p className="text-sm font-semibold text-rose-800">Lý do hủy đơn</p>
					<p className="text-sm text-rose-700 mt-1 wrap-break-word">
						{reason && reason.trim().length > 0 ? reason : 'Không có lý do cụ thể từ hệ thống.'}
					</p>
				</div>
			</div>
		</div>
	);
}

export default OrderFailedReason;
