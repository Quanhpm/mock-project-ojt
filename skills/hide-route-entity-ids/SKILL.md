---
name: hide-route-entity-ids
description: Use when a workflow page is passing transient entity ids through route params, search params, or location state and should be refactored to a store-backed session instead. Best for multi-step flows like POS review, checkout, confirmation, wizard, or modal-to-page transitions where the URL does not need to expose raw ids.
---

# Hide Route Entity IDs

Dùng skill này khi một màn đang truyền `id` qua `params`, `query`, hoặc `location.state`, nhưng `id` đó chỉ phục vụ cho một workflow tạm thời trong app.

## Dùng khi nào

- Luồng nhiều bước như `builder -> review -> checkout -> done`
- `id` chỉ là state tạm của session hiện tại
- URL không cần share cho người khác mở lại đúng dữ liệu đó
- User chỉ cần đi tiếp trong cùng tab, không cần deep-link thật

## Không dùng khi nào

- Trang detail chuẩn như `/orders/:orderId`, `/customers/:customerId`
- URL cần bookmark, copy, share, hoặc mở tab mới vẫn phải chạy đúng
- Backend đang coi route param là định danh chính của resource

## Mục tiêu

- Giấu `id` khỏi thanh địa chỉ
- Giữ workflow state ở `zustand`
- Nếu cần sống qua `F5` cùng tab, dùng `persist` với `sessionStorage`

Lưu ý:
- Cách này chỉ giấu `id` khỏi browser URL
- Không giấu `id` khỏi tab Network
- Muốn ẩn khỏi request thì backend phải đổi contract

## Recipe

### 1. Xác định id nào là transient

Nhóm đúng các field chỉ phục vụ workflow:

- `activeCartId`
- `selectedCustomer`
- `draftFranchiseId`
- `selectedPaymentId`

Không nhét vào store các field không cần giữ lâu hoặc có thể load lại dễ dàng.

### 2. Tạo store cấp module

Đặt ở `stores/` của module đó.

Mẫu tối thiểu:

```ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type FlowSessionState = {
  contextId: string | null;
  activeEntityId: string | null;
  selectedEntity: { id: string; name: string } | null;
  setContextId: (value: string | null) => void;
  setActiveEntityId: (value: string | null) => void;
  setSelectedEntity: (value: { id: string; name: string } | null) => void;
  resetSession: () => void;
};

const defaultState = {
  contextId: null,
  activeEntityId: null,
  selectedEntity: null,
};

export const useFlowSessionStore = create<FlowSessionState>()(
  persist(
    (set) => ({
      ...defaultState,
      setContextId: (contextId) => set({ contextId }),
      setActiveEntityId: (activeEntityId) => set({ activeEntityId }),
      setSelectedEntity: (selectedEntity) => set({ selectedEntity }),
      resetSession: () => set({ ...defaultState }),
    }),
    {
      name: "module-flow-session",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        contextId: state.contextId,
        activeEntityId: state.activeEntityId,
        selectedEntity: state.selectedEntity,
      }),
    },
  ),
);
```

Rule:

- `sessionStorage`: giữ qua reload của cùng tab
- `localStorage`: chỉ dùng khi thực sự muốn sống qua nhiều tab hoặc nhiều lần mở browser
- `partialize`: chỉ persist field cần thiết

### 3. Ghi state vào store trước khi navigate

Ở màn nguồn:

- set `activeEntityId`
- set `selectedEntity`
- set `contextId`
- `navigate("/target/clean-route")`

Không build URL kiểu:

```ts
navigate(`/review?cartId=${cartId}&customerId=${customerId}&franchiseId=${franchiseId}`);
```

### 4. Màn đích chỉ đọc từ store

Ở loader/hook của màn đích:

- đọc `activeEntityId`
- nếu có thì load detail
- nếu không có thì hiện empty state hoặc redirect về bước trước

Không parse `useSearchParams()` hoặc `useParams()` cho các `id` transient nữa.

### 5. Reset session đúng chỗ

Phải reset khi đổi root context của workflow, ví dụ:

- đổi franchise
- đổi customer
- hủy draft hiện tại
- checkout xong

Nhưng nếu chỉ quay lại bước trước trong cùng flow thì giữ session.

Pattern an toàn:

- `resetSession()` khi bắt đầu flow mới
- `preserveSession` khi back từ review về builder

### 6. Chỉ giữ “state workflow”, không giữ cả object lớn

Nên giữ:

- `id`
- `name`
- vài field UI cần hiển thị ngay

Không nên giữ:

- response API quá lớn
- list sản phẩm đầy đủ
- object lồng sâu khó invalidation

## Checklist áp dụng

- URL mới không còn `id` thừa
- Màn đích vẫn chạy đúng khi đi từ màn nguồn
- `F5` trong cùng tab có hành vi đúng với yêu cầu
- Đổi context cha thì session cũ bị clear
- Back về bước trước không mất state nếu flow cần giữ
- Không còn fallback đọc `query` cũ sau khi rollout xong

## Pitfalls hay gặp

- Reset session xong vô tình clear luôn `contextId` vừa set
- Persist quá nhiều field làm state cũ bám dai
- Dùng store cho trang detail thật, làm mất khả năng deep-link
- Vừa giữ `id` trong URL vừa giữ trong store, thành ra duplicated source of truth

## Cách quyết định nhanh

- Nếu URL là “định danh tài nguyên” thì giữ `id` trên route
- Nếu URL chỉ đang “chở state tạm” thì đưa vào store

## Reference implementation

Luồng POS admin hiện đang dùng pattern này ở:

- `src/modules/admin/order-management/stores/pos-session.store.ts`
- `src/modules/admin/order-management/hooks/use-pos-session.ts`
- `src/modules/admin/order-management/hooks/use-order-franchise-context.ts`
- `src/modules/admin/order-management/hooks/use-pos-builder-cart-lifecycle.ts`
- `src/modules/admin/order-management/hooks/use-pos-review-loader.ts`
- `src/modules/admin/order-management/hooks/use-order-pos-review-page.ts`
- `src/modules/admin/side-selection/hooks/use-franchise-selection.hook.ts`

## Output expectation khi áp dụng skill này

Khi refactor một màn tương tự, kết quả nên đạt:

- route đích sạch, không lộ `id` transient
- hook loader gọn hơn vì không parse query
- store là source of truth duy nhất cho workflow state
- reset/preserve flow rõ ràng, không bị state cũ bám sai màn
