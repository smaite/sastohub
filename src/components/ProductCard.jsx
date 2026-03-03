import React, { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { Heart, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product, layout = 'grid' }) {
  const { addItem } = useCartStore();
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/product/${product.slug}`);
  };

  if (layout === 'list') {
    return (
      <div
        onClick={handleNavigate}
        className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-row h-40 group"
      >
        <div className="w-40 bg-gray-100 relative overflow-hidden flex-shrink-0">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
          )}

          <button className="absolute top-2 left-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-primary hover:text-white transition-colors opacity-0 group-hover:opacity-100">
            <Heart className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col flex-1 min-w-0">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-widest font-black">
                {product.vendors?.business_name || 'Generic Store'}
              </p>
              <h3 className="font-bold text-secondary truncate text-lg group-hover:text-primary transition-colors">{product.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-primary font-black text-xl leading-none mb-1">Rs. {product.price}</p>
              {product.compare_at_price && (
                <p className="text-gray-400 line-through text-xs italic">Rs. {product.compare_at_price}</p>
              )}
            </div>
          </div>

          <div className="mt-auto flex items-center gap-3">
             <button
              onClick={(e) => {
                e.stopPropagation();
                addItem(product);
              }}
              className="px-6 py-2 bg-primary text-white rounded-xl flex items-center gap-2 font-bold text-sm hover:bg-orange-600 transition-colors shadow-lg shadow-primary/20"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
            <button className="p-2 border rounded-xl hover:bg-gray-50 text-gray-400 transition-colors">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleNavigate}
      className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col h-full group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
        )}

        <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-primary hover:text-white transition-colors z-10">
          <Heart className="w-4 h-4" />
        </button>

        <div className={`absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/20 to-transparent transition-all duration-300 transform ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addItem(product);
            }}
            className="w-full bg-primary text-white py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-lg"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] text-gray-400 mb-1.5 uppercase tracking-widest font-black">
          {product.vendors?.business_name || 'Generic Store'}
        </p>
        <h3 className="font-bold text-secondary line-clamp-2 mb-2 flex-1 text-sm group-hover:text-primary transition-colors">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          <p className="text-primary font-black text-base">Rs. {product.price}</p>
          {product.compare_at_price && (
            <p className="text-gray-400 line-through text-[10px] italic">Rs. {product.compare_at_price}</p>
          )}
        </div>
      </div>
    </div>
  );
}
