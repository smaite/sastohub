import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Shield, User, Database, RefreshCcw, X } from 'lucide-react';

export default function AuthDebugger() {
  const { user, profile, setProfile } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastError, setLastError] = useState(null);

  const forceRefresh = async () => {
    if (!user) return;
    setIsRefreshing(true);
    setLastError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Debug Refresh Error:', error);
        setLastError(error.message);
      } else if (!data) {
        setLastError('No record found for this ID');
      } else {
        setProfile(data);
      }
    } catch (err) {
      setLastError(err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[9999] bg-secondary text-white p-3 rounded-full shadow-2xl hover:bg-primary transition-all flex items-center gap-2 font-bold text-xs border-2 border-white"
      >
        <Shield className="h-4 w-4" /> AUTH DEBUG
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-80 bg-white rounded-2xl shadow-2xl border-2 border-secondary overflow-hidden flex flex-col animate-slide-up">
      <div className="bg-secondary p-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span className="font-black text-xs uppercase tracking-widest">Auth Debugger</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* User Info */}
        <div className="space-y-1">
          <p className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
            <User className="h-3 w-3" /> Supabase User
          </p>
          <div className="bg-gray-50 p-2 rounded-lg border text-[11px] font-mono break-all">
            {user ? (
              <>
                <p className="text-secondary font-bold">{user.email}</p>
                <p className="text-gray-400 mt-1">ID: {user.id}</p>
              </>
            ) : (
              <p className="text-red-500 font-bold italic text-center py-1">Not Logged In</p>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="space-y-1">
          <p className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
            <Database className="h-3 w-3" /> Profiles Table
          </p>
          <div className="bg-gray-50 p-2 rounded-lg border text-[11px] font-mono">
            {lastError ? (
              <div className="p-2 bg-red-50 text-red-600 rounded border border-red-100 mb-2 font-bold break-words">
                ERROR: {lastError}
              </div>
            ) : null}
            {profile ? (
              <div className="space-y-1">
                <p className="flex justify-between items-center">
                  <span className="text-gray-400 uppercase text-[9px]">Role:</span>
                  <span className={`font-black px-2 py-0.5 rounded text-[10px] ${
                    profile.role === 'admin' ? 'bg-purple-600 text-white' :
                    profile.role === 'seller' ? 'bg-green-600 text-white' :
                    'bg-blue-600 text-white'
                  }`}>
                    {profile.role?.toUpperCase() || 'NULL'}
                  </span>
                </p>
                <p className="flex justify-between items-center pt-1 border-t border-gray-200">
                  <span className="text-gray-400 uppercase text-[9px]">Name:</span>
                  <span className="font-bold text-secondary truncate ml-2">{profile.full_name || 'NULL'}</span>
                </p>
              </div>
            ) : (
              <p className="text-red-500 font-bold italic text-center py-1">No Profile Loaded</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={forceRefresh}
            disabled={!user || isRefreshing}
            className="w-full bg-secondary text-white py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition-all"
          >
            <RefreshCcw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'REFRESHING...' : 'FORCE REFRESH PROFILE'}
          </button>

          {!profile && user && (
            <button
              onClick={async () => {
                setIsRefreshing(true);
                const { error } = await supabase.from('profiles').upsert({
                  id: user.id,
                  full_name: 'Muhammad Omar',
                  role: 'admin'
                });
                if (error) setLastError(error.message);
                else await forceRefresh();
                setIsRefreshing(false);
              }}
              className="w-full bg-red-600 text-white py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg"
            >
              REPAIR/CREATE ADMIN PROFILE
            </button>
          )}
        </div>

        <p className="text-[9px] text-center text-gray-400 italic">
          Tip: If role is not 'admin', manually update it in Supabase table 'profiles' for ID above.
        </p>
      </div>
    </div>
  );
}
