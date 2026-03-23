import { toast } from 'sonner';
import { HttpError, getCustomerProfile } from '@/apis';
import { checkoutCart } from '@/apis/endpointsCLIENT/cart.api';
import { useNavigate } from 'react-router-dom';
import { ROUTER_URL } from '@/routes/router.const';

export interface CheckoutPayload {
  address: string;
  phone: string;
  message?: string;
}

export function useCheckoutHandler(cartId: string) {
    const navigate = useNavigate();

    const fetchCustomerInfo = async (): Promise<CheckoutPayload> => {
        const response = await getCustomerProfile();
        return {
            address: response?.address?.trim() ?? '',
            phone: response?.phone?.trim() ?? '',
            message: '',
        };
    };

    const getCheckoutPrefill = async (): Promise<CheckoutPayload> => {
        try {
            return await fetchCustomerInfo();
        } catch (err) {
            console.error('[useCheckoutHandler] cannot prefill customer info:', err);
            return {
                address: '',
                phone: '',
                message: '',
            };
        }
    };

    const handleCheckout = async (payload: CheckoutPayload): Promise<boolean> => {
        if (!cartId) {
            toast.error('Không tìm thấy giỏ hàng để checkout');
            return false;
        }

        try {
            const address = payload.address.trim();
            const phone = payload.phone.trim();
            const message = payload.message?.trim() ?? '';

            if (!address || !phone) {
                toast.error('Thiếu thông tin giao hàng', {
                    description: 'Vui lòng nhập địa chỉ và số điện thoại trước khi thanh toán.',
                });
                return false;
            }

            await checkoutCart(cartId, { address, phone, message });

            navigate(ROUTER_URL.HOME_ROUTER.CHECKOUT, {
                state: { cartId },
            });
            return true;
        } catch (err) {
            const message =
                err instanceof HttpError ? err.message : 'Checkout thất bại. Vui lòng thử lại.';

            toast.error('Checkout thất bại', {
                description: message,
            });
            console.error('[useCheckoutHandler] checkout failed:', err);
            return false;
        }
    };

    return { handleCheckout, getCheckoutPrefill };
}