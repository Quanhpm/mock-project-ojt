export interface PosCategory {
  category_id: string;
  category_name: string;
  category_code: string;
  franchise_id: string;
  franchise_name: string;
  display_order: number;
}

export interface PosProductSize {
  product_franchise_id: string;
  size: string;
  price: number;
  is_available: boolean;
}

export interface PosProduct {
  product_id: string;
  category_id: string;
  category_name: string;
  category_display_order: number;
  product_display_order: number;
  SKU: string;
  name: string;
  description: string;
  image_url: string;
  is_have_topping: string[];
  sizes: PosProductSize[];
}

export interface PosToppingProduct {
  product_id: string;
  category_id: string;
  category_name: string;
  name: string;
  image_url: string;
  product_franchise_id: string;
  price: number;
  is_available: boolean;
}

export interface PosProductFranchiseLookupItem {
  product_id: string;
  category_id: string;
  category_name: string;
  product_name: string;
  product_image_url: string;
  product_franchise_id: string;
  size_label: string;
  price: number;
  is_available: boolean;
}
