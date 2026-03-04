import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { supabase } from '../lib/supabase';
import { Heart, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product, layout = 'grid' }) {
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isWished, setIsWished] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) checkWishlist();
  }, [user, product.id]);

  async function checkWishlist() {
    const { data } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .maybeSingle();
    setIsWished(!!data);
  }

  async function toggleWishlist(e) {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    if (isWished) {
      await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', product.id);
      setIsWished(false);
    } else {
      await supabase.from('wishlists').insert({ user_id: user.id, product_id: product.id });
      setIsWished(true);
    }
  }

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

          <button
            onClick={toggleWishlist}
            className={`absolute top-2 left-2 p-1.5 rounded-full shadow-sm transition-colors opacity-0 group-hover:opacity-100 ${isWished ? 'bg-primary text-white opacity-100' : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-primary hover:text-white'
              }`}
          >
            <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="p-5 flex flex-col flex-1 min-w-0">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">

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
            <button
              onClick={toggleWishlist}
              className={`p-2 border rounded-xl transition-colors ${isWished ? 'bg-primary/10 border-primary text-primary' : 'text-gray-400 hover:bg-gray-50'
                }`}
            >
              <Heart className={`w-5 h-5 ${isWished ? 'fill-current' : ''}`} />
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

        <button
          onClick={toggleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-colors z-10 ${isWished ? 'bg-primary text-white' : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-primary hover:text-white'
            }`}
        >
          <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
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
