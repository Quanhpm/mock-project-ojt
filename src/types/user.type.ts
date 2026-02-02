// User type definition - aligned with DBML schema
export interface User {
  id: number
  email: string
  password_hash: string
  name: string
  phone: string
  avatar_url: string
  is_active: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
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
