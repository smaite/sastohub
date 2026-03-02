import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Plus, Package, ShoppingBag, Clock, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VendorDashboard() {
  const { user } = useAuthStore();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchVendorData(); }, [user]);

  async function fetchVendorData() {
    setLoading(true);
    const { data: v } = await supabase.from('vendors').select('*').eq('owner_id', user.id).single();
    if (v) {
      setVendor(v);
      const { data: p } = await supabase.from('products').select('*').eq('vendor_id', v.id);
      setProducts(p || []);
    }
    setLoading(false);
  }

  if (loading) return <div className='p-10 text-center text-gray-500'>Loading...</div>;

  if (!vendor) return (
    <div className='max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-sm border text-center'>
      <h2 className='text-2xl font-bold mb-4'>Become a Seller</h2>
      <p className='text-gray-600 mb-8'>You have not applied to sell on SastoHub yet.</p>
      <Link to='/vendor/onboarding' className='bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600'>Apply Now</Link>
    </div>
  );

  if (vendor.status === 'pending') return (
    <div className='min-h-[70vh] flex items-center justify-center px-4'>
      <div className='max-w-md w-full text-center'>
        <div className='w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6'>
          <Clock className='h-10 w-10 text-yellow-500' />
        </div>
        <h2 className='text-2xl font-black text-secondary mb-3'>Application Pending</h2>
        <p className='text-gray-500 mb-2'>Your application for <strong>{vendor.business_name}</strong> is under review.</p>
        <p className='text-gray-400 text-sm'>You will be notified once approved. Usually 24-48 hours.</p>
      </div>
    </div>
  );

  if (vendor.status === 'suspended') return (
    <div className='min-h-[70vh] flex items-center justify-center px-4'>
      <div className='max-w-md w-full text-center'>
        <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6'>
          <XCircle className='h-10 w-10 text-red-500' />
        </div>
        <h2 className='text-2xl font-black text-secondary mb-3'>Account Suspended</h2>
        <p className='text-gray-500'>Your vendor account has been suspended. Please contact support.</p>
      </div>
    </div>
  );

  return (
    <div className='max-w-7xl mx-auto px-4 py-10'>
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>{vendor.business_name}</h1>
          <p className='text-gray-500 text-sm mt-0.5'>Vendor Dashboard</p>
        </div>
        <Link to='/vendor/add-product' className='bg-primary text-white flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold hover:bg-orange-600'>
          <Plus className='h-5 w-5' /> Add Product
        </Link>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-10'>
        <div className='bg-white p-6 rounded-xl border shadow-sm'>
          <div className='flex items-center gap-3 text-primary mb-3'><Package className='h-5 w-5' /><span className='font-bold text-gray-700 text-sm'>Total Products</span></div>
          <p className='text-3xl font-black'>{products.length}</p>
        </div>
        <div className='bg-white p-6 rounded-xl border shadow-sm'>
          <div className='flex items-center gap-3 text-green-600 mb-3'><ShoppingBag className='h-5 w-5' /><span className='font-bold text-gray-700 text-sm'>Orders</span></div>
          <p className='text-3xl font-black'>0</p>
        </div>
        <div className='bg-white p-6 rounded-xl border shadow-sm'>
          <div className='flex items-center gap-3 text-blue-600 mb-3'><Package className='h-5 w-5' /><span className='font-bold text-gray-700 text-sm'>Status</span></div>
          <span className='inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold capitalize'>{vendor.status}</span>
        </div>
      </div>
      <h2 className='text-xl font-bold mb-4'>Your Products</h2>
      <div className='bg-white rounded-xl border shadow-sm overflow-hidden'>
        <table className='w-full text-left'>
          <thead className='bg-gray-50 border-b'>
            <tr>
              <th className='px-6 py-4 font-bold text-gray-600 text-sm'>Product</th>
              <th className='px-6 py-4 font-bold text-gray-600 text-sm'>Price</th>
              <th className='px-6 py-4 font-bold text-gray-600 text-sm'>Stock</th>
              <th className='px-6 py-4 font-bold text-gray-600 text-sm'>Status</th>
            </tr>
          </thead>
          <tbody className='divide-y'>
            {products.map((p) => (
              <tr key={p.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 flex items-center gap-3'>
                  <div className='w-10 h-10 bg-gray-100 rounded flex-shrink-0 overflow-hidden'>
                    {p.images?.[0] && <img src={p.images[0]} alt='' className='w-full h-full object-cover' />}
                  </div>
                  <span className='font-medium text-sm'>{p.name}</span>
                </td>
                <td className='px-6 py-4 text-primary font-bold text-sm'>Rs. {p.price}</td>
                <td className='px-6 py-4 text-sm'>{p.stock_quantity}</td>
                <td className='px-6 py-4'>
                  <span className={p.is_published ? 'px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700' : 'px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700'}>
                    {p.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan='4' className='px-6 py-10 text-center text-gray-500 text-sm'>No products yet. <Link to='/vendor/add-product' className='text-primary font-bold'>Add your first product</Link></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}