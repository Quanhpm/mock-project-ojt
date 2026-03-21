import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast.hook";
import type {
  PosCategory,
  PosProduct,
  PosProductFranchiseLookupItem,
  PosToppingProduct,
} from "../models/menu.models";
import { splitMenuCatalog } from "../services/menu-catalog.service";
import { menuService } from "../services/menu.service";

export const usePosMenuData = (franchiseId: string | null) => {
  const { error: showError } = useToast();
  const [categories, setCategories] = useState<PosCategory[]>([]);
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [toppingCategories, setToppingCategories] = useState<PosCategory[]>([]);
  const [toppingProducts, setToppingProducts] = useState<PosToppingProduct[]>([]);
  const [productFranchiseLookup, setProductFranchiseLookup] = useState<
    Record<string, PosProductFranchiseLookupItem>
  >({});
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  const loadMenu = useCallback(async () => {
    if (!franchiseId) {
      setCategories([]);
      setProducts([]);
      setToppingCategories([]);
      setToppingProducts([]);
      setProductFranchiseLookup({});
      setIsLoadingMenu(false);
      return;
    }

    try {
      setIsLoadingMenu(true);
      const [categoryData, productData] = await Promise.all([
        menuService.getCategoriesByFranchise(franchiseId),
        menuService.getProductsByFranchise(franchiseId),
      ]);

      const nextCategories = [...(categoryData ?? [])].sort(
        (left, right) => left.display_order - right.display_order,
      );

      const nextProducts = [...(productData ?? [])].sort((left, right) => {
        if (left.category_display_order !== right.category_display_order) {
          return left.category_display_order - right.category_display_order;
        }

        return left.product_display_order - right.product_display_order;
      });

      const nextCatalog = splitMenuCatalog(nextCategories, nextProducts);

      setCategories(nextCatalog.saleCategories);
      setProducts(nextCatalog.saleProducts);
      setToppingCategories(nextCatalog.toppingCategories);
      setToppingProducts(nextCatalog.toppingProducts);
      setProductFranchiseLookup(nextCatalog.productFranchiseLookup);
    } catch (error) {
      console.error("[OrderPOS] Failed to load menu", error);
      showError("Không tải được menu của chi nhánh");
      setCategories([]);
      setProducts([]);
      setToppingCategories([]);
      setToppingProducts([]);
      setProductFranchiseLookup({});
    } finally {
      setIsLoadingMenu(false);
    }
  }, [franchiseId, showError]);

  useEffect(() => {
    void loadMenu();
  }, [loadMenu]);

  return {
    categories,
    products,
    toppingCategories,
    toppingProducts,
    productFranchiseLookup,
    isLoadingMenu,
    reloadMenu: loadMenu,
  };
};
