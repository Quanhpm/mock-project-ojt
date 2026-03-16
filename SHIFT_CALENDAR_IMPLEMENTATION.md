# 📅 Shift Calendar API Integration - Implementation Summary

## ✅ Completed: Chiến lược B - 2 API Calls

### Overview

Calendar hiển thị phân công ca làm bằng cách gọi 2 API search:

1. **`searchShiftAssignments()`** - Lấy danh sách phân công
2. **`searchUsers()`** - Lấy thông tin nhân viên (avatar, name)

---

## 📝 Thay đổi thực hiện

### 1. **Update `shift.api.ts`**

**Cập nhật type `ShiftAssignmentItem` để match API response:**

```typescript
export interface ShiftAssignmentItem {
  id?: string;
  user_id: string;
  user_name?: string; // ✅ Tên nhân viên
  shift_id: string;
  start_time?: string; // ✅ Từ shift (mới thêm)
  end_time?: string; // ✅ Từ shift (mới thêm)
  work_date: string; // YYYY-MM-DD format
  status: "ASSIGNED" | "COMPLETED" | "ABSENT"; // ✅ Cập nhật status values
  note?: string;
  assigned_by?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}
```

**Cập nhật `SearchShiftAssignmentsRequest` để support franchise filter:**

```typescript
export interface SearchShiftAssignmentsRequest {
  searchCondition: {
    shift_id?: string;
    user_id?: string;
    work_date?: string;
    assigned_by?: string;
    status?: string;
    franchise_id?: string; // ✅ Thêm franchise filter
    is_deleted?: boolean;
  };
  pageInfo: {
    pageNum: number;
    pageSize: number;
  };
}
```

---

### 2. **Refactor `useShiftCalendar.hook.ts`**

**Luồng mới:**

```
┌─────────────────────────────────────────────────────────────┐
│ useShiftCalendar Hook (Strategy B - 2 API Calls)           │
└─────────────────────────────────────────────────────────────┘
          │
          ├─ State Management:
          │  ├─ [assignmentRawData] - Raw API response từ searchShiftAssignments
          │  ├─ [usersMap] - Map<userId, UserItem> từ searchUsers
          │  └─ [monthDate] - Month hiện tại
          │
          ├─ useEffect (Dependency: filters.franchiseFilter):
          │  ├─ 1️⃣ Call searchShiftAssignments({
          │  │     searchCondition: { is_deleted: false, franchise_id },
          │  │     pageInfo: { pageNum: 1, pageSize: 1000 }
          │  │   })
          │  │   → Store vào assignmentRawData
          │  │
          │  └─ 2️⃣ Call searchUsers({
          │      searchCondition: { is_deleted: false },
          │      pageInfo: { pageNum: 1, pageSize: 1000 }
          │     })
          │     → Build Map<userId, user>
          │     → Store vào usersMap
          │
          ├─ useMemo (Transform):
          │  └─ assignmentsView = assignmentRawData.map(assign => {
          │      shift = shiftsMap.get(assign.shift_id)  // từ mockdata
          │      user = usersMap.get(assign.user_id)      // từ API
          │      return {
          │        id, workDate, status,
          │        shiftName: shift.name,
          │        startTime: assign.start_time || shift.start_time,
          │        endTime: assign.end_time || shift.end_time,
          │        staffName: assign.user_name || user?.name,
          │        staffAvatar: user?.avatar_url,
          │        franchiseName: shift.franchise_id → lookup franchises
          │      }
          │    })
          │
          ├─ useMemo (Filter):
          │  └─ filteredAssignments = assignmentsView.filter({
          │      searchTerm, staffFilter, statusFilter
          │    })  // franchise filter applied ở API level
          │
          ├─ useMemo (Group by date):
          │  └─ assignmentByDate = {
          │      "2026-04-01": [assign1, assign2],
          │      "2026-04-02": [assign3],
          │      ...
          │    }
          │
          └─ useMemo (Build calendar):
             └─ calendarDays = [
                  { date, isCurrentMonth, isToday, assignments },
                  ...
                ]  // 35 ngày
```

**Key Changes:**

```typescript
// ✅ NEW: Load từ API + cache users
useEffect(() => {
  const loadData = async () => {
    // 1. Search assignments by franchise
    const assignResponse = await shiftApi.searchShiftAssignments({
      searchCondition: {
        is_deleted: false,
        franchise_id: filters.franchiseFilter !== 'all' ? filters.franchiseFilter : undefined,
      },
      pageInfo: { pageNum: 1, pageSize: 1000 },
    })

    // 2. Search all users for avatar mapping
    const usersResponse = await searchUsers({
      searchCondition: { is_deleted: false },
      pageInfo: { pageNum: 1, pageSize: 1000 },
    })
  }
}, [filters.franchiseFilter])  // ✅ Re-fetch khi franchise thay đổi

// ✅ NEW: Transform raw data + lookup shifts từ mockdata
const assignmentsView = useMemo(() => {
  return assignmentRawData.map((assignment) => {
    const shift = shiftsMap.get(assignment.shift_id)
    const user = usersMap.get(assignment.user_id)

    return {
      // ... mapped fields
      startTime: assignment.start_time || shift.start_time,  // Fallback to shift
      endTime: assignment.end_time || shift.end_time,
      staffAvatar: user?.avatar_url || '',  // Từ usersMap
    }
  })
}, [assignmentRawData, usersMap, shiftsMap])

// ✅ UPDATED: Filter logic (franchise filter applied at API level)
const filteredAssignments = useMemo(() => {
  return assignmentsView.filter((assignment) => {
    const matchesSearch = ...
    const matchesStaff = ...
    const matchesStatus = ...
    // ❌ NO franchise filter here (already filtered by API)
    return matchesSearch && matchesStaff && matchesStatus
  })
}, [assignmentsView, filters])
```

---

## 🔄 Data Flow Diagram

```
User opens ShiftManagement
    ↓
filters.franchiseFilter = "franchise_123" (hoặc "all")
    ↓
useShiftCalendar() hook triggers useEffect
    ↓
┌─────────────────────────┐
│ API Call 1: Search      │
│ Assignments             │
├─────────────────────────┤
│ POST /shifts/search     │
│ franchise_id: "123"     │
│ is_deleted: false       │
└─────────────────────────┘
    ↓ response.data
[ShiftAssignmentItem[], ShiftAssignmentItem[], ...]
    ↓
┌─────────────────────────┐
│ API Call 2: Search      │
│ Users                   │
├─────────────────────────┤
│ POST /users/search      │
│ is_deleted: false       │
└─────────────────────────┘
    ↓ response.data
[UserItem[], UserItem[], ...]
    ↓ Cache in usersMap
    ↓
useMemo: Transform + Merge
    ├─ Loop assignments
    ├─ shiftsMap.get(shift_id) from mockdata
    ├─ usersMap.get(user_id) from API
    └─ Return ShiftAssignmentView[]
    ↓
useMemo: Group by work_date
    └─ assignmentByDate = { "2026-04-01": [...] }
    ↓
useMemo: Build calendar (35 days)
    ├─ For each day: push { date, isCurrentMonth, isToday, assignments }
    └─ Return calendarDays[]
    ↓
<ShiftCalendar calendarDays={calendarDays} />
    ├─ Display 35 ngày
    ├─ Show 3 assignments per day (+ "X more")
    ↓
User click ngày
    ↓
selectedAssignments = assignmentByDate[selectedDate]
    ↓
<ShiftDayPanel assignments={selectedAssignments} />
    └─ Show full details cho ngày đó
```

---

## 💾 Data Transformation Example

**API Response 1: searchShiftAssignments()**

```json
{
  "data": [
    {
      "id": "69b3f2727b4d0baec79a5064",
      "shift_id": "69b3f0097b4d0baec79a502b",
      "user_id": "69b3f1ca7b4d0baec79a5044",
      "user_name": "Quoc Anh",
      "start_time": "18:00",
      "end_time": "22:00",
      "work_date": "2026-04-01",
      "status": "ASSIGNED"
    }
  ]
}
```

**API Response 2: searchUsers()**

```json
{
  "data": [
    {
      "id": "69b3f1ca7b4d0baec79a5044",
      "name": "Quoc Anh",
      "avatar_url": "https://example.com/avatar.jpg"
    }
  ]
}
```

**Mockdata: shifts**

```typescript
shifts = [
  {
    id: 1,
    franchise_id: 5,
    name: "Ca chiều",
    start_time: "18:00",
    end_time: "22:00",
    is_deleted: false,
  },
];
```

**Mockdata: franchises**

```typescript
franchises = [{ id: 5, name: "Quán A" }];
```

**Output: ShiftAssignmentView**

```typescript
{
  id: "69b3f2727b4d0baec79a5064",
  workDate: "2026-04-01",
  status: "ASSIGNED",
  shiftId: "69b3f0097b4d0baec79a502b",
  shiftName: "Ca chiều",              // ✅ Từ shift mockdata
  startTime: "18:00",                 // ✅ Từ API
  endTime: "22:00",                   // ✅ Từ API
  staffId: "69b3f1ca7b4d0baec79a5044",
  staffName: "Quoc Anh",              // ✅ Từ API
  staffAvatar: "https://...",         // ✅ Từ usersMap (API users)
  franchiseId: 5,
  franchiseName: "Quán A"             // ✅ Từ shift → franchises mockdata lookup
}
```

---

## 🎯 Behavior

### 1. **Khi component mount**

- franchise_filter = "all" (default)
- Call API: Search **tất cả** assignments (không filter franchise)
- Call API: Search tất cả users
- Calendar hiển thị tất cả assignments

### 2. **Khi user chọn franchise**

- franchise_filter = "franchise_123"
- useEffect re-run → **Re-call API** với franchise_id
- Calendar re-render chỉ assignments của chi nhánh đó

### 3. **Khi user filter by staff/status**

- Staff filter & status filter: xử lý **client-side** (useMemo)
- Không re-call API
- Fast filtering

### 4. **Khi user thay đổi tháng**

- setMonthDate(newDate)
- useMemo recalculate calendarDays (không re-call API)
- Display 35 ngày của tháng mới

---

## ✨ Advantages of Strategy B

| Aspect                                                  | Status                 |
| ------------------------------------------------------- | ---------------------- |
| **Calls:** 2 API calls on mount                         | ✅ Đơn giản            |
| **Re-fetch:** Only on franchise change                  | ✅ Hiệu quả            |
| **Client-side filters:** Staff + Status                 | ✅ Nhanh               |
| **Avatar support:** From users API                      | ✅ Có                  |
| **Franchise info:** From shift object → lookup mockdata | ✅ Có                  |
| **Code complexity:** Medium                             | ✅ Manageable          |
| **Scalability:** ~1000 items                            | ✅ OK (pageSize: 1000) |

---

## 📊 File Changes Summary

| File                       | Change                                                 | Status |
| -------------------------- | ------------------------------------------------------ | ------ |
| `shift.api.ts`             | ✅ Updated types for ShiftAssignmentItem               | Done   |
| `shift.api.ts`             | ✅ Added franchise_id to SearchShiftAssignmentsRequest | Done   |
| `useShiftCalendar.hook.ts` | ✅ Replaced mockdata with API calls                    | Done   |
| `useShiftCalendar.hook.ts` | ✅ 2-stage data loading (assignments + users)          | Done   |
| `useShiftCalendar.hook.ts` | ✅ Transform + merge logic                             | Done   |

---

## 🚀 Next Steps

1. **Test calendar:** Open page, check if assignments display correctly
2. **Test franchise filter:** Select different franchise, check if data updates
3. **Test staff filter:** Filter by staff name, check results
4. **Test status filter:** Filter by status (ASSIGNED/COMPLETED/ABSENT)
5. **Test day selection:** Click day, check ShiftDayPanel shows correct assignments
6. **Handle errors:** Add error toast if API fails
7. **Add loading state:** Show skeleton/loader while fetching
