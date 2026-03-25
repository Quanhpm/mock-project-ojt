# Admin POS Flow Handoff

Updated: `2026-03-24`

## Scope

Tài liệu này tóm gọn toàn bộ luồng `POS của admin` trong module `order-management` để mở session mới và làm tiếp mà không cần đọc lại toàn bộ code từ đầu.

Flow chính hiện tại:

1. `Builder` ở `/admin/orders/pos`
2. `Review` ở `/admin/orders/pos/review`
3. `Order detail` sau checkout ở `/admin/orders/:orderId`

## File chính

### Pages

- `src/modules/admin/order-management/pages/OrderPosPage.tsx`
- `src/modules/admin/order-management/pages/OrderPosReviewPage.tsx`

### Page hooks

- `src/modules/admin/order-management/hooks/use-order-pos-page.ts`
- `src/modules/admin/order-management/hooks/use-order-pos-review-page.ts`

### Builder internals

- `src/modules/admin/order-management/hooks/use-pos-builder-cart-lifecycle.ts`
- `src/modules/admin/order-management/hooks/use-pos-builder-item-actions.ts`
- `src/modules/admin/order-management/hooks/use-pos-product-configurator.ts`
- `src/modules/admin/order-management/hooks/use-pos-menu-data.ts`
- `src/modules/admin/order-management/hooks/use-pos-customer-search.ts`

### Review internals

- `src/modules/admin/order-management/hooks/use-pos-review-loader.ts`
- `src/modules/admin/order-management/hooks/use-pos-review-actions.ts`

### Shared state / services / usecases

- `src/modules/admin/order-management/stores/pos-session.store.ts`
- `src/modules/admin/order-management/hooks/use-pos-session.ts`
- `src/modules/admin/order-management/hooks/use-order-franchise-context.ts`
- `src/modules/admin/order-management/services/cart.service.ts`
- `src/modules/admin/order-management/services/pos-product-config.service.ts`
- `src/modules/admin/order-management/usecases/load-pos-review-cart.usecase.ts`
- `src/modules/admin/order-management/usecases/checkout-cart.usecase.ts`
- `src/modules/admin/order-management/usecases/replace-cart-item-with-restore.usecase.ts`

## Kiến trúc hiện tại

- `Page` chủ yếu render partials.
- `use-order-pos-page` compose builder từ nhiều hook nhỏ.
- `use-order-pos-review-page` compose review từ `loader + actions + configurator`.
- `Cart backend` là source of truth duy nhất cho POS.
- `pos session store` chỉ giữ UI/context tạm thời trong memory:
  - `selectedCustomer`
  - `activeCartId`
  - `selectedAdminFranchiseId`
  - `selectedAdminFranchiseName`
  - `selectedCategory`
  - `searchQuery`
  - `customerKeyword`
- Không còn `sessionStorage`, không còn `draftItems`, không còn merge flow giữa local draft và active cart.

## Franchise context

- Nếu `ADMIN` không có franchise context sẵn, POS bắt buộc chọn chi nhánh trước.
- Franchise context cho POS được xử lý qua `use-order-franchise-context.ts`.
- Với `ADMIN` global, franchise đã chọn được lưu trong `pos session store`.
- Với role có context franchise sẵn, dùng luôn `activeContext`.

## POS session store

Store: `src/modules/admin/order-management/stores/pos-session.store.ts`

Đang lưu:

- `selectedCustomer`
- `activeCartId`
- `selectedAdminFranchiseId`
- `selectedAdminFranchiseName`
- `selectedCategory`
- `searchQuery`
- `customerKeyword`

Lưu ý:

- Store hiện chỉ là in-memory state cho UI/context
- Reload trang sẽ load lại cart từ backend thay vì restore từ storage
- `resetSession()` clear `customer + activeCart + filter` nhưng vẫn giữ franchise đã chọn theo rule hiện tại

## Builder flow

### 1. Vào màn POS

- Nếu chưa có franchise hợp lệ thì hiện `PosFranchiseSelectionGate`
- Nếu đã có franchise thì load menu, category, customer search

### 2. Chọn customer

- `selectCustomer()` set customer vào session
- clear kết quả search
- reset `activeCartId`
- check xem customer đang có `ACTIVE cart` ở đúng franchise hay không
- nếu có cart active thì render thẳng item của cart đó ở sidebar
- nếu chưa có cart active thì sidebar hiển thị rỗng

### 3. Chọn món

- POS bắt buộc chọn customer trước khi thêm món
- Click món mở `PosProductConfigModal`
- User chọn `size / topping / quantity / note`
- Confirm sẽ gọi thẳng `POST /carts/items/staff-bulk`
- Backend chịu trách nhiệm `create-or-reuse active cart`

### 4. Sau khi đã có active cart

- Thêm món dùng `POST /carts/items/staff-bulk`
- Tăng món dùng `addCartItemsUsecase`
- Giảm món:
  - `quantity > 1`: `update-cart-item` rồi reload cart
  - `quantity <= 1`: `delete cart item` rồi reload cart
- Xóa món: `delete cart item` rồi reload cart
- Click edit món persisted ở builder sẽ không sửa trực tiếp tại đây nữa
- Builder sẽ điều hướng sang review và báo user chỉnh ở review

### 5. Continue to review

- Chỉ còn 1 nhánh:
  - nếu cart hiện tại có item thì đi thẳng sang review
- Không còn modal `dùng cart hiện tại / gộp draft`

## Review flow

### 1. Load cart

Review loader ưu tiên theo thứ tự:

1. `cartId` từ query
2. `activeCartId` từ session
3. `customerId + franchiseId`

Sau đó:

- load cart detail
- hydrate lại `selectedCustomer`
- hydrate form state hiện tại từ cart backend
- nếu user sửa `phone / address / message` thì review sẽ lưu lại qua `PUT /carts/:id`
- `voucherCode` input chỉ là state cục bộ của màn review cho tới khi bấm apply

### 2. Hiển thị review

- Cột trái: danh sách item, ghi chú tổng, địa chỉ giao hàng
- Cột phải: customer, phone, voucher, tổng tiền, checkout
- Mobile có `PosReviewMobileNav`

### 3. Edit item tại review

Review là nơi chính để chỉnh item persisted:

- Đổi quantity đơn thuần:
  - `update-cart-item`
  - sau đó `refreshCartDetail`
- Đổi topping:
  - `replaceCartItemOptions`
  - hoặc `updateCartItemOption`
  - hoặc `removeCartItemOption`
  - sau đó `refreshCartDetail`
- Đổi `size` hoặc `note`:
  - dùng `replaceCartItemWithRestoreUsecase`
  - thực chất là `delete old line -> add new line`
  - nếu add lỗi sẽ cố restore line item cũ

### 4. Voucher

- Apply voucher: `PUT /carts/:id/apply-voucher`
- Remove voucher: `DELETE /carts/:id/remove-voucher`

### 5. Cập nhật thông tin cart

- Save info cart: `PUT /carts/:id`
- Review có nút nhỏ `Xóa giỏ hàng` dưới list sản phẩm
- Nút này mở `PosCancelCartModal`
- Confirm sẽ gọi `PUT /carts/:id/cancel`
- Sau đó clear session và quay về builder

### 6. Back về builder

- `goBackToBuilder()` navigate với `state: { preservePosSession: true }`
- Builder đọc cờ này để không reset session lúc mount lại

## Checkout flow

### Input gửi khi checkout

- `address`
- `phone`
- `message`

### Cách chạy hiện tại

1. `PUT /carts/:id/checkout`
2. retry `GET /orders/cart/:cartId` tối đa `5` lần, delay `800ms`
3. Nếu lấy được order:
   - toast success
   - navigate sang order detail
4. Nếu checkout thành công nhưng order detail chưa kịp sync:
   - vẫn toast success
   - navigate về list order
   - không báo lỗi giả

## API đang dùng

### Cart / order

- `GET /carts/customer/:customerId?status=ACTIVE`
- `GET /carts/:id`
- `POST /carts/items/staff-bulk`
- `PATCH|PUT /carts/items/update-cart-item`
- `DELETE /carts/items/:cartItemId`
- `PUT /carts/items/update-options-cart-item`
- `PATCH /carts/items/update-option`
- `PATCH /carts/items/remove-option`
- `PUT /carts/:id/apply-voucher`
- `DELETE /carts/:id/remove-voucher`
- `PUT /carts/:id/checkout`
- `PUT /carts/:id/cancel`
- `GET /orders/cart/:cartId`

### Menu / customer / franchise

- `GET /clients/franchises/:franchiseId/categories`
- `GET /clients/menu?franchiseId=...`
- `GET /customers/:customerId`
- `GET /franchises/select`

## Những fix quan trọng đã có

- Refactor `god hook / fat page` thành `loader + actions + lifecycle + item-actions`
- Builder auto xử lý `local draft` vs `persisted cart`
- Review edit item persisted ổn định hơn
- `update-cart-item` trả `null` không còn gây toast lỗi giả
- Sau `update` sẽ reload cart detail để lấy data mới
- Giảm số lượng item persisted đã quay lại pattern `mutation -> refetch cart`
- `checkout` không còn coi `get order by cart id` fail là checkout fail
- Có flow `cancel cart` bằng modal confirm riêng, không dùng `window.confirm`
- `pos session store` đã persist bằng `sessionStorage`

## Những gì chưa phải scope POS tiếp theo ngay lúc này

- Loading skeleton đẹp hơn cho review
- Builder-side cancel cart riêng
- Deep-link guard rõ ràng hơn cho cart đã `CHECKED_OUT` hoặc `CANCELED`
- Tối ưu thêm UI/UX mobile cho review

## Gợi ý task tiếp theo nếu mở session mới

Các hướng tiếp theo hợp lý:

1. Rà lại deep-link vào review với cart không còn hợp lệ
2. Thêm skeleton/loading state đẹp hơn ở review
3. Rà UX/customer flow trên mobile
4. Nếu muốn production hóa hơn:
   - thêm TTL cho `pos session store`
   - rà cleanup session khi logout

## Prompt gợi ý cho session mới

```md
Đọc file `reports/admin-pos-flow-handoff.md` trước.

Context:
- POS admin đã có 2 màn builder/review
- session store đang persist bằng sessionStorage
- checkout đã retry order lookup
- review đã có flow cancel cart bằng modal

Mục tiêu của session này:
- rà tiếp phần POS admin
- ưu tiên kiểm tra các edge case còn lại
- giữ rule code theo SKILLS.md: page mỏng, hook/usecase tách rõ trách nhiệm

Hãy đọc code liên quan trong:
- src/modules/admin/order-management/pages/OrderPosPage.tsx
- src/modules/admin/order-management/pages/OrderPosReviewPage.tsx
- src/modules/admin/order-management/hooks/use-pos-builder-cart-lifecycle.ts
- src/modules/admin/order-management/hooks/use-pos-builder-item-actions.ts
- src/modules/admin/order-management/hooks/use-pos-review-loader.ts
- src/modules/admin/order-management/hooks/use-pos-review-actions.ts
```
