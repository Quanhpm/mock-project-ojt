# Cart Module - Giải thích toàn bộ code

## 1. Mục tiêu của module
Module cart xử lý toàn bộ nghiệp vụ giỏ hàng phía client, gồm:
- Danh sách các giỏ hàng đang hoạt động.
- Chi tiết một giỏ hàng.
- Tăng/giảm/cập nhật số lượng item.
- Chỉnh sửa topping và ghi chú item.
- Áp mã voucher, xóa voucher.
- Hủy toàn bộ giỏ hàng.
- Checkout.

Module được tổ chức theo hướng tách lớp rõ ràng:
- pages: màn hình.
- components: UI component thuần hiển thị.
- hooks: state + nghiệp vụ + điều phối.
- services: helper tính toán/format.

---

## 2. Cấu trúc thư mục

- components/
  - CartDetailDialogs.tsx
  - CartDetailEmptyState.tsx
  - CartDetailHeader.tsx
  - CartDetailItemCard.tsx
  - CartDetailItemsSection.tsx
  - CartDetailSummaryAside.tsx
  - CartEditModal.tsx
  - CartSummaryCard.tsx
  - Confirm.tsx
  - index.ts
- hooks/
  - cartApiMapper.ts
  - use-cart-detail-page.hook.ts
  - use-cart-detail.hook.ts
  - use-cart-list.hook.ts
  - use-checkout-handler.hook.ts
- layouts/
  - index.ts
- pages/
  - Cart.tsx
  - CartDetail.tsx
- services/
  - cartDetail.service.ts

---

## 3. Luồng tổng thể

### 3.1 Trang danh sách giỏ hàng
1. pages/Cart.tsx gọi hooks/use-cart-list.hook.ts.
2. Hook gọi API lấy carts theo customer.
3. Dữ liệu thô được chuẩn hóa qua hooks/cartApiMapper.ts (extract + toCartSummary).
4. UI render danh sách qua components/CartSummaryCard.tsx.
5. Click card đi đến trang chi tiết cart.

### 3.2 Trang chi tiết giỏ hàng
1. pages/CartDetail.tsx gọi hooks/use-cart-detail-page.hook.ts (view-model cho page).
2. Hook page dùng hooks/use-cart-detail.hook.ts để xử lý toàn bộ nghiệp vụ cart.
3. Hook detail gọi API và chuẩn hóa dữ liệu qua cartApiMapper.ts (toCartDetail).
4. Page chỉ ghép các component UI:
   - Header
   - Items section
   - Summary aside
   - Dialogs (modal edit + confirm)

---

## 4. Giải thích chi tiết theo file

## 4.1 pages

### pages/Cart.tsx
Vai trò:
- Màn hình danh sách giỏ hàng của user.

Điểm chính:
- Lấy user và trạng thái đăng nhập từ client auth store.
- Gọi useCartList(user?.id, isLoggedIn).
- Nếu không có cart: render empty state + CTA đi menu.
- Nếu có cart: render grid CartSummaryCard và tổng tiền tất cả carts.

Thiết kế:
- Đây là page container vừa đủ, nghiệp vụ nặng nằm trong hook.

### pages/CartDetail.tsx
Vai trò:
- Màn hình chi tiết một giỏ hàng.

Điểm chính:
- Gọi useCartDetailPage() để nhận toàn bộ state/handlers.
- Không giữ logic business trong page.
- Chỉ render layout và truyền props vào component con.
- Hiển thị loading, empty state, nội dung chi tiết, modal/dialog.

Thiết kế:
- Page mỏng, tập trung style + composition.

---

## 4.2 hooks

### hooks/use-cart-list.hook.ts
Vai trò:
- Load và quản lý dữ liệu danh sách cart.

State trả về:
- carts: danh sách cart đã chuẩn hóa.
- totalItems: tổng item của tất cả carts.
- totalAmount: tổng tiền của tất cả carts.
- formatUpdatedAt: formatter thời gian “x phút/giờ/ngày trước”.

Nghiệp vụ:
- Gọi getCustomerCarts khi có userId và đang đăng nhập.
- Chuỗi xử lý dữ liệu:
  - extractCartsFromPayload
  - toCartSummary
  - filter cart hợp lệ (có id, itemsCount > 0)
- Bắt lỗi và toast bằng HttpError.

### hooks/use-cart-detail.hook.ts
Vai trò:
- Hook nghiệp vụ trung tâm cho màn hình cart detail.

State quan trọng:
- cart, isLoading
- isDeleting, isUpdatingQuantity
- editingItem, editItemQuantity, editNote, editOptions
- availableToppings, isLoadingToppings, isSavingEdit
- voucherCode, isApplyingVoucher, isRemovingVoucher
- isCancellingCart

Nghiệp vụ chính:
- loadCartDetail(): gọi getCartDetail + map toCartDetail.
- handleDeleteItem(): xóa item khỏi cart.
- setCartItemQuantity()/increase/decrease: cập nhật số lượng item.
- openEditPopup()/closeEditPopup(): điều khiển modal chỉnh sửa.
- load topping cho modal:
  - gọi getMenuByFranchise
  - tìm category topping
  - map thành danh sách topping khả dụng
- saveEditedItem():
  - so sánh thay đổi quantity, options, note
  - gọi updateCartItemQuantity / updateCartItemOptions khi cần
  - note hiện chưa có API cập nhật trực tiếp, chỉ toast thông báo
- applyVoucherForCart()/removeAllVoucherFromCart()
- handleCancelCart(): gọi API cancelCart để hủy cart.

Thiết kế:
- Đây là lớp “domain logic”.
- Component chỉ gọi handlers, không tự xử lý API.

### hooks/use-cart-detail-page.hook.ts
Vai trò:
- View-model cho trang CartDetail.

Điểm chính:
- Gộp dữ liệu từ useCartDetail + useCheckoutHandler.
- Quản lý state UI page-level:
  - pendingDeleteItemId
  - isCancelCartConfirmOpen
- Cung cấp handlers điều phối:
  - open/close/confirm delete item
  - open/close/confirm cancel cart
  - navigate về cart list hoặc menu
- Inject formatter và totalDiscount từ services.

Thiết kế:
- Tách "điều phối page" khỏi page component.
- Là lớp trung gian giữa UI và domain hook.

### hooks/use-checkout-handler.hook.ts
Vai trò:
- Xử lý checkout theo cartId.

Nghiệp vụ:
- Lấy address/phone từ profile customer.
- Gọi checkoutCart(cartId, { address, phone }).
- Điều hướng sang route checkout.

Lưu ý:
- Trong finally vẫn navigate sang trang checkout, kể cả khi API checkout lỗi.

### hooks/cartApiMapper.ts
Vai trò:
- Chuẩn hóa payload API không đồng nhất về một view model ổn định cho UI.

Kiểu dữ liệu xuất ra:
- CartSummaryView
- CartDetailItemView
- CartDetailView

Hàm chính:
- extractCartsFromPayload(payload):
  - hỗ trợ nhiều shape payload: array, data, carts, nested items...
- toCartSummary(cart): map sang model cho màn danh sách.
- toCartDetail(cart): map sang model cho màn chi tiết.

Helper:
- isRecord, isLikelyCart, isLikelyCartItem
- pickString, pickNumber
- extractCartItems

Thiết kế:
- Giúp UI/hook không phụ thuộc trực tiếp vào shape backend.
- Là điểm cô lập rủi ro khi backend thay đổi format response.

---

## 4.3 components

### components/CartSummaryCard.tsx
Vai trò:
- Card hiển thị 1 cart trong danh sách.

Hiển thị:
- Franchise, trạng thái cart, preview items, tổng tiền, số lượng item.
- Nút xem chi tiết.

### components/CartDetailHeader.tsx
Vai trò:
- Header của trang chi tiết cart.

Hiển thị:
- Nút quay lại.
- Số sản phẩm trong cart.
- Nút xóa giỏ hàng (mở confirm).

### components/CartDetailItemsSection.tsx
Vai trò:
- Khu vực danh sách item của cart detail.

Hiển thị:
- Header cột desktop.
- Danh sách CartDetailItemCard.
- Nút tiếp tục mua sắm.

### components/CartDetailItemCard.tsx
Vai trò:
- 1 dòng item trong cart detail.

Nghiệp vụ UI:
- Form quantity inline với react-hook-form + zod.
- Validate số lượng 1..999.
- Enter/blur để commit quantity.
- Nút giảm/tăng, nút sửa, nút xóa.
- Click card mở popup edit item.

### components/CartDetailSummaryAside.tsx
Vai trò:
- Sidebar tóm tắt đơn hàng.

Chức năng:
- Nhập/áp dụng voucher.
- Xóa voucher.
- Hiển thị subtotal, giảm giá, tổng thanh toán.
- Nút checkout.

### components/CartEditModal.tsx
Vai trò:
- Popup chỉnh sửa item trong cart.

Chức năng:
- Chỉnh quantity với validation.
- Chỉnh topping (số lượng mỗi topping).
- Chỉnh note.
- Tính tổng tạm trong popup.
- Lưu thay đổi qua callback onSave.

### components/CartDetailDialogs.tsx
Vai trò:
- Gom các dialog/modal của cart detail vào 1 component:
  - CartEditModal
  - Confirm xóa item
  - Confirm xóa cart

Ý nghĩa:
- Giảm độ dài page và gom logic render modal vào 1 chỗ.

### components/CartDetailEmptyState.tsx
Vai trò:
- Empty state khi không tìm thấy cart.

### components/Confirm.tsx
Vai trò:
- Modal confirm dùng chung (danger/warning/info).

Lưu ý:
- handleConfirm hiện đang gọi cả onConfirm và onClose.

### components/index.ts
Vai trò:
- Barrel export cho toàn bộ component của module cart.

---

## 4.4 services

### services/cartDetail.service.ts
Vai trò:
- Utility thuần cho cart detail.

Hàm:
- formatCurrencyVnd(amount)
- getCartTotalDiscount(cart)

Ý nghĩa:
- Tránh lặp logic format/tính toán trong page/hook.

---

## 4.5 layouts

### layouts/index.ts
Vai trò:
- Placeholder/comment, hiện không export layout nào.

---

## 5. Các điểm mạnh kiến trúc hiện tại
- Đã tách rõ page mỏng, logic nằm trong hook.
- Có lớp mapper riêng để chống thay đổi payload backend.
- Components được chia theo khu vực UI, dễ bảo trì.
- Dialogs được gom lại giúp CartDetail.tsx gọn.

---

## 6. Điểm cần lưu ý và cải tiến

---

## 7. Bản đồ phụ thuộc nhanh
- pages/Cart.tsx
  -> hooks/use-cart-list.hook.ts
  -> components/CartSummaryCard.tsx

- pages/CartDetail.tsx
  -> hooks/use-cart-detail-page.hook.ts
  -> components/CartDetailHeader.tsx
  -> components/CartDetailItemsSection.tsx
  -> components/CartDetailSummaryAside.tsx
  -> components/CartDetailDialogs.tsx

- hooks/use-cart-detail-page.hook.ts
  -> hooks/use-cart-detail.hook.ts
  -> hooks/use-checkout-handler.hook.ts
  -> services/cartDetail.service.ts

- hooks/use-cart-detail.hook.ts
  -> apis/endpointsCLIENT/cart.api.ts
  -> apis/endpointsCLIENT/client.api.ts
  -> hooks/cartApiMapper.ts

---

## 8. Kết luận
Folder cart hiện đang theo kiến trúc tương đối tốt cho scale vừa:
- Màn hình tách khỏi business logic.
- Business logic tách khỏi API payload shape.
- UI chia component theo vùng.

Điểm cần ưu tiên tiếp theo:
- Chuẩn hóa hành vi checkout khi lỗi.
- Rà soát Confirm callback async.
- Dọn legacy component để module sạch hơn.
