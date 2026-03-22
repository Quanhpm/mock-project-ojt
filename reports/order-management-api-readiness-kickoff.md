# Order Management API Readiness Kickoff

Updated: `2026-03-22`

## Muc tieu

Danh gia xem bo `Order API` hien tai da du request/response de bat dau lam task tiep theo hay chua:

- Staff xem order theo `franchise context` cua minh
- Manager xem order theo `franchise context` cua minh
- Admin chon franchise roi xem order theo franchise do
- Ca 3 role co the doi trang thai order
- Bamsat `UI hien tai` cua module `admin/order-management`

## Ket luan nhanh

Voi `Order API` hien co, phan `Order Management` da `du de bat dau implement` theo UI hien tai.

Phan du de lam ngay:

- danh sach order theo franchise
- filter theo status
- detail order
- doi status:
  - `CONFIRMED -> PREPARING`
  - `PREPARING -> READY_FOR_PICKUP`

Phan can ghi nho:

- `Admin chon franchise` khong nam trong `Order API`, ma phu thuoc vao flow/context franchise co san cua he thong
- `payment panel` tren order detail can them `Payment API`, khong thuoc nhom `Order API`
- 2 endpoint `PUT` doi status chua co sample response ro rang trong report local, nhung frontend van co the lam truoc vi khong can body response de render

## UI hien tai dang can gi

### 1. Order list

Tu [OrderListPage.tsx](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/pages/OrderListPage.tsx) va [use-order-list-page.ts](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/hooks/use-order-list-page.ts):

- load danh sach order theo franchise
- filter theo `status`
- search local theo:
  - `code`
  - `phone`
- chon 1 order de mo detail embedded

Field toi thieu can co cho list:

- `_id`
- `code`
- `status`
- `phone`
- `subtotal_amount`
- `final_amount`
- `created_at`

### 2. Order detail

Tu [OrderDetailPage.tsx](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/pages/OrderDetailPage.tsx), [OrderDetailHeader.tsx](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/partials/orders/OrderDetailHeader.tsx), [OrderDetailItems.tsx](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/partials/orders/OrderDetailItems.tsx):

- thong tin order
- thong tin customer
- address / phone / message
- tong tien / giam gia
- danh sach order items va options
- 2 action doi trang thai:
  - `Preparing`
  - `Ready`

Field toi thieu can co cho detail:

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

Trong `order_items` can:

- `order_item_id`
- `quantity`
- `product_name`
- `price_snapshot`
- `final_line_total`
- `options[]`

## Doi chieu Order API hien co

Backend dang co nhom API:

- `GET Get Order by CartId`
- `GET Get Orders by CustomerId`
- `GET Get Order by Code`
- `GET Get Order by Id`
- `GET Get Orders for Staff by FranchiseID`
- `PUT Change Status - Preparing`
- `PUT Change Status - Ready for Pickup`

## Danh gia tung endpoint

### 1. `GET /api/orders/franchise/:franchiseId?status=...`

Trang thai: `Du de lam order list`

API nay map voi:

- [order.service.ts](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/services/order.service.ts)
- [load-franchise-orders.usecase.ts](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/usecases/load-franchise-orders.usecase.ts)

Sample response da co trong report local:

- `reports/admin-pos-cart-order-payment-api.md`

Shape da xac nhan:

```json
{
  "_id": "69b908b496df2c6c678cf547",
  "code": "ORDER_LCF8FZ2FFU",
  "status": "OUT_FOR_DELIVERY",
  "phone": "0938947221",
  "subtotal_amount": 79000,
  "final_amount": 63200,
  "created_at": "2026-03-17T07:54:28.202Z"
}
```

Nhan xet:

- Du field cho UI list hien tai
- Co `status` query de filter tren backend
- Search textbox hien tai dang filter local, nen chua can API search rieng

### 2. `GET /api/orders/:id`

Trang thai: `Du de lam order detail`

API nay map voi:

- [order.service.ts](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/services/order.service.ts)
- [use-order-detail-page.ts](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/hooks/use-order-detail-page.ts)

Sample response da co trong report local, shape gan nhu trung voi `GET /api/orders/cart/:cartId`.

Nhan xet:

- Du field cho detail page hien tai
- Du field cho header, summary va item list
- Khong thay blocker ve request/response

### 3. `PUT /api/orders/:id/preparing`

Trang thai: `Du de bat dau lam`

Frontend hien tai chi can:

- goi thanh cong
- sau do refetch order detail

Nhan xet:

- Khong can request body
- Khong bat buoc response body phuc tap
- Can backend dam bao role hop le duoc phep goi endpoint nay

Can xac nhan them neu muon an tam hon:

- status code thanh cong
- response body tra `null` hay tra `order`

### 4. `PUT /api/orders/:id/ready-for-pickup`

Trang thai: `Du de bat dau lam`

Tuong tu endpoint `preparing`:

- khong can request body
- frontend co the reload detail sau khi goi
- can backend xac nhan permission cho 3 role

### 5. `GET /api/orders/code?code=...`

Trang thai: `Khong bat buoc cho phase dau`

Tac dung tot neu sau nay:

- muon search server-side theo ma don
- muon mo nhanh 1 order theo code

Voi UI hien tai:

- search dang local tren list da load
- nen endpoint nay la `optional`

### 6. `GET /api/orders/customer/:customerId?status=...`

Trang thai: `Khong bat buoc cho admin order management phase dau`

Tac dung:

- lich su order theo customer
- customer journey / profile page

Voi task hien tai:

- khong phai endpoint chinh

### 7. `GET /api/orders/cart/:cartId`

Trang thai: `Khong phai endpoint chinh cua order management`

Tac dung:

- dung sau checkout tu POS de tim `orderId`

Voi task quan ly order:

- khong phai dependency chinh

## Role va franchise context

### Staff

Du lam bang:

- lay `franchiseId` tu auth context
- goi `GET /api/orders/franchise/:franchiseId?status=...`

### Manager

Neu manager cung co `franchise context` ro rang trong auth store, thi cach dung giong staff:

- lay `franchiseId` tu auth context
- goi `GET /api/orders/franchise/:franchiseId?status=...`

Can luu y:

- file auth hien tai [admin-auth.store.ts](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/auth-admin/stores/admin-auth.store.ts) dang co helper `getFranchiseId`
- can confirm manager trong he thong dang co `active_context.franchise_id` hoac `roles[0].franchise_id`

### Admin

Ve `Order API` thi van du:

- admin chon 1 franchise
- roi van goi `GET /api/orders/franchise/:franchiseId?status=...`

Nhung de admin `chon franchise`, can them mot trong 2 thu sau:

- franchise context switching co san
- hoac `GET /franchises/select`

Phan nay `khong nam trong Order API`, nhung UI task se can no.

## Request/response da du toi dau

### Du de code ngay

- order list theo franchise
- status tabs
- detail page
- embedded detail trong order list
- 2 nut doi status

### Chua phai blocker, nhung nen xac nhan

- sample response cua 2 endpoint `PUT` doi status
- permission matrix:
  - `STAFF`
  - `MANAGER`
  - `ADMIN`
  co deu goi duoc 2 endpoint doi status hay khong

## Gaps so voi UI hien tai

### 1. Search hien tai la local search

UI search hien tai trong [OrderFiltersBar.tsx](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/partials/orders/OrderFiltersBar.tsx) dang la:

- search local theo `code`
- search local theo `phone`

Nen:

- chua can `GET /api/orders/code?code=...` ngay
- nhung neu order list lon, sau nay nen nang cap sang search server-side

### 2. Payment panel khong thuoc Order API

Trang detail hien tai con render [OrderPaymentPanel.tsx](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/partials/orders/OrderPaymentPanel.tsx).

Phan nay can them:

- `GET /payments/order/:orderId`

Neu task tiep theo chi tap trung vao `Order API`, thi co 2 cach:

1. Tam giu payment panel va tiep tuc dung payment API rieng
2. Hoan thanh order flow truoc, payment panel tinh sau

## Recommendation cho phase tiep theo

### Co the bat dau ngay

Theo UI hien tai, bo `Order API` da du de mo phase `Order Management`.

Frontend co the lam theo thu tu:

1. Chot franchise sourcing theo role
2. On dinh `order list by franchise`
3. On dinh `order detail by id`
4. Noi 2 action doi status
5. Sau do moi polish search / role UX / payment panel

### Khong can doi backend moi bat dau

Khong co blocker request/response nao lon o nhom `Order API` cho phase dau.

## File se dung tiep

- `src/modules/admin/order-management/pages/OrderListPage.tsx`
- `src/modules/admin/order-management/pages/OrderDetailPage.tsx`
- `src/modules/admin/order-management/hooks/use-order-list-page.ts`
- `src/modules/admin/order-management/hooks/use-order-detail-page.ts`
- `src/modules/admin/order-management/services/order.service.ts`
- `src/modules/admin/order-management/config/order-status.config.ts`

## Chot scope bat dau

Task tiep theo co the duoc chot nhu sau:

- Staff va manager xem order theo franchise context hien tai
- Admin chon franchise roi xem order theo franchise do
- Ca 3 role duoc doi status:
  - `Preparing`
  - `Ready for Pickup`
- Bam sat UI current state truoc, chua mo rong them flow ngoai scope
