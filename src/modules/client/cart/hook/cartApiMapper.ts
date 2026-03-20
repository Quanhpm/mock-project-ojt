export interface CartSummaryView {
  id: string;
  franchiseId: string;
  franchiseName: string;
  status: string;
  totalAmount: number;
  itemsCount: number;
  createdAt: string;
  itemsPreview: Array<{
    id: string;
    name: string;
    imageUrl: string;
    quantity: number;
    optionSummary: string;
  }>;
}

export interface CartDetailItemView {
  id: string;
  productId: string;
  productFranchiseId: string;
  name: string;
  sku: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  finalLineTotal: number;
  lineTotal: number;
  optionsHash: string;
  note: string;
  options: Array<{
    productFranchiseId: string;
    productName: string;
    quantity: number;
    priceSnapshot: number;
    discountAmount: number;
    finalPrice: number;
  }>;
}

export interface CartDetailView {
  id: string;
  customerId: string;
  customerName: string;
  franchiseId: string;
  franchiseName: string;
  status: string;
  address: string;
  phone: string;
  note: string;
  promotionDiscount: number;
  voucherDiscount: number;
  loyaltyPointsUsed: number;
  loyaltyDiscount: number;
  subtotalAmount: number;
  finalAmount: number;
  totalAmount: number;
  items: CartDetailItemView[];
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isLikelyCartItem = (value: Record<string, unknown>): boolean => {
  return (
    value.cart_item_id !== undefined
    || value.options_hash !== undefined
    || value.product_cart_price !== undefined
    || value.final_line_total !== undefined
  );
};

const isLikelyCart = (value: Record<string, unknown>): boolean => {
  return (
    value.cart_id !== undefined
    || value.customer_id !== undefined
    || value.franchise_id !== undefined
    || value.subtotal_amount !== undefined
    || value.final_amount !== undefined
    || value.cart_items !== undefined
  );
};

const pickString = (...values: unknown[]): string => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value;
    if (typeof value === 'number') return String(value);
  }
  return '';
};

const pickNumber = (...values: unknown[]): number => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
};

const extractCartItems = (cart: Record<string, unknown>): Record<string, unknown>[] => {
  const items = cart.items;
  if (Array.isArray(items)) return items.filter(isRecord);

  const cartItems = cart.cart_items;
  if (Array.isArray(cartItems)) return cartItems.filter(isRecord);

  const cartItemsCamel = cart.cartItems;
  if (Array.isArray(cartItemsCamel)) return cartItemsCamel.filter(isRecord);

  const cartItemList = cart.cartItemList;
  if (Array.isArray(cartItemList)) return cartItemList.filter(isRecord);

  return [];
};

export const extractCartsFromPayload = (payload: unknown): Record<string, unknown>[] => {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }

  if (isRecord(payload)) {
    const carts = payload.carts;
    if (Array.isArray(carts)) {
      return carts.filter(isRecord);
    }

    const data = payload.data;
    if (Array.isArray(data)) {
      return data.filter(isRecord);
    }

    if (isRecord(data)) {
      const nestedCarts = data.carts;
      if (Array.isArray(nestedCarts)) {
        return nestedCarts.filter(isRecord);
      }

      const nestedItems = data.items;
      if (Array.isArray(nestedItems)) {
        const itemRecords = nestedItems.filter(isRecord);
        if (itemRecords.length === 0) {
          return [data];
        }

        if (itemRecords.every(isLikelyCartItem)) {
          return [{ ...data, cart_items: itemRecords }];
        }

        if (itemRecords.every(isLikelyCart)) {
          return itemRecords;
        }

        return [data];
      }
      return [data];
    }

    return [payload];
  }

  return [];
};

export const toCartSummary = (cart: Record<string, unknown>): CartSummaryView => {
  const items = extractCartItems(cart);

  const itemsPreview = items.slice(0, 3).map((item) => {
    const itemOptions = Array.isArray(item.options)
      ? item.options.filter(isRecord)
      : [];

    const optionSummary = itemOptions
      .map((option) => {
        const optionName = pickString(option.product_name, option.name);
        const optionQty = Math.max(1, Math.floor(pickNumber(option.quantity, 1)));
        if (!optionName) return '';
        return `${optionName} x${optionQty}`;
      })
      .filter(Boolean)
      .join(', ');

    return {
      id: pickString(item.cart_item_id, item.id, item._id),
      name: pickString(item.product_name, item.name, 'Sản phẩm trong giỏ'),
      imageUrl: pickString(item.product_image_url, item.image_url),
      quantity: Math.max(1, Math.floor(pickNumber(item.quantity, item.qty, 1))),
      optionSummary,
    };
  });

  return {
    id: pickString(cart.id, cart._id, cart.cart_id),
    franchiseId: pickString(cart.franchise_id, cart.franchiseId),
    franchiseName: pickString(cart.franchise_name, 'Cửa hàng đang hoạt động'),
    status: pickString(cart.status, 'ACTIVE'),
    totalAmount: pickNumber(
      cart.final_amount,
      cart.total_amount,
      cart.subtotal_amount,
      cart.totalAmount,
      cart.grand_total,
      0,
    ),
    itemsCount: Math.max(0, Math.floor(pickNumber(cart.total_items, cart.items_count, items.length))),
    createdAt: pickString(cart.created_at, cart.createdAt),
    itemsPreview,
  };
};

export const toCartDetail = (cart: Record<string, unknown>): CartDetailView => {
  const items = extractCartItems(cart).map((item) => {
    const product = isRecord(item.product) ? item.product : null;
    const unitPrice = pickNumber(
      item.price,
      item.unit_price,
      item.base_price,
      item.product_cart_price,
      product?.price,
      0,
    );
    const quantity = Math.max(1, Math.floor(pickNumber(item.quantity, item.qty, 1)));
    const lineTotal = pickNumber(
      item.line_total,
      item.total_amount,
      item.final_line_total,
      unitPrice * quantity,
    );
    const finalLineTotal = pickNumber(item.final_line_total, lineTotal);
    const optionsRaw = item.options;
    const options = Array.isArray(optionsRaw)
      ? optionsRaw.filter(isRecord).map((option) => {
          const optionProduct = isRecord(option.product) ? option.product : null;
          return {
            productFranchiseId: pickString(option.product_franchise_id),
            productName: pickString(option.product_name, option.name, optionProduct?.name),
            quantity: Math.max(1, Math.floor(pickNumber(option.quantity, 1))),
            priceSnapshot: pickNumber(option.price_snapshot, option.price, 0),
            discountAmount: pickNumber(option.discount_amount, 0),
            finalPrice: pickNumber(option.final_price, option.price_snapshot, option.price, 0),
          };
        })
      : [];

    return {
      id: pickString(item.cart_item_id, item.id, item._id, item.cartItemId),
      productId: pickString(item.product_id, item.productId, product?.product_id, product?.id),
      productFranchiseId: pickString(
        item.product_franchise_id,
        item.productFranchiseId,
        product?.product_franchise_id,
        product?.franchise_product_id,
        item.franchise_product_id,
        item.size_id,
        item.variant_id,
      ),
      name: pickString(item.name, item.product_name, product?.name),
      sku: pickString(item.SKU, item.sku, product?.SKU),
      imageUrl: pickString(item.image_url, product?.image_url),
      quantity,
      unitPrice,
      discountAmount: pickNumber(item.discount_amount, 0),
      finalLineTotal,
      lineTotal,
      optionsHash: pickString(item.options_hash),
      note: pickString(item.note),
      options,
    };
  });

  const promotionDiscount = pickNumber(cart.promotion_discount, 0);
  const voucherDiscount = pickNumber(cart.voucher_discount, 0);
  const loyaltyPointsUsed = pickNumber(cart.loyalty_points_used, 0);
  const loyaltyDiscount = pickNumber(cart.loyalty_discount, 0);
  const subtotalAmount = pickNumber(
    cart.subtotal_amount,
    items.reduce((sum, item) => sum + item.lineTotal, 0),
  );
  const finalAmount = pickNumber(
    cart.final_amount,
    subtotalAmount - promotionDiscount - voucherDiscount - loyaltyDiscount,
  );

  return {
    id: pickString(cart.id, cart._id, cart.cart_id),
    customerId: pickString(cart.customer_id),
    customerName: pickString(cart.customer_name),
    franchiseId: pickString(cart.franchise_id, cart.franchiseId),
    franchiseName: pickString(cart.franchise_name),
    status: pickString(cart.status, 'ACTIVE'),
    address: pickString(cart.address),
    phone: pickString(cart.phone),
    note: pickString(cart.note),
    promotionDiscount,
    voucherDiscount,
    loyaltyPointsUsed,
    loyaltyDiscount,
    subtotalAmount,
    finalAmount,
    totalAmount: pickNumber(
      cart.final_amount,
      cart.total_amount,
      cart.subtotal_amount,
      cart.totalAmount,
      cart.grand_total,
      items.reduce((sum, item) => sum + item.lineTotal, 0),
    ),
    items,
  };
};
