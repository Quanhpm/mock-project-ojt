import { useCallback, useMemo, useState } from "react";
import type { PosProduct, PosProductSize, PosToppingProduct } from "../models/menu.models";
import {
  filterAllowedToppingProducts,
  getDefaultProductSize,
  productSupportsToppings,
  type PosProductCatalogSelection,
} from "../services/menu-catalog.service";

type SelectedToppingMap = Record<string, number>;

interface PosProductConfiguratorInitialState {
  selectedSizeId?: string;
  quantity?: number;
  note?: string;
  selectedToppings?: SelectedToppingMap;
}

export const usePosProductConfigurator = (toppingProducts: PosToppingProduct[]) => {
  const [activeProduct, setActiveProduct] = useState<PosProduct | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [selectedToppings, setSelectedToppings] = useState<SelectedToppingMap>({});

  const resetConfigurator = useCallback(() => {
    setActiveProduct(null);
    setSelectedSizeId("");
    setQuantity(1);
    setNote("");
    setSelectedToppings({});
  }, []);

  const initializeConfigurator = useCallback(
    (product: PosProduct, initialState?: PosProductConfiguratorInitialState) => {
      const defaultSize = getDefaultProductSize(product);
      const nextSelectedSizeId =
        initialState?.selectedSizeId &&
        product.sizes.some((size) => size.product_franchise_id === initialState.selectedSizeId)
          ? initialState.selectedSizeId
          : defaultSize?.product_franchise_id ?? "";

      setActiveProduct(product);
      setSelectedSizeId(nextSelectedSizeId);
      setQuantity(Math.max(1, initialState?.quantity ?? 1));
      setNote(initialState?.note ?? "");
      setSelectedToppings(initialState?.selectedToppings ?? {});
    },
    [],
  );

  const openConfigurator = useCallback(
    (product: PosProduct) => {
      initializeConfigurator(product);
    },
    [initializeConfigurator],
  );

  const openConfiguratorForEdit = useCallback(
    (product: PosProduct, initialState: PosProductConfiguratorInitialState) => {
      initializeConfigurator(product, initialState);
    },
    [initializeConfigurator],
  );

  const closeConfigurator = useCallback(() => {
    resetConfigurator();
  }, [resetConfigurator]);

  const selectedSize = useMemo<PosProductSize | null>(() => {
    if (!activeProduct) {
      return null;
    }

    return (
      activeProduct.sizes.find((size) => size.product_franchise_id === selectedSizeId) ??
      getDefaultProductSize(activeProduct)
    );
  }, [activeProduct, selectedSizeId]);

  const supportsToppings = useMemo(() => {
    return productSupportsToppings(activeProduct);
  }, [activeProduct]);

  const availableToppings = useMemo(() => {
    if (!activeProduct) {
      return [];
    }

    return filterAllowedToppingProducts(activeProduct, toppingProducts);
  }, [activeProduct, toppingProducts]);

  const toppingGroups = useMemo(() => {
    const groups = new Map<
      string,
      { categoryId: string; categoryName: string; items: PosToppingProduct[] }
    >();

    availableToppings.forEach((topping) => {
      const existingGroup = groups.get(topping.category_id);

      if (existingGroup) {
        existingGroup.items.push(topping);
        return;
      }

      groups.set(topping.category_id, {
        categoryId: topping.category_id,
        categoryName: topping.category_name,
        items: [topping],
      });
    });

    return Array.from(groups.values());
  }, [availableToppings]);

  const selectedToppingItems = useMemo<PosProductCatalogSelection["toppings"]>(() => {
    return availableToppings
      .filter((topping) => (selectedToppings[topping.product_franchise_id] ?? 0) > 0)
      .map((topping) => ({
        topping,
        quantity: selectedToppings[topping.product_franchise_id],
      }));
  }, [availableToppings, selectedToppings]);

  const totalPrice = useMemo(() => {
    if (!selectedSize) {
      return 0;
    }

    const toppingsTotal = selectedToppingItems.reduce((sum, item) => {
      return sum + item.topping.price * item.quantity;
    }, 0);

    return (selectedSize.price + toppingsTotal) * quantity;
  }, [quantity, selectedSize, selectedToppingItems]);

  const increaseQuantity = useCallback(() => {
    setQuantity((current) => current + 1);
  }, []);

  const decreaseQuantity = useCallback(() => {
    setQuantity((current) => Math.max(1, current - 1));
  }, []);

  const setSelectedSize = useCallback((productFranchiseId: string) => {
    setSelectedSizeId(productFranchiseId);
  }, []);

  const increaseToppingQuantity = useCallback((productFranchiseId: string) => {
    setSelectedToppings((current) => ({
      ...current,
      [productFranchiseId]: (current[productFranchiseId] ?? 0) + 1,
    }));
  }, []);

  const decreaseToppingQuantity = useCallback((productFranchiseId: string) => {
    setSelectedToppings((current) => {
      const nextQuantity = Math.max(0, (current[productFranchiseId] ?? 0) - 1);

      if (nextQuantity === 0) {
        const rest = { ...current };
        delete rest[productFranchiseId];
        return rest;
      }

      return {
        ...current,
        [productFranchiseId]: nextQuantity,
      };
    });
  }, []);

  const buildSelection = useCallback((): PosProductCatalogSelection | null => {
    if (!activeProduct || !selectedSize) {
      return null;
    }

    return {
      product: activeProduct,
      size: selectedSize,
      quantity,
      note,
      toppings: selectedToppingItems,
    };
  }, [activeProduct, note, quantity, selectedSize, selectedToppingItems]);

  return {
    isOpen: Boolean(activeProduct),
    activeProduct,
    selectedSize,
    quantity,
    note,
    supportsToppings,
    toppingGroups,
    selectedToppings,
    totalPrice,
    openConfigurator,
    openConfiguratorForEdit,
    closeConfigurator,
    resetConfigurator,
    setSelectedSize,
    setNote,
    increaseQuantity,
    decreaseQuantity,
    increaseToppingQuantity,
    decreaseToppingQuantity,
    buildSelection,
  };
};
