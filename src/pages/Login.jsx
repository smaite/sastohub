import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShoppingBag, ShieldCheck, Zap } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate('/');
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) setError(error.message);
  };

  return (
    <div className="h-screen flex items-stretch bg-white font-sans text-secondary overflow-hidden">
      {/* Left Side: Decorative & Info (Hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 bg-[#0a0a0a] relative overflow-hidden flex-col justify-between p-12 xl:p-16">
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-[400px] h-[400px] rounded-full bg-primary blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-orange-600 blur-[80px] opacity-50"></div>
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
              <ShoppingBag className="text-white h-6 w-6" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">SastoHub</span>
          </Link>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] mb-6 italic uppercase tracking-tighter">
            Elevate Your <br />
            <span className="text-primary text-glow">Shopping</span> <br />
            Experience.
          </h1>
          <p className="text-gray-400 text-lg font-medium leading-relaxed mb-8 max-w-sm">
            Step into Nepal's premium digital marketplace. Quality products, verified sellers.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-white/90">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 backdrop-blur-md">
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em]">Secure Payments</span>
            </div>
            <div className="flex items-center gap-4 text-white/90">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 backdrop-blur-md">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em]">24-Hour Dispatch</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
          Premium Marketplace Experience
        </div>
      </div>

      {/* Right Side: Login Form (Independently Scrollable) */}
      <div className="flex-1 flex flex-col p-6 md:p-12 lg:p-16 bg-white overflow-y-auto">
        <div className="w-full max-w-md mx-auto my-auto py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-secondary">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <ShoppingBag className="text-white h-6 w-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter">SastoHub</span>
            </Link>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter">Welcome Back</h2>
            <p className="text-gray-400 font-bold text-[10px] tracking-widest uppercase">Authorized Access Required</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl flex items-center gap-4 text-xs font-bold mb-6 shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-[16px] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Password</label>
                <Link to="/forgot-password" title="Coming soon" className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:underline">Reset?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-[16px] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm shadow-inner"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary text-white py-4 rounded-[16px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-secondary/30 hover:bg-black hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>SIGN IN <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center px-2">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-[9px] uppercase font-black text-gray-300">
              <span className="bg-white px-4 tracking-[0.3em]">Identity Hub</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 py-3 border-2 border-gray-50 rounded-2xl hover:bg-gray-50 hover:border-gray-100 transition-all font-black text-[10px] uppercase tracking-widest text-secondary"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-4 w-4" alt="G" /> Google
            </button>
            <button className="flex items-center justify-center gap-3 py-3 border-2 border-gray-50 rounded-2xl hover:bg-gray-50 hover:border-gray-100 transition-all font-black text-[10px] uppercase tracking-widest text-secondary">
              <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="h-4 w-4" alt="F" /> Facebook
            </button>
          </div>

          <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest mt-8">
            New here?{' '}
            <Link to="/signup" className="text-primary hover:underline italic">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
