// Mock users data
export const mockUsers = [
  {
    id: "user-1",
    name: "Nguyễn Văn Admin",
    email: "admin@example.com",
    phone: "0123456789",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    role: "admin" as const,
    isActive: true,
    address: "123 Đường ABC, Quận 1, TP.HCM",
    dateOfBirth: "1990-01-15",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T12:30:00Z"
  },
  {
    id: "user-2", 
    name: "Trần Thị Manager",
    email: "manager@example.com",
    phone: "0987654321",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
    role: "manager" as const,
    isActive: true,
    address: "456 Đường DEF, Quận 3, TP.HCM", 
    dateOfBirth: "1992-05-20",
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-20T09:15:00Z"
  },
  {
    id: "user-3",
    name: "Lê Văn Client",
    email: "client1@example.com", 
    phone: "0369852147",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    role: "client" as const,
    isActive: true,
    address: "789 Đường GHI, Quận 7, TP.HCM",
    dateOfBirth: "1995-08-10",
    createdAt: "2024-01-10T00:00:00Z", 
    updatedAt: "2024-01-25T14:45:00Z"
  },
  {
    id: "user-4",
    name: "Phạm Thị Hoa",
    email: "client2@example.com",
    phone: "0147258369", 
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    role: "client" as const,
    isActive: false,
    address: "321 Đường JKL, Quận 5, TP.HCM",
    dateOfBirth: "1988-12-03",
    createdAt: "2024-01-12T00:00:00Z",
    updatedAt: "2024-01-30T16:20:00Z"
  },
  {
    id: "user-5",
    name: "Hoàng Minh Tuấn",
    email: "client3@example.com",
    phone: "0852741963",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", 
    role: "client" as const,
    isActive: true,
    address: "654 Đường MNO, Quận 2, TP.HCM",
    dateOfBirth: "1993-07-25",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-02-01T11:10:00Z"
  }
];

// Mock user profile for current logged in user
export const mockCurrentUser = mockUsers[0]; // Admin user