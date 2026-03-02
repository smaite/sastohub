import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          vendors (business_name)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (!error) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Banner Section */}
      <div className="relative rounded-3xl overflow-hidden mb-12 bg-gradient-to-r from-primary to-orange-500 h-64 md:h-80 flex items-center">
        <div className="relative z-10 px-8 md:px-16 text-white max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter uppercase italic">
            SastoHub
          </h1>
          <p className="text-xl md:text-2xl font-medium opacity-90 mb-6">
            Nepal's premier multi-vendor destination.
          </p>
          <button className="bg-white text-primary px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
            Shop Now
          </button>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-white/10 skew-x-12 transform translate-x-20"></div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-secondary tracking-tight">Trending Now</h2>
        <button className="text-primary font-bold hover:underline">View All</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col">
              <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {products.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed">
              <p className="text-gray-500 font-medium">No products found. Be the first to list one!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
