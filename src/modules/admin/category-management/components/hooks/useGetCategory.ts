import { useState, useEffect } from "react";
import { getCategoryFranchiseById } from "../../api/category-franchise.api";
import { useToast } from "@/hooks/use-toast.hook";
import type { CategoryFranchise } from "../../api/category-franchise.types";

export const useGetCategory = (id: string | undefined) => {
  const [category, setCategory] = useState<CategoryFranchise | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { error: showError } = useToast();

  useEffect(() => {
    if (!id) return;

    const fetchCategory = async () => {
      setIsLoading(true);
      try {
        const data = await getCategoryFranchiseById(id);
        setCategory(data);
      } catch (error) {
        showError("Failed to load category information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { category, isLoading };
};
