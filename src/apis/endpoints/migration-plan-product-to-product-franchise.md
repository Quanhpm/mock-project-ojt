# KẾ HOẠCH CHUYỂN ĐỔI API: Product → Product-Franchise

## 🎯 Mục tiêu

Chuyển toàn bộ module quản lý sản phẩm (Product Management) từ API `/products` sang API `/product-franchises/search` để lọc sản phẩm theo chi nhánh hiện tại của user.

---

## 📦 CÁC FILE CẦN CHỈNH SỬA

### 1. API Layer (Core)

- ✅ `src/apis/endpoints/product-franchise.api.ts` - **Đã có sẵn, không cần sửa**
- 📝 `src/apis/endpoints/index.ts` - **Cần export thêm**

### 2. Module Product Management (Main Changes)

- 🔧 `src/modules/admin/product-management/components/product.api.ts` - **Thay thế searchProducts**
- 🔧 `src/modules/admin/product-management/components/product.types.ts` - **Cập nhật types**
- 🔧 `src/modules/admin/product-management/hooks/use-product-search.hook.ts` - **Logic lấy franchise_id**

### 3. Components sử dụng API (6 hooks)

- `src/modules/admin/product-management/components/hooks/useGetProducts.ts`
- `src/modules/admin/product-management/components/hooks/use-product-search.hook.ts`
- Các hooks khác (nếu có sử dụng searchProducts)

---

## 🔍 PHÂN TÍCH DỮ LIỆU HIỆN TẠI

### Store Structure (Zustand)

```typescript
// File: src/modules/admin/auth-admin/stores/admin-auth.store.ts
interface AdminAuthState {
  admin: UserInfo | null;
  roles: UserRoleItem[];
  activeContext: ActiveContext | null; // ← Chứa franchise_id
}

// Getter có sẵn:
export const getFranchiseId = (state: AdminAuthState): string | null => {
  if (state.activeContext?.franchiseId) return state.activeContext.franchiseId;
  if (state.roles.length > 0) return state.roles[0].franchise_id;
  return null;
};
```

### API Endpoints Comparison

| Tiêu chí               | API Cũ (`/products`) | API Mới (`/product-franchises`)   |
| ---------------------- | -------------------- | --------------------------------- |
| **Endpoint**           | `GET /products`      | `POST /product-franchises/search` |
| **Method**             | GET                  | POST                              |
| **Payload**            | Query params         | Body JSON với `searchCondition`   |
| **Filter Franchise**   | ❌ Không có          | ✅ Có field `franchise_id`        |
| **Response Structure** | `Product[]`          | `ProductFranchise[]`              |

---

## 📝 CHI TIẾT TỪNG BƯỚC THỰC HIỆN

---

## BƯỚC 1: Cập nhật Export API Endpoint

**File:** `src/apis/endpoints/index.ts`

**Thao tác:** Thêm export cho product-franchise API

```typescript
// ... existing exports
export * from "./product-franchise.api"; // ← THÊM DÒNG NÀY
```

**Lý do:** Cho phép import `searchProductFranchises` từ `@/apis/endpoints`

---

## BƯỚC 2: Cập nhật Types cho ProductFranchise

**File:** `src/modules/admin/product-management/components/product.types.ts`

**Thao tác:** Thêm interface cho ProductFranchise và cập nhật Search Payload

```typescript
// ✨ THÊM MỚI: Interface ProductFranchise
export interface ProductFranchise {
  id: string;
  product_id: string;
  product_name: string; // ← Backend trả về thêm
  franchise_id: string;
  franchise_name: string; // ← Backend trả về thêm
  size: string;
  price_base: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

// 🔧 CẬP NHẬT: Search Payload thêm franchise_id
export interface ProductSearchPayload {
  searchCondition?: {
    keyword?: string;
    franchise_id?: string; // ← THÊM DÒNG NÀY
    product_id?: string; // ← THÊM DÒNG NÀY
    size?: string; // ← THÊM DÒNG NÀY
    price_from?: number;
    price_to?: number;
    min_price?: number;
    max_price?: number;
    is_active?: boolean;
    is_deleted?: boolean;
  };
  pageInfo?: {
    pageNum: number;
    pageSize: number;
  };
}

// 🔧 CẬP NHẬT: Response trả về ProductFranchise thay vì Product
export interface ProductSearchResponse {
  success: boolean;
  data: ProductFranchise[]; // ← ĐỔI TỪ Product[] SANG ProductFranchise[]
  pageInfo?: {
    pageNum: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  message?: string;
}
```

**Lưu ý quan trọng:**

- `ProductFranchise` khác với `Product`: có thêm `franchise_id`, `size`, `price_base`
- Backend trả về thêm `product_name` và `franchise_name` (populate từ join)

---

## BƯỚC 3: Thay thế API Call trong product.api.ts

**File:** `src/modules/admin/product-management/components/product.api.ts`

**Thao tác:** Đổi từ `/products/search` sang `/product-franchises/search`

```typescript
import { httpClient } from "@/apis";
import type {
  ProductFranchise, // ← ĐỔI TỪ Product
  ProductCreatePayload,
  ProductUpdatePayload,
  ProductSearchPayload,
  ProductSearchResponse,
  ProductStatusPayload,
} from "./product.types";

// 🔧 THAY ĐỔI FUNCTION NÀY
export const searchProducts = (
  payload: ProductSearchPayload,
): Promise<ProductSearchResponse> => {
  return httpClient.post<ProductFranchise[], ProductSearchPayload>({
    // ← ĐỔI TYPE
    url: "/product-franchises/search", // ← ĐỔI URL
    data: payload,
  }) as Promise<ProductSearchResponse>;
};

// Các functions khác giữ nguyên (create, update, delete, restore, toggleStatus)
// vì chúng vẫn dùng endpoint /products
```

**Hoặc nếu muốn tách biệt rõ ràng hơn:**

```typescript
// Import API từ endpoints chung
import { searchProductFranchises } from "@/apis/endpoints/product-franchise.api";

// Wrapper để giữ tên function cũ (tùy chọn)
export const searchProducts = searchProductFranchises;
```

---

## BƯỚC 4: Cập nhật Hook - use-product-search.hook.ts

**File:** `src/modules/admin/product-management/hooks/use-product-search.hook.ts`

**Thao tác:** Lấy `franchise_id` từ Zustand Store và inject vào payload

```typescript
import { useState, useEffect, useCallback } from "react";
import { searchProducts } from "../components/product.api";
import type {
  ProductFranchise, // ← ĐỔI TỪ Product
  ProductSearchPayload,
} from "../components/product.types";
import { useToast } from "@/hooks/use-toast.hook";
import {
  useAdminAuthStore,
  getFranchiseId, // ← IMPORT THÊM GETTER
} from "@/modules/admin/auth-admin/stores/admin-auth.store";

// ... existing code ...

interface UseProductSearchReturn {
  products: ProductFranchise[]; // ← ĐỔI TYPE
  // ... rest of interface
}

export const useProductSearch = (): UseProductSearchReturn => {
  // 🆕 LẤY FRANCHISE_ID TỪ STORE
  const franchiseId = useAdminAuthStore(getFranchiseId); // ← THÊM DÒNG NÀY

  const [products, setProducts] = useState<ProductFranchise[]>([]); // ← ĐỔI TYPE
  // ... existing state ...

  const executeSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 🔧 INJECT franchise_id VÀO PAYLOAD
      const payload: ProductSearchPayload = {
        searchCondition: {
          ...filters,
          franchise_id: franchiseId || undefined, // ← THÊM DÒNG NÀY
          // Chuyển đổi string sang boolean nếu cần
          is_active:
            filters.is_active === "" ? undefined : filters.is_active === "true",
          is_deleted: filters.is_deleted,
        },
        pageInfo: {
          pageNum: currentPage,
          pageSize: pageSize,
        },
      };

      const response = await searchProducts(payload);

      if (response.success) {
        setProducts(response.data);
        setTotalPages(response.pageInfo?.totalPages || 1);
        setTotalItems(response.pageInfo?.totalItems || 0);
      }
    } catch (err: any) {
      setError(err.message || "Failed to search products");
      toast.error("Search failed", err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage, pageSize, franchiseId, toast]); // ← THÊM franchiseId VÀO DEPS

  // ... rest of the code
};
```

**Điểm quan trọng:**

1. `getFranchiseId` trả về `string | null`
2. Nếu `franchiseId = null` → Backend sẽ trả về toàn bộ sản phẩm (không filter)
3. Thêm `franchiseId` vào dependency array của `useCallback`

---

## BƯỚC 5: Cập nhật Components sử dụng Product

**File:** `src/modules/admin/product-management/components/hooks/useGetProducts.ts`

```typescript
import { useEffect, useState } from "react";
import { searchProducts } from "../product.api";
import type { ProductFranchise } from "../product.types"; // ← ĐỔI TYPE
import {
  useAdminAuthStore,
  getFranchiseId,
} from "@/modules/admin/auth-admin/stores/admin-auth.store";

export const useGetProducts = () => {
  const [products, setProducts] = useState<ProductFranchise[]>([]); // ← ĐỔI TYPE
  const [isLoading, setIsLoading] = useState(false);
  const franchiseId = useAdminAuthStore(getFranchiseId); // ← THÊM DÒNG NÀY

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await searchProducts({
          searchCondition: {
            franchise_id: franchiseId || undefined, // ← THÊM FILTER
            is_deleted: false,
          },
          pageInfo: {
            pageNum: 1,
            pageSize: 100,
          },
        });

        if (response.success) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [franchiseId]); // ← THÊM DEPENDENCY

  return { products, isLoading };
};
```

---

## BƯỚC 6: Cập nhật UI Components (nếu cần)

**File:** `src/modules/admin/product-management/components/ProductTable.tsx`

**Thay đổi columns nếu cần hiển thị thêm:**

```typescript
import type { ProductFranchise } from "./product.types";

interface ProductTableProps {
  products: ProductFranchise[]; // ← ĐỔI TYPE
  // ...
}

export const ProductTable = ({ products }: ProductTableProps) => {
  return (
    <Table>
      {/* Có thể hiển thị thêm: */}
      <Column header="Size">{(item) => item.size}</Column>
      <Column header="Price Base">{(item) => item.price_base}</Column>
      <Column header="Franchise">{(item) => item.franchise_name}</Column>
      {/* ... */}
    </Table>
  );
};
```

---

## 🧪 BƯỚC 7: Testing & Verification

### Test Cases:

1. **Test với user có franchise_id:**
   - Login với admin thuộc chi nhánh cụ thể
   - Vào trang Product Management
   - Verify: Chỉ hiển thị sản phẩm của chi nhánh đó

2. **Test với user có multiple franchises:**
   - Switch giữa các chi nhánh
   - Verify: Danh sách sản phẩm thay đổi theo

3. **Test với user SYSTEM (không có franchise_id):**
   - Login với tài khoản SYSTEM
   - Verify: Hiển thị toàn bộ sản phẩm của tất cả chi nhánh

4. **Test Pagination:**
   - Verify pageInfo vẫn hoạt động đúng

5. **Test Search Filters:**
   - Test keyword search
   - Test price range
   - Test status filter (active/deleted)

### Console Debugging:

```typescript
// Thêm vào executeSearch để debug
console.log("🔍 Search Payload:", {
  franchise_id: franchiseId,
  filters: filters,
  page: currentPage,
});

console.log("📦 API Response:", response);
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Backend Response Structure

Đảm bảo Backend trả về đầy đủ fields:

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "product_id": "...",
      "product_name": "Coffee Latte",
      "franchise_id": "...",
      "franchise_name": "HCM Branch",
      "size": "M",
      "price_base": 45000,
      "is_active": true,
      "is_deleted": false
    }
  ],
  "pageInfo": { ... }
}
```

### 2. Null Handling

```typescript
franchise_id: franchiseId || undefined; // ← Dùng undefined thay vì null
```

- Backend cần xử lý: nếu `franchise_id = undefined` → không filter

### 3. Type Safety

- Tất cả `Product` → `ProductFranchise`
- Import đúng type từ `product.types.ts`

### 4. Migration Path

- Có thể giữ cả 2 API tạm thời:
  ```typescript
  export const searchProducts = searchProductFranchises; // NEW
  export const searchProductsLegacy = searchProductsOldImplementation; // OLD (backup)
  ```

---

## 🎯 TÓM TẮT CHECKLIST

- [ ] **Step 1:** Export `product-franchise.api` trong `endpoints/index.ts`
- [ ] **Step 2:** Thêm `ProductFranchise` interface vào `product.types.ts`
- [ ] **Step 3:** Cập nhật `ProductSearchPayload` với field `franchise_id`
- [ ] **Step 4:** Đổi URL trong `searchProducts()` từ `/products` → `/product-franchises/search`
- [ ] **Step 5:** Import `getFranchiseId` từ `admin-auth.store`
- [ ] **Step 6:** Inject `franchiseId` vào payload trong `use-product-search.hook.ts`
- [ ] **Step 7:** Cập nhật các hooks khác: `useGetProducts.ts`, etc.
- [ ] **Step 8:** Cập nhật UI nếu cần hiển thị thêm `size`, `price_base`, `franchise_name`
- [ ] **Step 9:** Test 4 kịch bản: có franchise, switch franchise, SYSTEM user, pagination
- [ ] **Step 10:** Verify Console logs và Network tab

---

## 📚 TÀI LIỆU THAM KHẢO

- API Documentation: [product-franchise.md](./product-franchise.md)
- Zustand Store: `src/modules/admin/auth-admin/stores/admin-auth.store.ts`
- Current Implementation: `src/modules/admin/product-management/components/product.api.ts`

---

## 🔄 LUỒNG THÔNG TIN CHI TIẾT (Step-by-Step Data Flow)

### Giai đoạn 1: Khởi tạo ứng dụng (App Bootstrapping)

Đây là bước tiền đề, thường xảy ra bên ngoài trang Product (ví dụ: ở App.tsx hoặc sau khi Login).

1. App gọi API getProfile để lấy thông tin user đang đăng nhập.
2. Backend trả về một object profile, trong đó có chứa trường franchise_id.
3. Hàm xử lý (Action) của Zustand lưu toàn bộ object này vào Global Store.
   - _Trạng thái Store lúc này:_ profile.franchise_id đang giữ một giá trị cụ thể (VD: 'F_HCM_01') hoặc là null.

### Giai đoạn 2: User truy cập trang Product (Component Lifecycle)

1. User click vào menu "Sản phẩm". Component ProductPage bắt đầu quá trình Mount (khởi tạo).
2. Component "lắng nghe" (subscribe) Zustand Store để lấy giá trị franchise_id hiện tại ra một biến local.

### Giai đoạn 3: Ráp Payload và Gọi API (Core Logic)

1. Hàm fetch data (ví dụ: fetchProducts) được kích hoạt.
2. Code gỡ bỏ lệnh gọi API /products (Get All) cũ.
3. Code bọc giá trị franchise_id vừa lấy được vào một object Payload.
4. Gửi HTTP Request tới API /product-franchise/search kèm theo Payload.

### Giai đoạn 4: Phân nhánh xử lý tại Backend (Bạn cần hiểu để mapping đúng)

Dù đây là việc của Backend, nhưng nắm được nó giúp bạn tự tin truyền data:

- **Kịch bản A (Có chi nhánh):** Front-end truyền franchise_id: 'F_HCM_01'. Backend nhận được, query database lấy đúng sản phẩm của chi nhánh HCM và trả về.
- **Kịch bản B (Fallback):** Front-end truyền franchise_id: null. Backend nhận null, tự động bypass bộ lọc chi nhánh, query lấy toàn bộ sản phẩm trên toàn hệ thống và trả về.

### Giai đoạn 5: Render UI (Cập nhật giao diện)

1. API trả về mảng danh sách sản phẩm (dù là của 1 chi nhánh hay toàn bộ thì cấu trúc mảng vẫn giống nhau).
2. Lưu mảng này vào Local State (VD: useState tên là products).
3. React nhận thấy state thay đổi, tiến hành re-render lại UI, đổ data ra danh sách grid/table với Tailwind CSS.

---

**Created Date:** March 6, 2026
**Status:** Ready for Implementation
