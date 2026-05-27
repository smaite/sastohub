import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Vendors from './pages/Vendors';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import OrderSuccess from './pages/OrderSuccess';
import Wishlist from './pages/Wishlist';
import VendorDashboard from './pages/VendorDashboard';
import VendorOnboarding from './pages/VendorOnboarding';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import AdminDashboard from './pages/AdminDashboard';
import AuthDebugger from './components/AuthDebugger';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuthStore();

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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!profile || !allowedRoles.includes(profile.role))) {
    return <Navigate to="/" replace />;
  }

  return children;
}

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
      // Force refresh by selecting directly from the table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      console.log('Fetched Profile Role:', data?.role);
      setProfile(data);
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
        {/* Auth Pages (Standalone) */}
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />

        {/* Main App Pages (With Navbar & Footer) */}
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="products" element={<Products />} />
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
          <Route path="wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

          {/* Vendor Routes */}
          <Route path="vendor">
            <Route path="dashboard" element={<ProtectedRoute allowedRoles={['seller']}><VendorDashboard /></ProtectedRoute>} />
            <Route path="onboarding" element={<ProtectedRoute allowedRoles={['buyer']}><VendorOnboarding /></ProtectedRoute>} />
            <Route path="add-product" element={<ProtectedRoute allowedRoles={['seller']}><AddProduct /></ProtectedRoute>} />
            <Route path="edit-product/:id" element={<ProtectedRoute allowedRoles={['seller']}><EditProduct /></ProtectedRoute>} />
          </Route>

          {/* Admin Routes */}
          <Route path="admin">
            <Route path="dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          </Route>

          {/* 404 fallback */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center py-40 text-center px-4">
              <p className="text-8xl font-black text-gray-200 mb-4">404</p>
              <h2 className="text-2xl font-bold text-surface-900 mb-2">Page Not Found</h2>
              <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
              <a href="/" className="bg-primary-600 text-white px-6 py-3 rounded-full font-bold hover:bg-primary-700 transition-colors">Go Home</a>
            </div>
          } />
        </Route>
      </Routes>
      <AuthDebugger />
    </BrowserRouter>
  );
}

export default App;
