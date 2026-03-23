# Order Management Next Phase Handoff

Updated: `2026-03-22`

## Muc tieu phase tiep theo

Bat dau lam `Order Management` dua tren UI hien tai cua module `admin/order-management`.

Scope chot:

- `Staff` xem order theo `active franchise context`
- `Manager` xem order theo `active franchise context`
- `Admin` neu chua co `active franchise context` thi vao man chon franchise giong POS
- Sau khi co franchise hop le thi vao man quan ly order
- Ca `ADMIN`, `MANAGER`, `STAFF` deu co the doi status order:
  - `CONFIRMED -> PREPARING`
  - `PREPARING -> READY_FOR_PICKUP`

## Rule role va franchise context

### Staff / Manager

- Khong lam man chon franchise rieng
- Lay `franchiseId` tu auth context
- Uu tien dung helper:
  - [admin-auth.store.ts](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/auth-admin/stores/admin-auth.store.ts)
  - `getFranchiseId(store)`
- Neu khong co franchise context hop le:
  - coi la state loi hoac chua chon context
  - xu ly UI an toan, khong goi order API vo nghia

### Admin

- Neu `activeContext.franchise_id` dang `null`
- Hien man chon franchise giong flow POS
- Uu tien tai su dung:
  - [use-order-franchise-context.ts](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/hooks/use-order-franchise-context.ts)
  - [PosFranchiseSelectionGate.tsx](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/partials/pos/PosFranchiseSelectionGate.tsx)
- Sau khi chon franchise:
  - vao man order list/detail theo franchise do

## UI can dat duoc

### 1. Gate chon franchise cho admin

Hanh vi mong muon:

- neu la `ADMIN` va chua co franchise context thi khong show order list ngay
- hien gate chon franchise nhu POS
- chon xong thi load order management theo franchise vua chon

### 2. Order list

UI hien tai o:

- [OrderListPage.tsx](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/pages/OrderListPage.tsx)
- [OrderFiltersBar.tsx](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/partials/orders/OrderFiltersBar.tsx)
- [OrderList.tsx](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/partials/orders/OrderList.tsx)
- [OrderCard.tsx](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/partials/orders/OrderCard.tsx)

Can giu:

- filter theo `status`
- refresh list
- search local theo `code` va `phone`
- auto-select order dau tien neu list co data

### 3. Order detail

UI hien tai o:

- [OrderDetailPage.tsx](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/pages/OrderDetailPage.tsx)
- [OrderDetailHeader.tsx](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/partials/orders/OrderDetailHeader.tsx)
- [OrderDetailItems.tsx](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/partials/orders/OrderDetailItems.tsx)
- [OrderPaymentPanel.tsx](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/partials/orders/OrderPaymentPanel.tsx)

Can giu:

- header thong tin don
- thong tin customer / address / phone / message
- danh sach order items
- 2 nut doi status

## API Order da du de bat dau

Order API backend hien co:

- `GET /api/orders/franchise/:franchiseId?status=...`
- `GET /api/orders/:id`
- `PUT /api/orders/:id/preparing`
- `PUT /api/orders/:id/ready-for-pickup`

Ket luan:

- `du` de lam order list theo franchise
- `du` de lam order detail
- `du` de noi 2 action doi status

API khong phai blocker cho phase nay:

- `GET /api/orders/code?code=...`
- `GET /api/orders/customer/:customerId?status=...`
- `GET /api/orders/cart/:cartId`

Luu y:

- `payment panel` neu giu nguyen se van can `Payment API` rieng
- nhung phan `Order API` thi da du de bat dau phase nay

## Request / response can tin tu backend

### 1. Order list by franchise

Can co:

- `_id`
- `code`
- `status`
- `phone`
- `subtotal_amount`
- `final_amount`
- `created_at`

### 2. Order detail by id

Can co:

- `_id`
- `code`
- `status`
- `customer_id`
- `customer_name`
- `franchise_id`
- `franchise_name`
- `phone`
- `address`
- `message`
- `promotion_discount`
- `voucher_discount`
- `loyalty_discount`
- `subtotal_amount`
- `final_amount`
- `order_items`

### 3. Update status

Frontend hien tai chi can:

- goi thanh cong
- refetch detail sau khi update

Nen:

- khong bat buoc response body phai day du
- chi can endpoint thanh cong ro rang

## File se dung tiep

### Context / role

- `src/modules/admin/auth-admin/stores/admin-auth.store.ts`
- `src/modules/admin/order-management/hooks/use-order-franchise-context.ts`

### Page / hook chinh

- `src/modules/admin/order-management/pages/OrderListPage.tsx`
- `src/modules/admin/order-management/pages/OrderDetailPage.tsx`
- `src/modules/admin/order-management/hooks/use-order-list-page.ts`
- `src/modules/admin/order-management/hooks/use-order-detail-page.ts`

### UI blocks

- `src/modules/admin/order-management/partials/orders/OrderFiltersBar.tsx`
- `src/modules/admin/order-management/partials/orders/OrderList.tsx`
- `src/modules/admin/order-management/partials/orders/OrderCard.tsx`
- `src/modules/admin/order-management/partials/orders/OrderDetailHeader.tsx`
- `src/modules/admin/order-management/partials/orders/OrderDetailItems.tsx`
- `src/modules/admin/order-management/partials/orders/OrderPaymentPanel.tsx`
- `src/modules/admin/order-management/partials/pos/PosFranchiseSelectionGate.tsx`

### Service / usecase / config

- `src/modules/admin/order-management/services/order.service.ts`
- `src/modules/admin/order-management/services/payment.service.ts`
- `src/modules/admin/order-management/usecases/load-franchise-orders.usecase.ts`
- `src/modules/admin/order-management/config/order-status.config.ts`

## Huong implement de xai cho chat moi

Thu tu nen lam:

1. Tach `franchise sourcing` theo role
2. Noi gate chon franchise cho `ADMIN`
3. Giu `Staff / Manager` di thang vao order list bang `activeContext`
4. On dinh order list reload + filter + selected order
5. On dinh order detail
6. Noi 2 action doi status
7. Cuoi cung moi polish empty state / loading / payment panel

## Acceptance criteria

- Staff vao trang order thi thay order cua dung franchise context hien tai
- Manager vao trang order thi thay order cua dung franchise context hien tai
- Admin neu chua co franchise thi thay gate chon franchise nhu POS
- Admin chon franchise xong thi vao duoc order management
- Filter status hoat dong
- Refresh list hoat dong
- Chon order thi mo duoc detail
- Nut `Preparing` hoat dong khi order dang `CONFIRMED`
- Nut `Ready` hoat dong khi order dang `PREPARING`
- Sau khi doi status thi detail duoc refetch dung

## Ghi chu cho chat moi

- Doc file nay truoc:
  - [order-management-next-phase-handoff.md](/Users/FPTU/OJT/MockProject/Mock-Project/reports/order-management-next-phase-handoff.md)
- Doc them file readiness:
  - [order-management-api-readiness-kickoff.md](/Users/FPTU/OJT/MockProject/Mock-Project/reports/order-management-api-readiness-kickoff.md)
- Rule chia folder va code placement nam trong:
  - [SKILLS.md](/Users/FPTU/OJT/MockProject/Mock-Project/SKILLS.md)
