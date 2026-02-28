import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { OrderItem, ItemOptions } from '../types/order.types.ts';
import { SIZE_OPTIONS, TOPPINGS, SUGAR_LEVELS, ICE_LEVELS } from '../mock/ProductOption.ts';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: OrderItem;
  onSave: (itemId: string, options: ItemOptions) => void;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen,
  onClose,
  item,
  onSave,
}) => {
  const [selectedSize, setSelectedSize] = useState(item.options?.size || SIZE_OPTIONS[0]);
  const [selectedSugar, setSelectedSugar] = useState(item.options?.sugar || SUGAR_LEVELS[4]);
  const [selectedIce, setSelectedIce] = useState(item.options?.ice || ICE_LEVELS[4]);
  const [selectedToppings, setSelectedToppings] = useState<typeof TOPPINGS>(item.options?.toppings || []);

  if (!isOpen) return null;

  const toggleTopping = (topping: typeof TOPPINGS[0]) => {
    const exists = selectedToppings.find(t => t.code === topping.code);
    if (exists) {
      setSelectedToppings(selectedToppings.filter(t => t.code !== topping.code));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const handleSave = () => {
    const options: ItemOptions = {
      size: selectedSize,
      sugar: selectedSugar,
      ice: selectedIce,
      toppings: selectedToppings,
    };
    onSave(item.id, options);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
            <div>
              <h2 className="text-xl font-bold text-amber-900">Chỉnh sửa sản phẩm</h2>
              <p className="text-sm text-amber-700 mt-1">{item.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
            {/* Size Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Size <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {SIZE_OPTIONS.map((size) => (
                  <button
                    key={size.code}
                    onClick={() => setSelectedSize(size)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedSize.code === size.code
                        ? 'border-amber-700 bg-amber-50 text-amber-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="font-bold text-sm">{size.label}</div>
                    {size.bonusPrice > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        +{size.bonusPrice.toLocaleString('vi-VN')}đ
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sugar Level */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Đường <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {SUGAR_LEVELS.map((sugar) => (
                  <button
                    key={sugar.value}
                    onClick={() => setSelectedSugar(sugar)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedSugar.value === sugar.value
                        ? 'border-amber-700 bg-amber-50 text-amber-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="font-bold text-sm">{sugar.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Ice Level */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Đá <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {ICE_LEVELS.map((ice) => (
                  <button
                    key={ice.value}
                    onClick={() => setSelectedIce(ice)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedIce.value === ice.value
                        ? 'border-amber-700 bg-amber-50 text-amber-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="font-bold text-sm">{ice.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Toppings */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Topping
              </label>
              <div className="space-y-2">
                {TOPPINGS.map((topping) => {
                  const isSelected = selectedToppings.some(t => t.code === topping.code);
                  return (
                    <button
                      key={topping.code}
                      onClick={() => toggleTopping(topping)}
                      className={`w-full p-3 rounded-lg border-2 transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-amber-700 bg-amber-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'border-amber-700 bg-amber-700' : 'border-gray-300'
                        }`}>
                          {isSelected && <Check size={14} className="text-white" />}
                        </div>
                        <span className={`font-medium ${isSelected ? 'text-amber-900' : 'text-gray-700'}`}>
                          {topping.name}
                        </span>
                      </div>
                      <span className={`text-sm font-bold ${isSelected ? 'text-amber-700' : 'text-gray-500'}`}>
                        +{topping.price.toLocaleString('vi-VN')}đ
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border-2 border-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 px-4 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold shadow-lg shadow-amber-700/20 transition-all active:scale-[0.98]"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditItemModal;
