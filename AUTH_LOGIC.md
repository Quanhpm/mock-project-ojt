# AUTH LOGIC – Admin Authentication Flow

> Tài liệu mô tả chi tiết luồng xác thực phía Admin.
> Sử dụng **HttpOnly Cookie** – client không lưu/đọc token.

---

## 📁 File Map

| #   | File                                                                     | Vai trò                                                                             |
| --- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| 1   | `src/apis/axios.config.ts`                                               | Axios instance, `withCredentials: true`, response interceptor (refresh token queue) |
| 2   | `src/apis/endpoints/auth.api.ts`                                         | Hàm gọi API: `login`, `getProfile`, `logout`, `switchContext`                       |
| 3   | `src/modules/admin/auth-admin/stores/admin-auth.store.ts`                | Zustand store – state admin (không persist, không localStorage)                     |
| 4   | `src/modules/admin/auth-admin/hooks/use-admin-login.hook.ts`             | Hook xử lý logic đăng nhập                                                          |
| 5   | `src/modules/admin/auth-admin/pages/AdminLoginPage.tsx`                  | UI trang đăng nhập                                                                  |
| 6   | `src/modules/admin/side-selection/hooks/use-franchise-selection.hook.ts` | Hook chọn franchise sau khi login                                                   |
| 7   | `src/routes/guard/AdminGuard.route.tsx`                                  | Guard bảo vệ tất cả route `/admin/*`                                                |
| 8   | `src/routes/ProtectedRoute.tsx`                                          | Kiểm tra permission từng module con                                                 |
| 9   | `src/config/permissions.config.ts`                                       | Bảng quyền: role → modules[]                                                        |
| 10  | `src/layouts/AdminLayout/components/sidebar.tsx`                         | Sidebar + nút Logout                                                                |
| 11  | `src/App.tsx`                                                            | Root component – gọi `hydrate()` khi mount                                          |

---

## 1️⃣ Flow: Đăng nhập (Login)

### Mô tả

User nhập email + password → gọi API login → backend set cookie → lấy profile → lưu store → chuyển trang.

### Chi tiết

```
AdminLoginPage.tsx
  └─ form submit → handleLogin(data)
        │
        ▼
use-admin-login.hook.ts
  │
  ├── Bước 1: authApi.login({ email, password })
  │     POST  /api/auth
  │     → Backend set HttpOnly Cookie (access_token + refresh_token)
  │     → Client KHÔNG nhận token, KHÔNG lưu gì
  │
  ├── Bước 2: authApi.getProfile()
  │     GET  /api/auth       (cookie tự gửi kèm)
  │     → Response: { user, roles[], active_context }
  │
  ├── Bước 3: store.setProfile(profileData)
  │     → Zustand lưu: admin, roles, activeContext
  │     → isLoggedIn = true
  │
  ├── Bước 4: toast("Đăng nhập thành công")
  │
  └── Bước 5: navigate("/admin/select-franchise")
        → Luôn vào trang chọn franchise, KHÔNG auto-redirect
```

### Xử lý lỗi

| Loại lỗi                 | Hiển thị                              |
| ------------------------ | ------------------------------------- |
| `HttpError` (server trả) | `error.message` từ server             |
| Lỗi khác (network, v.v.) | "Email hoặc mật khẩu không chính xác" |

---

## 2️⃣ Flow: Chọn Franchise (Select Franchise)

### Mô tả

Sau khi login, user phải chọn 1 franchise để làm việc. Data lấy từ store (không gọi API lại).

### Chi tiết

```
/admin/select-franchise
        │
        ▼
use-franchise-selection.hook.ts
  │
  ├── Lấy từ Zustand store (KHÔNG gọi API):
  │     • admin  = useAdminAuthStore(s => s.admin)
  │     • roles  = useAdminAuthStore(s => s.roles)
  │     • activeContext = useAdminAuthStore(s => s.activeContext)
  │
  ├── Tạo danh sách franchise:
  │     franchises = roles.map(r => ({
  │       franchise_id, franchise_name, role
  │     }))
  │
  └── User click chọn franchise
        │
        ▼
handleSelectFranchise(franchise_id)
  │
  ├── Bước 1: authApi.switchContext({ franchise_id })
  │     POST  /api/auth/switch-context
  │     → Backend cập nhật cookie/session
  │
  ├── Bước 2: authApi.getProfile()
  │     GET  /api/auth
  │     → Profile MỚI với active_context đã cập nhật
  │
  ├── Bước 3: store.setProfile(newProfile)
  │     → getRoleCode() giờ trả role của franchise được chọn
  │
  └── Bước 4: navigate("/admin/dashboard")   ← đường dẫn TUYỆT ĐỐI
```

---

## 3️⃣ Flow: Guard & Permission Check

### Mô tả

Mỗi khi user truy cập `/admin/xxx`, hệ thống kiểm tra 2 lớp: đã đăng nhập chưa (Guard) → có quyền vào module không (ProtectedRoute).

### Chi tiết

```
User truy cập /admin/xxx
        │
        ▼
┌─ LỚP 1: AdminGuard.route.tsx ────────────────────────┐
│                                                        │
│  store = useAdminAuthStore.getState()                  │
│  roleCode = getRoleCode(store)                         │
│    → ưu tiên: activeContext?.role                      │
│    → fallback: roles[0]?.role                          │
│    → cuối cùng: ""                                     │
│                                                        │
│  if (!store.admin || !roleCode)                        │
│    → ❌ Redirect → /admin/login                        │
│                                                        │
│  else                                                  │
│    → ✅ Render <Outlet />                               │
└────────────────────────────────────────────────────────┘
        │
        ▼
┌─ LỚP 2: ProtectedRoute.tsx ──────────────────────────┐
│                                                        │
│  roleCode = getRoleCode(store)                         │
│  hasPermission(roleCode, requiredModule) ?             │
│                                                        │
│  if KHÔNG có quyền                                     │
│    → ❌ Redirect → /admin/dashboard                    │
│                                                        │
│  else                                                  │
│    → ✅ Render children                                 │
└────────────────────────────────────────────────────────┘
```

### Bảng quyền (`permissions.config.ts`)

| Role          | Modules được phép                                                           |
| ------------- | --------------------------------------------------------------------------- |
| **ADMIN**     | **Tất cả**                                                                  |
| **MANAGER**   | dashboard, products, inventory, customers, orders, shifts, select-franchise |
| **STAFF**     | dashboard, customers, orders, select-franchise                              |
| **WAREHOUSE** | dashboard, inventory, products, select-franchise                            |

---

## 4️⃣ Flow: F5 / Reload trang

### Mô tả

Khi user refresh trang hoặc mở lại tab, store bị mất (Zustand không persist). App phải gọi `hydrate()` để khôi phục session từ cookie.

### Chi tiết

```
User nhấn F5 / mở lại tab
        │
        ▼
App.tsx – useEffect([]) on mount
  │
  ├── Ban đầu: isLoading = true (giá trị khởi tạo)
  │     → Render <Loading /> thay vì routes
  │     → Guard chưa chạy → KHÔNG redirect sai
  │
  ├── Gọi adminStore.hydrate()
  │     → authApi.getProfile()   (GET /api/auth)
  │     → Cookie tự động gửi kèm
  │
  │   ┌─ Thành công ─────────────────────────────┐
  │   │  store.setProfile(data)                   │
  │   │  isLoggedIn = true                        │
  │   │  isLoading  = false                       │
  │   │  → Routes render                          │
  │   │  → Guard thấy admin có → cho qua ✅       │
  │   │  → User ở lại trang hiện tại              │
  │   └───────────────────────────────────────────┘
  │
  │   ┌─ Thất bại (cookie hết hạn / không có) ───┐
  │   │  admin = null                             │
  │   │  isLoggedIn = false                       │
  │   │  isLoading  = false                       │
  │   │  → Routes render                          │
  │   │  → Guard thấy null → redirect login ❌    │
  │   └───────────────────────────────────────────┘
```

### Tại sao `isLoading` khởi tạo = `true`?

> Nếu `isLoading = false` ban đầu → routes render ngay lập tức → Guard kiểm tra khi `admin` còn `null` → redirect về login **SAI**.
>
> Phải là `true` → hiển thị Loading → chờ `hydrate()` xong → mới render routes → Guard chạy đúng.

---

## 5️⃣ Flow: Đăng xuất (Logout)

### Mô tả

Gọi API xóa cookie → reset store → redirect về login.

### Chi tiết

```
User click nút Logout
        │
        ▼
store.logout()              (async – admin-auth.store.ts)
  │
  ├── Bước 1: authApi.logout()
  │     POST  /api/auth/logout
  │     → Backend xóa HttpOnly Cookie
  │
  ├── Bước 2: Reset Zustand state
  │     admin         = null
  │     roles         = []
  │     activeContext  = null
  │     isLoggedIn    = false
  │
  └── Bước 3: (từ UI) navigate("/admin/login")
```

### Code ở sidebar.tsx

```ts
const handleLogout = async () => {
  await logout(); // Bước 1 + 2: gọi API + reset store
  navigate("/admin/login"); // Bước 3: redirect
};
```

---

## 6️⃣ Flow: Auto Refresh Token (Interceptor)

### Mô tả

Khi access_token hết hạn, interceptor tự động gọi refresh. Nhiều request cùng bị 401 → chỉ refresh 1 lần, còn lại xếp hàng chờ.

### Chi tiết

```
Bất kỳ request nào → response 401
        │
        ▼
axios.config.ts – Response Interceptor
  │
  ├── Check: error.response.data.error === "ACCESS_TOKEN_EXPIRED" ?
  │
  │   ┌─ YES (token hết hạn) ────────────────────────────────────┐
  │   │                                                           │
  │   │  isRefreshing === false ?                                 │
  │   │                                                           │
  │   │  ┌─ YES (request ĐẦU TIÊN bị 401) ───────────────────┐  │
  │   │  │  isRefreshing = true                                │  │
  │   │  │  POST /api/auth/refresh  (cookie cũ gửi kèm)       │  │
  │   │  │                                                     │  │
  │   │  │  ✅ Refresh OK:                                     │  │
  │   │  │    → Backend set cookie MỚI                         │  │
  │   │  │    → Resolve tất cả request trong queue             │  │
  │   │  │    → Retry request gốc                              │  │
  │   │  │                                                     │  │
  │   │  │  ❌ Refresh FAIL:                                   │  │
  │   │  │    → Reject tất cả request trong queue              │  │
  │   │  │    → Throw error → component tự xử lý              │  │
  │   │  └─────────────────────────────────────────────────────┘  │
  │   │                                                           │
  │   │  ┌─ NO (đang refresh, request SAU) ────────────────────┐  │
  │   │  │  Đưa vào queue (Promise)                            │  │
  │   │  │  Chờ refresh xong → tự động retry                   │  │
  │   │  └─────────────────────────────────────────────────────┘  │
  │   └───────────────────────────────────────────────────────────┘
  │
  │   ┌─ NO (không phải token expired) ───────────────────────────┐
  │   │  Throw HttpError bình thường                              │
  │   └───────────────────────────────────────────────────────────┘
```

### Queue Mechanism

```
Request A ──→ 401 ──→ Bắt đầu refresh ──→ Chờ...
Request B ──→ 401 ──→ Vào queue         ──→ Chờ...
Request C ──→ 401 ──→ Vào queue         ──→ Chờ...
                                              │
                                    Refresh xong ✅
                                              │
Request A ──→ Retry với cookie mới ──→ ✅
Request B ──→ Retry với cookie mới ──→ ✅
Request C ──→ Retry với cookie mới ──→ ✅
```

---

## 🔑 7 Nguyên tắc quan trọng

| #   | Nguyên tắc                            | Chi tiết                                         |
| --- | ------------------------------------- | ------------------------------------------------ |
| 1   | **Không lưu token ở client**          | HttpOnly Cookie do backend quản lý hoàn toàn     |
| 2   | **`withCredentials: true`**           | Mọi Axios request tự gửi cookie đi               |
| 3   | **Không có request interceptor**      | Không cần gắn `Authorization` header             |
| 4   | **Zustand không persist**             | State chỉ trong memory, reload → `hydrate()` lại |
| 5   | **`isLoading` khởi tạo = `true`**     | Ngăn Guard chạy trước khi hydrate xong           |
| 6   | **`getRoleCode()` có fallback**       | `activeContext.role` → `roles[0].role` → `""`    |
| 7   | **Navigate luôn dùng path tuyệt đối** | `/admin/dashboard`, không dùng `"dashboard"`     |

---

## 📋 Tóm tắt các API Endpoint

| Method | Endpoint                   | Mục đích            | Cookie                       |
| ------ | -------------------------- | ------------------- | ---------------------------- |
| `POST` | `/api/auth`                | Đăng nhập           | Backend **set** cookie       |
| `GET`  | `/api/auth`                | Lấy profile + roles | Gửi cookie                   |
| `POST` | `/api/auth/logout`         | Đăng xuất           | Backend **xóa** cookie       |
| `POST` | `/api/auth/switch-context` | Chuyển franchise    | Gửi cookie, backend cập nhật |
| `POST` | `/api/auth/refresh`        | Refresh token       | Cookie cũ → cookie mới       |
