// Mock users data - aligned with DBML schema
export const mockUsers = [
  {
    id: 1,
    email: "admin@example.com",
    password: "admin123", 
    name: "Nguyễn Văn Admin",
    phone: "0123456789",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    is_active: true,
    is_deleted: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-15T12:30:00Z",
    role: "admin"
  },
  {
    id: 2,
    email: "manager@example.com",
    password_hash: "$2b$10$uvwxyzabcdefghijklmnopqrst",
    name: "Trần Thị Manager",
    phone: "0987654321",
    avatar_url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
    is_active: true,
    is_deleted: false,
    created_at: "2024-01-05T00:00:00Z",
    updated_at: "2024-01-20T09:15:00Z"
  },
  {
    id: 3,
    email: "manager2@example.com",
    password_hash: "$2b$10$stuvwxyzabcdefghijklmnopqr",
    name: "Lê Văn Manager 2",
    phone: "0369852147",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    is_active: true,
    is_deleted: false,
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-25T14:45:00Z"
  },
  {
    id: 4,
    email: "staff@example.com",
    password_hash: "$2b$10$qrstuvwxyzabcdefghijklmnopq",
    name: "Phạm Thị Hoa",
    phone: "0147258369",
    avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    is_active: false,
    is_deleted: false,
    created_at: "2024-01-12T00:00:00Z",
    updated_at: "2024-01-30T16:20:00Z"
  },
  {
    id: 5,
    email: "staff2@example.com",
    password_hash: "$2b$10$pqrstuvwxyzabcdefghijklmnopq",
    name: "Hoàng Minh Tuấn",
    phone: "0852741963",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    is_active: true,
    is_deleted: false,
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-02-01T11:10:00Z"
  }
];

// Mock user profile for current logged in user
export const mockCurrentUser = mockUsers[0]; // admin
