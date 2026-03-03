import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import {
  ShoppingCart, Heart, Share2, ShieldCheck,
  Truck, RotateCcw, MessageCircle, Store,
  Star, ChevronRight, Minus, Plus
} from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          vendors (
            id,
            business_name,
            description,
            address,
            city
          ),
          categories (
            id,
            name
          )
        `)
        .eq('slug', slug)
        .single();

      if (error || !data) {
        navigate('/products');
        return;
      }

      setProduct(data);

      // Fetch related products from same category
      if (data.category_id) {
        const { data: related } = await supabase
          .from('products')
          .select('*, vendors(business_name)')
          .eq('category_id', data.category_id)
          .neq('id', data.id)
          .limit(4);
        setRelatedProducts(related || []);
      }

      setLoading(false);
    }
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug, navigate]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    // Optional: show some feedback or navigate to cart
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-gray-500">Loading product details...</p>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-sm text-gray-500 font-medium">
        <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/')}>Home</span>
        <ChevronRight className="h-4 w-4" />
        <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/products')}>Products</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-secondary truncate">{product.name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left: Images */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border overflow-hidden aspect-square relative group">
              {product.images?.[activeImage] ? (
                <img
                  src={product.images[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">No Image</div>
              )}
              <button className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-primary hover:text-white transition-colors">
                <Heart className="h-6 w-6" />
              </button>
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${
                      activeImage === i ? 'border-primary shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Center: Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border p-6 md:p-8 shadow-sm">
              <div className="space-y-4">
                <p className="text-primary font-black text-xs uppercase tracking-[0.2em]">
                  {product.categories?.name || 'New Arrival'}
                </p>
                <h1 className="text-2xl md:text-3xl font-black text-secondary leading-tight">
                  {product.name}
                </h1>

                <div className="flex items-center gap-4 py-2 border-y border-gray-100">
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <span className="text-sm text-gray-400 font-bold border-l pl-4">No Reviews Yet</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-black text-primary italic">Rs. {product.price}</span>
                    {product.compare_at_price && (
                      <span className="text-gray-400 line-through text-lg italic">Rs. {product.compare_at_price}</span>
                    )}
                  </div>
                  <p className="text-xs text-green-600 font-bold uppercase tracking-wider">In Stock: {product.stock_quantity} units</p>
                </div>

                <div className="pt-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-gray-500">Quantity</span>
                    <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="p-2 hover:bg-gray-50 transition-colors text-gray-400 hover:text-primary"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-black text-secondary">{quantity}</span>
                      <button
                        onClick={() => setQuantity(q => q + 1)}
                        className="p-2 hover:bg-gray-50 transition-colors text-gray-400 hover:text-primary"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/30 hover:bg-orange-600 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
                    >
                      <ShoppingCart className="h-6 w-6" /> ADD TO CART
                    </button>
                    <button className="w-full bg-secondary text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-secondary/20 hover:bg-gray-800 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3">
                      BUY IT NOW
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details Card */}
            <div className="bg-white rounded-3xl border p-6 md:p-8 shadow-sm">
              <h3 className="text-lg font-black text-secondary mb-4 flex items-center gap-2">
                Description
              </h3>
              <div className="text-gray-500 text-sm leading-relaxed whitespace-pre-wrap">
                {product.description || 'No description provided by the seller.'}
              </div>
            </div>
          </div>

          {/* Right: Sidebar / Trust / Vendor */}
          <div className="lg:col-span-3 space-y-6">
            {/* Delivery Info */}
            <div className="bg-white rounded-3xl border p-6 shadow-sm space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-secondary">Fast Delivery</p>
                  <p className="text-xs text-gray-500 mt-1">Delivery within 2-4 business days across Nepal.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-secondary">Authentic Product</p>
                  <p className="text-xs text-gray-500 mt-1">100% original products guaranteed by SastoHub.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-secondary">Easy Returns</p>
                  <p className="text-xs text-gray-500 mt-1">7-day free return policy if items are damaged.</p>
                </div>
              </div>
            </div>

            {/* Vendor Card */}
            <div className="bg-white rounded-3xl border p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black">
                  <Store className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Sold by</p>
                  <h4 className="font-black text-secondary truncate">{product.vendors?.business_name}</h4>
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-secondary border border-gray-200 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                  <Store className="h-4 w-4" /> Visit Store
                </button>
                <button className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-secondary border border-gray-200 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                  <MessageCircle className="h-4 w-4" /> Chat with Seller
                </button>
              </div>

              <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-black text-secondary italic">88%</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Positive</p>
                </div>
                <div>
                  <p className="text-lg font-black text-secondary italic">99%</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ship Speed</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary to-orange-500 rounded-3xl p-6 text-white text-center shadow-lg shadow-primary/20">
              <ShieldCheck className="h-10 w-10 mx-auto mb-3" />
              <h4 className="font-black text-lg mb-2">SastoHub Safe Pay</h4>
              <p className="text-xs opacity-90 leading-relaxed font-medium">
                Your money is safe with us until you receive your product and confirm satisfaction.
              </p>
            </div>
          </div>

        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex justify-between items-center mb-8 px-2">
              <h2 className="text-2xl font-black text-secondary tracking-tight">Customers Also Bought</h2>
              <button className="text-primary font-bold hover:underline" onClick={() => navigate('/products')}>View More</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
