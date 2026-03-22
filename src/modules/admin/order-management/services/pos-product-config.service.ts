import type { CartItem, CartItemOption } from "../models/cart.models";
import type { StaffCartItemInput } from "../models/request.models";
import type { PosProductCatalogSelection } from "./menu-catalog.service";

const hashString = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
};

const normalizeNote = (note: string) => note.trim();

const normalizeOptionInputs = (
  options: Array<{ product_franchise_id: string; quantity: number }> | undefined,
) => {
  return [...(options ?? [])]
    .filter((option) => option.quantity > 0)
    .sort((left, right) => left.product_franchise_id.localeCompare(right.product_franchise_id));
};

const normalizeToppings = (selection: PosProductCatalogSelection) => {
  return [...selection.toppings].sort((left, right) =>
    left.topping.product_franchise_id.localeCompare(right.topping.product_franchise_id),
  );
};

const buildOptionsHash = (selection: PosProductCatalogSelection) => {
  const sortedToppings = normalizeToppings(selection);

  if (sortedToppings.length === 0) {
    return "";
  }

  return sortedToppings
    .map(({ topping, quantity }) => `${topping.product_franchise_id}:${quantity}`)
    .join("|");
};

const buildDraftItemIdentity = (selection: PosProductCatalogSelection) => {
  const note = normalizeNote(selection.note);
  const optionsHash = buildOptionsHash(selection);
  const rawSignature = [selection.size.product_franchise_id, note, optionsHash].join("::");

  return hashString(rawSignature);
};

const buildCartItemOptions = (selection: PosProductCatalogSelection): CartItemOption[] => {
  return normalizeToppings(selection).map(({ topping, quantity }) => ({
    quantity,
    product_franchise_id: topping.product_franchise_id,
    price_snapshot: topping.price,
    discount_amount: 0,
    final_price: topping.price,
    product_name: topping.name,
    product_image_url: topping.image_url,
    product: {
      name: topping.name,
      image_url: topping.image_url,
    },
  }));
};

const getPerUnitTotal = (selection: PosProductCatalogSelection) => {
  const toppingTotal = selection.toppings.reduce((sum, item) => {
    return sum + item.topping.price * item.quantity;
  }, 0);

  return selection.size.price + toppingTotal;
};

export const buildDraftCartItemFromConfiguredProduct = (
  selection: PosProductCatalogSelection,
): CartItem => {
  const normalizedNote = normalizeNote(selection.note);
  const options = buildCartItemOptions(selection);
  const perUnitTotal = getPerUnitTotal(selection);
  const totalPrice = perUnitTotal * selection.quantity;

  return {
    cart_item_id: `draft-${buildDraftItemIdentity(selection)}`,
    quantity: selection.quantity,
    product_franchise_id: selection.size.product_franchise_id,
    product_cart_price: selection.size.price,
    discount_amount: 0,
    line_total: totalPrice,
    final_line_total: totalPrice,
    options_hash: buildOptionsHash(selection),
    note: normalizedNote,
    product_name: selection.product.name,
    product_image_url: selection.product.image_url,
    product: {
      name: selection.product.name,
      image_url: selection.product.image_url,
    },
    selected_size_label: selection.size.size,
    options,
  };
};

export const buildStaffCartItemInputFromConfiguredProduct = (
  selection: PosProductCatalogSelection,
): StaffCartItemInput => {
  const normalizedNote = normalizeNote(selection.note);

  return {
    product_franchise_id: selection.size.product_franchise_id,
    quantity: selection.quantity,
    note: normalizedNote,
    options: selection.toppings.map(({ topping, quantity }) => ({
      product_franchise_id: topping.product_franchise_id,
      quantity,
    })),
  };
};

export const buildStaffCartItemInputFromCartItem = (item: CartItem): StaffCartItemInput => {
  return {
    product_franchise_id: item.product_franchise_id,
    quantity: item.quantity,
    note: normalizeNote(item.note),
    options: normalizeOptionInputs(
      item.options.map((option) => ({
        product_franchise_id: option.product_franchise_id,
        quantity: option.quantity,
      })),
    ),
  };
};

export const buildStaffCartItemConfigKey = (
  input: Pick<StaffCartItemInput, "product_franchise_id" | "note" | "options">,
) => {
  return [
    input.product_franchise_id,
    normalizeNote(input.note ?? ""),
    normalizeOptionInputs(input.options)
      .map((option) => `${option.product_franchise_id}:${option.quantity}`)
      .join("|"),
  ].join("::");
};

export const buildSelectedToppingMapFromCartItem = (item: CartItem) => {
  return item.options.reduce<Record<string, number>>((accumulator, option) => {
    if (option.quantity > 0) {
      accumulator[option.product_franchise_id] = option.quantity;
    }

    return accumulator;
  }, {});
};

export const buildStaffCartItemInputsFromDraftItems = (
  draftItems: CartItem[],
): StaffCartItemInput[] => {
  return draftItems.map((item) => ({
    product_franchise_id: item.product_franchise_id,
    quantity: item.quantity,
    note: normalizeNote(item.note),
    options: item.options.map((option) => ({
      product_franchise_id: option.product_franchise_id,
      quantity: option.quantity,
    })),
  }));
};
