import { useEffect, useMemo, useState } from 'react';
import { Coffee, Gift, Percent, Zap, TrendingUp, ShoppingCart } from 'lucide-react';
import type { ClientCustomerLoyaltyDetail, ClientLoyaltyRule, LoyaltyTier, LoyaltyTierRule } from '@/apis/endpointsCLIENT';
import { getClientCustomerLoyaltyDetail, getClientLoyaltyRuleByFranchise } from '@/apis/endpointsCLIENT';
import { useStore as useMenuStore } from '@/modules/client/menu/hooks/use-store.hook';

const TIER_LABELS: Record<LoyaltyTier, string> = {
	BRONZE: 'Đồng',
	SILVER: 'Bạc',
	GOLD: 'Vàng',
	PLATINUM: 'Bạch Kim',
};

const getTierLabel = (tier: LoyaltyTier | string) => {
	return TIER_LABELS[tier as LoyaltyTier] ?? tier;
};

const getTierGradient = (tier: LoyaltyTier | string) => {
	switch (tier) {
		case 'SILVER':
			return 'linear-gradient(135deg, #9ca3af 0%, #6b7280 55%, #4b5563 100%)';
		case 'GOLD':
			return 'linear-gradient(135deg, #FDE68A 0%, #D4AF37 45%, #B8860B 100%)'; 
			case 'PLATINUM':
			return 'linear-gradient(135deg, #434343 0%, #000000 50%, #1a1a1a 100%)';
		case 'BRONZE':
		default:
			return 'linear-gradient(135deg, var(--cf-primary) 0%, var(--cf-dark) 55%, var(--cf-secondary) 100%)';
	}
};

function ClientLoyaltyPage() {
	const selectedFranchiseId = useMenuStore((state) => state.franchiseId);
	const [rule, setRule] = useState<ClientLoyaltyRule | null>(null);
	const [customerLoyalty, setCustomerLoyalty] = useState<ClientCustomerLoyaltyDetail | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const loadLoyaltyRule = async () => {
			if (!selectedFranchiseId) {
				if (isMounted) {
					setRule(null);
					setCustomerLoyalty(null);
					setErrorMessage('Vui lòng chọn chi nhánh để xem Loyalty Rule.');
					setIsLoading(false);
				}
				return;
			}

			setIsLoading(true);
			setErrorMessage(null);

			try {
				const [nextRule, nextCustomerLoyalty] = await Promise.all([
					getClientLoyaltyRuleByFranchise(selectedFranchiseId),
					getClientCustomerLoyaltyDetail(selectedFranchiseId),
				]);

				if (!isMounted) {
					return;
				}

				if (!nextRule) {
					setRule(null);
					setCustomerLoyalty(null);
					setErrorMessage('Chi nhánh hiện tại chưa có Loyalty Rule khả dụng.');
				} else {
					setRule(nextRule);
					setCustomerLoyalty(nextCustomerLoyalty);
				}
			} catch {
				if (isMounted) {
					setRule(null);
					setCustomerLoyalty(null);
					setErrorMessage('Hiện tại chưa có đăng ký thành viên ở chi nhánh này. Vui lòng liên hệ nhân viên.');
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		void loadLoyaltyRule();

		return () => {
			isMounted = false;
		};
	}, [selectedFranchiseId]);

	const sortedTiers = useMemo(() => {
		const rules = rule?.tier_rules ?? [];
		return [...rules].sort((a, b) => a.min_points - b.min_points);
	}, [rule?.tier_rules]);

	const currentPoints = customerLoyalty?.loyalty_points ?? 0;

	const currentTier = useMemo<LoyaltyTierRule | null>(() => {
		if (sortedTiers.length === 0) {
			return null;
		}

		const matched = sortedTiers.find((tier) => {
			const max = tier.max_points ?? Number.POSITIVE_INFINITY;
			return currentPoints >= tier.min_points && currentPoints <= max;
		});

		return matched ?? sortedTiers[0];
	}, [currentPoints, sortedTiers]);

	const nextTier = useMemo<LoyaltyTierRule | null>(() => {
		if (!currentTier) {
			return null;
		}

		return sortedTiers.find((tier) => tier.min_points > currentPoints) ?? null;
	}, [currentPoints, currentTier, sortedTiers]);

	const targetPoints = nextTier?.min_points ?? currentPoints;
	const remainingPoints = nextTier ? Math.max(nextTier.min_points - currentPoints, 0) : 0;
	const progressPercent = nextTier
		? Math.min((currentPoints / nextTier.min_points) * 100, 100)
		: 100;
	const currentTierName = currentTier?.tier ?? customerLoyalty?.current_tier ?? 'BRONZE';
	const currentTierLabel = getTierLabel(currentTierName);
	const currentTierGradient = getTierGradient(currentTierName);

	const franchiseName = customerLoyalty?.franchise_id?.name ?? rule?.franchise_name ?? 'Chi nhánh hiện tại';
	const earnAmount = rule?.earn_amount_per_point ?? 10000;
	const redeemValue = rule?.redeem_value_per_point ?? 1000;
	const orderDiscount = currentTier?.benefit.order_discount_percent ?? 5;
	const earnMultiplier = currentTier?.benefit.earn_multiplier ?? 1.25;
	const customerName = customerLoyalty?.customer_id?.name;

	if (isLoading) {
		return (
			<main className="min-h-screen bg-[radial-gradient(circle_at_top,var(--cf-bg),#f1e8de_55%,var(--cf-surface))] px-4 py-8 md:px-8 lg:px-12">
				<div className="mx-auto w-full max-w-5xl space-y-6 animate-pulse">
					<div className="h-52 rounded-4xl bg-(--cf-surface)" />
					<div className="h-32 rounded-3xl bg-(--cf-surface)" />
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<div className="h-36 rounded-2xl bg-(--cf-surface)" />
						<div className="h-36 rounded-2xl bg-(--cf-surface)" />
						<div className="h-36 rounded-2xl bg-(--cf-surface)" />
					</div>
				</div>
			</main>
		);
	}

	if (errorMessage) {
		return (
			<main className="min-h-screen bg-[radial-gradient(circle_at_top,var(--cf-bg),#f1e8de_55%,var(--cf-surface))] px-4 py-8 md:px-8 lg:px-12">
				<div className="mx-auto w-full max-w-4xl rounded-3xl border border-(--cf-secondary)/40 bg-white/80 p-8 text-center">
					<p className="text-lg font-bold text-(--cf-primary)">{errorMessage}</p>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-[radial-gradient(circle_at_top,var(--cf-bg),#f1e8de_55%,var(--cf-surface))] px-4 py-8 md:px-8 lg:px-12">
			<div className="mx-auto w-full max-w-5xl space-y-8">
				<section className="rounded-4xl border border-(--cf-primary)/30 bg-white/65 p-6 shadow-[0_24px_60px_rgba(72,54,35,0.16)] backdrop-blur-sm md:p-8">
					<p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--cf-primary)">Hệ thống thành viên</p>
					<h1 className="mt-3 text-3xl font-black tracking-tight text-(--cf-dark) md:text-4xl">Đặc Quyền Thành Viên</h1>
					<p className="mt-2 text-sm text-(--cf-secondary) md:text-base">
						{customerName ? `${customerName}, ` : ''}tận hưởng trải nghiệm Boutique với ưu đãi tại {franchiseName}.
					</p>
					<div
						className="relative mt-6 overflow-hidden rounded-[28px] p-6 text-white md:p-8"
						style={{ background: currentTierGradient }}
					>
						<div className="absolute -right-6 -top-8 opacity-20">
							<Coffee size={168} className="animate-[coffeeFloat_4.5s_ease-in-out_infinite]" />
						</div>

						<div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
							<div>
								<p className="text-[11px] uppercase tracking-[0.32em] text-(--cf-accent-light)">Hạng Thành Viên</p>
								<h2 className="mt-2 text-3xl font-black tracking-wide md:text-4xl">Hạng {currentTierLabel}</h2>
								<p className="mt-4 text-sm text-(--cf-dark)">Ưu Đãi Boutique Brews</p>
							</div>

							<div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm">
								<p className="text-[11px] uppercase tracking-[0.25em] text-(--cf-accent-light)">Tổng điểm</p>
								<p className="mt-1 text-3xl font-black text-white">{currentPoints.toLocaleString('vi-VN')} PTS</p>
							</div>
						</div>

						<div className="relative z-10 mt-5 grid grid-cols-1 gap-3 text-xs text-(--cf-bg) sm:grid-cols-3">
							<div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
								<p className="uppercase tracking-[0.16em] text-(--cf-accent-light)">Đơn hàng</p>
								<p className="mt-1 text-lg font-bold text-white">{(customerLoyalty?.total_orders ?? 0).toLocaleString('vi-VN')}</p>
							</div>
							<div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
								<p className="uppercase tracking-[0.16em] text-(--cf-accent-light)">Điểm đã tích</p>
								<p className="mt-1 text-lg font-bold text-white">{(customerLoyalty?.total_earned_points ?? 0).toLocaleString('vi-VN')}</p>
							</div>
							<div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
								<p className="uppercase tracking-[0.16em] text-(--cf-accent-light)">Tổng chi tiêu</p>
								<p className="mt-1 text-lg font-bold text-white">{(customerLoyalty?.total_spent ?? 0).toLocaleString('vi-VN')}đ</p>
							</div>
						</div>
					</div>
				</section>

				<section className="rounded-3xl border border-(--cf-secondary)/30 bg-white/80 p-6 shadow-[0_18px_44px_rgba(90,62,35,0.12)] md:p-7">
					{nextTier ? (
						<p className="text-sm font-semibold text-(--cf-primary)">
							Bạn còn <span className="font-black text-(--cf-dark)">{remainingPoints.toLocaleString('vi-VN')} điểm</span> nữa để trở thành{' '}
							<span className="font-black tracking-wide">{getTierLabel(nextTier.tier)}</span>
						</p>
					) : (
						<p className="text-sm font-semibold text-(--cf-primary)">
							Bạn đã đạt hạng cao nhất. Tiếp tục tích điểm để tối đa quyền lợi của hội viên.
						</p>
					)}

					<div className="relative mt-4 h-4 overflow-hidden rounded-full bg-(--cf-bg)">
						<div
							className="relative h-full rounded-full bg-linear-to-r from-(--cf-primary) via-(--cf-secondary) to-(--cf-accent-light)"
							style={{ width: `${progressPercent}%` }}
						>
							<span
								className="absolute inset-y-0 -left-1/3 w-1/3 bg-linear-to-r from-transparent via-white/70 to-transparent"
								style={{ animation: 'shimmer 2.6s linear infinite' }}
							/>
						</div>
					</div>

					<div className="mt-3 flex items-center justify-between text-xs text-(--cf-secondary)">
						<span>{currentPoints.toLocaleString('vi-VN')} PTS</span>
						<span>{targetPoints.toLocaleString('vi-VN')} PTS</span>
					</div>
				</section>

				<section className="space-y-4">
					<h3 className="text-xl font-black text-(--cf-dark) md:text-2xl">Lợi ích đặc quyền</h3>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<article className="rounded-2xl border border-(--cf-surface) bg-white p-5 shadow-sm">
							<div className="inline-flex rounded-xl bg-(--cf-bg) p-2 text-(--cf-primary)">
								<Percent size={20} />
							</div>
							<h4 className="mt-3 text-lg font-bold text-(--cf-dark)">Giảm giá {orderDiscount}%</h4>
							<p className="mt-1 text-sm text-(--cf-secondary)">Áp dụng tự động cho mọi đơn hàng tại cửa hàng và online.</p>
						</article>

						<article className="rounded-2xl border border-(--cf-surface) bg-white p-5 shadow-sm">
							<div className="inline-flex rounded-xl bg-(--cf-bg) p-2 text-(--cf-primary)">
								<Zap size={20} />
							</div>
							<h4 className="mt-3 text-lg font-bold text-(--cf-dark)">Tích điểm x{earnMultiplier}</h4>
							<p className="mt-1 text-sm text-(--cf-secondary)">Mỗi giao dịch được cộng điểm nhanh hơn để lên hạng sớm hơn.</p>
						</article>

						<article className="rounded-2xl border border-(--cf-surface) bg-white p-5 shadow-sm">
							<div className="inline-flex rounded-xl bg-(--cf-bg) p-2 text-(--cf-primary)">
								<Gift size={20} />
							</div>
							<h4 className="mt-3 text-lg font-bold text-(--cf-dark)">Quà sinh nhật</h4>
							<p className="mt-1 text-sm text-(--cf-secondary)">Nhận voucher ưu đãi riêng trong tháng sinh nhật của bạn.</p>
						</article>
					</div>
				</section>

				<section className="rounded-3xl border border-(--cf-secondary)/40 bg-white/85 p-6 shadow-[0_14px_38px_rgba(90,62,35,0.1)] md:p-8">
					<h3 className="text-xl font-black text-(--cf-dark) md:text-2xl">Làm sao để nhận ưu đãi?</h3>

					<div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
						{/* Bước 1 */}
						<div className="flex flex-col gap-3 rounded-2xl border border-(--cf-surface) bg-(--cf-bg) p-5">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--cf-primary)/10 text-(--cf-primary)">
								<ShoppingCart size={20} />
							</div>
							<div>
								<p className="font-bold text-(--cf-dark)">1. Mua hàng & Tích điểm</p>
								<p className="mt-1 text-sm leading-relaxed text-(--cf-secondary)">
									Với mỗi <span className="font-semibold text-(--cf-primary)">{earnAmount.toLocaleString('vi-VN')}đ</span> chi tiêu, bạn nhận ngay <span className="font-bold text-(--cf-primary)">1 điểm</span>.
								</p>
							</div>
						</div>

						{/* Bước 2 */}
						<div className="flex flex-col gap-3 rounded-2xl border border-(--cf-surface) bg-(--cf-bg) p-5">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
								<Gift size={20} />
							</div>
							<div>
								<p className="font-bold text-(--cf-dark)">2. Đổi thưởng trực tiếp</p>
								<p className="mt-1 text-sm leading-relaxed text-(--cf-secondary)">
									Dùng điểm thanh toán đơn hàng. <span className="font-semibold text-emerald-600">1 điểm = {redeemValue.toLocaleString('vi-VN')}đ</span> tiền mặt.
								</p>
							</div>
						</div>

						{/* Bước 3 */}
						<div className="flex flex-col gap-3 rounded-2xl border border-(--cf-surface) bg-(--cf-bg) p-5">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
								<TrendingUp size={20} />
							</div>
							<div>
								<p className="font-bold text-(--cf-dark)">3. Đặc quyền thăng hạng</p>
								<p className="mt-1 text-sm leading-relaxed text-(--cf-secondary)">
									Tích lũy điểm để nâng cấp hạng thẻ, hưởng ưu đãi tới <span className="font-bold">10%</span>, và <span className="font-bold text-amber-600">miễn phí giao hàng</span> khi đạt hạng Bạch kim trở lên.
								</p>
							</div>
						</div>
					</div>
				</section>
			</div>

			<style>{`
				@keyframes shimmer {
					0% { transform: translateX(-140%); }
					100% { transform: translateX(420%); }
				}

				@keyframes coffeeFloat {
					0%, 100% { transform: translateY(0px) rotate(0deg); }
					50% { transform: translateY(8px) rotate(-4deg); }
				}
			`}</style>
		</main>
	);
}

export default ClientLoyaltyPage;
