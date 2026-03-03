import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Zap, ArrowRight,
  Smartphone, Laptop, Shirt, Home as HomeIcon,
  Dumbbell, Gift, ShoppingBag, Utensils
} from 'lucide-react';

const categories = [
  { name: 'Electronics', icon: Smartphone, color: 'bg-blue-100 text-blue-600' },
  { name: 'Laptops', icon: Laptop, color: 'bg-indigo-100 text-indigo-600' },
  { name: 'Fashion', icon: Shirt, color: 'bg-pink-100 text-pink-600' },
  { name: 'Home', icon: HomeIcon, color: 'bg-green-100 text-green-600' },
  { name: 'Fitness', icon: Dumbbell, color: 'bg-red-100 text-red-600' },
  { name: 'Gifts', icon: Gift, color: 'bg-purple-100 text-purple-600' },
  { name: 'Groceries', icon: Utensils, color: 'bg-yellow-100 text-yellow-600' },
  { name: 'Accessories', icon: ShoppingBag, color: 'bg-teal-100 text-teal-600' },
];

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
    title: 'Mega Sale Event',
    subtitle: 'Up to 70% off on all categories',
    cta: 'Shop Now',
    color: 'from-orange-500 to-red-600'
  },
  {
    image: 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&w=1200&q=80',
    title: 'Tech Upgrade',
    subtitle: 'Latest gadgets at unbeatable prices',
    cta: 'Explore Tech',
    color: 'from-blue-600 to-indigo-700'
  },
  {
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    title: 'Fashion Week',
    subtitle: 'New arrivals for the season',
    cta: 'View Collection',
    color: 'from-pink-500 to-purple-600'
  }
];

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ h: 12, m: 45, s: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format = (n) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-2">
      <div className="bg-primary text-white font-bold px-2 py-1 rounded text-sm">{format(timeLeft.h)}</div>
      <span className="font-bold text-primary">:</span>
      <div className="bg-primary text-white font-bold px-2 py-1 rounded text-sm">{format(timeLeft.m)}</div>
      <span className="font-bold text-primary">:</span>
      <div className="bg-primary text-white font-bold px-2 py-1 rounded text-sm">{format(timeLeft.s)}</div>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*, vendors(business_name)')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (!error) setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();

    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(slideInterval);
  }, []);

  const handleCategoryClick = (catName) => {
    navigate(`/products?category=${encodeURIComponent(catName)}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[300px] md:h-[450px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 flex items-center ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="absolute inset-0 bg-black/20 z-10" />
            <img src={slide.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-12 w-full">
              <div className={`inline-block px-4 py-8 md:px-12 md:py-16 rounded-3xl bg-gradient-to-br ${slide.color} text-white shadow-2xl backdrop-blur-sm bg-opacity-90`}>
                <h1 className="text-3xl md:text-6xl font-black mb-2 tracking-tighter uppercase italic leading-none">{slide.title}</h1>
                <p className="text-lg md:text-xl font-medium opacity-90 mb-6">{slide.subtitle}</p>
                <button className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 w-fit">
                  {slide.cta} <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-3 h-3 rounded-full transition-all ${i === currentSlide ? 'bg-primary w-8' : 'bg-white/50'}`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors hidden md:block"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors hidden md:block"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
        {/* Category Strip */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {categories.map(cat => (
            <div
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className={`w-14 h-14 md:w-16 md:h-16 ${cat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:-translate-y-1 group-hover:shadow-md`}>
                <cat.icon className="h-7 w-7 md:h-8 md:w-8" />
              </div>
              <span className="text-xs font-bold text-gray-700 text-center">{cat.name}</span>
            </div>
          ))}
        </div>

        {/* Flash Sale */}
        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-primary text-xl md:text-2xl font-black italic uppercase tracking-tighter">
                <Zap className="h-7 w-7 fill-current" />
                <h2>Flash Sale</h2>
              </div>
              <div className="hidden sm:flex items-center gap-3 ml-4">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Ending In:</span>
                <CountdownTimer />
              </div>
            </div>
            <button className="text-primary font-black flex items-center gap-1 hover:gap-2 transition-all text-sm md:text-base">
              SHOP ALL <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-3">
                  <div className="bg-gray-200 aspect-square rounded-xl" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {products.slice(0, 6).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Promo Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden group h-48 flex items-center">
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-1">Mobile Week</h3>
              <p className="opacity-80 text-sm mb-4">Latest smartphones with gifts</p>
              <button className="bg-white text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase">Explore</button>
            </div>
            <Smartphone className="absolute -right-4 -bottom-4 h-32 w-32 opacity-20 transform -rotate-12 group-hover:scale-110 transition-transform" />
          </div>
          <div className="bg-purple-600 rounded-3xl p-8 text-white relative overflow-hidden group h-48 flex items-center">
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-1">New Arrivals</h3>
              <p className="opacity-80 text-sm mb-4">Check out latest collection</p>
              <button className="bg-white text-purple-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase">View New</button>
            </div>
            <Gift className="absolute -right-4 -bottom-4 h-32 w-32 opacity-20 transform -rotate-12 group-hover:scale-110 transition-transform" />
          </div>
          <div className="bg-green-600 rounded-3xl p-8 text-white relative overflow-hidden group h-48 flex items-center">
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-1">Home Decor</h3>
              <p className="opacity-80 text-sm mb-4">Redesign your living space</p>
              <button className="bg-white text-green-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase">Shop Decor</button>
            </div>
            <HomeIcon className="absolute -right-4 -bottom-4 h-32 w-32 opacity-20 transform -rotate-12 group-hover:scale-110 transition-transform" />
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-secondary tracking-tight">Just For You</h2>
            <button className="text-gray-400 font-bold hover:text-primary transition-colors">View More</button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-3">
                  <div className="bg-gray-200 aspect-square rounded-xl" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
              {products.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <p className="text-gray-500 font-bold">No products listed yet.</p>
                  <p className="text-gray-400 text-sm">Products listed by approved vendors will appear here.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
