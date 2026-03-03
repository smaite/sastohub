import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Users, Store, ShoppingBag, Clock, Package, Eye, X, ExternalLink, MapPin, CreditCard, FileText, CheckCircle, XCircle } from 'lucide-react';

const tabs = ['Vendors', 'Users', 'Orders', 'Categories'];

function StatusBadge({ status }) {
  const map = {
    pending: 'bg-yellow-100 text-yellow-700',
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-red-100 text-red-700',
  };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${map[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
}

function CategoryManager({ categories, onRefresh }) {
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    const slug = newName.toLowerCase().trim().replace(/\s+/g, '-');
    const { error } = await supabase.from('categories').insert({ name: newName.trim(), slug });
    if (!error) {
      setNewName('');
      onRefresh();
    } else {
      alert(error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure? Products in this category will become uncategorized.')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) onRefresh();
    else alert(error.message);
  };

  return (
    <div className="p-6">
      <form onSubmit={handleAdd} className="mb-8 flex gap-3">
        <input
          type="text"
          placeholder="New Category Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-xl outline-none focus:ring-1 focus:ring-primary text-sm font-medium"
          required
        />
        <button
          disabled={loading}
          className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50 transition-all text-xs uppercase tracking-widest"
        >
          {loading ? 'Adding...' : 'Add Category'}
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group transition-all hover:bg-white hover:shadow-sm">
            <div>
              <p className="font-bold text-secondary text-sm">{cat.name}</p>
              <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest mt-0.5">{cat.slug}</p>
            </div>
            <button
              onClick={() => handleDelete(cat.id)}
              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-400 text-sm italic font-medium">
            No categories found. Add one above to get started.
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewModal({ vendor, onClose, onAction, actionLoading }) {
  if (!vendor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md text-secondary">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20">
        <div className="px-8 py-6 border-b flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-secondary uppercase italic tracking-tighter">{vendor.business_name}</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Registration Review</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-secondary">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-10 text-secondary font-sans">
          <div>
            <h3 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">
              <Store className="h-4 w-4 text-primary" /> 1. Shop Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Official Shop Name</p>
                <p className="font-bold text-lg">{vendor.business_name}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Business Website</p>
                {vendor.website ? (
                  <a href={vendor.website} target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline flex items-center gap-1">
                    {vendor.website} <ExternalLink className="h-3 w-3" />
                  </a>
                ) : <p className="text-gray-400 italic text-sm">No website provided</p>}
              </div>
              <div className="md:col-span-2">
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Shop Description</p>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-2xl border border-gray-100">{vendor.description}</p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t text-secondary">
            <h3 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">
              <MapPin className="h-4 w-4 text-primary" /> 2. Operations & Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Physical Address</p>
                <p className="font-bold text-secondary">{vendor.address}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Business Phone</p>
                <p className="font-black text-secondary italic text-lg">{vendor.phone}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">City</p>
                <p className="font-bold">{vendor.city}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">State / Province</p>
                <p className="font-bold">{vendor.state}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Postal Code</p>
                <p className="font-bold font-mono">{vendor.postal_code}</p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t text-secondary">
            <h3 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">
              <CreditCard className="h-4 w-4 text-primary" /> 3. Banking Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Account Holder</p>
                <p className="font-black text-secondary uppercase italic">{vendor.account_holder}</p>
              </div>
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Account Number</p>
                <p className="font-black text-secondary font-mono tracking-wider">{vendor.account_number}</p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t text-secondary">
            <h3 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">
              <FileText className="h-4 w-4 text-primary" /> 4. Legal Documentation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'NID Front', url: vendor.nid_front_url },
                { label: 'NID Back', url: vendor.nid_back_url },
                { label: 'PAN/VAT Card', url: vendor.pan_card_url },
                { label: 'Business Reg.', url: vendor.business_reg_url },
              ].map(doc => (
                <a
                  key={doc.label}
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-5 border-2 border-dashed rounded-2xl hover:border-primary hover:bg-red-50/50 transition-all group text-center bg-gray-50/30"
                >
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary mb-3">{doc.label}</p>
                  <div className="inline-flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest">
                    OPEN FILE <ExternalLink className="h-3.5 w-3.5" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="px-8 py-6 border-t bg-gray-50/50 flex items-center justify-end gap-4">
          <button
            onClick={() => onAction(vendor.id, vendor.owner_id, 'suspended')}
            disabled={actionLoading === vendor.id}
            className="px-8 py-3 bg-white text-red-600 border-2 border-red-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 hover:border-red-200 transition-all disabled:opacity-50"
          >
            Reject Application
          </button>
          <button
            onClick={() => onAction(vendor.id, vendor.owner_id, 'active')}
            disabled={actionLoading === vendor.id}
            className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
          >
            {actionLoading === vendor.id ? 'PROCESSING...' : 'APPROVE VENDOR'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Vendors');
  const [vendors, setVendors] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ vendors: 0, users: 0, orders: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);

  useEffect(() => {
    if (profile && profile.role !== 'admin') { navigate('/'); return; }
    fetchAll();
  }, [profile]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [vRes, uRes, oRes, cRes] = await Promise.all([
        supabase.from('vendors').select('*, profiles(full_name)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*, profiles(full_name)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name', { ascending: true }),
      ]);

      const v = vRes.data || [];
      const u = uRes.data || [];
      const o = oRes.data || [];
      const c = cRes.data || [];

      setVendors(v);
      setUsers(u);
      setOrders(o);
      setCategories(c);

      setStats({
        vendors: v.length,
        users: u.length,
        orders: o.length,
        pending: v.filter(x => x.status === 'pending').length,
      });
    } catch (err) {
      console.error('Admin Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function updateVendorStatus(id, ownerId, status) {
    setActionLoading(id);
    await supabase.from('vendors').update({ status }).eq('id', id);
    if (status === 'active') {
      await supabase.from('profiles').update({ role: 'seller' }).eq('id', ownerId);
    } else if (status === 'suspended') {
      await supabase.from('profiles').update({ role: 'buyer' }).eq('id', ownerId);
    }
    await fetchAll();
    setActionLoading('');
    setSelectedVendor(null);
  }

  async function updateUserRole(id, role) {
    setActionLoading(id);
    await supabase.from('profiles').update({ role }).eq('id', id);
    await fetchAll();
    setActionLoading('');
  }

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className='max-w-7xl mx-auto px-4 py-8 text-secondary font-sans'>
      <div className='mb-8 flex items-end justify-between'>
        <div>
          <h1 className='text-4xl font-black italic uppercase tracking-tighter leading-none'>Platform Control</h1>
          <p className='text-gray-400 font-bold text-[10px] mt-2 uppercase tracking-[0.3em]'>Super Administrator Level Access</p>
        </div>
        <button onClick={fetchAll} className="p-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl hover:bg-gray-100 transition-all text-secondary">
           <Clock className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-6 mb-10'>
        <div className='bg-white rounded-3xl border shadow-sm p-6 relative overflow-hidden group'>
          <div className="absolute -right-4 -bottom-4 text-primary opacity-[0.03] transform rotate-12 group-hover:scale-110 transition-transform"><Store className="h-32 w-32" /></div>
          <p className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Vendors</p>
          <p className='text-4xl font-black italic'>{stats.vendors}</p>
        </div>
        <div className='bg-white rounded-3xl border shadow-sm p-6 relative overflow-hidden group text-yellow-500'>
          <div className="absolute -right-4 -bottom-4 text-yellow-500 opacity-[0.03] transform rotate-12 group-hover:scale-110 transition-transform"><Clock className="h-32 w-32" /></div>
          <p className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Pending</p>
          <p className='text-4xl font-black italic'>{stats.pending}</p>
        </div>
        <div className='bg-white rounded-3xl border shadow-sm p-6 relative overflow-hidden group text-blue-500'>
          <div className="absolute -right-4 -bottom-4 text-blue-500 opacity-[0.03] transform rotate-12 group-hover:scale-110 transition-transform"><Users className="h-32 w-32" /></div>
          <p className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Users</p>
          <p className='text-4xl font-black italic'>{stats.users}</p>
        </div>
        <div className='bg-white rounded-3xl border shadow-sm p-6 relative overflow-hidden group text-green-500'>
          <div className="absolute -right-4 -bottom-4 text-green-500 opacity-[0.03] transform rotate-12 group-hover:scale-110 transition-transform"><ShoppingBag className="h-32 w-32" /></div>
          <p className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Orders</p>
          <p className='text-4xl font-black italic'>{stats.orders}</p>
        </div>
      </div>

      <div className='bg-white rounded-3xl border shadow-sm overflow-hidden'>
        <div className='flex border-b bg-gray-50/30 overflow-x-auto scrollbar-hide'>
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${
                tab === t ? 'text-primary' : 'text-gray-400 hover:text-secondary'
              }`}
            >
              {t}
              {tab === t && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
            </button>
          ))}
        </div>

        {tab === 'Vendors' && (
          <div className="overflow-x-auto">
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className="border-b bg-gray-50/50 text-secondary">
                  <th className='px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400'>Business Entity</th>
                  <th className='px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400'>Legal Owner</th>
                  <th className='px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400'>Joined</th>
                  <th className='px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400'>Status</th>
                  <th className='px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-right'>Action</th>
                </tr>
              </thead>
              <tbody className='divide-y text-secondary'>
                {vendors.map(v => (
                  <tr key={v.id} className='hover:bg-gray-50/50 transition-colors group'>
                    <td className='px-8 py-6'>
                      <p className='font-black text-sm group-hover:text-primary transition-colors'>{v.business_name}</p>
                      <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5'>{v.city}, {v.state}</p>
                    </td>
                    <td className='px-8 py-6'>
                      <p className="text-sm font-bold text-gray-600">{v.profiles?.full_name || 'N/A'}</p>
                      <p className="text-[10px] text-gray-400 font-mono italic uppercase">UID: {v.owner_id?.slice(0,8)}</p>
                    </td>
                    <td className='px-8 py-6 text-[11px] font-black text-gray-400 font-mono'>{new Date(v.created_at).toLocaleDateString()}</td>
                    <td className='px-8 py-6'><StatusBadge status={v.status} /></td>
                    <td className='px-8 py-6 text-right flex items-center justify-end gap-3'>
                      <button
                        onClick={() => setSelectedVendor(v)}
                        className='px-4 py-2 bg-secondary text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2'
                      >
                        <Eye className='h-3.5 w-3.5' /> Review
                      </button>
                      {v.status !== 'active' && (
                        <button onClick={() => updateVendorStatus(v.id, v.owner_id, 'active')} disabled={actionLoading === v.id} className='px-4 py-2 bg-green-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-600 transition-all disabled:opacity-50'>
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {vendors.length === 0 && <tr><td colSpan='5' className='px-8 py-20 text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-30'>Zero vendor records found</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'Users' && (
          <div className="overflow-x-auto">
            <table className='w-full text-left'>
              <thead>
                <tr className="border-b bg-gray-50/50 text-secondary">
                  <th className='px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400'>Identity</th>
                  <th className='px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400'>Clearance</th>
                  <th className='px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400'>Registration</th>
                  <th className='px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-right'>Privilege</th>
                </tr>
              </thead>
              <tbody className='divide-y text-secondary'>
                {users.map(u => (
                  <tr key={u.id} className='hover:bg-gray-50/50 transition-colors'>
                    <td className='px-8 py-6'>
                      <p className='font-black text-sm'>{u.full_name || 'Anonymous'}</p>
                      <p className="text-[9px] font-mono text-gray-400 uppercase">{u.id}</p>
                    </td>
                    <td className='px-8 py-6'><StatusBadge status={u.role || 'buyer'} /></td>
                    <td className='px-8 py-6 text-[11px] font-black text-gray-400 font-mono'>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className='px-8 py-6 text-right'>
                      <select
                        value={u.role || 'buyer'}
                        onChange={(e) => updateUserRole(u.id, e.target.value)}
                        disabled={actionLoading === u.id}
                        className='text-[9px] font-black uppercase tracking-[0.2em] border-2 border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:border-primary cursor-pointer disabled:opacity-50 transition-all appearance-none bg-white text-secondary'
                      >
                        <option value='buyer'>Buyer</option>
                        <option value='seller'>Seller</option>
                        <option value='admin'>Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'Orders' && (
          <div className="overflow-x-auto">
            <table className='w-full text-left'>
              <thead>
                <tr className="border-b bg-gray-50/50 text-secondary">
                  <th className='px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400'>ID</th>
                  <th className='px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400'>Customer</th>
                  <th className='px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400'>Valuation</th>
                  <th className='px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400'>Payment</th>
                  <th className='px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400'>Progress</th>
                  <th className='px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400'>Date</th>
                </tr>
              </thead>
              <tbody className='divide-y text-secondary'>
                {orders.map(o => (
                  <tr key={o.id} className='hover:bg-gray-50 transition-colors'>
                    <td className='px-8 py-6 font-mono text-[10px] font-black text-gray-400'>#{o.id.slice(0, 10).toUpperCase()}</td>
                    <td className='px-8 py-6 text-sm font-black'>{o.profiles?.full_name || 'Guest'}</td>
                    <td className='px-8 py-6 text-sm font-black text-primary italic'>Rs. {o.total_amount}</td>
                    <td className='px-8 py-6'><span className='text-[9px] font-black uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-lg text-gray-500 italic'>{o.payment_method}</span></td>
                    <td className='px-8 py-6'><StatusBadge status={o.status} /></td>
                    <td className='px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest'>{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan='6' className='px-8 py-20 text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-30'>Zero transaction history</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'Categories' && (
          <CategoryManager categories={categories} onRefresh={fetchAll} />
        )}
      </div>

      <ReviewModal
        vendor={selectedVendor}
        onClose={() => setSelectedVendor(null)}
        onAction={updateVendorStatus}
        actionLoading={actionLoading}
      />
    </div>
  );
}
