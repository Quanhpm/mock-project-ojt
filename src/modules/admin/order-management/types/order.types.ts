export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isLowStock?: boolean;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  customerId?: string;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  createdAt: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  icon?: string;
}
