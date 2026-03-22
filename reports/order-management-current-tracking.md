# Order Management Current Tracking

Updated: `2026-03-22`

## Doc file nay truoc neu mo chat moi

- [order-management-current-tracking.md](/Users/FPTU/OJT/MockProject/Mock-Project/reports/order-management-current-tracking.md)
- [order-management-next-phase-handoff.md](/Users/FPTU/OJT/MockProject/Mock-Project/reports/order-management-next-phase-handoff.md)
- [order-management-api-readiness-kickoff.md](/Users/FPTU/OJT/MockProject/Mock-Project/reports/order-management-api-readiness-kickoff.md)
- [SKILLS.md](/Users/FPTU/OJT/MockProject/Mock-Project/SKILLS.md)

## Tinh trang hien tai

Module `admin/order-management` da duoc noi tiep tren UI cu, khong doi layout list/detail chinh.

Da lam den:

- gate chon franchise cho `ADMIN`
- `MANAGER / STAFF` di theo `activeContext`
- order list load theo franchise
- order detail load `order + payment + customer`
- sidebar list co resolve ten customer theo `customer_id`
- payment panel co nut `Thanh toan`
- thanh `Trang thai don hang` da doi tu 4 step thanh 5 step
- flow `PREPARING -> READY_FOR_PICKUP` da doi thanh mo modal chon staff giao hang

## Flow trang thai moi dang dung

Thanh trang thai hien tai la:

1. `Da xac nhan`
2. `Dang chuan bi`
3. `San sang ban giao`
4. `Dang giao`
5. `Giao thanh cong`

Map status hien tai:

- `DRAFT` van dang duoc dung chung voi cot dau de giu UI hien tai
- `CONFIRMED` -> cot `Da xac nhan`
- `PREPARING` -> cot `Dang chuan bi`
- `READY_FOR_PICKUP` -> cot `San sang ban giao`
- `OUT_FOR_DELIVERY` -> cot `Dang giao`
- `COMPLETED` -> cot `Giao thanh cong`

Action dang noi:

- `CONFIRMED -> PREPARING`
  - `PUT /api/orders/:id/preparing`
- `PREPARING -> READY_FOR_PICKUP`
  - click vao step `San sang ban giao`
  - mo modal lay danh sach staff theo franchise cua order
  - chon 1 user, lay `value`
  - goi `PUT /api/orders/:id/ready-for-pickup`
  - body:
    - `{ "staff_id": "<value>" }`
- `READY_FOR_PICKUP -> OUT_FOR_DELIVERY`
  - `PUT /api/deliveries/:id/pickup`
- `OUT_FOR_DELIVERY -> COMPLETED`
  - `PUT /api/deliveries/:id/complete`

## API dang noi trong phase nay

### Order

- `GET /api/orders/franchise/:franchiseId?status=...`
- `GET /api/orders/:id`
- `PUT /api/orders/:id/preparing`
- `PUT /api/orders/:id/ready-for-pickup`

### Payment

- `GET /api/payments/order/:orderId`
- `PUT /api/payments/:paymentId/confirm`

### Delivery

- `PUT /api/deliveries/:deliveryId/pickup`
- `PUT /api/deliveries/:deliveryId/complete`

### User franchise role

- `GET /api/user-franchise-roles/franchise/:franchiseId`

Response dang duoc dung cho modal:

```json
[
  {
    "value": "user_id",
    "code": "",
    "name": "Ten user",
    "email": "mail@example.com",
    "phone": "0123456789",
    "image": "https://..."
  }
]
```

## File chinh vua duoc cham

### Detail / status flow

- `src/modules/admin/order-management/pages/OrderDetailPage.tsx`
- `src/modules/admin/order-management/hooks/use-order-detail-page.ts`
- `src/modules/admin/order-management/partials/orders/OrderProgressHeader.tsx`
- `src/modules/admin/order-management/partials/orders/OrderReadyForPickupModal.tsx`

### Service / model moi

- `src/modules/admin/order-management/services/order.service.ts`
- `src/modules/admin/order-management/services/delivery.service.ts`
- `src/modules/admin/order-management/services/delivery-assignee.service.ts`
- `src/modules/admin/order-management/models/order.models.ts`
- `src/modules/admin/order-management/models/request.models.ts`
- `src/modules/admin/order-management/models/delivery-assignee.models.ts`

### List / customer display

- `src/modules/admin/order-management/hooks/use-order-list-page.ts`
- `src/modules/admin/order-management/partials/orders/OrderList.tsx`
- `src/modules/admin/order-management/partials/orders/OrderCard.tsx`

## Ghi chu quan trong cho chat moi

- Lam theo `SKILLS.md`: page chi render va noi props, khong nhet business logic vao page.
- Logic modal chon staff giao hang dang nam trong `use-order-detail-page.ts`.
- Modal UI dang nam rieng o `partials/orders/OrderReadyForPickupModal.tsx`.
- `ready-for-pickup` khong con lay `staff_id` tu order hien tai nua; `staff_id` phai den tu user duoc chon trong modal.
- 2 step cuoi van can `delivery_id` hoac `delivery._id` co trong order detail de goi API delivery.
- Repo van co nhieu loi build nen khong dung `npm run build` lam thang do duy nhat; da lint rieng cac file vua sua thi pass.

## Neu tiep tuc tiep

Thu tu hop ly:

1. test tay flow `PREPARING -> mo modal -> chon staff -> READY_FOR_PICKUP`
2. test tiep `READY_FOR_PICKUP -> OUT_FOR_DELIVERY`
3. test tiep `OUT_FOR_DELIVERY -> COMPLETED`
4. polish wording modal neu can
5. neu backend tra shape khac cho user list, sua model/service theo payload that
