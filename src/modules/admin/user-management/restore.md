# Hướng Dẫn Tích Hợp Filter (Not deleted/Deleted) & Khôi phục (Restore)

Khi làm chức năng ẩn/hiện và khôi phục dữ liệu ở một trang quản lý bất kỳ (như User Management, Product Management,...), bạn có thể copy trực tiếp cấu trúc dưới đây để đảm bảo UI/UX mượt mà, đồng thời không mắc lỗi đồng bộ (stale closure) của API.

## 1. Cập Nhật State & API trong Custom Hook (`use[...]Search.ts`)

Để API và UI luôn đồng bộ ngay khi người dùng click (tránh lỗi nhấn filter nhưng API lại đẩy giá trị cũ vòng trước), hàm `executeSearch` phải nhận giá trị đè (overrides) trực tiếp:

```tsx
// 1. Thêm params overrides vào hàm
const executeSearch = useCallback(async (overrides?: {
  is_deleted?: boolean;
  is_active?: boolean | null;
  keyword?: string;
  page?: number;
}) => {
  setIsLoading(true);
  setError(null);

  try {
    // 2. Gộp state hiện tại với tham số mới nhất vừa click
    const activeFilters = { ...filters, ...(overrides || {}) };
    const resolvedPage = overrides?.page !== undefined ? overrides.page : currentPage;

    const searchCondition: any = {
      is_deleted: activeFilters.is_deleted,
    };

    if (activeFilters.keyword.trim()) {
      searchCondition.keyword = activeFilters.keyword.trim();
    }
    if (activeFilters.is_active !== null && activeFilters.is_active !== undefined) {
      searchCondition.is_active = activeFilters.is_active;
    }

    const payload = {
      searchCondition,
      pageInfo: { pageNum: resolvedPage, pageSize },
    };

    // 3. Gọi API
    const response = await userApi.searchUsers(payload);
    // ... set kết quả trả về
  } finally {
    setIsLoading(false);
  }
}, [filters, currentPage, pageSize]); // Add other dependencies as needed
```

---

## 2. Giao Diện Nút Toggle Trong Thanh Tìm Kiếm (`[...]Search.tsx`)

Thay vì dùng `setTimeout` gây lỗi đồng bộ trễ, khi người dùng click, hãy đẩy trực tiếp tham số vào `executeSearch`:

```tsx
const handleDeletedFilterChange = (value: boolean) => {
  setFilters((prev) => ({ ...prev, is_deleted: value }));
  setCurrentPage(1);
  // GỌI THẲNG HÀM VỚI OVERRIDES
  executeSearch({ is_deleted: value, page: 1 });
};
```

**Mã giao diện UI cho nút Toggle "Current" / "Deleted" (Tách riêng bên góc phải):**

```tsx
{/* Right Side: Deleted Toggle */}
<div>
  <button
    onClick={() => handleDeletedFilterChange(!filters.is_deleted)}
    style={{
      padding: "9px 16px",
      borderRadius: "8px",
      border: "1px solid #e0e0e0",
      backgroundColor: filters.is_deleted ? "#fff3e0" : "white",
      color: filters.is_deleted ? "#f57c00" : "#6c757d",
      fontWeight: "500",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.2s",
      whiteSpace: "nowrap",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = filters.is_deleted ? "#f57c00" : "#bdbdbd";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "#e0e0e0";
    }}
  >
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
    {filters.is_deleted ? "Deleted" : "Current"}
  </button>
</div>
```

*(Lưu ý: Bạn có thể giữ song song ô `<select>` Not deleted/Deleted gốc nếu cần, cả hai Component gọi hàm `handleDeletedFilterChange` sẽ tự động đồng bộ nhau tuyệt đối).*

---

## 3. Bổ Sung Modal Gọi Khôi Phục Dữ Liệu (`[...]Restore.tsx`)

Tạo mới file Component Modal để thay thế cho cái alert xác nhận của Browsers mặc định. Thiết kế Modal English UI chuẩn như hệ thống hiện hành:

```tsx
import { X, RotateCcw } from "lucide-react";

interface RestoreProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetId: string | number;
  targetName: string;
  isRestoring?: boolean;
}

export default function ResourceRestore({
  isOpen, onClose, onConfirm, targetId, targetName, isRestoring = false,
}: RestoreProps) {
  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "white", borderRadius: "12px", width: "90%", maxWidth: "480px", overflow: "hidden" }}>
        
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ backgroundColor: "#e8f5e9", padding: "10px", borderRadius: "8px" }}><RotateCcw size={24} color="#4caf50" /></div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#212529" }}>Restore Item</h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6c757d" }}><X size={20} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          <p style={{ margin: "0 0 16px 0", fontSize: "15px", color: "#495057", lineHeight: "1.6" }}>Are you sure you want to restore this item?</p>
          <div style={{ backgroundColor: "#f8f9fa", padding: "16px", borderRadius: "8px", border: "1px solid #e9ecef" }}>
            <div style={{ marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", color: "#6c757d", textTransform: "uppercase", fontWeight: "600" }}>ID</span>
              <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#212529", fontWeight: "500" }}>#{targetId}</p>
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#6c757d", textTransform: "uppercase", fontWeight: "600" }}>Name</span>
              <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#212529", fontWeight: "500" }}>{targetName}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between" }}>
          <button onClick={onClose} disabled={isRestoring} style={{ padding: "10px 20px", border: "1px solid #e0e0e0", borderRadius: "8px", backgroundColor: "white", cursor: "pointer", color: "#374151" }}>Cancel</button>
          <button onClick={onConfirm} disabled={isRestoring} style={{ padding: "10px 20px", border: "none", borderRadius: "8px", backgroundColor: "#4caf50", color: "white", cursor: "pointer", display: "flex", gap: "8px", alignItems: "center" }}>
            {isRestoring ? "Restoring..." : "Restore"}
          </button>
        </div>

      </div>
    </div>
  );
}
```

---

## 4. Gắn Modal Vào Màn Hình Cụ Thể (`[...]Table.tsx`)

Cuối cùng, thêm state vào Component bảng, sửa logic nút Restore ở dòng dữ liệu tương ứng, và Component render Modal ở block JSX nằm dưới cùng (ngoài `<main>` / `<div container>` chính):

```tsx
  // 1. Quản lý trạng thái
  const [restoreModal, setRestoreModal] = useState({ isOpen: false, id: "", name: "" });

  // 2. Chèn thay thế vào logic sự kiện khi nhấn nút vòng lặp
  <button onClick={() => {
    if (item.is_deleted) {
      setRestoreModal({ isOpen: true, id: item.id, name: item.name });
    } else {
      // Logic mở modal delete thông thường
    }
  }} />

  // 3. Render Modal ngoài cùng layout
  <ResourceRestore
    isOpen={restoreModal.isOpen}
    targetId={restoreModal.id}
    targetName={restoreModal.name}
    isRestoring={isLoading}
    onConfirm={() => {
      restoreItem(restoreModal.id); // Trỏ tới hàm chạy API Restore ở Custom Hook
      setRestoreModal({ isOpen: false, id: "", name: "" }); // Click xong tự đóng Modal
    }}
    onClose={() => setRestoreModal({ isOpen: false, id: "", name: "" })}
  />
```
