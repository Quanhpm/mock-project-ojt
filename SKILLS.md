# SKILL: Inventory Inline Edit + Excel/CSV Export-Import with Validation

> **Module:** Inventory Management (`src/modules/admin/inventory-management/`)
> **Mục đích:** Hướng dẫn chi tiết cho AI xây dựng chức năng chỉnh sửa Inventory trực tiếp trên Table (inline edit) + Export/Import Excel/CSV với validation row-by-row + Bulk Update qua API.

---

## 1. Context & Business Logic (Bối cảnh & Nghiệp vụ)

### 1.1. Mục tiêu tổng quan

Xây dựng chức năng chỉnh sửa Inventory cho **Inventory Management** với 3 cách thao tác:

1. **Inline Edit trên Table:** User chỉnh sửa trực tiếp `quantity` và `alert_threshold` bằng input ngay trên table.
2. **Export → Chỉnh sửa → Import:** User export data ra file Excel/CSV → Sửa trên file → Import lại vào table.
3. **Bulk Update:** User chọn checkbox các row → Nhấn nút Update → Gọi API cập nhật hàng loạt.

### 1.2. Luồng chi tiết

```
1. User mở trang Inventory List → Table hiển thị data với 2 cột quantity, alert_threshold là INPUT (editable).
2. Mỗi row có 1 CHECKBOX ở đầu dòng.
3. User có thể:
   a) Chỉnh sửa trực tiếp trên input → Tick checkbox row đó → Nhấn "Update Selected"
   b) Nhấn "Export All" hoặc "Export Selected" → Tải file Excel/CSV
   c) Sửa file Excel/CSV → Nhấn "Import" → Upload file
      → Hệ thống validate thông qua react-hook-form (hoặc schema tương ứng) từng row (trái → phải: quantity trước, alert_threshold sau)
      → Nếu BẤT KỲ row nào lỗi → KHÔNG import, hiển thị mảng lỗi trên top Table
      → Nếu TẤT CẢ row OK → Import vào table + check vị trí index của các item để auto đánh checkbox các row đã import
4. User nhấn "Update Selected" → Gọi API POST /api/inventories/adjust/bulk
```

### 1.3. Backend API Constraints

#### API hiện có:

| Method   | Endpoint                                            | Mô tả                                  |
| -------- | --------------------------------------------------- | -------------------------------------- |
| `POST`   | `/api/inventories`                                  | Tạo inventory item mới                 |
| `POST`   | `/api/inventories/search`                           | Tìm kiếm với phân trang                |
| `GET`    | `/api/inventories/:id`                              | Lấy chi tiết 1 item                    |
| `DELETE` | `/api/inventories/:id`                              | Xóa mềm                                |
| `PATCH`  | `/api/inventories/:id/restore`                      | Khôi phục item đã xóa                  |
| `POST`   | `/api/inventories/adjust`                           | Điều chỉnh quantity 1 item             |
| `POST`   | `/api/inventories/adjust/bulk`                      | **⭐ Điều chỉnh nhiều items cùng lúc** |
| `GET`    | `/api/inventories/low-stock/franchise/:franchiseId` | Lấy low stock theo franchise           |
| `GET`    | `/api/inventories/logs/:inventoryId`                | Lấy lịch sử điều chỉnh                 |

#### ⭐ API Bulk Update (ĐÃ XÁC NHẬN):

- **Method:** `POST`
- **Endpoint:** `/api/inventories/adjust/bulk`
- **Request Body:**

```json
{
  "items": [
    {
      "product_franchise_id": "69aa68ca7729bc6014ee5979",
      "change": -30,
      "alert_threshold": 10,
      "reason": ""
    },
    {
      "product_franchise_id": "69aa68f17729bc6014ee598f",
      "change": -50,
      "alert_threshold": 10,
      "reason": ""
    }
  ]
}
```

- **Response:** `200 OK`
- **QUAN TRỌNG:**
  - `change` là **delta** (sự thay đổi), KHÔNG phải giá trị tuyệt đối. VD: quantity hiện tại = 100, muốn thành 70 → `change = -30`.
  - `alert_threshold` là **giá trị tuyệt đối** (ghi đè trực tiếp).
  - `product_franchise_id` là key định danh, KHÔNG dùng `id` (inventory ID).
  - `reason` là string, có thể để rỗng `""`.

#### API Adjust đơn lẻ (đã có):

- **Method:** `POST`
- **Endpoint:** `/api/inventories/adjust`
- **Request Body:**

```json
{
  "product_franchise_id": "698eab1526ca2b18eb35347a",
  "change": -99,
  "reason": ""
}
```

### 1.4. Frontend Constraints

- Table **bắt buộc** quản lý bởi `react-hook-form` (sử dụng `useFieldArray`). Khuyên dùng Zod schema để đồng bộ với RHF.
- 2 cột `quantity` và `alert_threshold` render bằng `<input type="number" />` (kết nối form register) trực tiếp trên table.
- Checkbox ở mỗi row để chọn row muốn update.
- Khi import file, validate qua logic của RHF/Zod → validate xong nếu OK thì **ghi thẳng vào form** + check vị trí index của bản ghi excel để auto tick checkbox trên các row.
- Nếu validate lỗi → **giữ nguyên data gốc trên table**, hiển thị mảng lỗi phía trên table.

### 1.5. Dữ liệu Inventory (từ API search response)

Mỗi `InventoryItem` từ API `POST /inventories/search` có cấu trúc:

```typescript
interface InventoryItem {
  id: string; // Inventory ID (UUID)
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  product_franchise_id: string; // FK → product_franchise — DÙNG LÀM KEY CHO API UPDATE
  product_id: string; // Joined field
  franchise_id: string; // Joined field
  quantity: number; // ← EDITABLE (trên table + Excel)
  alert_threshold: number; // ← EDITABLE (trên table + Excel)
  product_name?: string; // Joined field (từ search)
  franchise_name?: string; // Joined field (từ search)
}
```

### 1.6. Các cột hiển thị trên Table (MỚI — có Inline Edit + Checkbox)

| #   | Column Header   | Field                                       | Editable? | UI Element                  |
| --- | --------------- | ------------------------------------------- | --------- | --------------------------- |
| 0   | ☑ (Checkbox)    | `_selected` (local state)                   | ✅        | `<input type="checkbox" />` |
| 1   | ID              | `id` (hiển thị 6 ký tự cuối)                | ❌        | Text                        |
| 2   | Product         | `product_name` (fallback `product_id`)      | ❌        | Text                        |
| 3   | Franchise       | `franchise_name` (fallback `franchise_id`)  | ❌        | Text                        |
| 4   | Quantity        | `quantity`                                  | ✅        | `<input type="number" />`   |
| 5   | Alert Threshold | `alert_threshold`                           | ✅        | `<input type="number" />`   |
| 6   | Status          | Computed từ `quantity` vs `alert_threshold` | ❌        | Badge                       |
| 7   | Actions         | -                                           | -         | Buttons                     |

---

## 2. Tech Stack (Công nghệ bắt buộc)

| Concern              | Library                             | Version (trong project)                   |
| -------------------- | ----------------------------------- | ----------------------------------------- |
| **Excel Processing** | `xlsx` (SheetJS)                    | **Cần cài thêm:** `npm install xlsx`      |
| **Form State**       | `react-hook-form`                   | `^7.71.1` (đã có)                         |
| **Form Array**       | `useFieldArray` từ RHF              | (đã có)                                   |
| **Validation**       | `zod`                               | `^4.3.6` (đã có)                          |
| **Zod ↔ RHF Bridge** | `@hookform/resolvers`               | `^5.2.2` (đã có)                          |
| **UI Components**    | Inline styles + `lucide-react`      | (đã có)                                   |
| **HTTP Client**      | Custom `httpClient` (Axios wrapper) | (đã có tại `src/apis/httpClient.ts`)      |
| **Toast**            | `sonner` qua `useToast` hook        | (đã có tại `src/hooks/use-toast.hook.ts`) |
| **UI State**         | React `useState`, `useMemo`         | (built-in)                                |

> ⚠️ **QUAN TRỌNG:** Cần chạy `npm install xlsx` trước khi bắt đầu code.

---

## 3. File Structure (Cấu trúc file cần tạo/sửa)

```
src/modules/admin/inventory-management/
├── component/
│   ├── inventory.api.ts              ← SỬA: Thêm bulkAdjustInventory API
│   ├── inventory.types.ts            ← SỬA: Thêm BulkAdjustPayload, InventoryExcelRow, etc.
│   ├── inventory.schema.ts           ← TẠO MỚI: Zod schemas (hoặc validate riêng)
│   ├── inventory.excel.ts            ← TẠO MỚI: Export/Import/Parse/Validate logic
│   ├── InventoryTable.tsx            ← SỬA: Inline edit inputs, checkbox, export/import buttons, error banner
│   ├── hooks/
│   │   ├── useInventoryExcel.ts      ← TẠO MỚI: Custom hook quản lý luồng Excel
│   │   ├── useBulkAdjustInventory.ts ← TẠO MỚI: Hook gọi API POST /inventories/adjust/bulk
│   │   └── ... (hooks hiện tại giữ nguyên)
│   └── ...
└── pages/
    └── InventoryListPage.tsx         ← SỬA nếu cần wrap FormProvider
```

---

## 4. Core Architecture (Luồng xử lý chi tiết)

### Luồng A — Inline Edit trên Table

```
1. Table render với 2 cột quantity, alert_threshold là <input type="number" />
2. User sửa trực tiếp giá trị trên input
3. User tick checkbox row đó (hoặc checkbox đã được tick sẵn khi import)
4. User nhấn "Update Selected"
5. Với mỗi row đã tick:
   - Tính change = newQuantity - originalQuantity (delta)
   - alert_threshold lấy giá trị hiện tại trên input (ghi đè tuyệt đối)
6. Build payload: { items: [...] }
7. Gọi POST /api/inventories/adjust/bulk
8. Toast success → Refetch data
```

### Luồng B — Export Excel/CSV

```
User nhấn "Export All" hoặc "Export Selected":
    → Nếu "Export All": lấy toàn bộ data đang hiển thị trên table
    → Nếu "Export Selected": chỉ lấy các row có checkbox đã tick
    → Clean data: giữ lại các field cần thiết cho Excel
    → Dùng xlsx.utils.json_to_sheet() + xlsx.writeFile()
    → File tải về: "inventory_export_YYYY-MM-DD.xlsx"
```

### Luồng C — Import Excel/CSV (QUAN TRỌNG)

```
1. User chọn file .xlsx / .xls / .csv
2. Parse file → mảng JSON raw
3. Map header → field key
4. VALIDATE TỪNG ROW (trái → phải):
   ┌──────────────────────────────────────────────────────────────────┐
   │ Với mỗi row (index i, bắt đầu từ 1):                          │
   │   a) Check quantity:                                            │
   │      - Phải là number (không phải string, NaN, undefined...)   │
   │      - Phải >= 0                                                │
   │      → Nếu lỗi: push "Row {i}, lỗi ... ở field quantity"      │
   │   b) Check alert_threshold:                                     │
   │      - Phải là number                                           │
   │      - Phải >= 0                                                │
   │      → Nếu lỗi: push "Row {i}, lỗi ... ở field alert_threshold"│
   └──────────────────────────────────────────────────────────────────┘
5. Sau khi check TOÀN BỘ rows:
   → Nếu mảng errors.length > 0:
      - KHÔNG import vào table
      - Giữ nguyên data gốc trên table
      - Hiển thị mảng errors phía TRÊN table, mỗi lỗi xuống dòng
      VD:
        ┌─────────────────────────────────────────────────────────┐
        │ Row 01, lỗi chỉ được nhập data số ở field quantity,     │
        │ Row 02: lỗi data ở field alert_threshold phải >= 0      │
        └─────────────────────────────────────────────────────────┘
   → Nếu mảng errors.length === 0 (ALL OK):
      - Import data vào form (ghi đè quantity, alert_threshold lên input)
      - Auto tick checkbox cho các row dựa trên vị trí index của file import với index của form array
      - Toast success: "Import thành công X dòng"
```

### Luồng D — Update Selected (Gọi API)

```
User nhấn "Update Selected":
    → Lấy tất cả row có checkbox đã tick
    → Với mỗi row:
        - change = currentInputQuantity - originalQuantityFromServer
        - alert_threshold = currentInputAlertThreshold (giá trị tuyệt đối)
        - product_franchise_id = row.product_franchise_id
        - reason = "" (hoặc user có thể nhập)
    → Build payload: { items: [...] }
    → Gọi POST /api/inventories/adjust/bulk
    → Toast success / error
    → Refetch data + Reset checkboxes
```

---

## 5. Type Definitions (Định nghĩa kiểu dữ liệu cần thêm)

### 5.1. Thêm vào `inventory.types.ts`:

```typescript
// ===== Bulk Adjust Types (API POST /inventories/adjust/bulk) =====

/** Một item trong payload gửi lên API bulk adjust */
export interface BulkAdjustItem {
  product_franchise_id: string; // Key định danh
  change: number; // Delta: newQuantity - originalQuantity (có thể âm, dương, hoặc 0)
  alert_threshold: number; // Giá trị tuyệt đối (ghi đè)
  reason: string; // Lý do, có thể rỗng ""
}

/** Payload gửi lên POST /api/inventories/adjust/bulk */
export interface BulkAdjustPayload {
  items: BulkAdjustItem[];
}

// ===== Excel/CSV Export-Import Types =====

/** Dữ liệu 1 dòng trong file Excel (flat, human-readable headers) */
export interface InventoryExcelRow {
  id: string; // Inventory ID — READ-ONLY, dùng để match
  product_name: string; // Tên sản phẩm — READ-ONLY
  franchise_name: string; // Tên franchise — READ-ONLY
  product_franchise_id: string; // PF ID — READ-ONLY, DÙNG LÀM KEY CHO API
  quantity: number; // ← EDITABLE
  alert_threshold: number; // ← EDITABLE
}

// ===== Table Row State (Local) =====

/** State cho mỗi row trên table — bao gồm data gốc + editable values + checkbox */
export interface InventoryTableRow extends InventoryItem {
  _selected: boolean; // Checkbox state
  _editQuantity: number; // Giá trị quantity trên input (có thể khác quantity gốc)
  _editAlertThreshold: number; // Giá trị alert_threshold trên input
  _originalQuantity: number; // Giá trị quantity GỐC từ server (để tính change)
  _originalAlertThreshold: number; // Giá trị alert_threshold GỐC từ server
}

// ===== Import Validation =====

/** Một lỗi validation khi import */
export interface ImportValidationError {
  row: number; // Row index (bắt đầu từ 01)
  field: string; // "quantity" | "alert_threshold"
  message: string; // Mô tả lỗi chi tiết
}
```

### 5.2. Excel Header Map (mapping giữa Excel column header ↔ key):

```typescript
/** Map: Excel Header (hiển thị cho user) → Field key */
export const EXCEL_HEADER_MAP: Record<string, keyof InventoryExcelRow> = {
  "Inventory ID": "id",
  "Product Name": "product_name",
  "Franchise Name": "franchise_name",
  "Product Franchise ID": "product_franchise_id",
  Quantity: "quantity",
  "Alert Threshold": "alert_threshold",
};

/** Map ngược: Field key → Excel Header */
export const FIELD_TO_HEADER_MAP: Record<keyof InventoryExcelRow, string> = {
  id: "Inventory ID",
  product_name: "Product Name",
  franchise_name: "Franchise Name",
  product_franchise_id: "Product Franchise ID",
  quantity: "Quantity",
  alert_threshold: "Alert Threshold",
};

/** Các cột READ-ONLY (user không được sửa trên Excel, dùng để match) */
export const READONLY_EXCEL_COLUMNS: (keyof InventoryExcelRow)[] = [
  "id",
  "product_name",
  "franchise_name",
  "product_franchise_id",
];

/** Các cột EDITABLE (user được sửa trên Excel VÀ trên Table) */
export const EDITABLE_EXCEL_COLUMNS: (keyof InventoryExcelRow)[] = [
  "quantity",
  "alert_threshold",
];
```

---

## 6. Validation Rules (Import Validation — file `inventory.schema.ts` hoặc validate riêng)

### 6.1. Quy tắc validate khi Import (Row-by-Row, Trái → Phải)

**QUAN TRỌNG:** Validate PHẢI thực hiện theo thứ tự:

1. Duyệt từng row từ đầu đến cuối (row 1, row 2, ...)
2. Trong mỗi row, check từ **trái → phải**: `quantity` trước, `alert_threshold` sau
3. Thu thập TẤT CẢ lỗi vào 1 mảng `ImportValidationError[]`
4. Sau khi check xong HẾT mới quyết định import hay không

### 6.2. Chi tiết Validation cho từng field:

#### Field `quantity`:

| Rule              | Điều kiện                                                           | Error message                                             |
| ----------------- | ------------------------------------------------------------------- | --------------------------------------------------------- |
| Kiểu dữ liệu      | Phải là `number` (không phải string, NaN, undefined, null, boolean) | `"Row {XX}, lỗi chỉ được nhập data số ở field quantity,"` |
| Giá trị tối thiểu | Phải `>= 0`                                                         | `"Row {XX}: lỗi data ở field quantity phải >= 0"`         |
| Số nguyên         | Phải là số nguyên (integer)                                         | `"Row {XX}: lỗi data ở field quantity phải là số nguyên"` |

#### Field `alert_threshold`:

| Rule              | Điều kiện                   | Error message                                                    |
| ----------------- | --------------------------- | ---------------------------------------------------------------- |
| Kiểu dữ liệu      | Phải là `number`            | `"Row {XX}, lỗi chỉ được nhập data số ở field alert_threshold,"` |
| Giá trị tối thiểu | Phải `>= 0`                 | `"Row {XX}: lỗi data ở field alert_threshold phải >= 0"`         |
| Số nguyên         | Phải là số nguyên (integer) | `"Row {XX}: lỗi data ở field alert_threshold phải là số nguyên"` |

### 6.3. Hàm validate (Pseudo-code):

```typescript
function validateImportRows(
  rows: Record<string, unknown>[],
): ImportValidationError[] {
  const errors: ImportValidationError[] = [];

  rows.forEach((row, index) => {
    const rowNum = String(index + 1).padStart(2, "0"); // "01", "02", ...

    // === Check quantity (TRÁI - check trước) ===
    const qty = row.quantity;
    if (
      qty === undefined ||
      qty === null ||
      qty === "" ||
      typeof qty === "boolean" ||
      isNaN(Number(qty))
    ) {
      errors.push({
        row: index + 1,
        field: "quantity",
        message: `Row ${rowNum}, lỗi chỉ được nhập data số ở field quantity,`,
      });
    } else {
      const qtyNum = Number(qty);
      if (qtyNum < 0) {
        errors.push({
          row: index + 1,
          field: "quantity",
          message: `Row ${rowNum}: lỗi data ở field quantity phải >= 0`,
        });
      } else if (!Number.isInteger(qtyNum)) {
        errors.push({
          row: index + 1,
          field: "quantity",
          message: `Row ${rowNum}: lỗi data ở field quantity phải là số nguyên`,
        });
      }
    }

    // === Check alert_threshold (PHẢI - check sau) ===
    const threshold = row.alert_threshold;
    if (
      threshold === undefined ||
      threshold === null ||
      threshold === "" ||
      typeof threshold === "boolean" ||
      isNaN(Number(threshold))
    ) {
      errors.push({
        row: index + 1,
        field: "alert_threshold",
        message: `Row ${rowNum}, lỗi chỉ được nhập data số ở field alert_threshold,`,
      });
    } else {
      const thresholdNum = Number(threshold);
      if (thresholdNum < 0) {
        errors.push({
          row: index + 1,
          field: "alert_threshold",
          message: `Row ${rowNum}: lỗi data ở field alert_threshold phải >= 0`,
        });
      } else if (!Number.isInteger(thresholdNum)) {
        errors.push({
          row: index + 1,
          field: "alert_threshold",
          message: `Row ${rowNum}: lỗi data ở field alert_threshold phải là số nguyên`,
        });
      }
    }
  });

  return errors;
}
```

### 6.4. Kết quả validate:

```typescript
// Nếu có lỗi:
if (errors.length > 0) {
  setImportErrors(errors); // Hiển thị trên UI
  // KHÔNG thay đổi bất kỳ data nào trên table
  return;
}

// Nếu không lỗi:
setImportErrors([]); // Xóa lỗi cũ (nếu có)
// Import data vào table + auto tick checkbox
```

### 6.5. (Optional) Nếu muốn dùng Zod thay vì validate thủ công:

```typescript
import { z } from "zod";

/** Schema validate 1 dòng inventory từ file import */
export const inventoryImportRowSchema = z.object({
  quantity: z
    .number({
      invalid_type_error: "lỗi chỉ được nhập data số ở field quantity,",
    })
    .int("lỗi data ở field quantity phải là số nguyên")
    .min(0, "lỗi data ở field quantity phải >= 0"),

  alert_threshold: z
    .number({
      invalid_type_error: "lỗi chỉ được nhập data số ở field alert_threshold,",
    })
    .int("lỗi data ở field alert_threshold phải là số nguyên")
    .min(0, "lỗi data ở field alert_threshold phải >= 0"),
});

// Dùng safeParse cho từng row, thu thập lỗi thành ImportValidationError[]
```

### 6.6. Bảng tổng hợp Validation Rules:

| Field                  | Type     | Required | Min | Kiểu check                         | Ghi chú                           |
| ---------------------- | -------- | -------- | --- | ---------------------------------- | --------------------------------- |
| `quantity`             | `number` | ✅       | 0   | Phải là số, >= 0, integer          | **Editable** — check trước (trái) |
| `alert_threshold`      | `number` | ✅       | 0   | Phải là số, >= 0, integer          | **Editable** — check sau (phải)   |
| `id`                   | `string` | ✅       | -   | Phải tồn tại, dùng match           | Read-only                         |
| `product_franchise_id` | `string` | ✅       | -   | Phải tồn tại, dùng match + gọi API | Read-only                         |

---

## 7. Execution Rules (Quy tắc viết code bắt buộc cho AI)

### Rule 1: Inline Edit trên Table

AI phải sửa `InventoryTable.tsx` để:

1. Thêm cột **Checkbox** ở đầu mỗi row (+ checkbox "Select All" ở header).
2. Cột `Quantity` render thành `<input type="number" />` thay vì text. Phải dùng `register` của `useFieldArray`.
3. Cột `Alert Threshold` render thành `<input type="number" />` thay vì text. Phải dùng `register` của `useFieldArray`.
4. Giữ lại giá trị gốc (`_originalQuantity`, `_originalAlertThreshold`) để tính `change` khi gọi API.
5. Khi user sửa input → form field được cập nhật thông qua react-hook-form.

**State management cho Table với RHF:**

```typescript
// Sử dụng react-hook-form + useFieldArray
const methods = useForm<{ items: InventoryTableRow[] }>({
  defaultValues: { items: [] },
});
const { control, register } = methods;
const { fields, update, replace } = useFieldArray({
  control,
  name: "items",
});

// Khi data load từ API → map sang array cho RHF
useEffect(() => {
  if (inventories.length > 0) {
    replace(
      inventories.map((item) => ({
        ...item,
        _selected: false,
        _editQuantity: item.quantity,
        _editAlertThreshold: item.alert_threshold,
        _originalQuantity: item.quantity,
        _originalAlertThreshold: item.alert_threshold,
      })),
    );
  }
}, [inventories]);
```

**Render input cells (RHF ví dụ):**

```tsx
{
  /* Quantity Input */
}
<td>
  <input
    type="number"
    min={0}
    {...register(`items.${index}._editQuantity` as const, {
      valueAsNumber: true,
    })}
    style={{
      width: "80px",
      padding: "6px 8px",
      borderRadius: "6px",
      border: "1px solid #dee2e6",
      fontSize: "14px",
      textAlign: "center",
    }}
  />
</td>;

{
  /* Alert Threshold Input */
}
<td>
  <input
    type="number"
    min={0}
    {...register(`items.${index}._editAlertThreshold` as const, {
      valueAsNumber: true,
    })}
    style={{
      width: "80px",
      padding: "6px 8px",
      borderRadius: "6px",
      border: "1px solid #dee2e6",
      fontSize: "14px",
      textAlign: "center",
    }}
  />
</td>;
```

### Rule 2: Hàm Export Data

AI phải viết hàm `exportInventoryToExcel` tuân thủ:

1. Nếu user nhấn **"Export All"** → Lấy toàn bộ `methods.getValues('items')`.
2. Nếu user nhấn **"Export Selected"** → Lấy chỉ các row có `_selected === true`.
3. Map mỗi row → `InventoryExcelRow` (chỉ giữ: `id`, `product_name`, `franchise_name`, `product_franchise_id`, `quantity` (lấy `_editQuantity`), `alert_threshold` (lấy `_editAlertThreshold`)).
4. Dùng `FIELD_TO_HEADER_MAP` để đặt header Excel dễ đọc.
5. Xuất file: `inventory_export_YYYY-MM-DD.xlsx`.
6. **Sheet name:** `"Inventory"`.

**Pseudo-code:**

```typescript
function exportInventoryToExcel(
  data: InventoryTableRow[],
  mode: "all" | "selected",
) {
  const rowsToExport =
    mode === "selected" ? data.filter((r) => r._selected) : data;

  if (rowsToExport.length === 0) {
    toast.error("Không có dữ liệu để export");
    return;
  }

  const excelData = rowsToExport.map((row) => ({
    [FIELD_TO_HEADER_MAP.id]: row.id,
    [FIELD_TO_HEADER_MAP.product_name]: row.product_name ?? row.product_id,
    [FIELD_TO_HEADER_MAP.franchise_name]:
      row.franchise_name ?? row.franchise_id,
    [FIELD_TO_HEADER_MAP.product_franchise_id]: row.product_franchise_id,
    [FIELD_TO_HEADER_MAP.quantity]: row._editQuantity,
    [FIELD_TO_HEADER_MAP.alert_threshold]: row._editAlertThreshold,
  }));

  const ws = xlsx.utils.json_to_sheet(excelData);
  ws["!cols"] = [
    { wch: 38 }, // Inventory ID
    { wch: 30 }, // Product Name
    { wch: 25 }, // Franchise Name
    { wch: 38 }, // Product Franchise ID
    { wch: 12 }, // Quantity
    { wch: 18 }, // Alert Threshold
  ];

  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Inventory");
  xlsx.writeFile(
    wb,
    `inventory_export_${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
}
```

### Rule 3: Hàm Import & Validate

AI phải viết hàm `importInventoryFromExcel` tuân thủ:

**Luồng xử lý:**

```typescript
async function handleImportFile(file: File) {
  // Step 1: Parse file
  const buffer = await file.arrayBuffer();
  const wb = xlsx.read(buffer, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rawRows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet);

  if (rawRows.length === 0) {
    toast.error("File không có dữ liệu");
    return;
  }

  // Step 2: Map header → key (trim headers để chống dư khoảng trắng)
  const mappedRows = rawRows.map((rawRow) => {
    const mapped: Record<string, unknown> = {};
    for (const [header, value] of Object.entries(rawRow)) {
      const trimmedHeader = header.trim();
      const key = EXCEL_HEADER_MAP[trimmedHeader];
      if (key) mapped[key] = value;
    }
    return mapped;
  });

  // Step 3: Validate từng row (trái → phải: quantity trước, alert_threshold sau)
  const errors = validateImportRows(mappedRows);

  // Step 4: Xử lý kết quả
  if (errors.length > 0) {
    // ❌ CÓ LỖI → KHÔNG import, hiển thị lỗi
    setImportErrors(errors);
    // toast.error(`Import thất bại: ${errors.length} lỗi`);
    return;
  }

  // ✅ KHÔNG LỖI → Import vào form + auto tick checkbox DỰA VÀO VỊ TRÍ INDEX
  setImportErrors([]); // Xóa lỗi cũ

  const currentItems = methods.getValues("items");
  const updatedItems = [...currentItems];

  // Match excel row index với table index (nếu table có thứ tự giống excel)
  // Theo đề bài: check vị trí index của các item import để đánh checkbox
  // Tức là Excel row 0 tương ứng form array index 0, v.v...
  for (let i = 0; i < mappedRows.length; i++) {
    const importedRow = mappedRows[i];

    // Check nếu vị trí index nằm trong giới hạn của bảng hiện tại
    if (i < updatedItems.length) {
      updatedItems[i] = {
        ...updatedItems[i],
        _editQuantity: Number(importedRow.quantity),
        _editAlertThreshold: Number(importedRow.alert_threshold),
        _selected: true, // ← AUTO TICK CHECKBOX DỰA THEO VỊ TRÍ INDEX
      };
    }
  }

  replace(updatedItems); // Cập nhật lại form array

  toast.success(`Import thành công ${mappedRows.length} dòng`);
}
```

### Rule 4: Error Banner UI (Hiển thị lỗi trên top Table)

**Component/Element:** Hiển thị ngay phía trên table, bên dưới filter bar.

```tsx
{
  importErrors.length > 0 && (
    <div
      style={{
        backgroundColor: "#fff5f5",
        border: "1px solid #fed7d7",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <h4
          style={{
            margin: 0,
            color: "#c53030",
            fontSize: "14px",
            fontWeight: "700",
          }}
        >
          ⚠️ Import Errors ({importErrors.length} lỗi):
        </h4>
        <button
          onClick={() => setImportErrors([])}
          style={
            {
              /* close button styles */
            }
          }
        >
          ✕
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {importErrors.map((err, i) => (
          <p
            key={i}
            style={{
              margin: 0,
              fontSize: "13px",
              color: "#c53030",
              lineHeight: "1.5",
            }}
          >
            {err.message}
          </p>
        ))}
      </div>
    </div>
  );
}
```

### Rule 5: Update Selected — Build Payload & Gọi API

**QUAN TRỌNG:** API dùng `change` (delta), KHÔNG dùng giá trị tuyệt đối cho quantity.

```typescript
function handleUpdateSelected() {
  const currentItems = methods.getValues("items");
  const selectedRows = currentItems.filter((r) => r._selected);

  if (selectedRows.length === 0) {
    toast.error("Vui lòng chọn ít nhất 1 row để update");
    return;
  }

  // Build payload theo đúng format API
  const payload: BulkAdjustPayload = {
    items: selectedRows.map((row) => ({
      product_franchise_id: row.product_franchise_id,
      change: row._editQuantity - row._originalQuantity, // ← DELTA, không phải giá trị tuyệt đối!
      alert_threshold: row._editAlertThreshold, // ← Giá trị tuyệt đối (ghi đè)
      reason: "", // Có thể mở rộng cho user nhập
    })),
  };

  // Gọi API
  bulkAdjustInventory(payload);
}
```

**VÍ DỤ tính change:**
| Trường hợp | Original (server) | Input (user sửa) | change |
|-------------|-------------------|-------------------|--------|
| Tăng số lượng | 100 | 150 | `+50` |
| Giảm số lượng | 100 | 70 | `-30` |
| Không đổi | 100 | 100 | `0` |
| Giảm về 0 | 50 | 0 | `-50` |

### Rule 6: API Endpoint (Thêm vào `inventory.api.ts`)

```typescript
// Bulk adjust inventory items (POST)
export const bulkAdjustInventory = (
  payload: BulkAdjustPayload,
): Promise<null> => {
  return httpClient.post<null, BulkAdjustPayload>({
    url: "/inventories/adjust/bulk",
    data: payload,
  });
};

// Cập nhật inventoryApi bundle:
export const inventoryApi = {
  // ... (existing)
  bulkAdjustInventory,
};
```

### Rule 7: Error Handling toàn diện

| Scenario                         | Action                                                                |
| -------------------------------- | --------------------------------------------------------------------- |
| File không phải .xlsx/.xls/.csv  | Toast error: "Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV (.csv)" |
| File > 5MB                       | Toast error: "File quá lớn (tối đa 5MB)"                              |
| File rỗng (0 data rows)          | Toast error: "File không có dữ liệu"                                  |
| Header sai format                | Toast error: "Header file không đúng định dạng"                       |
| **Import validate lỗi**          | **KHÔNG import, hiển thị mảng lỗi trên top Table (Error Banner)**     |
| Import OK, row không match       | Log warning, skip row đó                                              |
| Import OK, tất cả match          | Import vào table + auto tick checkbox + Toast success                 |
| Update Selected, 0 row được chọn | Toast error: "Vui lòng chọn ít nhất 1 row"                            |
| API bulk adjust thành công       | Toast success + Refetch data + Reset checkboxes                       |
| API bulk adjust thất bại         | Toast error: "Cập nhật thất bại: [message]", KHÔNG reset table        |
| Network error                    | Toast error: "Lỗi kết nối, vui lòng thử lại"                          |

---

## 8. Custom Hook: `useBulkAdjustInventory` (Gọi API)

```typescript
import { useState } from "react";
import { inventoryApi } from "../inventory.api";
import type { BulkAdjustPayload } from "../inventory.types";
import { useToast } from "@/hooks/use-toast.hook";

export const useBulkAdjustInventory = () => {
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showErrorToast } = useToast();

  const bulkAdjust = async (
    payload: BulkAdjustPayload,
    onSuccess?: () => void,
    onError?: (errorMessage: string) => void,
  ) => {
    setIsAdjusting(true);
    setError(null);

    try {
      await inventoryApi.bulkAdjustInventory(payload);
      success(
        "Cập nhật thành công",
        `Đã cập nhật ${payload.items.length} inventory items.`,
      );
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Không thể cập nhật lúc này. Vui lòng thử lại!";
      setError(errorMessage);
      showErrorToast("Cập nhật thất bại", errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsAdjusting(false);
    }
  };

  return { bulkAdjust, isAdjusting, error };
};
```

---

## 9. UI Integration (Tích hợp vào InventoryTable.tsx)

### 9.1. Thêm nút Export/Import/Update vào header:

Vị trí: Cạnh nút "Add Inventory" hiện tại.

```
[📥 Export All] [📥 Export Selected] [📤 Import] [🔄 Update Selected (X)] [+ Add Inventory]
```

- Nút **Export All**: Màu outline, border `#8B4513`, icon `download`
- Nút **Export Selected**: Màu outline, disabled nếu 0 row selected
- Nút **Import**: Màu outline, border `#8B4513`, icon `upload`
- Nút **Update Selected (X)**: Màu primary `#8B4513`, hiển thị số row đã chọn, disabled nếu 0 row selected
- Input file hidden: `<input type="file" accept=".xlsx,.xls,.csv" hidden ref={fileInputRef} />`

### 9.2. Table Header với Checkbox "Select All":

```tsx
<thead>
  <tr>
    <th>
      <input
        type="checkbox"
        checked={fields.length > 0 && fields.every((r) => r._selected)}
        onChange={(e) => handleSelectAll(e.target.checked)}
      />
    </th>
    <th>ID</th>
    <th>Product</th>
    <th>Franchise</th>
    <th>Quantity</th> {/* ← INPUT */}
    <th>Alert Threshold</th> {/* ← INPUT */}
    <th>Status</th>
    <th>Actions</th>
  </tr>
</thead>
```

### 9.3. Styling cho input cells:

```typescript
// Style cho input editable cell
const editableInputStyle: React.CSSProperties = {
  width: "80px",
  padding: "6px 8px",
  borderRadius: "6px",
  border: "1px solid #dee2e6",
  fontSize: "14px",
  textAlign: "center",
  outline: "none",
  transition: "border-color 0.2s",
};

// Style cho input khi focus
// onFocus → border: "1px solid #8B4513"
// onBlur → border: "1px solid #dee2e6"

// Style cho row đã selected (highlight nhẹ)
const selectedRowStyle: React.CSSProperties = {
  backgroundColor: "#fff8f2",
};
```

---

## 10. Luồng hoàn chỉnh (User Journey)

```
┌─────────────────────────────────────────────────────────────────────┐
│  INVENTORY LIST PAGE                                                │
│                                                                     │
│  [📥 Export All] [📥 Export Selected] [📤 Import] [🔄 Update (0)]  │
│  [+ Add Inventory]                                                  │
│                                                                     │
│  ┌── ERROR BANNER (nếu import lỗi) ─────────────────────────────┐  │
│  │ ⚠️ Import Errors (3 lỗi):                                    │  │
│  │ Row 01: lỗi chỉ được nhập data số ở field quantity            │  │
│  │ Row 02: lỗi data ở field alert_threshold phải >= 0            │  │
│  │ Row 05: lỗi chỉ được nhập data số ở field quantity            │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ ☑  │ ID  │Product│Franchise│ Quantity │Alert Threshold│Status│   │
│  │────│─────│───────│─────────│──────────│──────────────│──────│   │
│  │ ☐  │ #a1 │Cà phê│ HCM     │ [  100 ] │ [   10     ] │ ✅  │   │
│  │ ☑  │ #b2 │Trà sữa│ HN     │ [  150 ] │ [   15     ] │ ✅  │   │
│  │ ☑  │ #c3 │Matcha │ DN      │ [    5 ] │ [   30     ] │ ⚠️  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  CÁCH 1: Inline Edit                                                │
│  → User sửa trực tiếp input [150] và [30]                          │
│  → Tick checkbox row #b2 và #c3                                     │
│  → Nhấn [🔄 Update Selected (2)]                                   │
│  → API: POST /api/inventories/adjust/bulk                           │
│    payload: {                                                       │
│      items: [                                                       │
│        { product_franchise_id: "...", change: +100, alert: 15, reason: "" }, │
│        { product_franchise_id: "...", change: 0, alert: 30, reason: "" }    │
│      ]                                                              │
│    }                                                                │
│                                                                     │
│  CÁCH 2: Export → Edit → Import                                     │
│  → Nhấn [📥 Export All] → Tải file .xlsx                           │
│  → Mở Excel, sửa Quantity & Alert Threshold                        │
│  → Nhấn [📤 Import] → Chọn file                                   │
│  → Validate OK → Import vào table, auto tick checkbox               │
│  → Nhấn [🔄 Update Selected (X)]                                   │
│  → API call → Refetch                                               │
│                                                                     │
│  CÁCH 3: Export Selected                                            │
│  → Tick checkbox row #a1, #c3                                       │
│  → Nhấn [📥 Export Selected] → File chỉ chứa 2 row                │
│  → Sửa file → Import lại → ...                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 11. Checklist cho AI (Trước khi bắt tay code)

### Setup:

- [ ] Đã cài `xlsx`: `npm install xlsx`
- [ ] Đã thêm types mới vào `inventory.types.ts` (`BulkAdjustPayload`, `BulkAdjustItem`, `InventoryExcelRow`, `InventoryTableRow`, `ImportValidationError`)
- [ ] Đã thêm `bulkAdjustInventory` vào `inventory.api.ts` (POST `/inventories/adjust/bulk`)
- [ ] Đã tạo hook `useBulkAdjustInventory.ts`

### Table Refactor:

- [ ] `InventoryTable.tsx` có cột Checkbox ở mỗi row + "Select All" ở header
- [ ] Cột Quantity render `<input type="number" />`
- [ ] Cột Alert Threshold render `<input type="number" />`
- [ ] Giữ lại `_originalQuantity` và `_originalAlertThreshold` để tính `change`

### Export:

- [ ] Nút "Export All" xuất toàn bộ form data
- [ ] Nút "Export Selected" xuất chỉ các row đã tick
- [ ] File Excel có header đúng theo `FIELD_TO_HEADER_MAP`

### Import:

- [ ] Đọc file .xlsx/.xls/.csv thành JSON
- [ ] Validate từng row bằng RHF/Zod, trái → phải (quantity → alert_threshold)
- [ ] Nếu lỗi → Error banner trên top Table, KHÔNG import
- [ ] Nếu OK → Import data vào form array + đánh checkbox tự động dựa trên vị trí index bảng match với excel.

### Update:

- [ ] Nút "Update Selected" build đúng payload: `change` = delta, `alert_threshold` = absolute
- [ ] Gọi `POST /api/inventories/adjust/bulk`
- [ ] Sau khi success → Refetch + Reset checkboxes

### Test Cases:

- [ ] Export All → Import không sửa gì → Auto tick nhưng change = 0 → OK
- [ ] Export → Sửa quantity → Import → Auto tick → Update → API thành công
- [ ] Import file có row lỗi (quantity là string) → Error banner hiển thị, table giữ nguyên
- [ ] Import file có row lỗi (alert_threshold âm) → Error banner hiển thị, table giữ nguyên
- [ ] Chỉnh sửa inline → Tick checkbox → Update Selected → API gọi đúng `change` (delta)
- [ ] Export Selected (2 row) → File chỉ có 2 row
- [ ] File rỗng → Toast error
- [ ] File sai format → Toast error
