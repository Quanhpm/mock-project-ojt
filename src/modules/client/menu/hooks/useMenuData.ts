import { useState, useEffect } from "react"
import { useStore } from "../hooks/useStore"
import { getAllFranchises, getAllCategoriesByFranchise, getMenuByFranchise } from "@/apis/endpointsCLIENT/client.api";
import { type FranchiseResponse, type CategoryResponse, type MenuByFranchise } from "@/apis/endpointsCLIENT/client.api";

export function useMenuData() {
    // franchise
    const { franchiseId, setFranchiseId } = useStore();
    const [franchises, setFranchises] = useState<FranchiseResponse[]>([]);
    const fetchFranchises = async () => {
        try {
            const response = await getAllFranchises();
            setFranchises(response || []);
            const savedFranchiseId = franchiseId;
            if (savedFranchiseId) {
                setFranchiseId(savedFranchiseId);
            } else {
                setFranchiseId(response && response.length > 0 ? response[0].id : '');
            }
        } catch (error) {
            console.error("Failed to fetch franchises:", error);
        }
    };

    // categories
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const fetchCategories = async (franchiseId: string) => {
        try {
            const response = await getAllCategoriesByFranchise(franchiseId);
            const category = response;
            if (category) {
                const filteredCategory = category.filter((item) => !item.category_name?.toLowerCase().includes("topping"))
                setCategories(filteredCategory)
            }
            else setCategories([]);
        }
        catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    }

    // products
    const [products, setProducts] = useState<MenuByFranchise[]>([]);
    const fetchAllProducts = async (franchiseId: string) => {
        try {
            const response = await getMenuByFranchise(franchiseId, "");
            const product = response;
            if (product) {
                const filteredProduct = product.filter((item) => !item.category_name?.toLowerCase().includes("topping"))
                setProducts(filteredProduct);
            } else setProducts([]);
        }
        catch (error) {
            console.error("Failed to fetch products:", error);
        }
    }
    // Lọc product theo category
    const getProductByCategory = (categoryId: string) => {
        const category = products.find(item => item.category_id === categoryId);
        return category ? category.products : [];
    };

    // Lấy data franchise (chỉ lấy 1 lần)
    useEffect(() => {
        const fetchData = async () => {
            await fetchFranchises();
        }
        fetchData();
    }, []);
    // Lấy data category và product (đổi theo franchise)
    useEffect(() => {
        if (!franchiseId) return; // Skip if franchiseId is empty

        const fetchData = async () => {
            await fetchCategories(franchiseId);
            await fetchAllProducts(franchiseId);
        };
        fetchData();
    }, [franchiseId]);

    return { franchises, categories, products, getProductByCategory}
}