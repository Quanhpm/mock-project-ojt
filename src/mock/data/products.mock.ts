// Mock categories data
export const mockCategories = [
  {
    id: "cat-1",
    name: "Điện thoại",
    description: "Smartphone và phụ kiện",
    parentId: undefined,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "cat-2", 
    name: "Laptop",
    description: "Máy tính xách tay",
    parentId: undefined,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "cat-3",
    name: "Phụ kiện",
    description: "Phụ kiện công nghệ",
    parentId: undefined, 
    image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=300",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
];

// Mock products data
export const mockProducts = [
  {
    id: "prod-1",
    name: "iPhone 15 Pro Max",
    description: "iPhone 15 Pro Max với chip A17 Pro, camera 48MP, màn hình Super Retina XDR 6.7 inch",
    price: 29990000,
    originalPrice: 32990000,
    images: [
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"
    ],
    category: mockCategories[0],
    categoryId: "cat-1",
    brand: "Apple",
    sku: "IP15PM-256-BL",
    stock: 25,
    status: "active" as const,
    rating: 4.8,
    reviewCount: 156,
    tags: ["flagship", "5g", "premium"],
    specifications: {
      "Màn hình": "6.7 inch Super Retina XDR",
      "Chip": "A17 Pro",
      "Camera": "48MP + 12MP + 12MP",
      "RAM": "8GB",
      "Bộ nhớ": "256GB"
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z"
  },
  {
    id: "prod-2",
    name: "Samsung Galaxy S24 Ultra", 
    description: "Galaxy S24 Ultra với S Pen, camera 200MP, màn hình Dynamic AMOLED 6.8 inch",
    price: 26990000,
    originalPrice: 28990000,
    images: [
      "https://images.unsplash.com/photo-1610792516775-7763d9cd4e0c?w=500",
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=500"
    ],
    category: mockCategories[0], 
    categoryId: "cat-1",
    brand: "Samsung",
    sku: "SGS24U-512-TI",
    stock: 18,
    status: "active" as const,
    rating: 4.7,
    reviewCount: 89,
    tags: ["flagship", "5g", "s-pen"],
    specifications: {
      "Màn hình": "6.8 inch Dynamic AMOLED",
      "Chip": "Snapdragon 8 Gen 3",
      "Camera": "200MP + 50MP + 12MP + 10MP", 
      "RAM": "12GB",
      "Bộ nhớ": "512GB"
    },
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-25T00:00:00Z"
  },
  {
    id: "prod-3",
    name: "MacBook Pro M3 14 inch",
    description: "MacBook Pro với chip M3, màn hình Liquid Retina XDR 14 inch, hiệu năng vượt trội",
    price: 52990000,
    originalPrice: 55990000,
    images: [
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500"
    ],
    category: mockCategories[1],
    categoryId: "cat-2", 
    brand: "Apple",
    sku: "MBP14-M3-512-SG",
    stock: 12,
    status: "active" as const,
    rating: 4.9,
    reviewCount: 67,
    tags: ["professional", "m3", "creative"],
    specifications: {
      "Màn hình": "14 inch Liquid Retina XDR",
      "Chip": "Apple M3",
      "Camera": "1080p FaceTime HD",
      "RAM": "18GB",
      "Bộ nhớ": "512GB SSD"
    },
    createdAt: "2024-01-03T00:00:00Z", 
    updatedAt: "2024-01-22T00:00:00Z"
  },
  {
    id: "prod-4",
    name: "Dell XPS 13",
    description: "Laptop Dell XPS 13 với Intel Core i7 thế hệ 13, thiết kế mỏng nhẹ, màn hình InfinityEdge",
    price: 35990000,
    originalPrice: 38990000,
    images: [
      "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=500",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500"
    ],
    category: mockCategories[1],
    categoryId: "cat-2",
    brand: "Dell",
    sku: "XPS13-I7-1TB-SL", 
    stock: 8,
    status: "active" as const,
    rating: 4.6,
    reviewCount: 43,
    tags: ["ultrabook", "business", "portable"],
    specifications: {
      "Màn hình": "13.4 inch FHD+",
      "Chip": "Intel Core i7-1360P",
      "Camera": "720p HD",
      "RAM": "16GB",
      "Bộ nhớ": "1TB SSD"
    },
    createdAt: "2024-01-07T00:00:00Z",
    updatedAt: "2024-01-28T00:00:00Z"
  },
  {
    id: "prod-5",
    name: "AirPods Pro 2",
    description: "AirPods Pro thế hệ 2 với chip H2, chống ồn chủ động, âm thanh không gian",
    price: 6490000,
    originalPrice: 6990000,
    images: [
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500",
      "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500"
    ],
    category: mockCategories[2],
    categoryId: "cat-3",
    brand: "Apple", 
    sku: "APP2-USB-C-WH",
    stock: 45,
    status: "active" as const,
    rating: 4.8,
    reviewCount: 234,
    tags: ["wireless", "premium", "anc"],
    specifications: {
      "Kết nối": "Bluetooth 5.3",
      "Chip": "Apple H2",
      "Pin": "6 tiếng (tai nghe)",
      "Chống nước": "IPX4",
      "Cổng sạc": "USB-C"
    },
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-18T00:00:00Z"
  },
  {
    id: "prod-6",
    name: "iPad Air M2",
    description: "iPad Air với chip M2, màn hình Liquid Retina 11 inch, hỗ trợ Apple Pencil",
    price: 16990000,
    originalPrice: 18990000,
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500"
    ],
    category: mockCategories[2],
    categoryId: "cat-3",
    brand: "Apple",
    sku: "IPAD-AIR-M2-128-BL",
    stock: 0,
    status: "out_of_stock" as const, 
    rating: 4.7,
    reviewCount: 92,
    tags: ["tablet", "creative", "portable"],
    specifications: {
      "Màn hình": "11 inch Liquid Retina",
      "Chip": "Apple M2",
      "Camera": "12MP Wide",
      "RAM": "8GB",
      "Bộ nhớ": "128GB"
    },
    createdAt: "2024-01-04T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z"
  }
];