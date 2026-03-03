import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, User, Search, LogOut, LayoutDashboard,
  ChevronDown, MapPin, Phone, Bell, Heart, Package
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

const categories = [
  'Electronics', 'Fashion', 'Home & Living', 'Sports', 'Beauty',
  'Books', 'Toys', 'Groceries', 'Mobiles', 'Appliances',
];

export default function Navbar() {
  const { user, profile, signOut } = useAuthStore();
  const { items } = useCartStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
    } else if (selectedCategory !== 'All Categories') {
      navigate(`/products?category=${encodeURIComponent(selectedCategory)}`);
    }
  };

  const handleCategoryClick = (cat) => {
    navigate(`/products?category=${encodeURIComponent(cat)}`);
  };

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Top bar */}
      <div className="bg-primary text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> 01-XXXXXXX</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Deliver to: Kathmandu</span>
          </div>
          <div className="flex items-center gap-4">
            {(!user || profile?.role === 'buyer') && (
              <>
                <Link to="/vendors" className="hover:underline">Sell on SastoHub</Link>
                <span>|</span>
              </>
            )}
            <span>Help</span>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="bg-white py-3 px-4 border-b">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-black text-primary tracking-tight">SastoHub</span>
              <span className="text-[10px] text-gray-400 tracking-widest uppercase ml-0.5">Nepal's Marketplace</span>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex flex-1 max-w-2xl mx-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-r-0 border-gray-300 rounded-l-full px-3 py-2 text-sm bg-gray-50 outline-none text-gray-600 hidden md:block cursor-pointer"
            >
              <option>All Categories</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for products, brands and more..."
              className="flex-1 border border-gray-300 px-4 py-2 text-sm outline-none focus:border-primary"
            />
            <button type="submit" className="bg-primary text-white px-5 py-2 rounded-r-full hover:bg-orange-600 transition-colors">
              <Search className="h-5 w-5" />
            </button>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-5 flex-shrink-0">
            {/* Account */}
            {user ? (
              <div className="flex flex-col items-center group relative cursor-pointer">
                <User className="h-6 w-6 text-gray-600" />
                <span className="text-xs text-gray-600 mt-0.5 font-medium hidden sm:block truncate max-w-[70px]">
                  {profile?.full_name?.split(' ')[0] || 'Account'}
                </span>
                {/* Dropdown */}
                <div className="absolute top-10 right-0 bg-white border rounded-xl shadow-xl py-2 w-48 hidden group-hover:block z-50">
                  <div className="px-4 py-2 border-b mb-1">
                    <p className="font-bold text-sm text-secondary truncate">{profile?.full_name || user.email}</p>
                    <p className="text-xs text-gray-400 capitalize">{profile?.role}</p>
                  </div>
                  <Link to="/orders" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                    <Package className="h-4 w-4" /> My Orders
                  </Link>
                  {profile?.role === 'seller' && (
                    <Link to="/vendor/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                      <LayoutDashboard className="h-4 w-4" /> Seller Dashboard
                    </Link>
                  )}
                  {profile?.role === 'admin' && (
                    <Link to="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-purple-600 font-semibold">
                      <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                    </Link>
                  )}
                  <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-500">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="flex flex-col items-center">
                <User className="h-6 w-6 text-gray-600" />
                <span className="text-xs text-gray-600 mt-0.5 font-medium hidden sm:block">Login</span>
              </Link>
            )}

            {/* Wishlist */}
            <Link to="/wishlist" className="flex flex-col items-center">
              <Heart className="h-6 w-6 text-gray-600" />
              <span className="text-xs text-gray-600 mt-0.5 hidden sm:block">Wishlist</span>
            </Link>

            {/* Cart */}
            <Link to="/cart" className="flex flex-col items-center relative">
              <div className="relative">
                <ShoppingCart className="h-6 w-6 text-gray-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-600 mt-0.5 hidden sm:block">Cart</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Category nav bar */}
      <div className="bg-secondary text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 px-4 py-2.5 font-semibold whitespace-nowrap hover:bg-white/10 border-r border-white/10"
          >
            ☰ All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className="px-3 py-2.5 whitespace-nowrap hover:bg-white/10 transition-colors text-gray-200"
            >
              {cat}
            </button>
          ))}
          {(!user || profile?.role === 'buyer') && (
            <Link to="/vendors" className="ml-auto px-4 py-2.5 text-yellow-400 font-semibold whitespace-nowrap hover:underline">
              Become a Seller →
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
