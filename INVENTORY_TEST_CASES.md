# 🧪 INVENTORY MANAGEMENT - TEST CASES

> **Module:** Inventory Management - Inline Edit + Excel Import/Export + Bulk Update
> **Ngày:** 10 tháng 3, 2026
> **Tester:** ********\_********
> **Browser:** Chrome / Firefox / Safari

---

## 📋 CHECKLIST TỔNG QUAN

- [ ] **A. INLINE EDIT** (8 test cases)
- [ ] **B. EXPORT** (6 test cases)
- [ ] **C. IMPORT** (15 test cases)
- [ ] **D. UPDATE SELECTED (API BULK)** (4 test cases)
- [ ] **E. EDGE CASES & BUGS** (3 test cases)

**Tổng cộng:** 36 test cases

---

## A. INLINE EDIT (Chỉnh sửa trực tiếp trên Table)

### A1. Sửa quantity 1 row

**Mục tiêu:** Kiểm tra thay đổi quantity và tính toán delta đúng.

**Bước thực hiện:**

1. Mở trang Inventory List
2. Tìm 1 row có `quantity = 100`
3. Click vào input Quantity, sửa thành `150`
4. Tick checkbox ở đầu row
5. Nhấn nút **"Update Selected (1)"**

**Kết quả mong đợi:**

- ✅ Toast hiện: _"Cập nhật thành công - Đã cập nhật 1 inventory items"_
- ✅ Network tab: `POST /api/inventories/adjust/bulk` với payload:
  ```json
  {
    "items": [
      {
        "product_franchise_id": "...",
        "change": 50,
        "alert_threshold": 10,
        "reason": ""
      }
    ]
  }
  ```
- ✅ Table refetch, quantity hiển thị `150`
- ✅ Checkbox tự động untick sau khi update thành công

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### A2. Sửa alert_threshold 1 row

**Mục tiêu:** Kiểm tra thay đổi alert_threshold (giá trị tuyệt đối).

**Bước thực hiện:**

1. Tìm 1 row có `alert_threshold = 10`
2. Sửa alert_threshold thành `20`
3. Tick checkbox
4. Nhấn **"Update Selected (1)"**

**Kết quả mong đợi:**

- ✅ API payload: `"change": 0` (vì quantity không đổi), `"alert_threshold": 20`
- ✅ Toast success
- ✅ Table refetch, alert_threshold hiển thị `20`

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### A3. Sửa cả 2 field cùng lúc

**Mục tiêu:** Kiểm tra sửa đồng thời quantity + alert_threshold.

**Bước thực hiện:**

1. Tìm row có `quantity = 100`, `alert_threshold = 10`
2. Sửa quantity → `70`, alert_threshold → `5`
3. Tick checkbox
4. Nhấn **"Update Selected (1)"**

**Kết quả mong đợi:**

- ✅ API payload: `"change": -30`, `"alert_threshold": 5`
- ✅ Toast success
- ✅ Table refetch với data mới

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### A4. Sửa nhưng KHÔNG tick checkbox

**Mục tiêu:** Kiểm tra validation "phải chọn ít nhất 1 row".

**Bước thực hiện:**

1. Sửa quantity từ `100` → `150`
2. **KHÔNG tick checkbox**
3. Nhấn **"Update Selected (0)"**

**Kết quả mong đợi:**

- ✅ Nút **"Update Selected (0)"** bị **disabled** (không click được)
- ✅ Hoặc nếu click được: Toast error _"Vui lòng chọn ít nhất 1 row để update"_
- ✅ Không gọi API

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### A5. Sửa rồi quay về giá trị gốc

**Mục tiêu:** Kiểm tra change = 0 khi không thực sự thay đổi.

**Bước thực hiện:**

1. Row có quantity gốc `100`
2. Sửa thành `150`
3. Sửa lại về `100`
4. Tick checkbox
5. Nhấn **"Update Selected (1)"**

**Kết quả mong đợi:**

- ✅ API payload: `"change": 0`
- ✅ API vẫn được gọi (change=0 là hợp lệ)
- ✅ Toast success
- ✅ Table không thay đổi (vì data giữ nguyên)

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### A6. ⚠️ [BUG TIỀM ẨN] Xóa hết nội dung input

**Mục tiêu:** Kiểm tra xử lý NaN khi input rỗng.

**Bước thực hiện:**

1. Click vào input Quantity
2. Xóa hết nội dung (Ctrl+A → Delete)
3. Input hiện rỗng
4. Tick checkbox
5. Nhấn **"Update Selected (1)"**

**Kết quả mong đợi (LÝ TƯỞNG):**

- ✅ API payload: `"change": 0` (fallback về giá trị gốc) HOẶC
- ✅ Toast warning: _"Vui lòng nhập giá trị hợp lệ"_

**Kết quả mong đợi (HIỆN TẠI - CÓ THỂ BỊ BUG):**

- ⚠️ API payload: `"change": NaN` (vì `NaN - 100 = NaN`)
- ⚠️ Backend có thể reject hoặc xử lý sai

**Kết quả thực tế:** ☐ PASS / ☐ FAIL / ☐ BUG  
**Ghi chú:** ************\_************

---

### A7. Nhập số âm vào input

**Mục tiêu:** Kiểm tra input có min={0} có chặn được số âm không.

**Bước thực hiện:**

1. Click vào input Quantity
2. Gõ tay `-5` (hoặc dùng scroll mouse xuống âm)
3. Tick checkbox
4. Nhấn **"Update Selected (1)"**

**Kết quả mong đợi:**

- ⚠️ Input có `min={0}` nhưng user vẫn có thể gõ tay số âm
- ⚠️ API payload: `"change": -105` (nếu gốc là 100)
- ⚠️ Backend có thể reject (tùy validation phía server)

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### A8. Nhập số thập phân

**Mục tiêu:** Kiểm tra input type="number" có chặn số thập phân không.

**Bước thực hiện:**

1. Nhập `10.5` vào input Quantity
2. Tick checkbox
3. Nhấn **"Update Selected (1)"**

**Kết quả mong đợi:**

- ⚠️ Input cho phép nhập `10.5`
- ⚠️ API payload: `"change": -89.5` (nếu gốc là 100)
- ⚠️ Backend validation phải reject (vì quantity phải là integer)

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

## B. EXPORT (Xuất dữ liệu ra Excel)

### B1. Export All (có data)

**Mục tiêu:** Kiểm tra export toàn bộ data.

**Bước thực hiện:**

1. Đảm bảo table có ít nhất 5 rows
2. Nhấn nút **"Export All"**

**Kết quả mong đợi:**

- ✅ File `inventory_export_2026-03-10.xlsx` tải về
- ✅ Mở file Excel, có 6 cột:
  - `Inventory ID` | `Product Name` | `Franchise Name` | `Product Franchise ID` (ẩn) | `Quantity` | `Alert Threshold`
- ✅ Số dòng data = số rows trên table
- ✅ Toast success: _"Export thành công - Đã xuất X dòng ra file Excel"_

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### B2. Export All (0 data)

**Mục tiêu:** Kiểm tra export khi table trống.

**Bước thực hiện:**

1. Xóa hết data hoặc dùng filter để table hiển thị 0 rows
2. Nhấn **"Export All"**

**Kết quả mong đợi:**

- ✅ Toast error: _"Export thất bại - Không có dữ liệu để export"_
- ✅ Không có file tải về

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### B3. Export Selected (2 rows tick)

**Mục tiêu:** Kiểm tra export chỉ các row đã chọn.

**Bước thực hiện:**

1. Tick checkbox 2 rows bất kỳ
2. Nhấn **"Export Selected"**

**Kết quả mong đợi:**

- ✅ File Excel chỉ chứa **2 rows** (không phải toàn bộ)
- ✅ Toast success: _"Đã xuất 2 dòng ra file Excel"_

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### B4. Export Selected (0 tick)

**Mục tiêu:** Kiểm tra nút disabled khi chưa tick.

**Bước thực hiện:**

1. Không tick checkbox nào
2. Quan sát nút **"Export Selected"**

**Kết quả mong đợi:**

- ✅ Nút **"Export Selected"** bị **disabled** (opacity: 0.5, cursor: not-allowed)
- ✅ Không click được

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### B5. Export sau khi sửa inline

**Mục tiêu:** Kiểm tra file export lấy `_editQuantity` (data đã sửa).

**Bước thực hiện:**

1. Sửa quantity từ `100` → `150` (chưa Update API)
2. Ngay lập tức nhấn **"Export All"**
3. Mở file Excel

**Kết quả mong đợi:**

- ✅ File chứa `quantity = 150` (lấy từ `_editQuantity`, không phải data gốc)

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### B6. Cột Product Franchise ID ẩn

**Mục tiêu:** Kiểm tra cột D có hidden trong Excel không.

**Bước thực hiện:**

1. Export file
2. Mở Excel
3. Quan sát cột D (Product Franchise ID)

**Kết quả mong đợi:**

- ✅ Cột D bị **ẩn** (hidden) trong Excel
- ✅ User không nhìn thấy cột này (để tránh sửa nhầm)
- ✅ Nhưng data vẫn tồn tại (khi unhide thủ công thì vẫn thấy)

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

## C. IMPORT (Nhập dữ liệu từ Excel)

### C1. Import file ok, tất cả match

**Mục tiêu:** Kiểm tra luồng happy path - import thành công.

**Bước thực hiện:**

1. Nhấn **"Export All"** → Tải file `inventory_export_2026-03-10.xlsx`
2. Mở file Excel
3. Sửa 2 giá trị:
   - Row 1: Quantity từ `100` → `200`
   - Row 2: Alert Threshold từ `10` → `20`
4. Save file
5. Nhấn **"Import"** → Chọn file vừa sửa

**Kết quả mong đợi:**

- ✅ Không có error banner
- ✅ Table cập nhật:
  - Row 1: Quantity = `200`, **checkbox tự động tick**
  - Row 2: Alert Threshold = `20`, **checkbox tự động tick**
- ✅ Toast success: _"Import thành công - Đã import 2 dòng vào bảng"_

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### C2. Import file có quantity là text

**Mục tiêu:** Kiểm tra validation kiểu dữ liệu.

**Bước thực hiện:**

1. Export file → Mở Excel
2. Sửa Row 1, Quantity = `"abc"` (text)
3. Save → Import

**Kết quả mong đợi:**

- ✅ Error banner hiện:
  ```
  ⚠️ Import Errors (1 lỗi):
  Row 01, lỗi chỉ được nhập data số ở field quantity,
  ```
- ✅ Table **KHÔNG thay đổi** (giữ nguyên data gốc)
- ✅ Không có toast success

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### C3. Import file có quantity âm

**Mục tiêu:** Kiểm tra validation >= 0.

**Bước thực hiện:**

1. Sửa Row 1, Quantity = `-5`
2. Import

**Kết quả mong đợi:**

- ✅ Error banner:
  ```
  Row 01: lỗi data ở field quantity phải >= 0
  ```

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### C4. Import file có quantity thập phân

**Mục tiêu:** Kiểm tra validation integer.

**Bước thực hiện:**

1. Sửa Quantity = `10.5`
2. Import

**Kết quả mong đợi:**

- ✅ Error banner:
  ```
  Row 01: lỗi data ở field quantity phải là số nguyên
  ```

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### C5. Import file có alert_threshold là text

**Mục tiêu:** Kiểm tra validation alert_threshold kiểu dữ liệu.

**Bước thực hiện:**

1. Sửa Alert Threshold = `"xyz"`
2. Import

**Kết quả mong đợi:**

- ✅ Error banner:
  ```
  Row 01, lỗi chỉ được nhập data số ở field alert_threshold,
  ```

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### C6. Import file có alert_threshold âm

**Mục tiêu:** Kiểm tra validation >= 0.

**Bước thực hiện:**

1. Sửa Alert Threshold = `-3`
2. Import

**Kết quả mong đợi:**

- ✅ Error banner:
  ```
  Row 01: lỗi data ở field alert_threshold phải >= 0
  ```

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### C7. Import file có NHIỀU row lỗi

**Mục tiêu:** Kiểm tra thu thập tất cả lỗi.

**Bước thực hiện:**

1. Export file có 5 rows
2. Sửa:
   - Row 1: Quantity = `"abc"`
   - Row 3: Alert Threshold = `-5`
   - Row 5: Quantity = `10.5`
3. Import

**Kết quả mong đợi:**

- ✅ Error banner hiện **3 lỗi**, mỗi lỗi xuống dòng:
  ```
  Row 01, lỗi chỉ được nhập data số ở field quantity,
  Row 03: lỗi data ở field alert_threshold phải >= 0
  Row 05: lỗi data ở field quantity phải là số nguyên
  ```
- ✅ Table **KHÔNG thay đổi**

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### C8. Import file rỗng (0 data rows)

**Mục tiêu:** Kiểm tra validation file rỗng.

**Bước thực hiện:**

1. Export file → Mở Excel
2. Xóa hết data rows, chỉ giữ header
3. Save → Import

**Kết quả mong đợi:**

- ✅ Toast error: _"Import thất bại - File không có dữ liệu"_
- ✅ Không có error banner

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### C9. Import file sai format (.pdf)

**Mục tiêu:** Kiểm tra validation file extension.

**Bước thực hiện:**

1. Nhấn **"Import"**
2. Chọn file `.pdf` hoặc `.txt`

**Kết quả mong đợi:**

- ✅ Toast error: _"Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV (.csv)"_

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### C10. Import file > 5MB

**Mục tiêu:** Kiểm tra validation file size.

**Bước thực hiện:**

1. Tạo file Excel > 5MB (copy nhiều rows)
2. Import

**Kết quả mong đợi:**

- ✅ Toast error: _"File quá lớn (tối đa 5MB)"_

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### C11. Import file thiếu cột header

**Mục tiêu:** Kiểm tra validation header columns.

**Bước thực hiện:**

1. Export → Mở Excel
2. Xóa cột **"Quantity"** (cả header và data)
3. Save → Import

**Kết quả mong đợi:**

- ✅ Toast error: _"Header file không đúng định dạng. Thiếu cột: Quantity"_

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### C12. Import row có product_franchise_id không match table

**Mục tiêu:** Kiểm tra validation pfId tồn tại.

**Bước thực hiện:**

1. Export → Mở Excel
2. Unhide cột D (Product Franchise ID)
3. Sửa Row 1, Product Franchise ID = `"RANDOM_ID_123"`
4. Save → Import

**Kết quả mong đợi:**

- ✅ Error banner:
  ```
  Row 01: Product Franchise ID "ID_123" không tìm thấy trên bảng hiện tại
  ```

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### C13. Import 2 row trùng product_franchise_id

**Mục tiêu:** Kiểm tra validation trùng lặp pfId.

**Bước thực hiện:**

1. Export file có 3 rows
2. Unhide cột D
3. Copy Product Franchise ID từ Row 1 → Paste vào Row 2
4. Save → Import

**Kết quả mong đợi:**

- ✅ Error banner:
  ```
  Trùng lặp Product Franchise ID "..." tại các dòng: 01, 02
  ```

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### C14. Import lại cùng 1 file 2 lần

**Mục tiêu:** Kiểm tra reset input file.

**Bước thực hiện:**

1. Import file lần 1 (thành công)
2. Nhấn **"Import"** lần 2
3. Chọn **cùng file** vừa import

**Kết quả mong đợi:**

- ✅ File dialog cho phép chọn cùng file
- ✅ Import lần 2 vẫn hoạt động (do `fileInputRef.value = ""`)

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### C15. Đóng error banner

**Mục tiêu:** Kiểm tra close button của error banner.

**Bước thực hiện:**

1. Import file lỗi → Error banner hiện
2. Nhấn nút **✕** ở góc phải error banner

**Kết quả mong đợi:**

- ✅ Error banner biến mất
- ✅ Table giữ nguyên

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

## D. UPDATE SELECTED (API BULK)

### D1. Update 3 rows đã tick

**Mục tiêu:** Kiểm tra bulk update thành công.

**Bước thực hiện:**

1. Sửa 3 rows:
   - Row 1: Quantity `100 → 150`
   - Row 2: Alert Threshold `10 → 20`
   - Row 3: Cả 2 field
2. Tick checkbox 3 rows
3. Nhấn **"Update Selected (3)"**
4. Mở Network tab, quan sát request

**Kết quả mong đợi:**

- ✅ API `POST /api/inventories/adjust/bulk` với payload:
  ```json
  {
    "items": [
      {
        "product_franchise_id": "...",
        "change": 50,
        "alert_threshold": 10,
        "reason": ""
      },
      {
        "product_franchise_id": "...",
        "change": 0,
        "alert_threshold": 20,
        "reason": ""
      },
      {
        "product_franchise_id": "...",
        "change": -30,
        "alert_threshold": 5,
        "reason": ""
      }
    ]
  }
  ```
- ✅ Toast success: _"Đã cập nhật 3 inventory items"_
- ✅ Table refetch, data mới hiển thị
- ✅ Checkbox tự động untick

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### D2. Update 0 rows

**Mục tiêu:** Kiểm tra nút disabled khi 0 row được chọn.

**Bước thực hiện:**

1. Không tick checkbox nào
2. Quan sát nút **"Update Selected (0)"**

**Kết quả mong đợi:**

- ✅ Nút **disabled** (opacity: 0.5, cursor: not-allowed)
- ✅ Không click được

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### D3. API trả lỗi (500 Internal Server Error)

**Mục tiêu:** Kiểm tra xử lý lỗi từ backend.

**Bước thực hiện:**

1. Sửa + tick 1 row
2. **Tắt backend server** hoặc mock API trả 500
3. Nhấn **"Update Selected (1)"**

**Kết quả mong đợi:**

- ✅ Toast error: _"Cập nhật thất bại - Không thể cập nhật lúc này. Vui lòng thử lại!"_
- ✅ Table **KHÔNG thay đổi** (giữ nguyên data đã sửa)
- ✅ Checkbox vẫn còn tick

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

### D4. Import → Auto tick → Update (End-to-End)

**Mục tiêu:** Kiểm tra luồng hoàn chỉnh Import + Update.

**Bước thực hiện:**

1. Export → Sửa 2 rows trong Excel → Import
2. Kiểm tra: 2 rows tự động tick checkbox
3. Nhấn **"Update Selected (2)"**
4. Kiểm tra API và table

**Kết quả mong đợi:**

- ✅ Import thành công → 2 checkbox tự động tick
- ✅ Nhấn Update → API gọi với 2 items
- ✅ Toast success
- ✅ Table refetch

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

## E. EDGE CASES & BUGS

### E1. ⚠️ [BUG] Filter + Select All

**Mục tiêu:** Kiểm tra bug Select All khi có filter.

**Bước thực hiện:**

1. Filter status = **"Low Stock"** → Table chỉ hiển thị 3 rows
2. Nhấn checkbox **"Select All"** ở header
3. Kiểm tra: Có bao nhiêu row được tick?
4. Bỏ filter → Quan sát toàn bộ table

**Kết quả HIỆN TẠI (BUG):**

- ⚠️ Checkbox header hiện **unchecked** (vì có items ẩn chưa tick)
- ⚠️ Khi click Select All → **TẤT CẢ** items được tick (kể cả items bị filter ẩn)
- ⚠️ Bỏ filter → Thấy cả items "In Stock" cũng bị tick

**Kết quả MONG ĐỢI (SAU KHI FIX):**

- ✅ Chỉ tick các row **đang hiển thị** (sau filter)
- ✅ Checkbox header đúng trạng thái

**Kết quả thực tế:** ☐ BUG XÁC NHẬN / ☐ ĐÃ FIX  
**Ghi chú:** ************\_************

---

### E2. ⚠️ [GIỚI HẠN THIẾT KẾ] Chuyển trang mất data sửa

**Mục tiêu:** Kiểm tra persistence data khi chuyển page.

**Bước thực hiện:**

1. Ở Page 1, sửa quantity row 1 từ `100 → 150` (chưa Update)
2. Chuyển sang **Page 2**
3. Quay lại **Page 1**
4. Kiểm tra row 1

**Kết quả HIỆN TẠI:**

- ⚠️ Row 1 về lại `100` (data sửa bị mất)

**Nguyên nhân:**

- `useEffect([inventories])` gọi `replace()` mỗi khi API refetch
- Data chỉ tồn tại trên page hiện tại

**Giải pháp (nếu cần):**

- Lưu data sửa vào localStorage/sessionStorage
- Hoặc bắt buộc user Update trước khi chuyển page

**Kết quả thực tế:** ☐ XÁC NHẬN GIỚI HẠN / ☐ CẦN FIX  
**Ghi chú:** ************\_************

---

### E3. Import khi đang ở page khác

**Mục tiêu:** Kiểm tra import file có pfId thuộc page khác.

**Bước thực hiện:**

1. Ở **Page 1**, export 2 rows
2. Chuyển sang **Page 2**
3. Import file vừa export (từ Page 1)

**Kết quả mong đợi:**

- ✅ Error banner: _"Product Franchise ID ... không tìm thấy trên bảng hiện tại"_
- ✅ Hoặc toast warning: _"Đã import 0 dòng, bỏ qua 2 dòng không khớp"_

**Kết quả thực tế:** ☐ PASS / ☐ FAIL  
**Ghi chú:** ************\_************

---

## 📊 TỔNG KẾT

### Thống kê kết quả

| Phần               | Tổng   | Pass     | Fail     | Bug      |
| ------------------ | ------ | -------- | -------- | -------- |
| A. Inline Edit     | 8      | \_\_     | \_\_     | \_\_     |
| B. Export          | 6      | \_\_     | \_\_     | \_\_     |
| C. Import          | 15     | \_\_     | \_\_     | \_\_     |
| D. Update Selected | 4      | \_\_     | \_\_     | \_\_     |
| E. Edge Cases      | 3      | \_\_     | \_\_     | \_\_     |
| **TỔNG**           | **36** | **\_\_** | **\_\_** | **\_\_** |

### Bugs phát hiện (cần fix)

1. ☐ **[E1]** Select All khi filter tick cả items ẩn
2. ☐ **[A6]** NaN khi xóa hết input
3. ☐ **[E2]** Data sửa mất khi chuyển page (giới hạn thiết kế)

### Ghi chú chung

---

---

---

---

**Tester:** ************\_************  
**Ngày hoàn thành:** **_/_**/2026  
**Chữ ký:** ************\_************
