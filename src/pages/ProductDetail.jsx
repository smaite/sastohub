import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import {
  ShoppingCart, Heart, Share2, ShieldCheck,
  Truck, RotateCcw, MessageCircle, Store,
  Star, ChevronRight, Minus, Plus, User, Send
} from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [isWished, setIsWished] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

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

      // Fetch related products
      if (data.category_id) {
        const { data: related } = await supabase
          .from('products')
          .select('*, vendors(business_name)')
          .eq('category_id', data.category_id)
          .neq('id', data.id)
          .limit(4);
        setRelatedProducts(related || []);
      }

      // Fetch reviews
      fetchReviews(data.id);

      // Check wishlist
      if (user) checkWishlist(data.id);

      setLoading(false);
    }
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug, navigate, user]);

  async function fetchReviews(productId) {
    const { data } = await supabase
      .from('reviews')
      .select('*, profiles(full_name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    setReviews(data || []);
  }

  async function checkWishlist(productId) {
    const { data } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();
    setIsWished(!!data);
  }

  async function toggleWishlist() {
    if (!user) { navigate('/login'); return; }
    if (isWished) {
      await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', product.id);
      setIsWished(false);
    } else {
      await supabase.from('wishlists').insert({ user_id: user.id, product_id: product.id });
      setIsWished(true);
    }
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!newReview.comment.trim()) return;

    setSubmittingReview(true);
    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      product_id: product.id,
      rating: newReview.rating,
      comment: newReview.comment
    });

    if (!error) {
      setNewReview({ rating: 5, comment: '' });
      fetchReviews(product.id);
    } else {
      alert(error.message);
    }
    setSubmittingReview(false);
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-gray-500">Loading product details...</p>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-20 text-secondary">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-sm text-gray-500 font-medium">
        <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/')}>Home</span>
        <ChevronRight className="h-4 w-4" />
        <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/products')}>Products</span>
        <ChevronRight className="h-4 w-4" />
        <span className="truncate opacity-60">{product.name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left: Images */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border shadow-sm overflow-hidden aspect-square relative group">
              {product.images?.[activeImage] ? (
                <img
                  src={product.images[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">No Image</div>
              )}
              <button
                onClick={toggleWishlist}
                className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all ${
                  isWished ? 'bg-primary text-white scale-110' : 'bg-white/80 backdrop-blur-sm hover:bg-primary hover:text-white'
                }`}
              >
                <Heart className={`h-6 w-6 ${isWished ? 'fill-current' : ''}`} />
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
                <h1 className="text-2xl md:text-3xl font-black leading-tight">
                  {product.name}
                </h1>

                <div className="flex items-center gap-4 py-2 border-y border-gray-100">
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length || 0) ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-400 border-l pl-4 uppercase tracking-widest">
                    {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-black text-primary italic leading-none">Rs. {product.price}</span>
                    {product.compare_at_price && (
                      <span className="text-gray-400 line-through text-lg italic">Rs. {product.compare_at_price}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-green-600 font-black uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> In Stock: {product.stock_quantity} units
                  </p>
                </div>

                <div className="pt-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Quantity</span>
                    <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden bg-gray-50">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="p-2 hover:bg-white transition-colors text-gray-400 hover:text-primary"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center font-black text-sm">{quantity}</span>
                      <button
                        onClick={() => setQuantity(q => q + 1)}
                        className="p-2 hover:bg-white transition-colors text-gray-400 hover:text-primary"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-primary text-white py-4 rounded-2xl font-black text-base shadow-xl shadow-primary/30 hover:bg-orange-600 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3"
                    >
                      <ShoppingCart className="h-5 w-5" /> ADD TO CART
                    </button>
                    <button className="w-full bg-secondary text-white py-4 rounded-2xl font-black text-base shadow-xl shadow-secondary/20 hover:bg-black hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3">
                      BUY IT NOW
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border p-6 md:p-8 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Description</h3>
              <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {product.description || 'No description provided by the seller.'}
              </div>
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl border p-6 shadow-sm space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">Fast Delivery</p>
                  <p className="text-[11px] text-gray-500 mt-1 font-medium">Delivery within 2-4 business days across Nepal.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">Authentic</p>
                  <p className="text-[11px] text-gray-500 mt-1 font-medium">100% original products guaranteed by SastoHub.</p>
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
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Sold by</p>
                  <h4 className="font-black truncate">{product.vendors?.business_name}</h4>
                </div>
              </div>
              <button className="w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                Visit Store
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-3xl border p-8 shadow-sm">
              <h2 className="text-xl font-black uppercase italic tracking-tight mb-8">Customer Reviews</h2>

              {/* Review Form */}
              {user ? (
                <form onSubmit={handleSubmitReview} className="mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Rate this product</p>
                  <div className="flex gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform active:scale-90"
                      >
                        <Star className={`h-8 w-8 ${star <= (hoverRating || newReview.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Share your experience with this product..."
                    className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all h-32 text-sm font-medium resize-none mb-4"
                    required
                  />
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-secondary text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {submittingReview ? 'Posting...' : <><Send className="h-4 w-4" /> Post Review</>}
                  </button>
                </form>
              ) : (
                <div className="mb-10 p-6 bg-gray-50 rounded-2xl border border-dashed text-center">
                  <p className="text-sm font-bold text-gray-500 mb-2 text-secondary">Want to leave a review?</p>
                  <Link to="/login" className="text-primary font-black text-xs uppercase tracking-widest hover:underline">Login to your account</Link>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-black">{review.profiles?.full_name || 'Verified Buyer'}</p>
                          <div className="flex text-yellow-400">
                            {[...Array(review.rating)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm font-medium leading-relaxed pl-13">
                      {review.comment}
                    </p>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <p className="text-center py-10 text-gray-400 font-bold italic text-sm">No reviews yet. Be the first to rate this product!</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-black uppercase italic tracking-tight mb-8 px-2">You might also like</h2>
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
