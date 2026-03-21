# API Admin/POS Cho Dev Frontend

## 1. File này để làm gì

Đây là bản rút gọn để dev frontend đọc nhanh và bắt đầu implement.

- Nếu cần hiểu nhanh luồng và endpoint chính, đọc file này.
- Nếu cần full contract, sample dài, field-by-field đầy đủ, đọc thêm file:
  - `reports/admin-pos-cart-order-payment-api.md`

Phạm vi:

- `Cart`
- `Order`
- `Payment` ở mức tạm thời / tham khảo

## 2. Rule backend phải nhớ

### Cart

- Mỗi `customer` chỉ có tối đa `1 cart ACTIVE`.
- `GET /api/carts/customer/:customerId?status=...` trả về `array`.
- Nếu không có dữ liệu, backend trả `200` với `data: []`.
- Khi add cart item:
  - giống hệt line cũ, chỉ khác `quantity` -> backend cộng dồn quantity
  - khác `note` hoặc khác `options` -> backend tạo line mới
- `options` thực chất là `topping/add-on`.
- Mỗi option cũng là một `product_franchise_id`.
- Cart đã checkout thì không thể cancel nữa.

### Checkout

- `PUT /api/carts/:id/checkout` sinh order.
- Response checkout hiện tại là response tạm kiểu `cart-shaped object`.
- Không nên tin hoàn toàn `status` trong response checkout ngay lúc đó.
- Sau checkout nên refetch:
  - `GET /api/orders/cart/:cartId`
  - hoặc refetch cart/order liên quan

### Order

- `GET /api/orders/customer/:customerId?status=...` trả list khá giàu dữ liệu.
- `GET /api/orders/franchise/:franchiseId?status=...` trả list mỏng hơn nhiều.
- Không assume mọi “order list” có cùng shape.

### Payment

- Phần payment hiện chỉ nên xem là tham khảo tạm.
- Chưa nên đóng cứng frontend contract nếu backend còn đổi tiếp.

## 3. Luồng POS tối thiểu

### Bước 1: load active cart

```text
GET /api/carts/customer/:customerId?status=ACTIVE
```

Kết quả mong đợi:

- `[]` -> chưa có active cart
- `[cart]` -> có đúng 1 active cart để tiếp tục thao tác

### Bước 2: thêm món

Thêm 1 món:

```text
POST /api/carts/items/staff
```

Thêm nhiều món:

```text
POST /api/carts/items/staff-bulk
```

### Bước 3: chỉnh topping/options

Thay cả danh sách topping:

```text
PUT /api/carts/items/update-options-cart-item
```

Tăng/giảm số lượng một topping:

```text
PATCH /api/carts/items/update-option
```

Xóa một topping:

```text
PATCH /api/carts/items/remove-option
```

### Bước 4: cập nhật info cart

```text
PUT /api/carts/:id
```

Thông tin thường đi ở bước này:

- `address`
- `phone`
- `message`

### Bước 5: áp voucher nếu có

```text
PUT /api/carts/:id/apply-voucher
DELETE /api/carts/:id/remove-voucher
```

### Bước 6: checkout

```text
PUT /api/carts/:id/checkout
```

Sau đó:

```text
GET /api/orders/cart/:cartId
```

## 4. Luồng quản lý order tối thiểu

Load order theo chi nhánh:

```text
GET /api/orders/franchise/:franchiseId
GET /api/orders/franchise/:franchiseId?status=CONFIRMED
```

Mở detail:

```text
GET /api/orders/:id
```

Tra bằng code:

```text
GET /api/orders/code?code=ORDER_...
```

Xem lịch sử order của customer:

```text
GET /api/orders/customer/:customerId?status=...
```

## 5. Endpoint quan trọng nhất

### Cart

| Endpoint | Dùng khi nào | Ghi chú |
| --- | --- | --- |
| `GET /api/carts/customer/:customerId?status=ACTIVE` | Mở POS / restore cart | Trả `array`, không phải object |
| `POST /api/carts/items/staff` | Add 1 món | Dùng ở thao tác thêm lẻ |
| `POST /api/carts/items/staff-bulk` | Add nhiều món | Dùng khi chọn nhiều line cùng lúc |
| `GET /api/carts/:id` | Refetch cart detail | Dùng sau các thao tác ghi |
| `PUT /api/carts/:id` | Update info cart | Address/phone/message |
| `PUT /api/carts/:id/checkout` | Chốt cart | Sau đó nên gọi order API |

### Options / toppings

| Endpoint | Dùng khi nào | Ghi chú |
| --- | --- | --- |
| `PUT /api/carts/items/update-options-cart-item` | Save toàn bộ topping mới | Response `data: null` |
| `PATCH /api/carts/items/update-option` | Sửa quantity 1 topping | Không replace full list |
| `PATCH /api/carts/items/remove-option` | Xóa 1 topping | Dùng `option_product_franchise_id` |

### Order

| Endpoint | Dùng khi nào | Ghi chú |
| --- | --- | --- |
| `GET /api/orders/cart/:cartId` | Lấy order sau checkout | Endpoint quan trọng nhất sau checkout |
| `GET /api/orders/:id` | Mở detail order | Shape gần full detail |
| `GET /api/orders/code?code=...` | Search nhanh theo mã | Trả order detail shape |
| `GET /api/orders/customer/:customerId?status=...` | History theo customer | List khá giàu dữ liệu |
| `GET /api/orders/franchise/:franchiseId?status=...` | Board theo chi nhánh | List mỏng, tối ưu cho dashboard |

## 6. Request mẫu dev cần nhớ

### Add 1 cart item

```json
{
  "customer_id": "699e5b64558e4453d3fce2e3",
  "franchise_id": "698eab0826ca2b18eb35337e",
  "product_franchise_id": "69abb33e54f63d42311eeecd",
  "quantity": 1,
  "note": "không đá, 30% đường",
  "options": [
    {
      "product_franchise_id": "698eab1a26ca2b18eb3534de",
      "quantity": 1
    }
  ]
}
```

### Add nhiều cart item

```json
{
  "customer_id": "699e5b64558e4453d3fce2e3",
  "franchise_id": "698eab0826ca2b18eb35337e",
  "items": [
    {
      "product_franchise_id": "69abb33e54f63d42311eeecd",
      "quantity": 1,
      "note": "không đá, 30% đường",
      "options": [
        {
          "product_franchise_id": "698eab1a26ca2b18eb3534de",
          "quantity": 1
        }
      ]
    }
  ]
}
```

### Replace full options

```json
{
  "cart_item_id": "69bcc04ff86d6ed3e81641b1",
  "options": [
    {
      "product_franchise_id": "698eab1a26ca2b18eb3534de",
      "quantity": 1
    },
    {
      "product_franchise_id": "698eab1a26ca2b18eb3534d4",
      "quantity": 1
    }
  ]
}
```

### Remove 1 option

```json
{
  "cart_item_id": "69b2591edfeefd41c8494b26",
  "option_product_franchise_id": "698eab1d26ca2b18eb353515"
}
```

## 7. Shape dữ liệu cần nhớ

### Cart detail

- Top-level có thể có:
  - `_id`
  - `customer_id`
  - `franchise_id`
  - `staff_id`
  - `status`
  - `address`
  - `phone`
  - `message`
  - `promotion_discount`
  - `voucher_discount`
  - `loyalty_discount`
  - `subtotal_amount`
  - `final_amount`
  - `cart_items`

- `cart detail` thường dùng:
  - `product: { name, image_url }`

### Cart list

- `GET /api/carts/customer/:customerId?status=...` trả `data[]`
- Trong list payload thường flatten:
  - `product_name`
  - `product_image_url`

### Order detail

- `GET /api/orders/cart/:cartId`
- `GET /api/orders/:id`
- `GET /api/orders/code?code=...`

Ba endpoint này hiện đều gần với `order detail shape`.

### Order list theo franchise

Nhẹ hơn nhiều, thường chỉ có:

- `_id`
- `code`
- `status`
- `phone`
- `subtotal_amount`
- `final_amount`
- `created_at`

## 8. Các gotcha dễ dính bug

### 1. Đừng assume cart-by-customer trả object

Nó trả `array`.

### 2. Đừng assume checkout response là state cuối

Checkout response hiện có thể là response tạm.

Sau checkout nên refetch.

### 3. Đừng assume mọi order list có cùng shape

- `orders/customer` -> list giàu dữ liệu
- `orders/franchise` -> list mỏng

### 4. Đừng bind UI trực tiếp vào raw product shape

Vì có endpoint dùng:

- `product.name`

và endpoint khác dùng:

- `product_name`

Nên normalize trước khi render.

### 5. `count-cart-item` không phải endpoint chính cho admin/POS

- Hiện usage chính là customer side.
- Admin/POS không cần phụ thuộc vào nó trong flow chính.

### 6. `options` chính là topping/add-on

Không nên model nó như object “tuỳ chọn UI” mơ hồ.

## 9. Gợi ý state strategy cho frontend

### Nên giữ ít nhất các state sau

- `activeCart`
- `activeCartId`
- `activeCustomerId`
- `orderDetail`
- `franchiseOrderList`

### Sau các thao tác này nên refetch

- `PUT /api/carts/items/update-options-cart-item`
- `PUT /api/carts/:id/checkout`
- các PATCH option nếu chưa tin response

### Refetch ưu tiên

```text
GET /api/carts/:id
GET /api/carts/customer/:customerId?status=ACTIVE
GET /api/orders/cart/:cartId
```

## 10. TODO hiện tại

- Payment chưa nên xem là contract cuối.
- Nếu backend chốt payment sau, cập nhật tiếp:
  - `GET /api/payments/code?code=...`
  - `GET /api/payments/:id`
  - response của `confirm/refund`

## 11. Kết luận cho dev

Nếu chỉ nhớ 5 điều để bắt đầu làm POS:

1. Luôn vào từ `GET /api/carts/customer/:customerId?status=ACTIVE`
2. Add nhiều món thì dùng `staff-bulk`
3. Topping dùng `options`, mỗi option là `product_franchise_id`
4. Checkout xong phải lấy order lại bằng `GET /api/orders/cart/:cartId`
5. Normalize dữ liệu trước khi render UI
