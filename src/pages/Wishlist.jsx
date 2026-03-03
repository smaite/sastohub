import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const { user, loading: authLoading } = useAuthStore();
  const { addItem } = useCartStore();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      fetchWishlist();
    }
  }, [user, authLoading, navigate]);

  async function fetchWishlist() {
    setLoading(true);
    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        id,
        products (*)
      `)
      .eq('user_id', user.id);

    if (!error) {
      // Flatten the data to just get product objects with wishlist record id
      const flattened = data.map(item => ({
        ...item.products,
        wishlist_id: item.id
      }));
      setWishlistItems(flattened);
    }
    setLoading(false);
  }

  async function removeFromWishlist(wishlistId) {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('id', wishlistId);

    if (!error) {
      setWishlistItems(prev => prev.filter(item => item.wishlist_id !== wishlistId));
    }
  }

  const handleMoveToCart = (product) => {
    addItem(product);
    removeFromWishlist(product.wishlist_id);
  };

  if (loading || authLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500 font-medium">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      Loading your wishlist...
    </div>
  );

  if (wishlistItems.length === 0) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Heart className="h-10 w-10 text-primary opacity-30" />
      </div>
      <h2 className="text-2xl font-black text-secondary mb-2">Your wishlist is empty</h2>
      <p className="text-gray-500 mb-8">Save items you like to keep track of them and buy them later.</p>
      <Link to="/products" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors inline-flex items-center gap-2">
        Start Exploring <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-white rounded-2xl border shadow-sm flex items-center justify-center text-primary">
            <Heart className="h-6 w-6 fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-secondary">My Wishlist</h1>
            <p className="text-gray-500 text-sm">{wishlistItems.length} items saved</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="relative group">
              <ProductCard product={item} />

              <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWishlist(item.wishlist_id);
                  }}
                  className="p-2 bg-white text-red-500 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-all"
                  title="Remove from wishlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-2">
                <button
                  onClick={() => handleMoveToCart(item)}
                  className="w-full py-2 bg-secondary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-3.5 w-3.5" /> Move to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
