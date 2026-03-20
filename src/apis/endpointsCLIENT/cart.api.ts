import { httpClient } from "../httpClient";

<<<<<<< HEAD
// ======================== Types ========================

export interface AddCartItemRequest {
  franchise_id: string;
  product_franchise_id: string;
  quantity: number;
  address: string;
  phone: string;
  note?: string;
  message?: string;
  options?: Array<{
    product_franchise_id: string;
    quantity: number;
  }>;
}

export interface UpdateCartRequest {
  address: string;
  phone: string;
  note?: string;
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

export interface ApplyVoucherRequest {
  voucher_code: string;
}

export interface CountCustomerCartsResponse {
  count: number;
}

// ======================== API Functions ========================

// ADD ITEM TO CART
export const addCartItem = (
  data: AddCartItemRequest,
): Promise<null> => {
  return httpClient.post<null, AddCartItemRequest>({
    url: '/carts/items',
    data,
  });
};

// GET CUSTOMER CARTS
export const getCustomerCarts = (
  customerId: string,
  status: string = 'ACTIVE',
): Promise<null> => {
  return httpClient.get<null>({
    url: `/carts/customer/${customerId}?status=${status}`,
  });
};

// GET CART DETAIL
export const getCartDetail = (
  cartId: string,
): Promise<null> => {
  return httpClient.get<null>({
    url: `/carts/${cartId}`,
  });
};

// COUNT CUSTOMER CARTS
export const countCustomerCarts = (
  customerId: string,
  status: string = 'ACTIVE',
): Promise<CountCustomerCartsResponse | null> => {
  return httpClient.get<CountCustomerCartsResponse>({
    url: `/carts/customer/${customerId}/count-cart?status=${status}`,
  });
};

// COUNT CART ITEMS
export const countCartItems = (
  cartId: string,
): Promise<null> => {
  return httpClient.get<null>({
    url: `/carts/${cartId}/count-cart-item`,
  });
};

// UPDATE CART
export const updateCart = (
  cartId: string,
  data: UpdateCartRequest,
): Promise<null> => {
  return httpClient.put<null, UpdateCartRequest>({
    url: `/carts/${cartId}`,
    data,
  });
};

// DELETE CART ITEM
export const deleteCartItem = (
  cartItemId: string,
): Promise<null> => {
  return httpClient.delete<null>({
    url: `/carts/items/${cartItemId}`,
  });
};

// UPDATE CART ITEM OPTION QUANTITY
export const updateCartItemOption = (
  data: UpdateCartItemOptionRequest,
): Promise<null> => {
  return httpClient.patch<null, UpdateCartItemOptionRequest>({
    url: '/carts/items/update-option',
    data,
  });
};

// REMOVE CART ITEM OPTION
export const removeCartItemOption = (
  data: RemoveCartItemOptionRequest,
): Promise<null> => {
  return httpClient.patch<null, RemoveCartItemOptionRequest>({
    url: '/carts/items/remove-option',
    data,
  });
};

// APPLY VOUCHER
export const applyVoucher = (
  cartId: string,
  data: ApplyVoucherRequest,
): Promise<null> => {
  return httpClient.put<null, ApplyVoucherRequest>({
    url: `/carts/${cartId}/apply-voucher`,
    data,
  });
};

// REMOVE VOUCHER
export const removeVoucher = (
  cartId: string,
): Promise<null> => {
  return httpClient.delete<null>({
    url: `/carts/${cartId}/remove-voucher`,
  });
};

// CHECKOUT CART
export const checkoutCart = (
  cartId: string,
): Promise<null> => {
  return httpClient.put<null, never>({
    url: `/carts/${cartId}/checkout`,
  });
};

// CANCEL CART
export const cancelCart = (
  cartId: string,
): Promise<null> => {
  return httpClient.put<null, never>({
    url: `/carts/${cartId}/cancel`,
  });
};
=======
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
>>>>>>> dev
