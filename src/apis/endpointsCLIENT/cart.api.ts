import { httpClient } from "../httpClient";

export interface AddCartItemRequest {
  franchise_id: string;
  product_franchise_id: string;
  quantity: number;
  note?: string;
  options?: Array<{
    product_franchise_id: string;
    quantity: number;
  }>;
}

export interface UpdateCartRequest {
  address?: string;
  phone?: string;
  message?: string;
}

export interface UpdateCartItemOptionRequest {
  cart_item_id: string;
  option_product_franchise_id: string;
  quantity: number;
}

export interface RemoveCartItemOptionRequest {
  cart_item_id: string;
  option_product_franchise_id: string;
}

export interface UpdateCartItemOptionsRequest {
  cart_item_id: string;
  options: Array<{
    product_franchise_id: string;
    quantity: number;
  }>;
}

export interface UpdateCartItemQuantityRequest {
  cart_item_id: string;
  quantity: number;
}

export interface ApplyVoucherRequest {
  voucher_code: string;
}

export interface CountCustomerCartsResponse {
  count: number;
}

interface CheckoutCartRequest {
  address: string;
  phone: string;
  message?: string;
}

export const addCartItem = (
  data: AddCartItemRequest,
): Promise<null> => {
  return httpClient.post<null, AddCartItemRequest>({
    url: '/carts/items',
    data,
  });
};

export const getCustomerCarts = (
  customerId: string,
  status: string = 'ACTIVE',
): Promise<null> => {
  return httpClient.get<null>({
    url: `/carts/customer/${customerId}?status=${status}`,
  });
};

export const getCartDetail = (
  cartId: string,
): Promise<null> => {
  return httpClient.get<null>({
    url: `/carts/${cartId}`,
  });
};

export const countCustomerCarts = (
  customerId: string,
  status: string = 'ACTIVE',
): Promise<CountCustomerCartsResponse | null> => {
  return httpClient.get<CountCustomerCartsResponse>({
    url: `/carts/customer/${customerId}/count-cart?status=${status}`,
  });
};

export const countCartItems = (
  cartId: string,
): Promise<null> => {
  return httpClient.get<null>({
    url: `/carts/${cartId}/count-cart-item`,
  });
};

export const updateCart = (
  cartId: string,
  data: UpdateCartRequest,
): Promise<null> => {
  return httpClient.put<null, UpdateCartRequest>({
    url: `/carts/${cartId}`,
    data,
  });
};

export const deleteCartItem = (
  cartItemId: string,
): Promise<null> => {
  return httpClient.delete<null>({
    url: `/carts/items/${cartItemId}`,
  });
};

export const updateCartItemOption = (
  data: UpdateCartItemOptionRequest,
): Promise<null> => {
  return httpClient.patch<null, UpdateCartItemOptionRequest>({
    url: '/carts/items/update-option',
    data,
  });
};

export const removeCartItemOption = (
  data: RemoveCartItemOptionRequest,
): Promise<null> => {
  return httpClient.patch<null, RemoveCartItemOptionRequest>({
    url: '/carts/items/remove-option',
    data,
  });
};

export const updateCartItemOptions = (
  data: UpdateCartItemOptionsRequest,
): Promise<null> => {
  return httpClient.put<null, UpdateCartItemOptionsRequest>({
    url: '/carts/items/update-options-cart-item',
    data,
  });
};

export const updateCartItemQuantity = (
  data: UpdateCartItemQuantityRequest,
): Promise<null> => {
  return httpClient.patch<null, UpdateCartItemQuantityRequest>({
    url: '/carts/items/update-cart-item',
    data,
  });
};

export const applyVoucher = (
  cartId: string,
  data: ApplyVoucherRequest,
): Promise<null> => {
  return httpClient.put<null, ApplyVoucherRequest>({
    url: `/carts/${cartId}/apply-voucher`,
    data,
  });
};

export const removeVoucher = (
  cartId: string,
): Promise<null> => {
  return httpClient.delete<null>({
    url: `/carts/${cartId}/remove-voucher`,
  });
};

export const checkoutCart = (
  cartId: string,
  data: CheckoutCartRequest
): Promise<null> => {
  return httpClient.put<null, CheckoutCartRequest>({
    url: `/carts/${cartId}/checkout`,
    data,
  });
};

export const cancelCart = (
  cartId: string,
): Promise<null> => {
  return httpClient.put<null, never>({
    url: `/carts/${cartId}/cancel`,
  });
};
