import { checkoutCart } from "@/apis/endpointsCLIENT/cart.api";
import { getCustomerProfile } from "@/apis";
import { useNavigate } from "react-router-dom";
import { ROUTER_URL } from '@/routes/router.const';

export function useCheckoutHandler(cartId: string) {
    const navigate = useNavigate();

    const fetchCustomerInfo = async () => {
        const response = await getCustomerProfile();
        return {
            address: response?.address ?? "",
            phone: response?.phone ?? ""
        };
    };

    const handleCheckout = async () => {
        try {
            const { address, phone } = await fetchCustomerInfo();
            await checkoutCart(cartId, { address, phone });

        } catch (e) {
            console.error("Check out thất bại", e);
        } finally {
            navigate(ROUTER_URL.HOME_ROUTER.CHECKOUT, {
                state: { cartId }
            });
        }
    };

    return { handleCheckout };
}