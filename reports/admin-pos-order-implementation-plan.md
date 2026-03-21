# Kế hoạch lớn implement Admin POS + Order Management

## 1. Mục tiêu

Tài liệu này dùng để chốt hướng implement thật cho tính năng `POS bán hàng tại quầy` và `quản lý đơn hàng` trong admin.

Mục tiêu chính:

- tách rõ `POS` và `Order Management` thành 2 route chính
- giữ đúng tinh thần UI hiện tại của module mock `order-management`
- bỏ toàn bộ mock data và mock business logic cũ khi bắt đầu code thật
- tổ chức lại module theo `SKILLS.md`, không nhét business logic vào `page`
- để API của tính năng này nằm trong module riêng, không đi theo pattern cũ rải endpoint ở nhiều nơi

## 2. Nguyên tắc triển khai

Nguồn quy tắc chính: [SKILLS.md](/Users/FPTU/OJT/MockProject/Mock-Project/SKILLS.md)

Các rule phải bám:

- `page` chỉ ghép UI, gọi hook, gọi usecase, xử lý event mức cao
- logic fetch, submit, transform, sync state phải tách ra `hooks`, `usecases`, `services`
- API của `order/cart/payment` đặt trong module riêng của feature này
- code dùng chung theo domain thì đưa vào `features`
- type dùng chung thì đưa vào `models`
- state dùng chung trong module thì đưa vào `stores`

Nguyên tắc bổ sung cho feature này:

- không reuse mock business logic cũ của [OrderManagement.tsx](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/pages/OrderManagement.tsx)
- có thể giữ tinh thần layout/UI của màn mock, nhưng data flow và state phải viết lại
- không bơm số điện thoại fake
- không dùng address giả kiểu `123` cho đơn mua tại quầy

## 3. Đọc từ code hiện tại

Những gì đang có trong repo:

- route admin hiện chỉ có một entry `orders`: [router.const.ts](/Users/FPTU/OJT/MockProject/Mock-Project/src/routes/router.const.ts)
- menu hiện tại đang map `Order Pos` vào `orders`: [Admin.menu.tsx](/Users/FPTU/OJT/MockProject/Mock-Project/src/routes/admin/Admin.menu.tsx)
- page hiện tại của module order là mock POS: [OrderManagement.tsx](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/pages/OrderManagement.tsx)
- page mock đang có đúng layout mà team muốn:
  - trái: header + category tabs + product grid
  - phải: cart sidebar / summary / pay action

Kết luận:

- không nên để `/admin/orders` tiếp tục là POS duy nhất
- nếu để chung POS và quản lý đơn trong một màn sẽ rất rối state và khó mở rộng
- nên tách `2 route chính + 1 route detail ẩn`

## 4. Route đề xuất

### 4.1. Route chính

- `/admin/orders/pos`
  - màn bán hàng tại quầy cho `staff` hoặc `manager`
  - tập trung vào cart, customer, checkout, payment nhanh
- `/admin/orders`
  - màn quản lý đơn hàng
  - tập trung vào list, filter, lịch sử, tra cứu, đổi trạng thái

### 4.2. Route detail ẩn

- `/admin/orders/:orderId`
  - màn chi tiết đơn
  - dùng để xem full order, payment, timeline, action theo trạng thái
  - không nhất thiết show ở sidebar

### 4.3. Lý do không nên tách thêm top-level route lúc đầu

Chưa nên tạo thêm top-level route riêng cho:

- payment management
- order history riêng
- customer order lookup riêng

Lý do:

- `order history` có thể nằm trong `Order Management` bằng filter
- `payment` hiện chưa chốt contract cuối, nên nên gắn vào `order detail` trước
- `lookup theo code / phone / customer` có thể nằm trong thanh search/filter của `Order Management`

## 5. Route constants và menu dự kiến

Đề xuất sửa route constants theo hướng:

```ts
ADMIN_ROUTER: {
  ORDER: "orders",
  ORDER_POS: "orders/pos",
  ORDER_DETAIL: "orders/:orderId",
}
```

Menu admin nên có 2 entry hiển thị:

- `POS`
- `Orders`

Route detail:

- để hidden, không đưa sidebar

Lưu ý về permission:

- trước mắt vẫn có thể dùng chung `requiredModule="orders"`
- sau này nếu backend tách quyền sâu hơn thì mới split action-level permission

Lưu ý về route registration trong code hiện tại:

- router admin đang generate route từ `ADMIN_MENU`
- vì vậy `OrderPosPage`, `OrderListPage`, `OrderDetailPage` đều cần được đăng ký trong `ADMIN_MENU`
- riêng `OrderDetailPage` nên để `hideFromSidebar: true`

Lưu ý về sidebar active state:

- khi có cả `orders` và `orders/pos`, logic active state phải tránh highlight sai giữa route cha và route con
- phần này nên review cùng lúc khi sửa menu, không để tới cuối mới xử lý

## 6. Cấu trúc module mới

Không nên tạo feature mới ở chỗ khác. Nên refactor ngay trong module hiện có:

`src/modules/admin/order-management`

Cấu trúc đề xuất:

```text
src/modules/admin/order-management/
  config/
    order-management.config.ts
    order-status.config.ts
  models/
    cart.models.ts
    order.models.ts
    payment.models.ts
    request.models.ts
    view.models.ts
  services/
    cart.service.ts
    order.service.ts
    payment.service.ts
  usecases/
    get-active-cart.usecase.ts
    sync-pos-cart.usecase.ts
    add-cart-items.usecase.ts
    update-cart-item-options.usecase.ts
    checkout-cart.usecase.ts
    load-franchise-orders.usecase.ts
    load-order-detail.usecase.ts
  hooks/
    use-order-pos-page.ts
    use-order-list-page.ts
    use-order-detail-page.ts
    use-order-filters.ts
    use-pos-customer.ts
  stores/
    pos-session.store.ts
  features/
    customer-picker/
    cart-editor/
    order-status/
    money-summary/
  partials/
    pos/
      PosHeader.tsx
      PosCategoryTabs.tsx
      PosProductGrid.tsx
      PosProductCard.tsx
      PosCartSidebar.tsx
      PosCartItemRow.tsx
      PosCustomerPanel.tsx
      PosCheckoutPanel.tsx
    orders/
      OrderFiltersBar.tsx
      OrderTable.tsx
      OrderTableRow.tsx
      OrderSummaryCards.tsx
      OrderDetailHeader.tsx
      OrderDetailItems.tsx
      OrderPaymentPanel.tsx
      OrderTimeline.tsx
  pages/
    OrderPosPage.tsx
    OrderListPage.tsx
    OrderDetailPage.tsx
  index.ts
```

Phần nên loại bỏ dần:

- `mock/`
- `types/order.types.ts` hiện tại nếu chỉ còn phục vụ mock UI
- business logic hiện đang nằm trực tiếp trong page

## 7. UI system phải giữ

Từ màn mock hiện tại, cần giữ lại các đặc điểm sau:

- layout 2 cột desktop:
  - trái là product/menu workspace
  - phải là cart sidebar
- màu chủ đạo nâu/amber đang đồng bộ với admin
- card trắng, bo góc lớn, shadow nhẹ
- action chính nằm rõ ở đáy sidebar
- category tabs và product card có cảm giác nhanh, trực quan, dùng tốt cho thao tác tại quầy

Không nên làm:

- bê style inline rối như một số module admin cũ
- biến POS thành một table form khô cứng
- nhét quá nhiều control nhỏ vào header làm mất tốc độ thao tác

Nên làm:

- giữ tinh thần UI hiện tại nhưng chuẩn hóa component
- tách rõ `display component` và `screen logic`
- nếu phải đổi cấu trúc UI, ưu tiên không phá cảm giác của màn mock hiện có

## 8. Quyết định nghiệp vụ đã chốt

### 8.1. Customer walk-in

Nếu backend bắt buộc `phone` hoặc cần `customer_id`, không được bơm số giả linh tinh.

Giải pháp chuẩn:

- dùng một `walk-in customer` chuẩn hóa
- tất cả đơn khách vãng lai map về customer này
- phone hiển thị và search/report đi theo customer chuẩn đó, không bị bẩn dữ liệu

Việc cần chốt thêm:

- customer walk-in này đã tồn tại sẵn chưa
- lấy bằng `config`, seed cứng, hay API search customer

### 8.2. Default address cho mua tại quầy

Không dùng chuỗi giả như `123`.

Chuẩn đề xuất:

- `MUA_TAI_QUAY - {franchiseName}`

Lợi ích:

- đọc log/report dễ hiểu
- không gây nhầm với địa chỉ giao hàng thật

### 8.3. ACTIVE cart rule

Theo backend contract hiện tại:

- mỗi customer chỉ có tối đa `1 ACTIVE cart`
- POS phải coi `GET cart by customer + status=ACTIVE` là điểm restore chính

### 8.4. Merge cart item rule

Khi add cart item:

- nếu line mới giống hệt line cũ, backend có thể merge tăng quantity
- nếu khác `note` hoặc khác `options`, backend tạo line riêng

Frontend POS phải chấp nhận behavior này, không tự ép local state theo giả định khác.

### 8.5. Checkout response

Backend hiện có tình huống response checkout là object dạng cart summary và có thể chưa phản ánh `status` cuối.

Kết luận implement:

- sau `checkout`, phải refetch bằng luồng chuẩn
- không tin tuyệt đối object response tạm để update UI cuối cùng

### 8.6. Cancel rule

- cart đã checkout thì không thể cancel

## 9. Scope màn POS

### 9.1. Mục tiêu

Màn POS phục vụ thao tác nhanh tại quầy:

- chọn customer
- restore active cart
- thêm 1 món hoặc nhiều món
- chỉnh quantity, note, options
- cập nhật info phụ
- apply/remove voucher
- checkout
- dẫn sang payment hoặc order detail nếu cần

### 9.2. Dữ liệu chính cần load

- franchise hiện tại từ admin context
- customer đang thao tác
- active cart của customer
- danh sách category/product theo franchise
- voucher nếu có luồng áp voucher tại POS

### 9.3. API POS cần dùng

Cart:

- `POST /api/carts/items/staff`
- `POST /api/carts/items/staff-bulk`
- `GET /api/carts/customer/:customerId?status=ACTIVE`
- `GET /api/carts/:id`
- `PUT /api/carts/:id`
- `DELETE /api/carts/:cartItemId`
- `PUT /api/carts/items/update-options-cart-item`
- `PATCH /api/carts/items/update-option`
- `PATCH /api/carts/items/remove-option`
- `PUT /api/carts/:id/apply-voucher`
- `DELETE /api/carts/:id/remove-voucher`
- `PUT /api/carts/:id/checkout`
- `PUT /api/carts/:id/cancel`

Order:

- `GET /api/orders/cart/:cartId`

Payment:

- phase đầu chỉ gắn điểm nối
- contract payment vẫn tạm thời, chưa xem là phase khóa cuối

### 9.4. Khối UI nên có

- `PosHeader`
  - franchise switch context summary
  - customer selector
  - search sản phẩm
- `PosCategoryTabs`
- `PosProductGrid`
- `PosCartSidebar`
  - customer info
  - line items
  - money summary
  - note/address/phone
  - voucher section
  - checkout/pay action

### 9.5. Luồng chuẩn

1. chọn customer hoặc `walk-in customer`
2. gọi `GET active cart`
3. nếu đã có cart thì restore
4. thêm món:
   - add từng món bằng `staff`
   - add nhiều món bằng `staff-bulk`
5. chỉnh options hoặc quantity
6. cập nhật address/phone/message nếu cần
7. checkout
8. refetch bằng `order by cartId` hoặc route sang detail

## 10. Scope màn Order Management

### 10.1. Mục tiêu

Màn này phục vụ vận hành và quản lý:

- xem đơn theo franchise
- filter theo status
- tra cứu theo code, phone
- xem lịch sử order
- mở detail
- thao tác đổi trạng thái nếu backend hỗ trợ

### 10.2. API cần dùng

- `GET /api/orders/franchise/:franchiseId?status=...`
- `GET /api/orders/:id`
- `GET /api/orders/code?code=...`
- `GET /api/orders/customer/:customerId?status=...`
- payment tạm thời gắn ở detail

### 10.3. Khối UI nên có

- `OrderFiltersBar`
  - status
  - code
  - phone
  - customer
  - date range nếu có
- `OrderSummaryCards`
  - quick counts theo status nếu cần
- `OrderTable`
  - list mỏng, thao tác nhanh
- `OrderDetailPage`
  - order info
  - items
  - money breakdown
  - payment block
  - actions

### 10.4. Lưu ý về list shape

Backend hiện có ít nhất 2 shape khác nhau:

- order detail shape
- franchise order list shape mỏng

Không được dùng một interface duy nhất cho tất cả response order.

## 11. Scope màn Order Detail

Màn này nên là nơi gom các thao tác chuyên sâu:

- xem full snapshot của order
- xem payment liên quan
- xem thông tin customer, franchise, staff
- xem item list và toppings/options
- trigger action theo status nếu backend có

Lợi ích:

- `Order Management` list giữ gọn
- dễ deep-link từ table hoặc từ POS sau checkout

## 12. Mapping API -> usecase -> UI

### 12.1. POS

- `get-active-cart.usecase`
  - gọi `GET cart by customer + ACTIVE`
  - normalize cart list response
  - chọn cart đang active hoặc trả null
- `add-cart-items.usecase`
  - chọn API `staff` hoặc `staff-bulk`
  - sau submit thì sync lại cart detail
- `update-cart-item-options.usecase`
  - replace all options
  - sau đó refetch cart detail
- `checkout-cart.usecase`
  - submit checkout
  - refetch cart/order chuẩn

### 12.2. Orders

- `load-franchise-orders.usecase`
  - lấy list order theo franchise
  - áp filter status/search
- `load-order-detail.usecase`
  - lấy order detail theo `id`
  - ghép thêm payment nếu phase đó đã bật

## 13. Strategy state management

Không nên để toàn bộ state nằm trong page.

Đề xuất:

- `use-order-pos-page.ts`
  - orchestration cho POS page
- `pos-session.store.ts`
  - state dùng chung trong POS:
    - selected customer
    - active cart id
    - local UI flags
    - pending item editor state
- `use-order-filters.ts`
  - query params / filter state cho order list
- `use-order-list-page.ts`
  - fetch list, pagination, refetch, open detail

Nguyên tắc:

- state server lấy từ service/usecase
- state UI tạm thời để trong hook hoặc store module-local
- không để component con tự gọi API bừa

## 14. Chiến lược service API trong module riêng

Theo yêu cầu hiện tại, API của feature này không đưa vào pattern cũ ở `src/apis/endpoints/*`.

Hướng làm:

- trong module `order-management`, tạo `services/*.service.ts`
- service bên trong vẫn có thể dùng `httpClient` global của app
- nhưng request/response models và endpoint wrapper phải sống trong module này

Ví dụ:

```ts
// src/modules/admin/order-management/services/cart.service.ts
import { httpClient } from "@/apis/httpClient";
```

Lợi ích:

- feature self-contained
- không làm bẩn shared endpoints cũ
- refactor về sau dễ hơn

## 15. Các phase implement đề xuất

### Phase 1. Tái cấu trúc route và module

- thêm route constants mới
- đổi `/admin/orders` thành `OrderListPage`
- thêm `/admin/orders/pos`
- thêm `/admin/orders/:orderId`
- refactor module tree theo `SKILLS.md`

### Phase 2. Shared models + services + usecases

- định nghĩa models chuẩn hóa cho cart/order/payment
- viết service wrappers cho cart/order/payment
- viết normalize helpers nếu backend shape lệch nhau

### Phase 3. Implement POS thật

- thay toàn bộ mock data
- load product/category theo franchise
- chọn customer / walk-in customer
- restore active cart
- add item / bulk add
- update options / remove option / update quantity
- update cart info
- checkout

### Phase 4. Implement Order Management thật

- list theo franchise
- filter theo status
- search theo code / phone / customer nếu có
- mở order detail

### Phase 5. Implement Order Detail

- full detail page
- money breakdown
- payment summary block
- action buttons theo status

### Phase 6. Payment integration và polish

- chỉ làm khi contract payment được chốt
- confirm/refund
- paid state sync

## 16. Các blocker hoặc chỗ cần chốt thêm

### 16.1. API đổi trạng thái order

Hiện trong contract đã gửi chưa có endpoint rõ ràng để:

- confirm order
- preparing
- ready for pickup
- out for delivery
- completed
- canceled

Trong khi đây là chức năng bạn đã nêu cho route quản lý đơn.

Kết luận:

- đây là blocker nghiệp vụ thật
- không nên tự đoán endpoint

### 16.2. Walk-in customer source of truth

Cần chốt một trong các cách:

- backend seed sẵn 1 customer walk-in
- frontend config cứng một `walkInCustomerId`
- frontend tìm bằng một key chuẩn hóa

### 16.3. Menu/category/product API cho POS

Tài liệu backend cart/order/payment đã có, nhưng API load menu POS theo franchise cần chốt lại rõ:

- category theo franchise
- product theo franchise/category
- search product

### 16.4. Payment contract cuối

Payment hiện vẫn nên xem là `TODO`.

Có thể chuẩn bị structure trước nhưng chưa khóa UX/action cuối.

### 16.5. Menu active logic khi tách POS và Orders

Khi sidebar có đồng thời:

- `orders`
- `orders/pos`

thì cần kiểm tra lại logic active menu hiện tại để tránh:

- cả 2 item cùng active
- hoặc item cha nuốt item con

## 17. Definition of done cho bản đầu

Bản đầu được xem là xong khi:

- có 2 route chính:
  - POS
  - Orders
- có route detail order
- POS không còn mock data
- POS dùng real cart APIs
- Order list dùng real order APIs
- detail order dùng real detail API
- address mua tại quầy dùng format `MUA_TAI_QUAY - {franchiseName}`
- không dùng phone fake cho khách vãng lai
- code tổ chức theo `SKILLS.md`
- page gọn, logic ra hooks/usecases/services

## 18. Checklist thực thi

- [ ] tạo route constants mới cho POS và order detail
- [ ] cập nhật admin menu thành 2 entry riêng
- [ ] refactor tree của module `order-management`
- [ ] tạo models chuẩn hóa cho cart/order/payment
- [ ] tạo services module-local
- [ ] viết usecase restore active cart
- [ ] viết POS page thật từ UI mock cũ
- [ ] viết order list page thật
- [ ] viết order detail page
- [ ] nối payment block ở mức tạm thời
- [ ] review lại responsive và loading/error states
- [ ] test flow chính với franchise context

## 19. Đề xuất triển khai thực tế ngay sau plan này

Thứ tự làm tốt nhất:

1. route + module structure
2. shared models/services/usecases
3. POS trước
4. order list sau
5. order detail
6. payment và status actions khi contract đủ

Lý do:

- POS đang là màn có UI rõ nhất
- POS phụ thuộc cart APIs đã chốt nhiều nhất
- order status actions hiện còn thiếu contract backend nên chưa nên lấy làm phase đầu
