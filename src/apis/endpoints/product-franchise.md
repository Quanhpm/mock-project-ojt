# Product Franchise API Documentation

## API 1: Create Item (PRODUCT-FRANCHISE-01)

### Overview

- **API ID**: PRODUCT-FRANCHISE-01
- **API Name**: Create Item
- **Method**: POST
- **URL**: `/api/product-franchises`
- **Token**: YES
- **Type/Role**: ADMIN, MANAGER
- **Note**: size có thể set "DEFAULT" nếu không có size

### Request Body

| No. | FieldName    | Type   | Required | Default | Example                                    |
| --- | ------------ | ------ | -------- | ------- | ------------------------------------------ |
| 1   | franchise_id | string | YES      |         | "franchise_id": "697dc8294a449704df41fb2d" |
| 2   | product_id   | string | YES      |         | "product_id": "6989ecc3484628cc67c5d3c9"   |
| 3   | size         | string | YES      |         | "size": "XL"                               |
| 4   | price_base   | number | YES      |         | "price_base": 50000                        |

### Request Example

```json
{
  "franchise_id": "697dc8294a449704df41fb2d",
  "product_id": "6989ecc3484628cc67c5d3c9",
  "size": "XL",
  "price_base": 50000
}
```

### Response

#### Success Response

```json
{
  "success": true,
  "data": {
    "id": "69a1ba27c166898fa7c847ee",
    "is_active": true,
    "is_deleted": false,
    "created_at": "2026-02-27T15:37:11.086Z",
    "updated_at": "2026-02-27T15:37:11.086Z",
    "product_id": "69a1b97ec166898fa7c847df",
    "franchise_id": "69a1b941c166898fa7c847d6",
    "size": "XL",
    "price_base": 50000
  }
}
```

---

## API 2: Search/List Product Franchises

### Overview

- **Method**: POST/GET (to be confirmed)
- **URL**: `/api/product-franchises/search` (to be confirmed)
- **Token**: YES (to be confirmed)

### Request Body

#### Search Condition Object

| No. | FieldName       | Type              | Required | Default | Example             |
| --- | --------------- | ----------------- | -------- | ------- | ------------------- |
| 1   | searchCondition | object            | YES      |         | See below           |
| 2   | franchise_id    | string            | NO       | ""      | "franchise_id": ""  |
| 3   | product_id      | string            | NO       | ""      | "product_id": ""    |
| 4   | size            | string            | NO       | ""      | "size": ""          |
| 5   | price_from      | string \| number  | NO       | ""      | "price_from": ""    |
| 6   | price_to        | string \| number  | NO       | ""      | "price_to": ""      |
| 7   | is_active       | string \| boolean | NO       | ""      | "is_active": ""     |
| 8   | is_deleted      | string \| boolean | NO       | FALSE   | "is_deleted": false |
| 9   | pageInfo        | object            | YES      |         | See below           |
| 10  | pageNum         | number            | YES      | 1       | "pageNum": 1        |
| 11  | pageSize        | number            | YES      | 10      | "pageSize": 50      |

### Request Example

```json
{
  "searchCondition": {
    "product_id": "",
    "franchise_id": "",
    "size": "",
    "price_from": "",
    "price_to": "",
    "is_active": "",
    "is_deleted": false
  },
  "pageInfo": {
    "pageNum": 1,
    "pageSize": 50
  }
}
```

### Response

#### Success Response

```json
{
  "success": true,
  "data": [
    {
      "id": "69a1ba27c166898fa7c847ee",
      "is_active": true,
      "is_deleted": false,
      "created_at": "2026-02-27T15:37:11.086Z",
      "updated_at": "2026-02-27T15:37:11.086Z",
      "product_id": "69a1b97ec166898fa7c847df",
      "product_name": "Coffee B",
      "franchise_id": "69a1b941c166898fa7c847d6",
      "franchise_name": "Chợt Cafe 008",
      "size": "XL",
      "price_base": 50000
    }
  ]
}
```

---

## API 3: Get Item (PRODUCT-FRANCHISE-03)

### Overview

- **API ID**: PRODUCT-FRANCHISE-03
- **API Name**: Get Item
- **Method**: GET
- **URL**: `/api/product-franchises/:id`
- **Token**: YES
- **Type/Role**: SYSTEM & FRANCHISE

### Request Parameters

- **Path Parameter**: `id` (Product Franchise ID)

### Request Example

```
GET /api/product-franchises/69a1ba27c166898fa7c847ee
```

### Response

#### Success Response

```json
{
  "success": true,
  "data": {
    "id": "69a1ba27c166898fa7c847ee",
    "is_active": true,
    "is_deleted": false,
    "created_at": "2026-02-27T15:37:11.086Z",
    "updated_at": "2026-02-27T15:37:11.086Z",
    "product_id": "69a1b97ec166898fa7c847df",
    "franchise_id": "69a1b941c166898fa7c847d6",
    "size": "XL",
    "price_base": 50000
  }
}
```

---

## API 4: Update Item (PRODUCT-FRANCHISE-04)

### Overview

- **API ID**: PRODUCT-FRANCHISE-04
- **API Name**: Update Item
- **Method**: PUT
- **URL**: `/api/product-franchises/:id`
- **Token**: YES
- **Type/Role**: ADMIN, MANAGER

### Request Parameters

- **Path Parameter**: `id` (Product Franchise ID)

### Request Body

| No. | FieldName  | Type   | Required | Default | Example             |
| --- | ---------- | ------ | -------- | ------- | ------------------- |
| 1   | size       | string | YES      |         | "size": "XL"        |
| 2   | price_base | number | YES      |         | "price_base": 49000 |

### Request Example

```
PUT /api/product-franchises/69a1ba27c166898fa7c847ee
```

```json
{
  "size": "XL",
  "price_base": 49000
}
```

### Response

#### Success Response

```json
{
  "success": true,
  "data": {
    "id": "69a1ba27c166898fa7c847ee",
    "is_active": true,
    "is_deleted": false,
    "created_at": "2026-02-27T15:37:11.086Z",
    "updated_at": "2026-02-27T15:37:11.086Z",
    "product_id": "69a1b97ec166898fa7c847df",
    "franchise_id": "69a1b941c166898fa7c847d6",
    "size": "XL",
    "price_base": 50000
  }
}
```

---

## API 5: Delete Item (PRODUCT-FRANCHISE-05)

### Overview

- **API ID**: PRODUCT-FRANCHISE-05
- **API Name**: Delete Item
- **Method**: DELETE
- **URL**: `/api/product-franchises/:id`
- **Token**: YES
- **Type/Role**: ADMIN, MANAGER

### Request Parameters

- **Path Parameter**: `id` (Product Franchise ID)

### Request Example

```
DELETE /api/product-franchises/69a1ba27c166898fa7c847ee
```

### Response

#### Success Response

```json
{
  "success": true,
  "data": null
}
```

---

## API 6: Restore Item (PRODUCT-FRANCHISE-06)

### Overview

- **API ID**: PRODUCT-FRANCHISE-06
- **API Name**: Restore Item
- **Method**: PATCH
- **URL**: `/api/product-franchises/restore`
- **Token**: YES
- **Type/Role**: ADMIN, MANAGER

### Request Parameters

No input parameters required (id may be passed via body or determined by token)

### Request Example

```
PATCH /api/product-franchises/restore
```

### Response

#### Success Response

```json
{
  "success": true,
  "data": null
}
```

---

## API 7: Change Status Item (PRODUCT-FRANCHISE-07)

### Overview

- **API ID**: PRODUCT-FRANCHISE-07
- **API Name**: Change Status Item
- **Method**: PATCH
- **URL**: `/api/product-franchises/status`
- **Token**: YES
- **Type/Role**: ADMIN, MANAGER

### Request Body

| No. | FieldName | Type    | Required | Default | Example           |
| --- | --------- | ------- | -------- | ------- | ----------------- |
| 1   | is_active | boolean | YES      |         | "is_active": true |

### Request Example

```
PATCH /api/product-franchises/status
```

```json
{
  "is_active": true
}
```

### Response

#### Success Response

```json
{
  "success": true,
  "data": null
}
```

---

## Notes

1. **Size Field**: Khi tạo product franchise, nếu sản phẩm không có size, có thể set giá trị "DEFAULT"
2. **Search Conditions**: Tất cả các field trong searchCondition đều optional (không bắt buộc)
3. **Pagination**: Mặc định pageNum = 1, pageSize = 10
4. **is_deleted**: Mặc định là FALSE để chỉ lấy các record chưa bị xóa
5. **Get Item**: API GET có thể được truy cập bởi SYSTEM & FRANCHISE roles
6. **Update & Delete**: Chỉ ADMIN và MANAGER mới có quyền cập nhật và xóa product franchise
7. **Restore Item**: API PATCH để khôi phục lại product franchise đã bị xóa (soft delete), chỉ ADMIN và MANAGER
8. **Change Status**: API PATCH để thay đổi trạng thái active/inactive của product franchise, chỉ ADMIN và MANAGER
