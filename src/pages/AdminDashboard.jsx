import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Users, Store, ShoppingBag, CheckCircle, XCircle, Clock, Package, Eye, X, ExternalLink, MapPin, CreditCard, FileText } from 'lucide-react';

const tabs = ['Vendors', 'Users', 'Orders', 'Categories'];

function StatusBadge({ status }) {
  const map = {
    pending: 'bg-yellow-100 text-yellow-700',
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-red-100 text-red-700',
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${map[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
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
          className="flex-1 px-4 py-2 border rounded-xl outline-none focus:ring-1 focus:ring-primary"
          required
        />
        <button
          disabled={loading}
          className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Adding...' : 'Add Category'}
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 group">
            <div>
              <p className="font-bold text-secondary">{cat.name}</p>
              <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">{cat.slug}</p>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-xl font-black text-secondary">{vendor.business_name}</h2>
            <p className="text-sm text-gray-500">Application Review</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8">
          {/* Section 1: Basic Info */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              <Store className="h-4 w-4" /> Shop Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Shop Name</p>
                <p className="text-secondary font-semibold">{vendor.business_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Website</p>
                {vendor.website ? (
                  <a href={vendor.website} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                    {vendor.website} <ExternalLink className="h-3 w-3" />
                  </a>
                ) : <p className="text-gray-400 italic">None</p>}
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-400 font-bold uppercase">Description</p>
                <p className="text-gray-600 whitespace-pre-wrap">{vendor.description}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Location */}
          <div className="pt-6 border-t">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              <MapPin className="h-4 w-4" /> Business Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <p className="text-xs text-gray-400 font-bold uppercase">Address</p>
                <p className="text-secondary font-semibold">{vendor.address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Phone</p>
                <p className="text-secondary font-semibold">{vendor.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">City</p>
                <p className="text-secondary font-semibold">{vendor.city}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">State</p>
                <p className="text-secondary font-semibold">{vendor.state}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Postal Code</p>
                <p className="text-secondary font-semibold">{vendor.postal_code}</p>
              </div>
            </div>
          </div>

          {/* Section 3: Bank Details */}
          <div className="pt-6 border-t">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              <CreditCard className="h-4 w-4" /> Bank Account Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Account Holder</p>
                <p className="text-secondary font-semibold">{vendor.account_holder}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Account Number</p>
                <p className="text-secondary font-semibold">{vendor.account_number}</p>
              </div>
            </div>
          </div>

          {/* Section 4: Documents */}
          <div className="pt-6 border-t">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              <FileText className="h-4 w-4" /> Required Documents
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'NID Front', url: vendor.nid_front_url },
                { label: 'NID Back', url: vendor.nid_back_url },
                { label: 'PAN Card', url: vendor.pan_card_url },
                { label: 'Business Reg.', url: vendor.business_reg_url },
              ].map(doc => (
                <a
                  key={doc.label}
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 border-2 border-dashed rounded-xl hover:border-primary hover:bg-red-50 transition-colors group text-center"
                >
                  <p className="text-xs font-bold text-gray-400 uppercase group-hover:text-primary mb-2">{doc.label}</p>
                  <div className="inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                    View Doc <ExternalLink className="h-4 w-4" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer: Actions */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={() => onAction(vendor.id, vendor.owner_id, 'suspended')}
            disabled={actionLoading === vendor.id}
            className="px-6 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            Suspend Application
          </button>
          <button
            onClick={() => onAction(vendor.id, vendor.owner_id, 'active')}
            disabled={actionLoading === vendor.id}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            Approve & Go Live
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
    const [{ data: v }, { data: u }, { data: o }] = await Promise.all([
      supabase.from('vendors').select('*, profiles(full_name, email)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*, profiles(full_name)').order('created_at', { ascending: false }),
    ]);
    setVendors(v || []);
    setUsers(u || []);
    setOrders(o || []);
    setStats({
      vendors: (v || []).length,
      users: (u || []).length,
      orders: (o || []).length,
      pending: (v || []).filter(x => x.status === 'pending').length,
    });
    setLoading(false);
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

  if (loading) return <div className='p-10 text-center text-gray-500'>Loading admin dashboard...</div>;

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-black text-secondary'>Admin Dashboard</h1>
        <p className='text-gray-500 mt-1'>Manage vendors, users, and orders.</p>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
        <div className='bg-white rounded-xl border shadow-sm p-5'>
          <div className='flex items-center gap-2 text-primary mb-2'><Store className='h-5 w-5' /><span className='text-sm font-bold text-gray-600'>Total Vendors</span></div>
          <p className='text-3xl font-black'>{stats.vendors}</p>
        </div>
        <div className='bg-white rounded-xl border shadow-sm p-5'>
          <div className='flex items-center gap-2 text-yellow-500 mb-2'><Clock className='h-5 w-5' /><span className='text-sm font-bold text-gray-600'>Pending</span></div>
          <p className='text-3xl font-black'>{stats.pending}</p>
        </div>
        <div className='bg-white rounded-xl border shadow-sm p-5'>
          <div className='flex items-center gap-2 text-blue-500 mb-2'><Users className='h-5 w-5' /><span className='text-sm font-bold text-gray-600'>Total Users</span></div>
          <p className='text-3xl font-black'>{stats.users}</p>
        </div>
        <div className='bg-white rounded-xl border shadow-sm p-5'>
          <div className='flex items-center gap-2 text-green-500 mb-2'><ShoppingBag className='h-5 w-5' /><span className='text-sm font-bold text-gray-600'>Orders</span></div>
          <p className='text-3xl font-black'>{stats.orders}</p>
        </div>
      </div>

      <div className='bg-white rounded-xl border shadow-sm overflow-hidden'>
        <div className='flex border-b'>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-6 py-4 font-bold text-sm transition-colors ${tab === t ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-800'}`}>{t}</button>
          ))}
        </div>

        {tab === 'Vendors' && (
          <table className='w-full text-left'>
            <thead className='bg-gray-50 border-b'>
              <tr>
                <th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase'>Business</th>
                <th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase'>Owner</th>
                <th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase'>Applied</th>
                <th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase'>Status</th>
                <th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y'>
              {vendors.map(v => (
                <tr key={v.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4'>
                    <p className='font-semibold text-secondary'>{v.business_name}</p>
                    <p className='text-xs text-gray-400 mt-0.5 line-clamp-1'>{v.description}</p>
                  </td>
                  <td className='px-6 py-4'>
                    <p className="text-sm text-gray-600">{v.profiles?.full_name || 'N/A'}</p>
                    <p className="text-xs text-gray-400">{v.profiles?.email || ''}</p>
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-400'>{new Date(v.created_at).toLocaleDateString()}</td>
                  <td className='px-6 py-4'><StatusBadge status={v.status} /></td>
                  <td className='px-6 py-4 text-right flex items-center justify-end gap-2'>
                    <button
                      onClick={() => setSelectedVendor(v)}
                      className='flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors'
                    >
                      <Eye className='h-3.5 w-3.5' /> Review
                    </button>
                    {v.status !== 'active' && (
                      <button onClick={() => updateVendorStatus(v.id, v.owner_id, 'active')} disabled={actionLoading === v.id} className='flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100 disabled:opacity-50 transition-colors'>
                        <CheckCircle className='h-3.5 w-3.5' /> Approve
                      </button>
                    )}
                    {v.status !== 'suspended' && (
                      <button onClick={() => updateVendorStatus(v.id, v.owner_id, 'suspended')} disabled={actionLoading === v.id} className='flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 disabled:opacity-50 transition-colors'>
                        <XCircle className='h-3.5 w-3.5' /> Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {vendors.length === 0 && <tr><td colSpan='5' className='px-6 py-10 text-center text-gray-400 text-sm'>No vendors yet.</td></tr>}
            </tbody>
          </table>
        )}

        {tab === 'Users' && (
          <table className='w-full text-left'>
            <thead className='bg-gray-50 border-b'>
              <tr>
                <th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase'>Name</th>
                <th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase'>Role</th>
                <th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase'>Joined</th>
                <th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right'>Change Role</th>
              </tr>
            </thead>
            <tbody className='divide-y'>
              {users.map(u => (
                <tr key={u.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4'>
                    <p className='font-semibold text-secondary text-sm'>{u.full_name || 'Unnamed User'}</p>
                    <p className='text-xs text-gray-400'>{u.email}</p>
                  </td>
                  <td className='px-6 py-4'><StatusBadge status={u.role || 'buyer'} /></td>
                  <td className='px-6 py-4 text-sm text-gray-400'>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className='px-6 py-4 text-right'>
                    <select value={u.role || 'buyer'} onChange={(e) => updateUserRole(u.id, e.target.value)} disabled={actionLoading === u.id} className='text-xs border rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:opacity-50'>
                      <option value='buyer'>Buyer</option>
                      <option value='seller'>Seller</option>
                      <option value='admin'>Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan='4' className='px-6 py-10 text-center text-gray-400 text-sm'>No users yet.</td></tr>}
            </tbody>
          </table>
        )}

        {tab === 'Orders' && (
          <table className='w-full text-left'>
            <thead className='bg-gray-50 border-b'>
              <tr>
                <th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase'>Order ID</th>
                <th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase'>Buyer</th>
                <th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase'>Amount</th>
                <th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase'>Payment</th>
                <th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase'>Status</th>
                <th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase'>Date</th>
              </tr>
            </thead>
            <tbody className='divide-y'>
              {orders.map(o => (
                <tr key={o.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 font-mono text-xs text-gray-500'>{o.id.slice(0, 8)}...</td>
                  <td className='px-6 py-4 text-sm'>{o.profiles?.full_name || 'Guest'}</td>
                  <td className='px-6 py-4 text-sm font-bold text-secondary'>Rs. {o.total_amount}</td>
                  <td className='px-6 py-4'><span className='text-xs font-bold uppercase text-gray-500'>{o.payment_method}</span></td>
                  <td className='px-6 py-4'><StatusBadge status={o.status} /></td>
                  <td className='px-6 py-4 text-sm text-gray-400'>{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan='6' className='px-6 py-10 text-center text-gray-400 text-sm'>No orders yet.</td></tr>}
            </tbody>
          </table>
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