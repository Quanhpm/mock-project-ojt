import React, { useState, useMemo } from 'react';
import { ProductCard, OrderSidebar, MenuHeader, CategoryTabs } from '../components/index.ts';
import { mockMenuItems, menuCategories } from '../mock/order.mock.ts';
import type { Order, OrderItem, MenuItem } from '../types/order.types.ts';

export const OrderManagementPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [selectedLocation, setSelectedLocation] = useState('CO-1');

  const [order, setOrder] = useState<Order>({
    id: '2045',
    orderNumber: '2045',
    items: [],
    orderType: 'delivery',
    subtotal: 0,
    tax: 0,
    total: 0,
    createdAt: new Date().toISOString(),
  });

  const TAX_RATE = 0.05;

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    let products = mockMenuItems;

    // Filter by category
    if (selectedCategory !== '1') {
      const categoryMap: Record<string, string> = {
        '2': 'coffee',
        '3': 'food',
        '4': 'dessert',
        '5': 'beverage',
        '6': 'addon',
      };
      const categoryName = categoryMap[selectedCategory];
      if (categoryName) {
        products = products.filter((p) => p.category === categoryName);
      }
    }

    // Filter by search query
    if (searchQuery) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return products;
  }, [searchQuery, selectedCategory]);

  const handleAddToCart = (item: MenuItem) => {
    setOrder((prev) => {
      const existingItem = prev.items.find((i) => i.menuItemId === item.id);

      let updatedItems: OrderItem[];
      if (existingItem) {
        updatedItems = prev.items.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        updatedItems = [
          ...prev.items,
          {
            id: `${item.id}-${Date.now()}`,
            menuItemId: item.id,
            name: item.name,
            quantity: 1,
            unitPrice: item.price,
          },
        ];
      }

      const subtotal = updatedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
      const total = subtotal + tax;

      return {
        ...prev,
        items: updatedItems,
        subtotal,
        tax,
        total,
      };
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setOrder((prev) => {
      const updatedItems = prev.items.filter((i) => i.id !== itemId);
      const subtotal = updatedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
      const total = subtotal + tax;

      return {
        ...prev,
        items: updatedItems,
        subtotal,
        tax,
        total,
      };
    });
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setOrder((prev) => {
      const updatedItems = prev.items.map((i) =>
        i.id === itemId ? { ...i, quantity } : i
      );
      const subtotal = updatedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
      const total = subtotal + tax;

      return {
        ...prev,
        items: updatedItems,
        subtotal,
        tax,
        total,
      };
    });
  };

  const handleOrderTypeChange = (type: 'dine-in' | 'takeaway' | 'delivery') => {
    setOrder((prev) => ({
      ...prev,
      orderType: type,
    }));
  };

  const handleNotesChange = (notes: string) => {
    setOrder((prev) => ({
      ...prev,
      notes,
    }));
  };

  return (
    <main className="flex-1 flex overflow-hidden h-screen bg-gray-50">
      {/* Menu Section */}
      <section className="flex-1 flex flex-col overflow-hidden relative border-r border-gray-100">
        <MenuHeader
          selectedLocation={selectedLocation}
          searchQuery={searchQuery}
          onLocationChange={setSelectedLocation}
          onSearchChange={setSearchQuery}
        />

        <CategoryTabs
          categories={menuCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-6 pt-2">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  onAddToCart={handleAddToCart}
                />
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center py-12 text-gray-400">
                <p>No items found matching your search</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Order Sidebar */}
      <OrderSidebar
        order={order}
        onRemoveItem={handleRemoveItem}
        onUpdateQuantity={handleUpdateQuantity}
        onOrderTypeChange={handleOrderTypeChange}
        onNotesChange={handleNotesChange}
      />
    </main>
  );
};

export default OrderManagementPage;
