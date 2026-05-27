import React from 'react';
import { useCartStore } from '../store/cartStore';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-12 w-12 text-gray-300" />
        </div>
        <h2 className="text-2xl font-black text-surface-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors">
          Browse Products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-surface-900 mb-8">Shopping Cart
          <span className="ml-3 text-base font-medium text-gray-400">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border flex gap-4 hover:shadow-md transition-shadow">
                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border">
                  {item.images?.[0] && (
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-surface-900 truncate">{item.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{item.vendors?.business_name}</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center border rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-2 hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-4 font-bold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= (Number.parseInt(item.stock_quantity, 10) || 0)}
                        className={`p-2 ${item.quantity >= (Number.parseInt(item.stock_quantity, 10) || 0) ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 transition-colors'}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium transition-colors"
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-surface-900">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">Rs. {item.price} each</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border h-fit sticky top-28">
            <h2 className="text-xl font-black text-surface-900 mb-6">Order Summary</h2>
            <div className="space-y-3 mb-5 text-sm">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-gray-600">
                  <span className="truncate max-w-[160px]">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                  <span className="font-medium">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold">Rs. {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery Fee</span>
                <span className="font-bold text-green-600">Free</span>
              </div>
              <div className="flex justify-between font-black text-lg border-t pt-3">
                <span>Total</span>
                <span className="text-primary-600">Rs. {total.toLocaleString()}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="flex items-center justify-center gap-2 w-full bg-primary-600 text-white text-center py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-colors"
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
