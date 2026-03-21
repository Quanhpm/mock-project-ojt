// User type definition - aligned with DBML schema
export interface User {
  id: number
  email: string
  password: string
  name: string
  phone: string
  avatar_url: string
  is_active: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
  role: string // Role code (GLOBAL_ADMIN, FRANCHISE_MANAGER, STAFF, WAREHOUSE)
  franchise_id: number | null // Franchise ID, null for global admin
  password_hash?: string // Optional: for hashed passwords
}

// Role type definition - aligned with DBML schema
export interface Role {
  id: number
  code: string
  name: string
  description: string
  scope: 'GLOBAL' | 'FRANCHISE'
  is_deleted: boolean
  created_at: string
  updated_at: string
}

// User Franchise Role type definition - aligned with DBML schema
export interface UserFranchiseRole {
  id: number
  user_id: number
  franchise_id: number | null // null if role is GLOBAL
  role_id: number
  is_deleted: boolean
  created_at: string
  updated_at: string
}

// Role constants from models/role.model.ts
export const ROLE = {
  ADMIN: "admin",
  MANAGER: "manager", 
  STAFF: "staff",
  CUSTOMER: "customer",
} as const;

export type RoleType = (typeof ROLE)[keyof typeof ROLE];

// Helper function from models/role.model.ts
export const isNonCustomerRole = (role: RoleType): role is Exclude<RoleType, "customer"> => {
  return role !== ROLE.CUSTOMER;
};

// UserAccount from models/user.model.ts
export type UserAccount = {
  id: number;
  role: RoleType;
  email?: string;
};
