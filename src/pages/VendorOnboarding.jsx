import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function VendorOnboarding() {
  const { user } = useAuthStore();
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('vendors')
      .insert({
        owner_id: user.id,
        business_name: businessName,
        description: description,
        status: 'active' // For MVP, auto-activate
      });

    if (error) {
      alert(error.message);
    } else {
      // Also update profile role just in case
      await supabase.from('profiles').update({ role: 'seller' }).eq('id', user.id);
      navigate('/vendor/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-20 p-8 bg-white rounded-xl shadow-sm border">
      <h1 className="text-3xl font-bold mb-2">Vendor Onboarding</h1>
      <p className="text-gray-500 mb-8">Tell us about your business to start selling.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Business Name</label>
          <input
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-1 focus:ring-primary outline-none"
            placeholder="e.g. Kathmandu Electronics"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Business Description</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-1 focus:ring-primary outline-none h-32"
            placeholder="Describe what you sell..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Launch My Shop'}
        </button>
      </form>
    </div>
  );
}
