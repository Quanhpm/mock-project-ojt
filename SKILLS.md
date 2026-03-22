# Rule chia folder

Tài liệu này dùng cho `admin auth`, nhưng có thể áp dụng cho các chức năng phức tạp như `order`, `cart`, `product`, `user`.

## Nguyên tắc chính

- mỗi folder chỉ nên làm 1 việc riêng
- không nhét business logic vào `page`
- `page` chỉ dùng để ghép UI, gọi hook, gọi usecase, và xử lý event
- mục tiêu là để file page không bị dài và khó đọc

## Folder nào làm gì

- `pages`: chứa màn hình chính, chỉ lo hiển thị và nối các phần lại với nhau
- `partials`: chứa các block UI nhỏ tách ra từ page
- `hooks`: chứa logic tách khỏi page, ví dụ xử lý state cục bộ, fetch, submit, filter, pagination
- `schema`: chứa validate form hoặc validate input
- `services`: chứa hàm gọi API, mỗi hàm 1 nhiệm vụ
- `usecases`: chứa logic nghiệp vụ, tức là luồng xử lý giữa `page`, `hooks`, `services`, `stores`
- `features`: chứa phần dùng chung theo domain, không thuộc riêng 1 page
- `stores`: chứa state global dùng chung
- `routes`: chứa route và guard
- `config`: chứa config, endpoint, env, constant hệ thống
- `models`: chứa type, interface, enum dùng chung

## Cách đặt cho dễ đọc

- code chỉ dùng cho 1 màn thì để gần màn đó
- code nhiều màn cùng dùng thì đưa lên `features`
- state dùng chung thì để `stores`
- type dùng chung thì để `models`
- config chung thì để `config`

## Áp dụng khi làm `order` và `cart`

- page chỉ render layout, gọi hook, truyền props xuống partials
- logic xử lý đơn hàng hoặc giỏ hàng đưa ra `hooks` hoặc `usecases`
- API tách riêng trong `services`
- phần dùng chung của `order` và `cart` thì gom vào `features`

## Mục tiêu

- page gọn
- folder rõ trách nhiệm
- dễ tìm file
- dễ mở rộng chức năng mà không bị rối

## Rule khi làm Order Management

- bám theo UI hiện tại của `src/modules/admin/order-management`
- không nhét franchise context logic trực tiếp vào `page`
- logic xác định franchise theo role phải để trong `hooks` hoặc `usecases`
- `Staff` và `Manager` lấy franchise từ `activeContext` hoặc helper auth store, không tạo flow chọn franchise riêng
- `Admin` dùng màn chọn franchise giống POS, ưu tiên tái sử dụng `PosFranchiseSelectionGate` hoặc tách component chung thay vì copy UI mới
- `OrderListPage` chỉ ghép filter bar, list và detail panel
- `use-order-list-page.ts` chịu trách nhiệm:
  - load order theo franchise
  - filter theo status
  - giữ selected order
  - refresh list
- `use-order-detail-page.ts` chịu trách nhiệm:
  - load order detail
  - load payment nếu màn hình còn giữ payment panel
  - update status rồi refetch
- `order.service.ts` chỉ chứa API order, không nhét business branching theo role vào service
- nếu có logic phân nhánh role `ADMIN / MANAGER / STAFF`, ưu tiên gom vào 1 hook context riêng thay vì rải điều kiện khắp page
- khi chưa có yêu cầu mới từ backend, giữ search ở order list là local search như UI hiện tại
- chỉ mở rộng API search theo code khi thật sự cần server-side search
