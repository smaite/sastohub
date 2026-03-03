import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Plus, Package, ShoppingBag, Clock, XCircle, ChevronRight, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const tabs = ['Products', 'Orders'];

export default function VendorDashboard() {
  const { user, profile, loading: authLoading } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Products');
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (profile?.role === 'admin') {
        navigate('/admin/dashboard');
      }
    }
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    if (user && profile?.role !== 'admin') {
      fetchVendorData();
    }
  }, [user, profile]);

  async function fetchVendorData() {
    setLoading(true);
    // 1. Get vendor profile
    const { data: v } = await supabase.from('vendors').select('*').eq('owner_id', user.id).single();
    if (v) {
      setVendor(v);

      // 2. Get products and orders in parallel
      const [{ data: p }, { data: o }] = await Promise.all([
        supabase.from('products').select('*').eq('vendor_id', v.id).order('created_at', { ascending: false }),
        supabase.from('order_items').select(`
          *,
          products (name, images),
          orders (
            id,
            created_at,
            shipping_address,
            payment_method,
            payment_status,
            profiles (full_name)
          )
        `).eq('vendor_id', v.id).order('created_at', { ascending: false })
      ]);

      setProducts(p || []);
      setOrders(o || []);
    }
    setLoading(false);
  }

  async function updateItemStatus(itemId, status) {
    setActionLoading(itemId);
    const { error } = await supabase
      .from('order_items')
      .update({ status })
      .eq('id', itemId);

    if (!error) {
      await fetchVendorData();
    }
    setActionLoading('');
  }

  if (loading) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

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
          <h1 className='text-3xl font-black text-secondary'>{vendor.business_name}</h1>
          <p className='text-gray-500 text-sm mt-0.5'>Seller Control Center</p>
        </div>
        <Link to='/vendor/add-product' className='bg-primary text-white flex items-center gap-2 px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-primary/20'>
          <Plus className='h-5 w-5' /> Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-10'>
        <div className='bg-white p-6 rounded-2xl border shadow-sm'>
          <div className='flex items-center gap-3 text-primary mb-3'><Package className='h-5 w-5' /><span className='font-bold text-gray-400 text-xs uppercase tracking-widest'>Total Products</span></div>
          <p className='text-3xl font-black text-secondary'>{products.length}</p>
        </div>
        <div className='bg-white p-6 rounded-2xl border shadow-sm'>
          <div className='flex items-center gap-3 text-green-600 mb-3'><ShoppingBag className='h-5 w-5' /><span className='font-bold text-gray-400 text-xs uppercase tracking-widest'>Total Sales</span></div>
          <p className='text-3xl font-black text-secondary'>{orders.length}</p>
        </div>
        <div className='bg-white p-6 rounded-2xl border shadow-sm'>
          <div className='flex items-center gap-3 text-blue-600 mb-3'><Clock className='h-5 w-5' /><span className='font-bold text-gray-400 text-xs uppercase tracking-widest'>Account Status</span></div>
          <span className='inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold capitalize'>{vendor.status}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="flex border-b">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-8 py-5 font-black text-sm transition-all relative ${
                activeTab === t ? 'text-primary' : 'text-gray-400 hover:text-secondary'
              }`}
            >
              {t}
              {activeTab === t && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === 'Products' && (
          <div className="overflow-x-auto">
            <table className='w-full text-left'>
              <thead className='bg-gray-50 border-b'>
                <tr>
                  <th className='px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider'>Product</th>
                  <th className='px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider'>Price</th>
                  <th className='px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider'>Stock</th>
                  <th className='px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider'>Status</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {products.map((p) => (
                  <tr key={p.id} className='hover:bg-gray-50 transition-colors'>
                    <td className='px-6 py-4 flex items-center gap-4'>
                      <div className='w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden border'>
                        {p.images?.[0] && <img src={p.images[0]} alt='' className='w-full h-full object-cover' />}
                      </div>
                      <span className='font-bold text-secondary text-sm'>{p.name}</span>
                    </td>
                    <td className='px-6 py-4 text-primary font-black text-sm italic'>Rs. {p.price}</td>
                    <td className='px-6 py-4 text-sm font-bold text-gray-600'>{p.stock_quantity} units</td>
                    <td className='px-6 py-4'>
                      <span className={p.is_published ? 'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-700' : 'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-yellow-100 text-yellow-700'}>
                        {p.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan='4' className='px-6 py-20 text-center text-gray-400'>
                      <Package className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="font-bold">No products yet.</p>
                      <Link to='/vendor/add-product' className='text-primary font-black hover:underline mt-1 inline-block text-sm'>Add your first product →</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'Orders' && (
          <div className="overflow-x-auto">
            <table className='w-full text-left'>
              <thead className='bg-gray-50 border-b'>
                <tr>
                  <th className='px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider'>Order / Item</th>
                  <th className='px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider'>Buyer</th>
                  <th className='px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider'>Total</th>
                  <th className='px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider'>Status</th>
                  <th className='px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider text-right'>Action</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {orders.map((item) => (
                  <tr key={item.id} className='hover:bg-gray-50 transition-colors'>
                    <td className='px-6 py-4'>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border">
                          {item.products?.images?.[0] && <img src={item.products.images[0]} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 font-mono mb-0.5">#{item.orders?.id.slice(0,8)}</p>
                          <p className="text-sm font-bold text-secondary truncate max-w-[150px]">{item.products?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <p className="text-sm font-bold text-secondary">{item.orders?.profiles?.full_name}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">{item.orders?.payment_method}</p>
                    </td>
                    <td className='px-6 py-4 text-sm font-black text-secondary italic'>
                      Rs. {item.unit_price * item.quantity}
                      <p className="text-[10px] text-gray-400 not-italic font-medium">Qty: {item.quantity}</p>
                    </td>
                    <td className='px-6 py-4'>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        item.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        item.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                        item.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <select
                        value={item.status}
                        disabled={actionLoading === item.id}
                        onChange={(e) => updateItemStatus(item.id, e.target.value)}
                        className="text-xs font-bold border rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:opacity-50"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan='5' className='px-6 py-20 text-center text-gray-400'>
                      <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="font-bold">No orders yet.</p>
                      <p className="text-sm">When customers buy your products, they will appear here.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}