import type { Product, ProductFranchise } from './product.types';

// Cart item type
export interface CartItem {
  id: string
  product: Product
  productFranchise: ProductFranchise
  quantity: number
  price: number // snapshot price at the time added to cart
  line_total: number // quantity * price
}

// Shopping cart type
export interface Cart {
  id: string
  customer_id: number
  franchise_id: number
  items: CartItem[]
  total_amount: number
  created_at: string
  updated_at: string
}

// Cart actions
export interface AddToCartRequest {
  product_franchise_id: number
  quantity: number
}

export interface UpdateCartItemRequest {
  cart_item_id: string
  quantity: number
}

export interface RemoveFromCartRequest {
  cart_item_id: string
}
