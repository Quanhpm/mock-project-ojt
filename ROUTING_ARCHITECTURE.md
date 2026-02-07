# 📚 Kiến trúc Client-side Routing với ClientGuard

## 🏗️ Cấu trúc Routing

```
App.tsx
├── Admin Routes (không liên quan client)
│
├── CLIENT AUTH ROUTES (/client/login, /client/register)
│   └── Layout: AuthClientLayout
│
├── CLIENT PUBLIC ROUTES (Guest có thể truy cập)
│   ├── / (Homepage)
│   ├── /menu
│   ├── /about
│   └── /contact
│   └── Layout: ClientLayout (header: Home, Menu, About, Contact, Login, Register)
│
└── HOME PRIVATE ROUTES (Cần đăng nhập - ClientGuard)
    ├── /home (Dashboard)
    ├── /home/cart
    ├── /home/profile
    ├── /home/change-password
    ├── /home/order-history
    └── /home/checkout
    └── Layout: HomeLayout (header: Cart, Profile, Change Password, Logout)
```

---

## 🔒 ClientGuard - Bảo vệ Private Routes

**File**: `src/routes/guard/ClientGuard.route.tsx`

**Nhiệm vụ**:
1. Kiểm tra user đã đăng nhập chưa
2. Nếu CHƯA → redirect về `/client/login` và lưu route hiện tại
3. Nếu ĐÃ → cho phép render layout + page con

**Logic**:
```typescript
if (!isInitialized) return <Loading />;
if (!isLoggedIn) return <Navigate to="/client/login" state={{ from: location.pathname }} />;
return <Outlet />; // Render child routes
```

---

## 🎨 Layouts

### 1. ClientLayout (cho GUEST - chưa đăng nhập)

**File**: `src/layouts/ClientLayout/ClientLayout.tsx`

**Header**: Home, Menu, About, Contact, Login, Register  
**Footer**: Thông tin cơ bản  
**Sử dụng cho**: /, /menu, /about, /contact

**Không có**: Cart, Profile, Logout

---

### 2. HomeLayout (cho USER đã đăng nhập)

**File**: `src/modules/client/home/layouts/HomeLayout.tsx`

**Header**: Cart, Profile, Change Password, Logout, Avatar  
**Footer**: Thêm links cho private pages  
**Sử dụng cho**: /home, /home/cart, /home/profile, /home/change-password

**Đặc biệt**: Nằm trong folder `home/` - khu vực private

---

## 🛣️ Routes Configuration

### Public Routes (Guest)
```typescript
// src/routes/client/ClientPublic.route.tsx
export const ClientPublicRoutes = (
  <Route element={<ClientLayout />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/menu" element={<MenuPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/contact" element={<ContactPage />} />
  </Route>
);
```

### Private Routes (Logged-in User)
```typescript
// src/routes/client/HomePrivate.route.tsx
export const HomePrivateRoutes = (
  <Route element={<ClientGuard />}>  {/* Bảo vệ */}
    <Route element={<HomeLayout />}>
      <Route path="/home" element={<HomePrivatePage />} />
      <Route path="/home/cart" element={<CartPage />} />
      <Route path="/home/profile" element={<ProfilePage />} />
      <Route path="/home/change-password" element={<ChangePasswordPage />} />
    </Route>
  </Route>
);
```

---

## 🔄 Luồng hoạt động

### Scenario 1: Guest truy cập Public Route

```
Guest → "/" 
→ Render ClientLayout 
→ Header: Home, Menu, About, Contact, Login, Register
→ HomePage
```

### Scenario 2: Guest truy cập Private Route

```
Guest → "/home/cart"
→ ClientGuard kiểm tra → Chưa đăng nhập
→ Redirect: "/client/login" (state: { from: "/home/cart" })
→ Hiển thị warning: "⚠️ Vui lòng đăng nhập để tiếp tục"
```

### Scenario 3: Guest đăng nhập thành công

```
Guest → Login thành công
→ Token lưu vào localStorage
→ Redirect về route đã lưu: "/home/cart"
→ ClientGuard kiểm tra → Đã đăng nhập ✓
→ Render HomeLayout
→ Header: Cart, Profile, Change Password, Logout
→ CartPage
```

### Scenario 4: User đã đăng nhập truy cập Public Route

```
Logged-in User → "/"
→ Render ClientLayout (vẫn là layout public)
→ HomePage
→ Nhưng header có thêm avatar, cart (do state isLoggedIn)
```

---

## 📂 Cấu trúc folder

```
src/
├── layouts/
│   ├── ClientLayout/           # Layout cho GUEST
│   │   ├── ClientLayout.tsx
│   │   └── components/
│   │       ├── ClientHeader.tsx  # Header: Login, Register
│   │       └── ClientFooter.tsx
│   │
│   └── AuthClientLayout/       # Layout cho Login/Register page
│
├── modules/
│   └── client/
│       └── home/               # Khu vực PRIVATE
│           ├── layouts/
│           │   └── HomeLayout.tsx    # Layout sau khi đăng nhập
│           ├── components/
│           │   ├── HomeHeader.tsx    # Header: Cart, Profile, Logout
│           │   └── HomeFooter.tsx
│           └── pages/
│               └── HomePage.tsx
│
└── routes/
    ├── guard/
    │   └── ClientGuard.route.tsx    # Bảo vệ private routes
    ├── client/
    │   ├── ClientPublic.route.tsx   # Public routes
    │   ├── ClientAuth.route.tsx     # Auth routes
    │   └── HomePrivate.route.tsx    # Private routes (NEW)
    └── router.const.ts
```

---

## 🎯 Best Practices

### 1. Tách biệt Layout rõ ràng
- ❌ KHÔNG dùng `if (isLoggedIn)` trong cùng 1 layout
- ✅ Tạo 2 layout riêng: ClientLayout & HomeLayout

### 2. Guard Protection
- ❌ KHÔNG dùng PrivateRoute
- ✅ Dùng ClientGuard với logic rõ ràng

### 3. Folder Structure
- home/ là khu vực PRIVATE
- Tất cả route trong home/ đều được bọc bởi ClientGuard
- Guest KHÔNG BAO GIỜ truy cập trực tiếp được home/

### 4. Redirect after Login
- Lưu route gốc trong `location.state`
- Sau login → redirect về route đã lưu
- UX tốt hơn, user không bị mất맥락

---

## 🚀 Sử dụng

### Test Public Routes (Guest)
1. Mở `http://localhost:5173/`
2. Header hiển thị: Login, Register
3. Click vào các link: Menu, About, Contact

### Test Private Routes Protection
1. Truy cập `http://localhost:5173/home/cart` (chưa đăng nhập)
2. Tự động redirect về `/client/login`
3. Hiển thị warning: "Vui lòng đăng nhập để tiếp tục"

### Test Login Flow
1. Login với:
   - Email: `an.nguyen@test.com`
   - Password: `12345678`
2. Redirect về `/home/cart` (route đã lưu)
3. Header hiển thị: Cart, Profile, Logout, Avatar

### Test Logged-in User
1. Sau khi login, truy cập `/home`
2. Header: Cart, Profile, Change Password, Logout
3. Truy cập `/` → vẫn hiển thị public homepage

---

## 📊 Route Table

| Route                    | Layout        | Access      | Guard         |
|--------------------------|---------------|-------------|---------------|
| `/`                      | ClientLayout  | Public      | None          |
| `/menu`                  | ClientLayout  | Public      | None          |
| `/about`                 | ClientLayout  | Public      | None          |
| `/contact`               | ClientLayout  | Public      | None          |
| `/client/login`          | AuthLayout    | Public      | None          |
| `/client/register`       | AuthLayout    | Public      | None          |
| `/home`                  | HomeLayout    | Private     | ClientGuard   |
| `/home/cart`             | HomeLayout    | Private     | ClientGuard   |
| `/home/profile`          | HomeLayout    | Private     | ClientGuard   |
| `/home/change-password`  | HomeLayout    | Private     | ClientGuard   |
| `/home/order-history`    | HomeLayout    | Private     | ClientGuard   |

---

## ✅ Đã hoàn thành

- [x] Tạo ClientGuard component
- [x] Sửa ClientLayout thành layout cho GUEST
- [x] Tạo HomeLayout cho user đã đăng nhập
- [x] Cập nhật routing configuration
- [x] Cập nhật router constants
- [x] Test redirect sau login
- [x] Tách biệt public/private routes

---

## 🔧 Mở rộng trong tương lai

1. **Role-based Access Control**: Thêm AdminGuard, ManagerGuard
2. **Permission System**: Kiểm tra quyền chi tiết hơn
3. **Route Middleware**: Thêm logger, analytics
4. **Lazy Loading**: Tối ưu performance
5. **Error Boundaries**: Xử lý lỗi tốt hơn

---

**Tác giả**: Senior Frontend Developer  
**Ngày tạo**: 2026-02-02
