import type { User, Role } from './user.type';

// Login request/response types
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
  expiresAt: string
}

// Registration types
export interface RegisterRequest {
  email: string
  password: string
  name: string
  phone: string
}

export interface RegisterResponse {
  user: User
  message: string
}

// Auth state types
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Permission types
export interface UserWithRoles {
  user: User
  roles: Array<{
    role: Role
    franchise_id: number | null
  }>
}

// Token types
export interface TokenPayload {
  userId: number
  email: string
  exp: number
  iat: number
}