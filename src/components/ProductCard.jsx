import React, { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { Heart, ShoppingCart } from 'lucide-react';

export default function ProductCard({ product }) {
  const { addItem } = useCartStore();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-square bg-gray-100 relative group overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
        )}

        <button className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-primary hover:text-white transition-colors">
          <Heart className="w-5 h-5" />
        </button>

        {isHovered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              addItem(product);
            }}
            className="absolute bottom-0 left-0 right-0 bg-primary text-white py-3 flex items-center justify-center gap-2 font-bold animate-slide-up"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">
          {product.vendors?.business_name || 'Generic Store'}
        </p>
        <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 flex-1">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          <p className="text-primary font-bold text-lg">Rs. {product.price}</p>
          {product.compare_at_price && (
            <p className="text-gray-400 line-through text-sm">Rs. {product.compare_at_price}</p>
          )}
        </div>
      </div>
    </div>
  );
}
