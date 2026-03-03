import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a session (Supabase automatically handles the token from URL)
    supabase.auth.onAuthStateChange(async (event) => {
      if (event !== "PASSWORD_RECOVERY") {
        // If not in recovery mode, they shouldn't be here unless they just clicked the link
        const { data } = await supabase.auth.getSession();
        if (!data.session) navigate('/login');
      }
    });
  }, [navigate]);

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      alert('Password updated successfully! Please login with your new password.');
      await supabase.auth.signOut();
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div className="h-screen flex items-stretch bg-white font-sans text-secondary overflow-hidden">
      {/* Left Side: Decorative */}
      <div className="hidden lg:flex w-1/2 bg-[#0a0a0a] relative overflow-hidden flex-col justify-between p-12 xl:p-16">
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none text-secondary">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600 blur-[100px] opacity-40"></div>
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group text-secondary">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
              <ShoppingBag className="text-white h-7 w-7" />
            </div>
            <span className="text-3xl font-black text-white tracking-tighter">SastoHub</span>
          </Link>
        </div>

        <div className="relative z-10">
          <h1 className="text-6xl font-black text-white leading-[1.1] mb-8 italic uppercase tracking-tighter">
            Account <br />
            <span className="text-primary text-glow">Restored.</span>
          </h1>
          <p className="text-gray-400 text-xl font-medium leading-relaxed mb-12">
            Set a new secure password to regain access to your SastoHub account and continue your journey.
          </p>
        </div>

        <div className="relative z-10 text-gray-600 text-xs font-black uppercase tracking-[0.3em]">
          Identity Security Protocol
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-10 my-auto">
          <div className="space-y-2 text-secondary">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">New Password</h2>
            <p className="text-gray-400 font-bold text-sm tracking-wide uppercase">Secure your account with a strong password</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-2xl flex items-center gap-4 text-sm font-bold shadow-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">New Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-secondary placeholder:text-gray-300 shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-secondary placeholder:text-gray-300 shadow-inner"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-secondary/30 hover:bg-black hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>UPDATE PASSWORD <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest pt-4">
            Remembered your password?{' '}
            <Link to="/login" className="text-primary font-black hover:underline decoration-2 underline-offset-4 italic">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
