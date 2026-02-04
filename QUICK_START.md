# 🚀 Quick Start Guide - Client Routing Architecture

## ✅ Đã hoàn thành

Tôi đã xây dựng xong kiến trúc client-side routing theo đúng yêu cầu của bạn:

### 1. ✅ ClientGuard (KHÔNG phải PrivateRoute)
- **File**: `src/routes/guard/ClientGuard.route.tsx`
- Kiểm tra đăng nhập
- Redirect về `/client/login` nếu chưa đăng nhập
- Lưu route hiện tại để redirect lại sau

### 2. ✅ ClientLayout (cho GUEST)
- **File**: `src/layouts/ClientLayout/`
- Header: Home, Menu, About, Contact, Login, Register
- **KHÔNG có**: Cart, Profile, Logout

### 3. ✅ HomeLayout (cho USER đã đăng nhập)
- **File**: `src/modules/client/home/layouts/HomeLayout.tsx`
- Header: Cart, Profile, Change Password, Logout, Avatar
- **Nằm trong folder home/** - khu vực private

### 4. ✅ Routing Configuration
```
Public Routes (Guest):
├── /                  → HomePage
├── /menu             → Menu Page
├── /about            → About Page
└── /contact          → Contact Page

Private Routes (Logged-in - ClientGuard):
├── /home             → Home Dashboard
├── /home/cart        → Cart Page
├── /home/profile     → Profile Page
├── /home/change-password → Change Password
└── /home/order-history   → Order History
```

---

## 🧪 Testing

### Test 1: Guest truy cập Public Route
```bash
npm run dev
# Mở http://localhost:5173/
# ✓ Header: Home, Menu, About, Contact, Login, Register
```

### Test 2: Guest truy cập Private Route (bị chặn)
```bash
# Truy cập http://localhost:5173/home/cart
# ✓ Tự động redirect về /client/login
# ✓ Hiển thị warning: "Vui lòng đăng nhập"
```

### Test 3: Login thành công
```bash
# Login với:
# Email: an.nguyen@test.com
# Password: 12345678
# ✓ Redirect về /home/cart (route đã lưu)
# ✓ Header: Cart, Profile, Logout, Avatar
```

---

## 📊 Route Table

| Route | Layout | Access | Guard |
|-------|--------|--------|-------|
| `/` | ClientLayout | Public | - |
| `/menu` | ClientLayout | Public | - |
| `/about` | ClientLayout | Public | - |
| `/contact` | ClientLayout | Public | - |
| `/client/login` | AuthLayout | Public | - |
| `/home` | HomeLayout | Private | ClientGuard |
| `/home/cart` | HomeLayout | Private | ClientGuard |
| `/home/profile` | HomeLayout | Private | ClientGuard |
| `/home/change-password` | HomeLayout | Private | ClientGuard |

---

## 📁 Files Changed

```
✅ Created:
├── src/routes/guard/ClientGuard.route.tsx
├── src/routes/client/HomePrivate.route.tsx
├── src/modules/client/home/layouts/HomeLayout.tsx
├── src/modules/client/home/components/HomeHeader.tsx
├── src/modules/client/home/components/HomeFooter.tsx
└── ROUTING_ARCHITECTURE.md (chi tiết)

✅ Modified:
├── src/layouts/ClientLayout/ClientLayout.tsx
├── src/layouts/ClientLayout/components/ClientHeader.tsx
├── src/layouts/ClientLayout/components/ClientFooter.tsx
├── src/routes/router.const.ts
├── src/routes/client/ClientPublic.route.tsx
├── src/routes/index.ts
├── src/App.tsx
└── src/modules/client/home/pages/HomePage.tsx
```

---

## 🎯 Key Points

1. **KHÔNG dùng PrivateRoute** → Dùng ClientGuard ✅
2. **KHÔNG dùng MainLayout** → Tách ClientLayout & HomeLayout ✅
3. **home/ là khu vực PRIVATE** → Tất cả route trong home/ đều bọc ClientGuard ✅
4. **Layout riêng biệt** → KHÔNG dùng if trong cùng 1 layout ✅

---

## 📚 Documentation

Xem chi tiết tại: **[ROUTING_ARCHITECTURE.md](./ROUTING_ARCHITECTURE.md)**

---

## 🚀 Next Steps

1. Run dev server: `npm run dev`
2. Test các route: /, /menu, /home/cart
3. Test login flow
4. Tạo các page thực tế trong home/

---

**Status**: ✅ COMPLETED  
**Date**: 2026-02-02
