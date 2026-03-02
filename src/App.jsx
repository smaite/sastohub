import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Vendors from './pages/Vendors';
import VendorDashboard from './pages/VendorDashboard';
import VendorOnboarding from './pages/VendorOnboarding';
import AddProduct from './pages/AddProduct';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';

function App() {
  const { setUser, setProfile, setLoading, profile, loading } = useAuthStore();

  useEffect(() => {
    console.log('App initialized, starting auth check...');

    // Safety timeout: if auth takes too long, stop loading
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('Auth check timed out after 5s, forcing load');
        setLoading(false);
      }
    }, 5000);

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Session fetched:', session ? 'User present' : 'No user');
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch(err => {
      console.error('Session check error:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error) setProfile(data);
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading SastoHub...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="vendors" element={<Vendors />} />

          {/* Vendor Routes */}
          <Route path="vendor">
            <Route path="dashboard" element={<VendorDashboard />} />
            <Route path="onboarding" element={<VendorOnboarding />} />
            <Route path="add-product" element={<AddProduct />} />
          </Route>

          {/* 404 fallback */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center py-40 text-center px-4">
              <p className="text-8xl font-black text-gray-200 mb-4">404</p>
              <h2 className="text-2xl font-bold text-secondary mb-2">Page Not Found</h2>
              <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
              <a href="/" className="bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors">Go Home</a>
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
