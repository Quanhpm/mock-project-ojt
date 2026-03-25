# Payment History Chat Handoff MD

## Summary
Làm trang admin `Lịch sử Payment` tại route `/admin/payments` để hiển thị lịch sử giao dịch thanh toán theo `franchise context` hiện tại.

Trang này phải:
- dùng UI table cùng phong cách với các trang admin hiện có, ưu tiên bám pattern của `ProductTable`
- có route/menu riêng
- có hook `use-payment-history.ts`
- gọi API theo `franchiseId`
- có phân trang frontend
- có filter theo ngày và trạng thái
- hỗ trợ `ADMIN` chọn franchise như trang order queue
- hỗ trợ `MANAGER` dùng `activeContext`
- chỉ cho `ADMIN` và `MANAGER` truy cập

## Current Repo Facts
- Route constant `payments` đã có sẵn trong [src/routes/router.const.ts](/Users/FPTU/OJT/MockProject/Mock-Project/src/routes/router.const.ts)
- Hiện chưa có module admin `payment-management`
- Hiện chưa có page admin cho payment history
- `useOrderFranchiseContext` đã hỗ trợ:
  - `ADMIN` chưa có `franchise context` thì hiện gate chọn franchise
  - `MANAGER` lấy `franchiseId` từ `activeContext`
- Có thể tái sử dụng:
  - [src/modules/admin/order-management/hooks/use-order-franchise-context.ts](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/hooks/use-order-franchise-context.ts)
  - [src/modules/admin/order-management/partials/pos/PosFranchiseSelectionGate.tsx](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/order-management/partials/pos/PosFranchiseSelectionGate.tsx)
- `permissions.config.ts` hiện chưa có module `payments`, nên phải thêm module quyền mới
- UI table cần bám pattern của:
  - [src/modules/admin/product-management/components/ProductTable.tsx](/Users/FPTU/OJT/MockProject/Mock-Project/src/modules/admin/product-management/components/ProductTable.tsx)
  - tinh thần là: page mỏng, component table chính chứa UI bảng + filter bar + pagination, hook riêng chứa state/fetch/filter

## API To Use
API chính:
- `GET /api/payments/franchise/:franchiseId?status=`

Sample response:
- trả về mảng payment
- shape nested object cho `franchise_id`, `customer_id`, `order_id`
- `status` có các giá trị: `PENDING`, `PAID`, `REFUNDED`
- `method` có thể là chuỗi rỗng
- `paid_at` có thể không có

Vì API hiện tại chưa cho thấy có phân trang/search server-side, implement:
- fetch toàn bộ list theo `franchiseId` + `status`
- filter ngày ở frontend
- pagination ở frontend
- sort mặc định `created_at` giảm dần, payment mới nhất lên đầu

## Access And Permissions
Role truy cập:
- `ADMIN`
- `MANAGER`

Không cho:
- `STAFF`
- `WAREHOUSE`

Bắt buộc thêm module quyền mới:
- `payments`

Cần sửa:
- [src/config/permissions.config.ts](/Users/FPTU/OJT/MockProject/Mock-Project/src/config/permissions.config.ts)
- thêm `payments` vào union `Module`
- thêm `payments` cho `ADMIN`
- thêm `payments` cho `MANAGER`
- không thêm cho `STAFF`
- không thêm cho `WAREHOUSE`

## Route And Menu
Dùng route:
- `ROUTER_URL.ADMIN_ROUTER.PAYMENT` tương ứng `/admin/payments`

Cần:
- thêm menu item `Payments` trong admin menu
- `allowedRoles: ["ADMIN", "MANAGER"]`
- route page mới dùng `ProtectedRoute` bình thường

Nếu muốn ẩn khỏi sidebar thì không đúng yêu cầu, nên:
- `Payments` phải hiện trên sidebar

## Folder Structure To Create
Tạo module mới:
- `src/modules/admin/payment-management/pages/PaymentHistoryPage.tsx`
- `src/modules/admin/payment-management/hooks/use-payment-history.ts`
- `src/modules/admin/payment-management/services/payment-history.service.ts`
- `src/modules/admin/payment-management/models/payment-history.models.ts`
- `src/modules/admin/payment-management/partials/payment-history/PaymentHistoryTable.tsx`
- `src/modules/admin/payment-management/partials/payment-history/PaymentHistoryFilters.tsx`
- `src/modules/admin/payment-management/partials/payment-history/PaymentHistoryHeader.tsx`
- `src/modules/admin/payment-management/partials/payment-history/PaymentHistoryPagination.tsx`
- `src/modules/admin/payment-management/pages/index.ts`
- `src/modules/admin/payment-management/index.ts`

Nguyên tắc:
- `page` chỉ ghép layout
- fetch/filter/pagination nằm trong hook
- API nằm riêng trong service
- model riêng cho payment history, không nhét tạm vào order models

## Data Models
Tạo model riêng cho response list, ví dụ:
```ts
export type PaymentHistoryStatus = "PENDING" | "PAID" | "REFUNDED";

export interface PaymentHistoryFranchiseRef {
  _id: string;
  name: string;
}

export interface PaymentHistoryCustomerRef {
  _id: string;
  name: string;
}

export interface PaymentHistoryOrderRef {
  _id: string;
  code: string;
}

export interface PaymentHistoryItem {
  _id: string;
  franchise_id: PaymentHistoryFranchiseRef | null;
  customer_id: PaymentHistoryCustomerRef | null;
  order_id: PaymentHistoryOrderRef | null;
  code: string;
  method: string;
  status: PaymentHistoryStatus;
  amount: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  paid_at?: string;
}
```

Tạo thêm type filter UI:
```ts
export interface PaymentHistoryFilters {
  status: PaymentHistoryStatus | "";
  dateFrom: string;
  dateTo: string;
}
```

## Service Layer
Trong `payment-history.service.ts`, tạo tối thiểu:
- `getPaymentsByFranchise(franchiseId: string, status?: PaymentHistoryStatus | "")`

Dùng `httpClient.get`
Behavior:
- nếu `status === ""` thì gửi request không kèm status
- endpoint: `/payments/franchise/${franchiseId}`

Không reuse `paymentService` hiện tại trong `order-management` vì service đó đang đóng vai trò cho order detail flow; payment history nên có service riêng trong module riêng.

## Hook Behavior
File:
- `use-payment-history.ts`

Hook phải xử lý:
- franchise context
- fetch data
- local filters
- local pagination
- loading/error state

State tối thiểu:
- `payments`
- `isLoading`
- `statusFilter`
- `dateFrom`
- `dateTo`
- `currentPage`
- `pageSize` default `10`

Derived state:
- `filteredPayments`
- `paginatedPayments`
- `totalItems`
- `totalPages`

Logic:
- lấy `franchiseId`, `franchiseName`, `franchiseOptions`, `requiresFranchiseSelection`, `hasInvalidFranchiseContext`, `switchFranchise` từ `useOrderFranchiseContext`
- khi mount và khi `franchiseId` đổi:
  - nếu không có `franchiseId`, không gọi API
  - nếu có `franchiseId`, gọi API
- khi `statusFilter` đổi:
  - gọi lại API với `status`
- khi `dateFrom` hoặc `dateTo` đổi:
  - chỉ filter local
- khi đổi bất kỳ filter nào:
  - reset `currentPage = 1`

Filter ngày:
- dùng `created_at`
- `dateFrom`: từ đầu ngày local
- `dateTo`: đến cuối ngày local
- nếu thiếu một đầu mốc thì chỉ áp mốc còn lại

Sort:
- mặc định `created_at` giảm dần

Pagination:
- frontend pagination sau khi filter local
- `pageSize = 10`
- nếu `currentPage > totalPages` sau filter thì kéo về page hợp lệ

Error handling:
- toast lỗi nếu fetch fail
- empty state an toàn nếu không có data

## Page Behavior
File:
- `PaymentHistoryPage.tsx`

Page chỉ render:
- franchise selection gate nếu cần
- invalid franchise empty state nếu không có context hợp lệ
- header
- filters
- table
- pagination

Dùng đúng pattern giống các page admin khác:
- page mỏng như `ProductListPage`
- main table component chịu trách nhiệm UI chính
- không nhét business logic vào page

## UI Requirements
Bắt buộc bám style/pattern table của `ProductTable`:
- card/container trắng bo góc
- filter bar nằm phía trên bảng
- table header rõ ràng
- row hover nhẹ
- pagination footer giống style admin hiện tại
- loading skeleton hoặc loading row trong khối bảng
- empty state trong khối bảng, không phải toast-only

Không dùng layout card như order queue.

## Table Columns
Cột đề xuất:
- `Payment Code`
- `Order Code`
- `Customer`
- `Method`
- `Status`
- `Amount`
- `Created At`
- `Paid At`

Hiển thị chi tiết:
- `Payment Code`: `payment.code`
- `Order Code`: `order_id.code` hoặc `-`
- `Customer`: `customer_id.name` hoặc `Khách vãng lai`
- `Method`: nếu rỗng thì `Chưa xác định`
- `Status`: badge màu
- `Amount`: format `vi-VN`
- `Created At`: format datetime `vi-VN`
- `Paid At`: format datetime `vi-VN` hoặc `-`

Badge màu:
- `PENDING`: amber/yellow
- `PAID`: emerald/green
- `REFUNDED`: slate hoặc rose, nhưng nên nhất quán với các badge khác trong admin

## Filters
Cần có filter bar với:
- status select
- date from
- date to

Status options:
- `Tất cả`
- `PENDING`
- `PAID`
- `REFUNDED`

Ngày:
- dùng input `type="date"`
- label rõ ràng:
  - `Từ ngày`
  - `Đến ngày`

Không cần ở v1:
- text search
- export CSV/PDF
- row actions
- modal detail
- refund button
- confirm payment button

## Pagination
Pagination ở frontend, đặt dưới bảng.

Yêu cầu:
- hiển thị tổng số item
- hiển thị page hiện tại / total pages
- có nút `Prev`, `Next`
- có nút chọn số trang nếu tiện
- nếu không có component dùng chung, viết UI pagination đơn giản nhưng cùng phong cách admin table hiện có

## Empty States
Các empty state phải tách rõ:
- chưa có franchise hợp lệ
- API trả rỗng toàn bộ
- filter ngày/status làm rỗng list

Text gợi ý:
- toàn bộ rỗng: `Chưa có giao dịch payment nào cho chi nhánh này`
- rỗng do filter: `Không có giao dịch phù hợp với bộ lọc hiện tại`

## Implementation Notes
- giữ `useOrderFranchiseContext` là nguồn franchise duy nhất cho page này
- không tạo flow chọn franchise riêng mới
- không chỉnh backend contract
- nếu cần shared constant cho payment status label/badge thì có thể tạo trong module `payment-management/config`, không nên buộc gắn vào `order-management`
- nếu muốn reuse `PaymentStatus` type từ `order.models.ts` thì được, nhưng response item vẫn nên có model riêng vì shape nested khác hoàn toàn

## Acceptance Criteria
- `ADMIN` vào `/admin/payments` khi chưa có franchise context sẽ thấy màn chọn chi nhánh
- `ADMIN` chọn chi nhánh xong sẽ load được payment history
- `MANAGER` vào trang sẽ load theo `activeContext.franchise_id`
- `STAFF` và `WAREHOUSE` không vào được route
- menu `Payments` xuất hiện trên sidebar cho `ADMIN` và `MANAGER`
- filter `status` hoạt động bằng cách gọi lại API theo `status`
- `dateFrom` và `dateTo` filter đúng trên `created_at`
- bảng mặc định hiển thị payment mới nhất trước
- phân trang hoạt động sau khi áp filter
- `method` rỗng hiển thị `Chưa xác định`
- `paid_at` trống hiển thị `-`
- empty state đúng khi không có dữ liệu

## Out Of Scope
Không làm trong task này:
- payment detail page
- refund flow
- confirm payment flow
- realtime refresh
- server-side pagination/search
- export dữ liệu

## Suggested Final Prompt For New Chat
Hãy tạo trang `Lịch sử Payment` cho hệ thống Admin với các yêu cầu sau:

- Dùng route `/admin/payments`
- Chỉ cho `ADMIN` và `MANAGER` truy cập
- Tạo module quyền `payments` riêng trong `permissions.config.ts`
- Dùng `useOrderFranchiseContext` để lấy `franchise context`
- Nếu là `ADMIN` chưa có franchise context thì hiển thị `PosFranchiseSelectionGate` giống order queue
- Nếu là `MANAGER` thì dùng `activeContext` hiện tại
- Gọi API `GET /api/payments/franchise/:franchiseId?status=`
- Tạo hook `use-payment-history.ts`
- Làm UI dạng table, cùng phong cách với `ProductTable`
- Có filter theo `status`, `dateFrom`, `dateTo`
- Có frontend pagination
- Mặc định sort payment mới nhất lên trên
- `method` rỗng hiển thị `Chưa xác định`
- `paid_at` trống hiển thị `-`
- Không làm action confirm/refund trong task này
- Giữ page mỏng, logic nằm trong hook/service, bám theo rule folder trong `SKILLS.md`
