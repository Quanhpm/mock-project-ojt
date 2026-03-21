import type {
  PosCategory,
  PosProduct,
  PosProductFranchiseLookupItem,
  PosProductSize,
  PosToppingProduct,
} from "../models/menu.models";

const TOPPING_KEYWORD = "topping";

const normalizeText = (value?: string) => value?.trim().toLowerCase() ?? "";

const getToppingConstraints = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  if (typeof value === "string" && value.trim().length > 0 && value.toLowerCase() !== "false") {
    return [value];
  }

  return [];
};

const resolveToppingSupport = (value: unknown) => {
  if (typeof value === "boolean") {
    return value;
  }

  return getToppingConstraints(value).length > 0;
};

export const isToppingCategory = (category: {
  category_name?: string;
  category_code?: string;
}) => {
  const categoryName = normalizeText(category.category_name);
  const categoryCode = normalizeText(category.category_code);

  return (
    categoryName.includes(TOPPING_KEYWORD) ||
    categoryCode.includes(TOPPING_KEYWORD)
  );
};

export const getDefaultProductSize = (product: PosProduct | null) => {
  if (!product) {
    return null;
  }

  return product.sizes.find((size) => size.is_available) ?? product.sizes[0] ?? null;
};

export const productSupportsToppings = (product: PosProduct | null) => {
  if (!product) {
    return false;
  }

  return resolveToppingSupport(product.is_have_topping as unknown);
};

const buildToppingProduct = (product: PosProduct): PosToppingProduct | null => {
  const availableSize = getDefaultProductSize(product);

  if (!availableSize) {
    return null;
  }

  return {
    product_id: product.product_id,
    category_id: product.category_id,
    category_name: product.category_name,
    name: product.name,
    image_url: product.image_url,
    product_franchise_id: availableSize.product_franchise_id,
    price: availableSize.price,
    is_available: availableSize.is_available,
  };
};

const buildProductFranchiseLookup = (products: PosProduct[]) => {
  return products.reduce<Record<string, PosProductFranchiseLookupItem>>((lookup, product) => {
    product.sizes.forEach((size) => {
      lookup[size.product_franchise_id] = {
        product_id: product.product_id,
        category_id: product.category_id,
        category_name: product.category_name,
        product_name: product.name,
        product_image_url: product.image_url,
        product_franchise_id: size.product_franchise_id,
        size_label: size.size,
        price: size.price,
        is_available: size.is_available,
      };
    });

    return lookup;
  }, {});
};

export const splitMenuCatalog = (
  categories: PosCategory[],
  products: PosProduct[],
) => {
  const toppingCategoryIds = new Set(
    categories.filter((category) => isToppingCategory(category)).map((category) => category.category_id),
  );

  const saleCategories = categories.filter((category) => !toppingCategoryIds.has(category.category_id));
  const toppingCategories = categories.filter((category) => toppingCategoryIds.has(category.category_id));
  const saleProducts = products.filter((product) => !toppingCategoryIds.has(product.category_id));
  const toppingProducts = products
    .filter((product) => toppingCategoryIds.has(product.category_id))
    .map(buildToppingProduct)
    .filter((product): product is PosToppingProduct => Boolean(product));

  return {
    saleCategories,
    saleProducts,
    toppingCategories,
    toppingProducts,
    productFranchiseLookup: buildProductFranchiseLookup(products),
  };
};

export const filterAllowedToppingProducts = (
  product: PosProduct,
  toppingProducts: PosToppingProduct[],
) => {
  if (!productSupportsToppings(product)) {
    return [];
  }

  const constraints = getToppingConstraints(product.is_have_topping as unknown);

  if (constraints.length === 0) {
    return toppingProducts;
  }

  const filteredToppings = toppingProducts.filter((topping) => {
    return (
      constraints.includes(topping.category_id) ||
      constraints.includes(topping.product_id) ||
      constraints.includes(topping.product_franchise_id)
    );
  });

  return filteredToppings.length > 0 ? filteredToppings : toppingProducts;
};

export const resolveProductSizeLabel = (
  productFranchiseLookup: Record<string, PosProductFranchiseLookupItem>,
  productFranchiseId: string,
) => {
  return productFranchiseLookup[productFranchiseId]?.size_label;
};

export const resolveProductPrice = (
  productFranchiseLookup: Record<string, PosProductFranchiseLookupItem>,
  productFranchiseId: string,
) => {
  return productFranchiseLookup[productFranchiseId]?.price ?? 0;
};

export type PosProductCatalogSelection = {
  product: PosProduct;
  size: PosProductSize;
  quantity: number;
  note: string;
  toppings: Array<{
    topping: PosToppingProduct;
    quantity: number;
  }>;
};
