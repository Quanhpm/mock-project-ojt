# Order POS Current Progress Handoff

Updated: `2026-03-22`

## Current status

Scope `Order POS builder` va `Order POS review` hien tai da on dinh o muc co the handoff va chuyen sang xu ly tiep `trang quan ly order`.

Rule tong quat dang dung:

1. `Builder` o `/admin/orders/pos`
2. `Review` o `/admin/orders/pos/review`
3. `Order detail` sau checkout o `/admin/orders/:orderId`

## Da hoan thanh

- Tach ro flow `builder -> review -> order detail`.
- `ADMIN` global bat buoc chon chi nhanh truoc khi vao POS.
- Giu duoc franchise context khi di qua lai giua builder va review.
- Fix API menu: POS hien tai load san pham tu `GET /clients/menu`, khong dung endpoint cu nua.
- Local draft chi dung truoc khi co persisted cart.
- Sau khi da co cart backend, builder chuyen sang `server-first`.
- Item da co trong `ACTIVE cart` duoc sua sau o review modal.
- Sua topping cho item persisted tai review bang bo API option:
  - `PUT /carts/items/update-options-cart-item`
  - `PATCH /carts/items/update-option`
  - `PATCH /carts/items/remove-option`
- Doi `size` hoac `note` cua item persisted dang xu ly theo kieu:
  - xoa line item cu
  - them lai line item moi
- Review khong con bi duplicate loading ben trong trang.
- Review tu fill `address` va `phone` tu `GET /customers/:id`.
- `address / phone / message` khong con goi API khi blur.
- Ba field `address / phone / message` chi duoc gui luc checkout.
- Sau checkout, navigate sang order detail bang `replace`, nen bam Back khong quay lai review cu.
- Truong hop 1 customer co nhieu `ACTIVE cart` o nhieu chi nhanh da duoc xu ly o frontend:
  - lay danh sach active cart
  - filter theo `franchise_id` hien tai
  - chi dung cart active cua dung chi nhanh dang thao tac

## Hanh vi hien tai

### Builder

- Chon chi nhanh
- Chon customer
- Chon mon
- Mo modal cau hinh mon de chon size / topping / note
- Neu chua co persisted cart:
  - thao tac tren `draftItems` local
- Neu da co persisted cart:
  - add mon moi bang API
  - tang / giam / xoa item bang API
  - click vao item persisted thi khong sua sau tai builder nua, xu ly o review

### Review

- Load cart that tu backend
- Hien danh sach item, tong tien, voucher
- Cho sua sau item persisted trong cung modal cau hinh mon
- Tu fill `address / phone` bang customer detail
- Cho phep user sua local `address / phone / message`
- Chi gui 3 field do luc bam `Xac nhan thanh toan`

### Checkout

- Goi `PUT /carts/:id/checkout`
- Dinh kem:
  - `address`
  - `phone`
  - `message`
- Sau do lay `order` tu `GET /orders/cart/:cartId`
- Chuyen sang `/admin/orders/:orderId`

## API dang dung trong POS

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
- `GET /orders/cart/:cartId`

### Menu / customer / franchise

- `GET /clients/franchises/:franchiseId/categories`
- `GET /clients/menu?franchiseId=...`
- `GET /customers/:customerId`
- `GET /franchises/select`

## File chinh can nho

### Builder

- `src/modules/admin/order-management/pages/OrderPosPage.tsx`
- `src/modules/admin/order-management/hooks/use-order-pos-page.ts`
- `src/modules/admin/order-management/partials/pos/PosDraftSidebar.tsx`
- `src/modules/admin/order-management/partials/pos/PosProductConfigModal.tsx`

### Review

- `src/modules/admin/order-management/pages/OrderPosReviewPage.tsx`
- `src/modules/admin/order-management/hooks/use-order-pos-review-page.ts`

### Shared state / services

- `src/modules/admin/order-management/stores/pos-session.store.ts`
- `src/modules/admin/order-management/hooks/use-pos-session.ts`
- `src/modules/admin/order-management/services/cart.service.ts`
- `src/modules/admin/order-management/services/customer.service.ts`
- `src/modules/admin/order-management/services/menu.service.ts`
- `src/modules/admin/order-management/services/pos-product-config.service.ts`
- `src/modules/admin/order-management/usecases/get-active-cart.usecase.ts`

## Ghi chu ky thuat con ton tai

- Backend chua co `PUT` atomic de update full cart item trong 1 lan.
- Vi vay doi `size` va mot so case doi cau hinh van phai di theo huong `delete + add lai`.
- Neu backend tra ve hon 1 `ACTIVE cart` trong cung mot franchise, frontend hien tai:
  - `console.warn`
  - tam lay cart dau tien
- Review guard cho case deep-link vao cart da `CHECKED_OUT` chua lam.
  - Hien tai da giam rui ro bang `navigate(..., { replace: true })` sau checkout.

## Verification

Da verify o muc module `order-management`:

- `eslint` pass voi cac file vua sua
- `build` loc theo file order-management khong con loi tu scope POS / review

Luu y:

- `npm run build` toan repo van fail vi loi co san o module khac, khong nam trong scope nay

## Scope tiep theo

Scope tiep theo la `trang quan ly order`.

### Muc tieu tiep theo

- Rasoat `order list`
- Rasoat `order detail`
- Kiem tra filter / status / data load
- Kiem tra UX di tu POS checkout sang order detail
- Kiem tra cac action cap nhat trang thai don

### File du kien se dung tiep

- `src/modules/admin/order-management/pages/OrderListPage.tsx`
- `src/modules/admin/order-management/pages/OrderDetailPage.tsx`
- `src/modules/admin/order-management/hooks/use-order-list-page.ts`
- `src/modules/admin/order-management/hooks/use-order-detail-page.ts`
- `src/modules/admin/order-management/services/order.service.ts`
- `src/modules/admin/order-management/services/payment.service.ts`
