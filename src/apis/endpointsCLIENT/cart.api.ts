import { httpClient } from "../httpClient";

type Status = "ACTIVE" | "DEACTIVE"
type Size = "S" | "M" | "L" | "DEFAULT"

interface Option {
    product_franchise_id: string;
    quantity: number;
}

interface AddToCartRequest {
    franchise_id: string;
    product_franchise_id: string;
    quantity: number;
    address: string;
    phone: string;
    option: Option
}

interface ProductFranchise {
    _id: string;
    product_id: string;
    franchise_id: string;
    price_base: number;
    size: Size;
    is_active: boolean;
    is_delete: boolean
}

interface CartItem {
    cart_item_id: string;
    quantity: number;
    product_cart_price: number;
    discount_amount: number;
    line_total: number;
    final_line_total: number;
    options_hash: string;
    product_franchise_id: {

    }
}

interface GetCartResponse {
    _id: string;
    customer_id: string
    franchise_id: string
    status: Status;
    address: string;
    phone: string;
    loyalty_points_used: number;
    promotion_discount: number;
    voucher_discount: number;
    loyalty_discount: number;
    subtotal_amount: number;
    final_amount: number;
    cart_items:
}