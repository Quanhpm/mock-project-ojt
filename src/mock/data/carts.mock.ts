// Mock cart data
export const mockCart = {
  id: "cart-1",
  userId: "user-3",
  items: [
    {
      id: "cart-item-1",
      productId: "prod-1",
      product: {
        id: "prod-1",
        name: "iPhone 15 Pro Max",
        price: 29990000,
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=150",
        stock: 25,
        sku: "IP15PM-256-BL"
      },
      quantity: 1,
      specifications: {
        "Màu sắc": "Xanh Titan",
        "Bộ nhớ": "256GB"
      },
      addedAt: "2024-02-01T10:00:00Z"
    },
    {
      id: "cart-item-2", 
      productId: "prod-5",
      product: {
        id: "prod-5",
        name: "AirPods Pro 2",
        price: 6490000,
        image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=150",
        stock: 45,
        sku: "APP2-USB-C-WH"
      },
      quantity: 2,
      addedAt: "2024-02-01T14:30:00Z"
    },
    {
      id: "cart-item-3",
      productId: "prod-4", 
      product: {
        id: "prod-4",
        name: "Dell XPS 13",
        price: 35990000,
        image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=150",
        stock: 8,
        sku: "XPS13-I7-1TB-SL"
      },
      quantity: 1,
      specifications: {
        "Màu sắc": "Bạc",
        "RAM": "16GB",
        "Bộ nhớ": "1TB"
      },
      addedAt: "2024-02-02T09:15:00Z"
    }
  ],
  totalItems: 4,
  totalAmount: 78470000,
  updatedAt: "2024-02-02T09:15:00Z"
};

// Mock multiple carts for different users
export const mockCarts = [
  mockCart,
  {
    id: "cart-2",
    userId: "user-4",
    items: [
      {
        id: "cart-item-4",
        productId: "prod-3",
        product: {
          id: "prod-3",
          name: "MacBook Pro M3 14 inch",
          price: 52990000,
          image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=150",
          stock: 12,
          sku: "MBP14-M3-512-SG"
        },
        quantity: 1,
        addedAt: "2024-01-30T16:45:00Z"
      }
    ],
    totalItems: 1,
    totalAmount: 52990000,
    updatedAt: "2024-01-30T16:45:00Z"
  }
];