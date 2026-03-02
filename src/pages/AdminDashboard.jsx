import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Users, Store, ShoppingBag, CheckCircle, XCircle, Clock, Package } from 'lucide-react';

const tabs = ['Vendors', 'Users', 'Orders'];

function StatusBadge({ status }) {
  const map = {
    pending: 'bg-yellow-100 text-yellow-700',
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-red-100 text-red-700',
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${map[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
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

  useEffect(() => {
    if (profile && profile.role !== 'admin') { navigate('/'); return; }
    fetchAll();
  }, [profile]);

  async function fetchAll() {
    setLoading(true);
    const [{ data: v }, { data: u }, { data: o }] = await Promise.all([
      supabase.from('vendors').select('*, profiles(full_name, email:id)').order('created_at', { ascending: false }),
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
                  <td className='px-6 py-4 text-sm text-gray-600'>{v.profiles?.full_name || 'N/A'}</td>
                  <td className='px-6 py-4 text-sm text-gray-400'>{new Date(v.created_at).toLocaleDateString()}</td>
                  <td className='px-6 py-4'><StatusBadge status={v.status} /></td>
                  <td className='px-6 py-4 text-right flex items-center justify-end gap-2'>
                    {v.status !== 'active' && (
                      <button onClick={() => updateVendorStatus(v.id, v.owner_id, 'active')} disabled={actionLoading === v.id} className='flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100 disabled:opacity-50'>
                        <CheckCircle className='h-3.5 w-3.5' /> Approve
                      </button>
                    )}
                    {v.status !== 'suspended' && (
                      <button onClick={() => updateVendorStatus(v.id, v.owner_id, 'suspended')} disabled={actionLoading === v.id} className='flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 disabled:opacity-50'>
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
      </div>
    </div>
  );
}