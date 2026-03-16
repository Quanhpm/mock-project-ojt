# Shift Management - Manual Test Cases

## 1. Scope

Tài liệu này dùng để test toàn bộ luồng `Shift Management` hiện tại:

- Role-based navigation: `Admin` / `Manager`
- Franchise selection
- Calendar `Assignment View` / `Shift View`
- Filter, month navigation, date selection
- Daily Assignment panel + modal
- Create shift, edit shift
- Quick assign user to shift
- Update assignment status
- Delete assignment
- Import Excel

## 2. Preconditions

Chuẩn bị trước khi test:

- Có ít nhất `1` tài khoản `Admin`
- Có ít nhất `1` tài khoản `Manager` có `franchise_id`
- Có ít nhất `2` franchise
- Franchise đang test có ít nhất:
  - `2` shift active
  - `2` staff active trong `user-franchise-roles`
  - `1` vài shift assignment đã tồn tại
- Có sẵn ít nhất `1` ngày có assignment và `1` ngày không có assignment

## 3. Suggested Test Data

Nên chuẩn bị data kiểu này:

- Franchise A:
  - Shift `Morning` `09:00 - 15:00`
  - Shift `Evening` `15:00 - 21:00`
  - Staff A, Staff B, Staff C
- Franchise B:
  - Shift `Morning B`
  - Staff D
- Existing assignments:
  - `2026-04-03`: Staff A -> Morning
  - `2026-04-03`: Staff B -> Morning
  - `2026-04-03`: Staff C -> Evening

## 4. Known Current Behavior

Khi test, lưu ý đây là behavior hiện tại của hệ thống:

- `Shift View` chỉ hiển thị shift group của những ngày đang có assignment
- Nếu một shift đã được tạo nhưng chưa có ai được assign vào ngày đó, calendar chưa hiện shift đó ở `Shift View`
- Import Excel dùng `work_date`, `shift_id`, `user_id`
- File template import có `2` sheet: `Import` và `References`

## 5. Test Cases

### A. Routing & Access

#### TC-SM-001 - Admin mở menu Shift

**Precondition**
- Đăng nhập bằng tài khoản `Admin`

**Steps**
1. Bấm menu `Shift`

**Expected**
- Không vào thẳng calendar
- Điều hướng tới trang chọn franchise
- Hiển thị danh sách franchise

#### TC-SM-002 - Manager mở menu Shift

**Precondition**
- Đăng nhập bằng tài khoản `Manager`
- `active-context` có `franchise_id`

**Steps**
1. Bấm menu `Shift`

**Expected**
- Điều hướng thẳng vào `/admin/shifts/calendar?franchiseId=...`
- Không đi qua trang chọn franchise

#### TC-SM-003 - Admin chọn franchise thành công

**Precondition**
- Đang ở trang chọn franchise

**Steps**
1. Bấm vào một franchise card

**Expected**
- Điều hướng vào calendar của franchise đã chọn
- Header hiển thị đúng tên franchise

#### TC-SM-004 - Search franchise trên trang chọn franchise

**Precondition**
- Đang ở trang chọn franchise

**Steps**
1. Gõ tên franchise
2. Gõ mã franchise

**Expected**
- Danh sách lọc đúng theo keyword
- Không match thì hiện empty state

### B. Calendar Basics

#### TC-SM-005 - Điều hướng tháng

**Steps**
1. Bấm tháng trước
2. Bấm tháng sau

**Expected**
- Label tháng đổi đúng
- Grid calendar render ổn định
- Không crash khi đổi tháng nhiều lần

#### TC-SM-006 - Chọn ngày trên calendar

**Steps**
1. Bấm một ngày có dữ liệu
2. Bấm một ngày không có dữ liệu

**Expected**
- Panel bên phải đổi đúng ngày
- Không bị lệch state giữa calendar và panel

#### TC-SM-007 - Assignment View mặc định

**Steps**
1. Mở màn calendar

**Expected**
- Mặc định ở `Assignment View`
- Header/panel hiển thị theo assignment

#### TC-SM-008 - Toggle sang Shift View

**Steps**
1. Bấm toggle đổi view

**Expected**
- Chuyển sang `Shift View`
- Grid calendar hiển thị shift group thay vì tên nhân viên
- Panel bên phải đổi thành `Daily Shift Groups`

#### TC-SM-009 - Toggle qua lại nhiều lần

**Steps**
1. Chuyển `Assignment View` -> `Shift View`
2. Chuyển ngược lại
3. Lặp lại vài lần

**Expected**
- Không reload API thừa bất thường
- Dữ liệu không mất
- Ngày đang chọn vẫn giữ

### C. Filters

#### TC-SM-010 - Search trong Assignment View

**Steps**
1. Search theo tên staff
2. Search theo tên shift

**Expected**
- Assignment list lọc đúng
- Calendar cell reflect đúng dữ liệu đã lọc

#### TC-SM-011 - Staff filter trong Assignment View

**Steps**
1. Chọn một staff trong dropdown

**Expected**
- Chỉ còn assignment của staff đó
- Dropdown chỉ hiển thị staff thuộc franchise hiện tại

#### TC-SM-012 - Status filter trong Assignment View

**Steps**
1. Chọn từng status: `PENDING`, `ASSIGNED`, `COMPLETED`, `CANCELED`, `ABSENT`

**Expected**
- Danh sách chỉ hiện assignment đúng status

#### TC-SM-013 - Filter UI trong Shift View

**Steps**
1. Chuyển sang `Shift View`

**Expected**
- Search placeholder đổi thành search theo shift
- Staff filter bị ẩn
- Status filter bị ẩn
- Summary ở header đổi sang `Visible Shift Groups`

#### TC-SM-014 - Search trong Shift View

**Steps**
1. Search theo tên shift đang có assignment
2. Search keyword không tồn tại

**Expected**
- Chỉ hiện đúng shift group match keyword
- Không match thì panel/calendar về empty state hợp lý

#### TC-SM-015 - Clear filters

**Steps**
1. Set search/filter bất kỳ
2. Bấm `Clear Filters`

**Expected**
- Toàn bộ filter reset về mặc định
- Dữ liệu hiển thị lại đầy đủ

### D. Assignment View Panel

#### TC-SM-016 - Hiển thị danh sách assignment trong ngày

**Precondition**
- Chọn ngày có assignment
- Đang ở `Assignment View`

**Expected**
- Mỗi card hiển thị staff, shift, franchise
- Badge status màu đúng

#### TC-SM-017 - Đổi status assignment

**Steps**
1. Bấm badge status của một assignment
2. Chọn từng status khác

**Expected**
- Dropdown mở đúng
- API update status được gọi
- Sau khi save, status mới hiển thị đúng

#### TC-SM-018 - Delete assignment từ panel

**Steps**
1. Bấm icon delete
2. Xác nhận ở dialog

**Expected**
- Có confirm trước khi xóa
- Sau khi xóa, assignment biến mất khỏi panel/calendar

#### TC-SM-019 - Hủy delete assignment từ panel

**Steps**
1. Bấm delete
2. Chọn cancel/close dialog

**Expected**
- Không gọi delete API
- Assignment vẫn giữ nguyên

### E. Shift View Panel & Daily Assignment Modal

#### TC-SM-020 - Open Daily Assignment từ Shift View panel

**Precondition**
- Chọn ngày có shift group
- Đang ở `Shift View`

**Steps**
1. Bấm `Open Daily Assignment`

**Expected**
- Mở đúng modal của shift/day đã chọn
- Header modal hiển thị đúng tên shift, ngày, giờ

#### TC-SM-021 - Open Daily Assignment từ calendar cell

**Steps**
1. Trong `Shift View`, bấm một shift nằm trong calendar cell

**Expected**
- Chọn đúng ngày
- Mở modal đúng shift

#### TC-SM-022 - Update status trong Daily Assignment modal

**Steps**
1. Mở modal Daily Assignment
2. Đổi status một assignment

**Expected**
- Status cập nhật thành công
- Modal vẫn còn mở
- Dữ liệu trong modal sync đúng

#### TC-SM-023 - Delete assignment trong Daily Assignment modal

**Steps**
1. Mở modal Daily Assignment
2. Bấm delete một user assignment
3. Confirm

**Expected**
- Assignment bị xóa
- Count assignment trong modal cập nhật đúng

#### TC-SM-024 - Assign user trong Daily Assignment modal

**Steps**
1. Mở modal Daily Assignment
2. Chọn user từ dropdown
3. Bấm `Assign User`

**Expected**
- Chỉ hiện user thuộc franchise hiện tại
- Không hiện user đã assign rồi trong chính shift/day đó
- Tạo assignment thành công và reload đúng

### F. Quick Assign

#### TC-SM-025 - Mở quick assign từ Daily Shift Groups

**Steps**
1. Chọn ngày bất kỳ
2. Bấm `Assign User` ở panel `Daily Shift Groups`

**Expected**
- Mở modal quick assign
- Hiển thị đúng ngày đang chọn

#### TC-SM-026 - Quick assign: chọn shift trước rồi mới chọn user

**Steps**
1. Mở quick assign modal
2. Quan sát dropdown user trước khi chọn shift
3. Chọn một shift

**Expected**
- Trước khi chọn shift, user select bị disable hoặc yêu cầu chọn shift trước
- Sau khi chọn shift, dropdown user được enable

#### TC-SM-027 - Quick assign: chặn duplicate

**Precondition**
- Trong ngày đang chọn, shift `Morning` đã có Staff A

**Steps**
1. Mở quick assign
2. Chọn shift `Morning`

**Expected**
- Staff A không còn xuất hiện trong user dropdown của shift đó
- Nếu cố tạo trùng bằng state cũ thì UI chặn trước khi gọi API

#### TC-SM-028 - Quick assign thành công

**Steps**
1. Chọn shift
2. Chọn user hợp lệ
3. Submit

**Expected**
- Tạo assignment thành công
- Modal đóng
- Calendar/panel reload đúng

### G. Create Shift & Edit Shift

#### TC-SM-029 - Create shift step 1

**Steps**
1. Bấm `Create Shift`
2. Nhập tên shift, franchise, giờ bắt đầu, giờ kết thúc
3. Submit

**Expected**
- Tạo shift thành công
- Chuyển sang step 2

#### TC-SM-030 - Create shift step 2 assign staff

**Steps**
1. Ở step 2, chọn staff
2. Chọn work date
3. Submit

**Expected**
- Gọi API assign thành công
- Điều hướng về calendar đúng franchise

#### TC-SM-031 - Edit shift từ Shift View

**Steps**
1. Trong `Shift View`, bấm `Edit Shift`
2. Đổi tên shift hoặc giờ
3. Save

**Expected**
- Update thành công
- Calendar reload với thông tin shift mới

#### TC-SM-032 - Edit shift từ Daily Assignment modal

**Steps**
1. Mở `Daily Assignment`
2. Bấm `Edit Shift`
3. Save thay đổi

**Expected**
- Update thành công
- Modal/day panel hiển thị giờ hoặc tên mới

### H. Import Excel

#### TC-SM-033 - Download import template

**Steps**
1. Bấm `Import Excel`
2. Bấm `Download Template`

**Expected**
- Tải đúng `1` file Excel
- File có `2` sheet: `Import`, `References`
- `References` có hướng dẫn date format `YYYY-MM-DD`

#### TC-SM-034 - Parse file import hợp lệ

**Steps**
1. Upload file hợp lệ với cột `work_date`, `shift_id`, `user_id`

**Expected**
- Preview row hiển thị đúng
- `Ready` > 0
- Không báo validation error

#### TC-SM-035 - Validate header import

**Steps**
1. Upload file thiếu header bắt buộc

**Expected**
- Báo lỗi file invalid
- Không cho submit

#### TC-SM-036 - Validate date import

**Steps**
1. Upload file có `work_date` sai format

**Expected**
- Row bị mark error
- Không cho import

#### TC-SM-037 - Validate duplicate trong file

**Steps**
1. Upload file có 2 row cùng `shift_id + user_id + work_date`

**Expected**
- Row duplicate bị mark error
- Không cho import

#### TC-SM-038 - Validate duplicate với assignment có sẵn

**Steps**
1. Upload file chứa assignment đã tồn tại trên calendar

**Expected**
- Row bị mark error `already exists`
- Không cho import

#### TC-SM-039 - Partial fail import

**Precondition**
- Backend trả partial fail cho bulk import

**Steps**
1. Upload file có cả row hợp lệ và row backend reject
2. Submit import

**Expected**
- Toast warning hiển thị
- Modal không tự đóng
- Có thể tiếp tục kiểm tra lại file

#### TC-SM-040 - Import thành công

**Steps**
1. Upload file hợp lệ hoàn toàn
2. Submit

**Expected**
- Toast success
- Modal đóng
- Calendar reload và hiện assignment mới

### I. Empty States & Edge Cases

#### TC-SM-041 - Ngày không có assignment

**Steps**
1. Chọn ngày không có assignment
2. Ở `Assignment View`

**Expected**
- Hiện `No assignments for this day`

#### TC-SM-042 - Ngày không có shift group

**Steps**
1. Chọn ngày không có assignment
2. Chuyển sang `Shift View`

**Expected**
- Hiện empty state `No shifts grouped for this day`
- Có CTA `Assign User To Shift`

#### TC-SM-043 - Franchise không có staff hợp lệ

**Precondition**
- Franchise không có user active trong `user-franchise-roles`

**Steps**
1. Mở Daily Assignment modal hoặc quick assign

**Expected**
- Dropdown user không có option
- UI hiển thị rõ `No available users`

#### TC-SM-044 - Franchise không có shift active

**Precondition**
- Franchise không có shift active

**Steps**
1. Mở quick assign
2. Mở import template

**Expected**
- Quick assign không có shift option
- References sheet của import phản ánh đúng trạng thái data

## 6. Regression Notes

Sau khi test xong, nên xác nhận thêm:

- Không có API search user nào trả cả user deleted trong flow Shift
- Toggle view không làm mất franchise đang chọn
- `Change Franchise` chỉ xuất hiện với `Admin`
- `Manager` luôn bị lock vào đúng franchise của mình

## 7. Recommended Test Order

Để test nhanh nhưng vẫn đủ sâu, mình khuyên đi theo thứ tự:

1. Routing và chọn franchise
2. Calendar basics
3. Filters
4. Assignment View actions
5. Shift View + Daily Assignment
6. Quick assign
7. Create shift + Edit shift
8. Import Excel
9. Empty states và edge cases
