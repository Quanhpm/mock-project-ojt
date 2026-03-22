import { toast } from 'sonner';
import { HttpError, getCustomerProfile } from '@/apis';
import { checkoutCart } from '@/apis/endpointsCLIENT/cart.api';
import { useNavigate } from 'react-router-dom';
import { ROUTER_URL } from '@/routes/router.const';

export function useCheckoutHandler(cartId: string) {
    const navigate = useNavigate();

    const fetchCustomerInfo = async () => {
        const response = await getCustomerProfile();
        return {
            address: response?.address?.trim() ?? '',
            phone: response?.phone?.trim() ?? '',
        };
    };

    const handleCheckout = async () => {
        if (!cartId) {
            toast.error('Không tìm thấy giỏ hàng để checkout');
            return;
        }

        try {
            const { address, phone } = await fetchCustomerInfo();

            if (!address || !phone) {
                toast.error('Thiếu thông tin giao hàng', {
                    description: 'Vui lòng cập nhật địa chỉ và số điện thoại trước khi thanh toán.',
                });
                return;
            }

            await checkoutCart(cartId, { address, phone });

            navigate(ROUTER_URL.HOME_ROUTER.CHECKOUT, {
                state: { cartId },
            });
        } catch (err) {
            const message =
                err instanceof HttpError ? err.message : 'Checkout thất bại. Vui lòng thử lại.';

            toast.error('Checkout thất bại', {
                description: message,
            });
            console.error('[useCheckoutHandler] checkout failed:', err);
        }
    };

    return { handleCheckout };
}