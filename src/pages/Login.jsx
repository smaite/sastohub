import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Key, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true, // Automatically registers new users
        emailRedirectTo: window.location.origin,
      }
    });

    if (error) {
      setError(error.message);
    } else {
      setStep('otp');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) setError(error.message);
  };

  return (
    <div className="h-screen flex items-stretch bg-white font-sans text-secondary overflow-hidden">
      {/* Left Side: Decorative & Info */}
      <div className="hidden lg:flex w-1/2 bg-[#0a0a0a] relative overflow-hidden flex-col justify-between p-12 xl:p-16">
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none text-secondary">
          <div className="absolute -top-24 -right-24 w-[400px] h-[400px] rounded-full bg-primary blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-orange-600 blur-[80px] opacity-50"></div>
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group text-white">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20 text-white border-none">
              <ShoppingBag className="text-white h-6 w-6" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter uppercase italic">SastoHub</span>
          </Link>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] mb-6 italic uppercase tracking-tighter">
            Instant <br />
            <span className="text-primary">OTP</span> <br />
            Access.
          </h1>
          <p className="text-gray-400 text-lg font-medium leading-relaxed mb-8 max-w-sm">
            Experience Nepal's premium marketplace with secure, passwordless entry.
          </p>

          <div className="flex items-center gap-4 text-white/90">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 backdrop-blur-md">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em]">Verified Secure</span>
          </div>
        </div>

        <div className="relative z-10 text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
          Powered by SastoHub Identity
        </div>
      </div>

      {/* Right Side: OTP Form (Scrollable) */}
      <div className="flex-1 flex flex-col p-6 md:p-12 lg:p-16 bg-white overflow-y-auto scrollbar-hide">
        <div className="w-full max-w-md mx-auto my-auto py-8 text-secondary">
          <div className="lg:hidden mb-12">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center border-none">
                <ShoppingBag className="text-white h-6 w-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase italic">SastoHub</span>
            </Link>
          </div>

          <div className="space-y-2 mb-10 text-secondary">
            <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter">
              {step === 'email' ? 'Sign In' : 'Verify Code'}
            </h2>
            <p className="text-gray-400 font-bold text-[10px] tracking-widest uppercase leading-loose">
              {step === 'email'
                ? 'ENTER YOUR EMAIL TO RECEIVE A LOGIN CODE'
                : `A 6-DIGIT CODE HAS BEEN SENT TO ${email.toUpperCase()}`}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-3 rounded-2xl flex items-center gap-4 text-xs font-bold mb-8 shadow-sm">
              {error}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-1.5 text-secondary">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[20px] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm shadow-inner text-secondary"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary text-white py-4 rounded-[20px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-secondary/30 hover:bg-black hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>SEND LOGIN CODE <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-1.5 text-secondary">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 text-center block">6-Digit Code</label>
                <div className="relative group">
                  <Key className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[20px] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-black text-xl tracking-[0.6em] text-center shadow-inner text-secondary"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-[20px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:bg-orange-600 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>VERIFY & ENTER <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-center text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors pt-2"
              >
                Edit Email Address
              </button>
            </form>
          )}

          <div className="relative py-8">
            <div className="absolute inset-0 flex items-center px-2">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-[9px] uppercase font-black text-gray-300">
              <span className="bg-white px-6 tracking-[0.3em]">Express Access</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 py-4 border-2 border-gray-50 rounded-2xl hover:bg-gray-50 hover:border-gray-100 transition-all font-black text-[10px] uppercase tracking-widest text-secondary"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-4 w-4" alt="G" /> Google
            </button>
            <button className="flex items-center justify-center gap-3 py-4 border-2 border-gray-50 rounded-2xl hover:bg-gray-50 hover:border-gray-100 transition-all font-black text-[10px] uppercase tracking-widest text-secondary">
              <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="h-4 w-4" alt="F" /> Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
