# 🔐 Auth Flow Documentation

## 📋 Overview

Hệ thống authentication sử dụng **HttpOnly cookies** với dual-token strategy (access_token + refresh_token):

- **Access Token**: Có thời hạn ngắn (15-30 phút), dùng cho API requests
- **Refresh Token**: Có thời hạn dài (7-30 ngày), dùng để lấy access token mới
- **HttpOnly Cookies**: Tự động gửi kèm mọi request, không thể bị JS truy cập (bảo mật)

---

## 🏗️ Architecture Layers

### Layer 1: Axios Interceptor (`src/apis/axios.config.ts`)

**Trách vụ:** Auto-refresh token + logout khi session expire

**Key Features:**

- ✅ Queue-based refresh: Nếu nhiều requests nhận 401 → chỉ 1 refresh call
- ✅ Network error handling
- ✅ Clear Authorization header trước retry (tránh infinite loop)
- ✅ Auto logout + redirect when refresh token expired

### Layer 2: Auth Store (`src/modules/admin/auth-admin/stores/admin-auth.store.ts`)

**Trách vụ:** Quản lý auth state + hydrate session

**Key Features:**

- ✅ Zustand state management
- ✅ `setProfile()`: Set user info từ API
- ✅ `logout()`: Clear state + API call
- ✅ `hydrate()`: Check session still alive (on app init)

### Layer 3: App Component (`src/App.tsx`)

**Trách vụ:** Initialize hydrate + handle errors

**Key Features:**

- ✅ Call `adminHydrate()` on mount
- ✅ Show Loading screen while hydrating
- ✅ Fallback error handling nếu hydrate fail

---

## 🔄 Detailed Flow Scenarios

### Scenario 1️⃣: User Login (Lần đầu)

```
User Input Email/Password
    ↓
POST /api/auth { email, password }
    ↓
Backend:
  - Validate credentials ✅
  - Generate new access_token + refresh_token
  - Set HttpOnly cookies (auto by response header)
  - Return user profile
    ↓
Frontend - use-admin-login.hook.ts:
  1. await login(data) → POST /api/auth
  2. await getProfile() → GET /api/auth (check session)
  3. setProfile(profile) → zustand store
  4. success("Đăng nhập thành công!")
  5. navigate(/admin/select-franchise)
    ↓
✅ isLoggedIn = true
✅ User on dashboard
```

**Files involved:**

- `use-admin-login.hook.ts`: Orchestrate login flow
- `AdminLoginPage.tsx`: Login UI
- `auth.api.ts`: API calls

---

### Scenario 2️⃣: User Close Browser → Return (Refresh Token Still Valid)

```
Day 1 (14:00):
  User login → cookies set (access_token + refresh_token)

Day 2 (09:00):
  User open browser → refresh tokens still valid ✅
    ↓
App.tsx App Load:
  1. adminHydrate() called
  2. GET /auth with cookies
    ↓
Backend:
  - Check refresh_token cookie → still valid ✅
  - Generate new access_token (optional)
  - Return user profile
    ↓
Frontend - hydrate():
  1. const profile = await getProfile()
  2. setProfile(profile)
  3. isLoggedIn = true
  4. isLoading = false
    ↓
✅ Routes render
✅ User auto logged in (NO manual login needed!)
```

**Key Point:** User quay lại website **không cần login lại** vì refresh_token còn hợp lệ.

---

### Scenario 3️⃣: User Close Browser → Return (Refresh Token Expired)

```
Day 1 (14:00):
  User login → refresh_token issued (expire in 30 days)

Day 31 (09:00):
  User open browser → refresh_token EXPIRED ❌
    ↓
App.tsx App Load:
  1. adminHydrate() called
  2. GET /auth with cookies
    ↓
Backend:
  - Check refresh_token → EXPIRED ❌
  - Return 401 Unauthorized
    ↓
Frontend - Interceptor (axios.config.ts):
  1. Catch 401 + errorCode = "ACCESS_TOKEN_EXPIRED"
  2. Attempt to call POST /auth/refresh-token
  3. Backend return 401 (refresh_token expired)
  4. Catch refreshError → check URL
  5. URL includes '/auth/refresh-token' → LOGOUT scenario
  6. await useAdminAuthStore.getState().logout()
     - Try POST /auth/logout
     - Clear store: admin=null, roles=[], isLoggedIn=false
  7. window.location.href = '/admin/login'
  8. Throw HttpError(REFRESH_TOKEN_FAILED)
    ↓
Frontend - hydrate():
  1. getProfile() throws HttpError
  2. Catch error
  3. Check if error.code === "REFRESH_TOKEN_FAILED"
  4. Re-throw error
    ↓
Frontend - App.tsx:
  1. adminHydrate().catch(error)
  2. Check if error.code === "REFRESH_TOKEN_FAILED"
  3. window.location.href = '/admin/login' (double layer)
    ↓
✅ **DOUBLE LAYER PROTECTION:**
  - Layer 1: Interceptor redirect
  - Layer 2: App.tsx fallback redirect
    ↓
✅ User forced to login page
✅ Store cleared (isLoggedIn = false)
✅ No infinite loops, no stuck screens
```

**Key Point:** Automatic logout khi refresh_token expire (không bị stuck).

---

### Scenario 4️⃣: User on Dashboard + Access Token Expires (But Refresh Token Valid)

```
User making request:
POST /api/products/create
  ↓
Backend:
  - Check Authorization header (access_token) → EXPIRED ❌
  - Return 401 + errorCode="ACCESS_TOKEN_EXPIRED"
    ↓
Frontend - Interceptor:
  1. Catch 401 + ACCESS_TOKEN_EXPIRED
  2. Check _retry flag → not set, so proceed
  3. Set _retry = true (prevent infinite loop)
  4. Check isRefreshing:
     - If true: queue request + wait
     - If false: start refresh
    ↓
  5. Call POST /auth/refresh-token with cookies
     ↓
  6. Backend validate refresh_token → valid ✅
  7. Issue new access_token (via Set-Cookie)
  8. Return 200 OK
    ↓
  9. Interceptor processQueue(): resolve all waiting requests
  10. Clear Authorization header from originalRequest
      → Tránh sending old access_token
  11. Retry: POST /api/products/create
      → Cookies automatically send new access_token
    ↓
Backend:
  - Check new access_token → valid ✅
  - Return 200 + data
    ↓
✅ Request succeeded
✅ User doesn't notice anything
✅ No manual login required
```

**Key Points:**

- Access token refresh **transparent** to user
- Multiple requests automatically queued (efficient)
- Authorization header cleared before retry (prevent infinite loop)

---

### Scenario 5️⃣: User on Dashboard + Refresh Token Expires (Most Critical)

```
Situation:
  - access_token expired (normal)
  - refresh_token ALSO expired (rare but possible)
    ↓
User making request:
POST /api/orders/create
  ↓
Backend:
  - Check Authorization header → EXPIRED ❌
  - Return 401 + errorCode="ACCESS_TOKEN_EXPIRED"
    ↓
Frontend - Interceptor:
  1. Catch 401 + ACCESS_TOKEN_EXPIRED
  2. Try to refresh: POST /auth/refresh-token
  3. Backend check refresh_token → EXPIRED ❌
  4. Return 401
    ↓
  5. Interceptor catch refreshError
  6. Check if originalRequest.url.includes('/auth/refresh-token')
     → YES! This is the critical check ✅
  7. await useAdminAuthStore.getState().logout()
     - POST /auth/logout
     - Clear store
  8. window.location.href = '/admin/login'
  9. Throw HttpError(REFRESH_TOKEN_FAILED)
    ↓
  10. processQueue(refreshError) → reject all queued requests
    ↓
Frontend - UI:
  - Request fails with REFRESH_TOKEN_FAILED
  - Toast/Error notification shows
  - User redirected to login
    ↓
✅ User kicked out gracefully
✅ No infinite loops
✅ No stuck screens
```

**Critical Feature:** URL check on `/auth/refresh-token` prevents infinite loops!

---

## 🔑 Key Implementation Details

### 1. Authorization Header Management

**File:** `src/apis/axios.config.ts`

```typescript
// Before retry, clear old Authorization header
delete originalRequest.headers.Authorization;
return axiosClient(originalRequest);
```

**Why:**

- Access token is usually in Authorization header
- If we retry with old header → old token still invalid → 401 again
- Clear it → backend sends new token via Set-Cookie

---

### 2. Refresh Token Queue

**File:** `src/apis/axios.config.ts`

```typescript
let isRefreshing = false;
let refreshQueue = [];

// Multiple 401s → Queue mechanism
if (isRefreshing) {
  return new Promise((resolve, reject) => {
    refreshQueue.push({ resolve, reject });
  }).then(() => axiosClient(originalRequest));
}
```

**Why:**

- If 5 requests hit 401 at same time
- Without queue: 5 refresh calls (wasteful + server strain)
- With queue: 1 refresh call + 5 requests wait + 1 retry

---

### 3. The Critical URL Check

**File:** `src/apis/axios.config.ts` (Line 107-111)

```typescript
if (originalRequest.url?.includes("/auth/refresh-token")) {
  // Refresh token itself failed → logout immediately
  const { logout } = useAdminAuthStore.getState();
  await logout();
  window.location.href = "/admin/login";
  throw new HttpError(REFRESH_TOKEN_FAILED);
}
```

**Why:**

- Without this: If refresh endpoint fails → try again → infinite loop
- With this: Immediately break out + logout + redirect

---

### 4. Hydrate on App Load

**File:** `src/modules/admin/auth-admin/stores/admin-auth.store.ts`

```typescript
hydrate: async () => {
  set({ isLoading: true });
  try {
    const profile = await getProfile(); // GET /auth with cookies
    if (profile) {
      set({ admin, roles, activeContext, isLoggedIn: true });
    }
  } catch (error) {
    if (error.code === "REFRESH_TOKEN_FAILED") {
      throw error; // Propagate to App.tsx
    }
    // Other errors: log but don't throw (user just not logged in)
    console.error("[hydrate] Error:", error);
  } finally {
    set({ isLoading: false });
  }
};
```

**Why:**

- App start must check if user already logged in (from cookies)
- If yes: auto-restore session (no manual login)
- If no/expired: redirect to login

---

### 5. getProfile() Enhancement

**File:** `src/apis/endpoints/auth.api.ts`

```typescript
export const getProfile = (): Promise<ProfileResponse> => {
  return httpClient
    .get<ProfileResponse>({
      url: "/auth",
    })
    .then((profile) => {
      if (!profile) {
        throw new HttpError({
          status: 401,
          message: "Not authenticated",
          code: "NOT_AUTHENTICATED",
        });
      }
      return profile;
    });
};
```

**Why:**

- Never return null → always either ProfileResponse or throw
- Prevents bugs where null profile crashes downstream code
- Explicit error handling

---

## 🔒 Security Considerations

### ✅ What's Protected

| Scenario             | Protection                            |
| -------------------- | ------------------------------------- |
| **XSS Attack**       | HttpOnly cookies prevent JS access ✅ |
| **CSRF Attack**      | SameSite cookie flag (backend) ✅     |
| **Expired Token**    | Auto-refresh or auto-logout ✅        |
| **Infinite Loops**   | URL check + \_retry flag ✅           |
| **Session Fixation** | Cookies rotate on each refresh ✅     |

### ⚠️ Assumptions

1. **Backend must:**
   - Set HttpOnly + Secure + SameSite cookies
   - Rotate tokens on refresh
   - Validate refresh_token before issuing new access_token
   - Return 401 on any auth failure

2. **HTTPS Required:**
   - Secure cookies only transmitted over HTTPS
   - Otherwise: man-in-the-middle attacks possible

---

## 📊 State Diagram

```
┌─────────────────────────────────────────────────────┐
│                   App Lifecycle                      │
└─────────────────────────────────────────────────────┘
         │
         ↓
    App.tsx mounts
         │
         ├─→ adminHydrate() called
         │
         ├─→ isLoading = true → show <Loading />
         │
         ├─→ getProfile() → GET /auth with cookies
         │
    ┌────┴──────────────────┬──────────────────┐
    │                       │                  │
    ↓                       ↓                  ↓
Profile ✅             401 (expired)      Network error
    │                       │                  │
    ↓                       ↓                  ↓
setProfile()          Refresh token       Log error
isLoggedIn=true       check failed        isLoggedIn=false
isLoading=false            │                  │
    │                       ↓                  ↓
    ├──→ logout()       App.tsx .catch()   Router: /login
    │    redirect:login │                  (ProtectedRoute
    │                   ↓                   redirects)
    │              /admin/login
    │
    ├──→ isLoading=false
    │
    ├──→ Routes render
    │
    ├──→ <ProtectedRoute> checks isLoggedIn
    │
    └──→ Show dashboard / login page
```

---

## 🛠️ Testing Checklist

- [ ] **Test 1:** Login → refresh page → user still logged in (auto-restore)
- [ ] **Test 2:** Login → wait for access_token to expire → make API call → request succeeds (auto-refresh)
- [ ] **Test 3:** Manually delete refresh_token cookie → refresh page → redirect to login
- [ ] **Test 4:** Multiple API requests at same time → only 1 refresh call (queue mechanism)
- [ ] **Test 5:** Close browser → come back 1 month later (refresh_token expired) → redirect to login
- [ ] **Test 6:** Logout → cookies cleared → refresh page → login page shows
- [ ] **Test 7:** Network offline → try API call → "Network error" message

---

## 📁 Related Files

```
src/
├── apis/
│   ├── axios.config.ts              ← Interceptor (Layer 1)
│   ├── httpClient.ts                ← Wrapper
│   └── endpoints/
│       └── auth.api.ts              ← getProfile() enhancement
├── App.tsx                           ← Error handling (Layer 3)
└── modules/admin/auth-admin/
    ├── stores/
    │   └── admin-auth.store.ts      ← Hydrate + state (Layer 2)
    ├── hooks/
    │   └── use-admin-login.hook.ts  ← Login orchestration
    └── pages/
        └── AdminLoginPage.tsx        ← Login UI
```

---

## 📝 Version History

| Date       | Change                                  | Status      |
| ---------- | --------------------------------------- | ----------- |
| 2025-03-01 | Initial implementation                  | ✅ Complete |
| 2025-03-01 | Fix hydrate() error logging             | ✅ Complete |
| 2025-03-01 | Clear Authorization header before retry | ✅ Complete |
| 2025-03-01 | getProfile() null handling              | ✅ Complete |

---

**Last Updated:** March 1, 2025  
**Status:** ✅ Production Ready
