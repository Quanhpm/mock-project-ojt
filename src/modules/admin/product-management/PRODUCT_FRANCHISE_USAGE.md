# Product Franchise Management - Implementation Guide

## 📁 Cấu trúc File Đã Tạo

```
src/modules/admin/product-management/
├── api/
│   └── product-franchise.api.ts           ✅ NEW - CRUD API cho Product Franchise
├── hooks/
│   └── useProductFranchiseActions.hook.ts ✅ NEW - Hook quản lý actions
└── components/
    ├── AddProductToFranchiseDrawer.tsx    ✅ NEW - UI drawer kích hoạt product
    ├── product.api.ts                      ✅ UPDATED - Thêm getProductSelectItems()
    └── product.types.ts                    ✅ UPDATED - Thêm ProductSelectItem interface
```

---

## 🎯 Chức Năng Đã Implement

### 1. **Product Franchise API Layer** (`product-franchise.api.ts`)

Cung cấp đầy đủ CRUD operations cho Product Franchise:

```typescript
- createProductFranchise()         ✅ POST /api/product-franchises
- searchProductFranchises()         ✅ POST /api/product-franchises/search
- getProductFranchiseById()         ✅ GET /api/product-franchises/:id
- updateProductFranchise()          ✅ PUT /api/product-franchises/:id
- deleteProductFranchise()          ✅ DELETE /api/product-franchises/:id
- restoreProductFranchise()         ✅ PATCH /api/product-franchises/:id/restore
- toggleProductFranchiseStatus()    ✅ PATCH /api/product-franchises/:id/status
```

**Types:**
```typescript
interface ProductFranchiseCreatePayload {
  franchise_id: string;
  product_id: string;
  size: string;
  price_base: number;
}
```

---

### 2. **Hook Actions** (`useProductFranchiseActions.hook.ts`)

React hook với state management và error handling:

```typescript
const { 
  create,          // Kích hoạt product cho franchise
  update,          // Cập nhật size/price
  remove,          // Xóa (soft delete)
  restore,         // Khôi phục
  toggleStatus,    // Bật/tắt active status
  isCreating,      // Loading states
  isUpdating,
  isDeleting,
  isRestoring,
  isToggling
} = useProductFranchiseActions(onSuccess);
```

---

### 3. **UI Component** (`AddProductToFranchiseDrawer.tsx`)

Drawer component với đầy đủ tính năng:

#### **Features:**
- ✅ Dropdown select từ master products (gọi API `/products/select`)
- ✅ Auto-fill price với `min_price` khi chọn product
- ✅ Validate price trong khoảng `min_price` - `max_price`
- ✅ Input size (auto uppercase)
- ✅ Toggle active status
- ✅ Franchise info (read-only, lấy từ context)
- ✅ Loading states
- ✅ Error handling
- ✅ Success callback

#### **Props:**
```typescript
interface AddProductToFranchiseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
```

---

## 🚀 Cách Sử Dụng

### **Bước 1: Import Component**

```typescript
import AddProductToFranchiseDrawer from "@/modules/admin/product-management/components/AddProductToFranchiseDrawer";
```

### **Bước 2: Quản lý State**

```typescript
const [isDrawerOpen, setIsDrawerOpen] = useState(false);

const handleSuccess = () => {
  // Refetch data hoặc update UI
  refetch();
};
```

### **Bước 3: Render Component**

```tsx
<>
  <button onClick={() => setIsDrawerOpen(true)}>
    Add Product to Franchise
  </button>

  <AddProductToFranchiseDrawer
    isOpen={isDrawerOpen}
    onClose={() => setIsDrawerOpen(false)}
    onSuccess={handleSuccess}
  />
</>
```

---

## 🎨 UI Design

Component sử dụng Tailwind CSS với màu chủ đạo:
- **Primary:** `#8B5A2B` (Brown coffee theme)
- **Primary Dark:** `#7F5539`
- **Primary Light:** `#B08968`

**Responsive:** Mobile-first design, hỗ trợ màn hình từ 320px trở lên.

---

## 🔐 Security & Validation

### **Frontend Validation:**
1. ✅ Product phải được chọn
2. ✅ Size không được để trống
3. ✅ Price > 0
4. ✅ Price phải trong khoảng `[min_price, max_price]` của product
5. ✅ Franchise ID phải tồn tại

### **Backend Expected:**
- Validate duplicate: `(franchise_id, product_id, size)` là unique
- Validate franchise có permission
- Validate product tồn tại và active

---

## 📊 Data Flow

```
[User Interface]
     │
     ▼
[AddProductToFranchiseDrawer]
     │
     ├─► Load Products ────► GET /api/products/select
     │
     └─► Submit Form ───────► POST /api/product-franchises
              │                     {
              │                       franchise_id,
              │                       product_id,
              │                       size: "L",
              │                       price_base: 50000
              │                     }
              │
              ▼
         [Success] ─────► Callback onSuccess() ─────► Refetch/Update UI
```

---

## ⚠️ Known Issues & TODOs

### **Cần làm tiếp:**
1. ❌ Tạo page quản lý Product Franchise (list/search/edit)
2. ❌ Integrate vào menu navigation
3. ❌ Test với backend API thật
4. ❌ Handle case: Product đã được kích hoạt cho franchise (show error)
5. ❌ Thêm image preview cho product

### **Backend cần có:**
```
GET  /api/products/select
     Response: [{ value, label, SKU, min_price, max_price }]
```

---

## 🧪 Testing Checklist

- [ ] Mở drawer, kiểm tra UI render đúng
- [ ] Select product, kiểm tra auto-fill price
- [ ] Nhập size, kiểm tra uppercase auto
- [ ] Nhập price < min_price → hiển thị error
- [ ] Nhập price > max_price → hiển thị error
- [ ] Submit form thành công
- [ ] Submit form thất bại (network error)
- [ ] Loading state hiển thị đúng
- [ ] Close drawer, form reset về trạng thái ban đầu

---

## 📝 Example Usage in Table

```tsx
import { useState } from "react";
import AddProductToFranchiseDrawer from "@/modules/admin/product-management/components/AddProductToFranchiseDrawer";

export default function ProductTable() {
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  return (
    <>
      {/* Table Header */}
      <div className="flex justify-between items-center mb-4">
        <h1>Product Franchise Management</h1>
        <button
          onClick={() => setIsAddDrawerOpen(true)}
          className="px-4 py-2 bg-[#8B5A2B] text-white rounded-lg"
        >
          Add Product to Franchise
        </button>
      </div>

      {/* Table content... */}

      {/* Drawer */}
      <AddProductToFranchiseDrawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        onSuccess={() => {
          setIsAddDrawerOpen(false);
          // refetch data
        }}
      />
    </>
  );
}
```

---

## 🎉 Summary

**Đã hoàn thành:**
✅ API layer đầy đủ cho Product Franchise  
✅ Hook quản lý actions với error handling  
✅ UI component drawer với validation  
✅ Load master products từ backend  
✅ Auto-fill và validation price range  
✅ Responsive design với Tailwind CSS  

**Component này giải quyết vấn đề THIẾU MIDDLE LAYER (Product Franchise) trong workflow hiện tại!**
