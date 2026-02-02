// Mock roles data - aligned with DBML schema
export const mockRoles = [
  {
    id: 1,
    code: "SUPER_ADMIN",
    name: "Super Admin",
    description: "Quản lý toàn hệ thống, quản lý người dùng, cửa hàng",
    scope: "GLOBAL",
    is_deleted: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    code: "FRANCHISE_MANAGER",
    name: "Franchise Manager",
    description: "Quản lý cửa hàng, nhân viên, sản phẩm, đơn hàng",
    scope: "FRANCHISE",
    is_deleted: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 3,
    code: "STAFF",
    name: "Staff",
    description: "Nhân viên bán hàng, xử lý đơn hàng",
    scope: "FRANCHISE",
    is_deleted: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 4,
    code: "CUSTOMER",
    name: "Customer",
    description: "Khách hàng",
    scope: "GLOBAL",
    is_deleted: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
];
