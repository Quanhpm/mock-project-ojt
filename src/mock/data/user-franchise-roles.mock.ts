// Mock user_franchise_role data - aligned with DBML schema
// UNIQUE (user_id, franchise_id, role_id) constraint
export const mockUserFranchiseRoles = [
  // User 1 (Admin) - SUPER_ADMIN with null franchise_id (GLOBAL scope)
  {
    id: 1,
    user_id: 1,
    franchise_id: null,
    role_id: 1, // SUPER_ADMIN (GLOBAL)
    is_deleted: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  // User 2 (Manager) - FRANCHISE_MANAGER at franchise 1
  {
    id: 2,
    user_id: 2,
    franchise_id: 1,
    role_id: 2, // FRANCHISE_MANAGER
    is_deleted: false,
    created_at: "2024-01-05T00:00:00Z",
    updated_at: "2024-01-05T00:00:00Z"
  },
  // User 3 (Manager 2) - FRANCHISE_MANAGER at franchise 2
  {
    id: 3,
    user_id: 3,
    franchise_id: 2,
    role_id: 2, // FRANCHISE_MANAGER
    is_deleted: false,
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-10T00:00:00Z"
  },
  // User 4 (Staff) - STAFF at franchise 1
  {
    id: 4,
    user_id: 4,
    franchise_id: 1,
    role_id: 3, // STAFF
    is_deleted: false,
    created_at: "2024-01-12T00:00:00Z",
    updated_at: "2024-01-12T00:00:00Z"
  },
  // User 5 (Staff 2) - STAFF at franchise 1
  {
    id: 5,
    user_id: 5,
    franchise_id: 1,
    role_id: 3, // STAFF
    is_deleted: false,
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z"
  },
  // User 2 - Additional: Also STAFF at franchise 2 (multi-franchise support)
  {
    id: 6,
    user_id: 2,
    franchise_id: 2,
    role_id: 3, // STAFF
    is_deleted: false,
    created_at: "2024-01-20T00:00:00Z",
    updated_at: "2024-01-20T00:00:00Z"
  }
];
