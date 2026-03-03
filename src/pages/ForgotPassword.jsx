import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, ShoppingBag } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) setError(error.message);
    else setMessage('Check your email for the password reset link.');
    setLoading(false);
  };

  return (
    <div className="h-screen flex items-stretch bg-white font-sans text-secondary overflow-hidden">
      {/* Left Side: Decorative (Matching Login/Signup) */}
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
            Secure Your <br />
            <span className="text-primary">Account</span> <br />
            Easily.
          </h1>
          <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-sm">
            Don't worry, it happens. Just enter your email and we'll get you back on track.
          </p>
        </div>

        <div className="relative z-10 text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
          Premium Security Features
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col p-6 md:p-12 lg:p-16 bg-white overflow-y-auto">
        <div className="w-full max-w-md mx-auto my-auto py-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors text-xs font-black uppercase tracking-widest mb-12 group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Sign In
          </Link>

          <div className="space-y-2 mb-8">
            <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-secondary">Reset Password</h2>
            <p className="text-gray-400 font-bold text-[10px] tracking-widest uppercase leading-loose">Enter your email to receive a recovery link</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl flex items-center gap-4 text-xs font-bold mb-6 shadow-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-xl flex items-center gap-4 text-xs font-bold mb-6 shadow-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-6">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary text-white py-4 rounded-[16px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-secondary/30 hover:bg-black hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>SEND RECOVERY LINK <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
