import type { MenuByFranchise, MenuProduct } from "@/apis/endpointsCLIENT/client.api";
import { useState } from "react"

export function useProductSearch(products: MenuByFranchise[]) {
    const [search, setSearch] = useState<string>('');
    const [filteredProducts, setFilteredProducts] = useState<MenuProduct[]>([]); // Lưu kết quả tìm kiếm
    const [showSearchResults, setShowSearchResults] = useState<boolean>(false); // Hiển thị kết quả tìm kiếm

    // // Filter search
    const filterProductsBySearch = (searchTerm: string): MenuProduct[] => {
        return products.flatMap((category) =>
            category.products.filter(
                (product) =>
                    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    category.category_name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    };

    // Hàm xử lý khi người dùng nhấn Enter
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') { // Kiểm tra xem phím nhấn có phải là Enter
            const results = filterProductsBySearch(search);
            setFilteredProducts(results); // Cập nhật danh sách sản phẩm đã lọc
            setShowSearchResults(true);
        }
    };
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value;
        setSearch(searchTerm);
        // Ẩn kết quả tìm kiếm khi người dùng thay đổi nội dung
        if (searchTerm === '') {
            setShowSearchResults(false); // Ẩn kết quả khi ô tìm kiếm trống
        }
    };
    return {search, filteredProducts, showSearchResults, handleSearchChange, handleKeyDown}
}