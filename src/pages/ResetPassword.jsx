import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Lock, ArrowRight, ShoppingBag, ShieldCheck, Key, Mail } from 'lucide-react';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  // Try to get email from navigation state (passed from ForgotPassword)
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState('verify'); // 'verify' or 'new-password'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'recovery',
    });

    if (error) {
      setError(error.message);
    } else {
      setStep('new-password');
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
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
      alert('Password updated successfully! Redirecting to login...');
      await supabase.auth.signOut();
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div className="h-screen flex items-stretch bg-white font-sans text-secondary overflow-hidden">
      {/* Left Side: Decorative */}
      <div className="hidden lg:flex w-1/2 bg-[#0a0a0a] relative overflow-hidden flex-col justify-between p-12 xl:p-16 text-white">
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none text-secondary">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600 blur-[100px] opacity-40"></div>
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group text-white">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20 text-white border-none">
              <ShoppingBag className="text-white h-6 w-6" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">SastoHub</span>
          </Link>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] mb-6 italic uppercase tracking-tighter">
            Security <br />
            <span className="text-primary text-glow">Restored.</span>
          </h1>
          <p className="text-gray-400 text-lg font-medium leading-relaxed mb-8 max-w-sm">
            Verify your recovery code and set a new secure password.
          </p>
        </div>

        <div className="relative z-10 text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
          Identity Security Protocol
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col p-6 md:p-12 lg:p-16 bg-white overflow-y-auto scrollbar-hide text-secondary">
        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="space-y-2 mb-10">
            <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter">
              {step === 'verify' ? 'Verification' : 'New Password'}
            </h2>
            <p className="text-gray-400 font-bold text-[10px] tracking-widest uppercase leading-loose">
              {step === 'verify' ? 'Enter the 8-digit code from your email' : 'Secure your account with a strong password'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl flex items-center gap-4 text-xs font-bold mb-8">
              {error}
            </div>
          )}

          {step === 'verify' ? (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[16px] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Recovery Code</label>
                <div className="relative group">
                  <Key className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="••••••••"
                    maxLength={8}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[16px] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-black text-2xl tracking-[0.8em] text-center shadow-inner placeholder:tracking-normal placeholder:opacity-30"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary text-white py-4 rounded-[16px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-secondary/30 hover:bg-black hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>VERIFY CODE <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-[16px] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-[16px] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm shadow-inner"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-[16px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:bg-orange-600 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>UPDATE PASSWORD <ShieldCheck className="h-4 w-4" /></>
                )}
              </button>
            </form>
          )}

          <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest mt-12">
            Back to{' '}
            <Link to="/login" className="text-primary hover:underline italic">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
