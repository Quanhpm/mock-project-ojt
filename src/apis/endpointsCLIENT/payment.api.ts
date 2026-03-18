import { httpClient } from "../httpClient";
import type { GetOrdersByCustomerIdResponse } from "../endpointsCLIENT/order.api"

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
    providerTxnId: string;
}

interface RefundPaymentRequest {
    refund_reason: string;
}

export const getPaymentByOrderId = (orderId: string): Promise<PaymentResponse[] | null> => {
    return httpClient.get<PaymentResponse[]>({
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
        url: `payments/${id}`,
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

export const getOrderbyId = (id: string): Promise<GetOrdersByCustomerIdResponse | null> => {
    return httpClient.get<GetOrdersByCustomerIdResponse>({
        url: `orders/${id}`
    })
}