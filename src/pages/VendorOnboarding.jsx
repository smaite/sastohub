import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Clock, Store, Phone, MapPin } from 'lucide-react';

export default function VendorOnboarding() {
  const { user } = useAuthStore();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ business_name: '', description: '', phone: '', address: '', pan_vat: '' });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { setError('Please log in first.'); return; }
    setLoading(true); setError('');
    const { data: existing } = await supabase.from('vendors').select('id').eq('owner_id', user.id).single();
    if (existing) { setError('You already submitted an application.'); setLoading(false); return; }
    const { error: insertError } = await supabase.from('vendors').insert({
      owner_id: user.id, business_name: form.business_name, description: form.description, status: 'pending',
    });
    if (insertError) setError(insertError.message);
    else setSubmitted(true);
    setLoading(false);
  };

  if (submitted) return (
    <div className='min-h-[70vh] flex items-center justify-center px-4'>
      <div className='max-w-md w-full text-center'>
        <div className='w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6'>
          <Clock className='h-10 w-10 text-yellow-500' />
        </div>
        <h2 className='text-2xl font-black text-secondary mb-3'>Application Submitted!</h2>
        <p className='text-gray-500 mb-6'>Your vendor application is under review. Our team will notify you within <strong>24-48 hours</strong>.</p>
        <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-left text-sm text-yellow-800'>
          <p className='font-bold mb-2'>What happens next?</p>
          <ul className='space-y-1 list-disc list-inside'>
            <li>Admin reviews your application</li>
            <li>Once approved, you can start adding products</li>
            <li>You will receive seller access on approval</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className='max-w-2xl mx-auto px-4 py-12'>
      <div className='text-center mb-10'>
        <div className='w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4'>
          <Store className='h-8 w-8 text-primary' />
        </div>
        <h1 className='text-3xl font-black text-secondary'>Apply to Sell on SastoHub</h1>
        <p className='text-gray-500 mt-2'>Fill in your business details. Our admin team will review and approve your application.</p>
      </div>
      {error && <div className='bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm font-medium'>{error}</div>}
      <form onSubmit={handleSubmit} className='bg-white rounded-2xl border shadow-sm p-8 space-y-5'>
        <div>
          <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Business Name *</label>
          <input name='business_name' required value={form.business_name} onChange={handleChange} placeholder='e.g. Kathmandu Electronics' className='w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-200 focus:border-primary outline-none' />
        </div>
        <div>
          <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Business Description *</label>
          <textarea name='description' required value={form.description} onChange={handleChange} rows={3} placeholder='What products do you sell?' className='w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-200 focus:border-primary outline-none resize-none' />
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Phone Number *</label>
            <input name='phone' required type='tel' value={form.phone} onChange={handleChange} placeholder='98XXXXXXXX' className='w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-200 focus:border-primary outline-none' />
          </div>
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-1.5'>PAN / VAT Number</label>
            <input name='pan_vat' value={form.pan_vat} onChange={handleChange} placeholder='Optional' className='w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-200 focus:border-primary outline-none' />
          </div>
        </div>
        <div>
          <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Business Address *</label>
          <input name='address' required value={form.address} onChange={handleChange} placeholder='e.g. New Road, Kathmandu' className='w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-200 focus:border-primary outline-none' />
        </div>
        <p className='bg-gray-50 rounded-xl p-4 text-sm text-gray-500'>By submitting, you agree to SastoHub seller terms. Applications are reviewed within 24-48 hours.</p>
        <button type='submit' disabled={loading} className='w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors disabled:opacity-50'>
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}