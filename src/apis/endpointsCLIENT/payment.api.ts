import { httpClient } from "../httpClient";

export interface OrderOption {
  product_franchise_id: string;
  product_name: string;
  product_image_url: string;
  quantity: number;
  price_snapshot: number;
  discount_amount: number;
  final_price: number;
}

export interface OrderItem {
  order_item_id: string;
  product_franchise_id: string;
  product_name: string;
  product_image_url: string;
  quantity: number;
  price_snapshot: number;
  discount_amount: number;
  line_total: number;
  final_line_total: number;
  options_hash: string;
  options: OrderOption[];
}

export interface OrderResponse {
  _id: string;
  customer_id: string;
  franchise_id: string;
  cart_id: string;
  code: string;
  status: string;
  address: string;
  phone: string;
  message: string;
  promotion_discount: number;
  voucher_discount: number;
  loyalty_discount: number;
  subtotal_amount: number;
  final_amount: number;
  promotion_id: string;
  promotion_type: string;
  promotion_value: number;
  voucher_type: string;
  voucher_value: number;
  loyalty_points_used: number;
  franchise_name: string;
  customer_name: string;
  order_items: OrderItem[];
}

export interface PaymentResponse {
    _id: string;
    franchise_id: string;
    customer_id: string;
    order_id: string;
    code: string;
    method: string;
    status: string;
    amount: number;
    is_active: boolean;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    __v: number;
    paid_at: string;
}

export interface RefundPaymentResponse extends PaymentResponse {
    refund_reason: string;
}

interface ConfirmPaymentRequest {
    method: string;
    providerTxnId?: string;
}

interface RefundPaymentRequest {
    refund_reason: string;
}

export const getPaymentByOrderId = (orderId: string): Promise<PaymentResponse | null> => {
    return httpClient.get<PaymentResponse>({
        url: `payments/order/${orderId}`
    })
}

export const getPaymentByCustomerId = (customerId: string): Promise<PaymentResponse[] | null> => {
    return httpClient.get<PaymentResponse[]>({
        url: `payments/customer/${customerId}`
    })
}

export const getPaymentByCode = (code: string): Promise<PaymentResponse[] | null> => {
    return httpClient.get<PaymentResponse[]>({
        url: `payments/code?code=${code}`
    })
}

export const getPaymentById = (id: string): Promise<PaymentResponse[] | null> => {
    return httpClient.get<PaymentResponse[]>({
        url: `payments/${id}`
    })
}

export const confirmPayment = (
    id: string,
    data: ConfirmPaymentRequest,
): Promise<PaymentResponse[] | null> => {
    return httpClient.put<PaymentResponse[], ConfirmPaymentRequest>({
        url: `payments/${id}/confirm`,
        data,
    });
}

export const refundPayment = (
    id: string,
    data: RefundPaymentRequest,
): Promise<RefundPaymentResponse[] | null> => {
    return httpClient.put<RefundPaymentResponse[], RefundPaymentRequest>({
        url: `payments/${id}`,
        data,
    });
}

export const getOrderbyCartId = (id: string): Promise<OrderResponse | null> => {
    return httpClient.get<OrderResponse>({
        url: `orders/cart/${id}`
    })
}