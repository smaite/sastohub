import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle, ShoppingBag } from 'lucide-react';

function StatusBadge({ status }) {
  const map = {
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    processing: { color: 'bg-blue-100 text-blue-700', icon: Package },
    shipped: { color: 'bg-purple-100 text-purple-700', icon: Truck },
    delivered: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle },
  };
  const config = map[status] || { color: 'bg-gray-100 text-gray-700', icon: Package };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${config.color}`}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

const TRACK_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

function statusStepIndex(status) {
  if (status === 'cancelled') return -1;
  const idx = TRACK_STEPS.indexOf(status);
  return idx >= 0 ? idx : 0;
}

function OrderTracking({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Order Tracking</p>
        <p className="mt-1 text-xs font-bold text-red-600">This order was cancelled.</p>
      </div>
    );
  }

  const active = statusStepIndex(status);
  return (
    <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order Tracking</p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {TRACK_STEPS.map((step, index) => {
          const done = index <= active;
          return (
            <div key={step} className="flex flex-col items-center gap-1">
              <div className={`h-2.5 w-2.5 rounded-full ${done ? 'bg-primary-600' : 'bg-gray-300'}`} />
              <p className={`text-[10px] font-bold uppercase tracking-wide ${done ? 'text-surface-900' : 'text-gray-400'}`}>
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Orders() {
  const { user, loading: authLoading } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestModal, setRequestModal] = useState({ open: false, type: '', orderId: '' });
  const [requestReason, setRequestReason] = useState('');
  const [requesting, setRequesting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, navigate]);

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name, images)
        )
      `)
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) setOrders(data || []);
    setLoading(false);
  }

  function openRequestModal(type, orderId) {
    setRequestReason('');
    setRequestModal({ open: true, type, orderId });
  }

  function closeRequestModal() {
    setRequestModal({ open: false, type: '', orderId: '' });
    setRequestReason('');
  }

  async function submitRequest() {
    const reason = requestReason.trim();
    if (!reason) {
      alert('Please tell us why you want to cancel/return this order.');
      return;
    }
    setRequesting(true);
    const isCancel = requestModal.type === 'cancel';

    const payload = isCancel
      ? {
          status: 'cancelled',
          cancel_requested_at: new Date().toISOString(),
          cancel_request_reason: reason,
        }
      : {
          return_requested_at: new Date().toISOString(),
          return_request_reason: reason,
        };

    const { error } = await supabase
      .from('orders')
      .update(payload)
      .eq('id', requestModal.orderId)
      .eq('buyer_id', user.id);

    if (error) {
      alert(error.message);
    } else {
      closeRequestModal();
      fetchOrders();
    }
    setRequesting(false);
  }

  if (loading || authLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500 font-medium">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      Loading your orders...
    </div>
  );

  if (orders.length === 0) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Package className="h-10 w-10 text-gray-300" />
      </div>
      <h2 className="text-2xl font-black text-surface-900 mb-2">No orders found</h2>
      <p className="text-gray-500 mb-8">You haven't placed any orders yet. Start shopping to see them here!</p>
      <Link to="/products" className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors">
        Browse Products
      </Link>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-white rounded-2xl border shadow-sm flex items-center justify-center">
            <ShoppingBag className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-surface-900">My Orders</h1>
            <p className="text-gray-500 text-sm">Track and manage your recent purchases.</p>
          </div>
        </div>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl border shadow-sm overflow-hidden transition-all hover:shadow-md">
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Order ID</p>
                    <p className="text-sm font-black text-surface-900 font-mono">{order.id.slice(0, 8)}...</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Placed On</p>
                    <p className="text-sm font-bold text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Amount</p>
                    <p className="text-sm font-black text-primary-600 font-mono">Rs. {order.total_amount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-400">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="space-y-4">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border">
                        {item.products?.images?.[0] ? (
                          <img src={item.products.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Image</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-surface-900 text-sm truncate group-hover:text-primary-600 transition-colors cursor-pointer">
                          {item.products?.name}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          Quantity: <span className="font-bold text-surface-900">{item.quantity}</span> •
                          Price: <span className="font-bold text-surface-900">Rs. {item.unit_price}</span>
                        </p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <button className="text-xs font-bold text-primary-600 hover:underline">Write Review</button>
                      </div>
                    </div>
                  ))}
                </div>

                <OrderTracking status={order.status} />

                {(order.cancel_request_reason || order.return_request_reason) && (
                  <div className="mt-3 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                      {order.cancel_request_reason ? 'Cancel Request Sent' : 'Return Request Sent'}
                    </p>
                    <p className="mt-1 text-xs font-bold text-orange-700">
                      {order.cancel_request_reason || order.return_request_reason}
                    </p>
                  </div>
                )}

                {/* Shipping Details */}
                <div className="mt-6 pt-6 border-t flex flex-wrap gap-10">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Delivery Address</p>
                    <p className="text-xs text-gray-600 leading-relaxed max-w-[250px]">
                      {order.shipping_address?.address}<br />
                      Phone: <span className="font-bold">{order.shipping_address?.phone}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Payment Method</p>
                    {(() => {
                      const paymentStatus = order.payment_method === 'cod'
                        ? 'paid'
                        : (order.payment_status || 'pending');
                      const paymentLabel = paymentStatus === 'paid'
                        ? 'completed'
                        : paymentStatus;
                      return (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-surface-900 uppercase bg-gray-100 px-2 py-0.5 rounded italic">
                        {order.payment_method}
                      </span>
                      <span className={`text-[10px] font-bold ${paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                        ({paymentLabel})
                      </span>
                    </div>
                      );
                    })()}
                  </div>
                  <div className="ml-auto">
                    {['pending', 'processing'].includes(order.status) && !order.cancel_requested_at && (
                      <button
                        onClick={() => openRequestModal('cancel', order.id)}
                        className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-colors"
                      >
                        Request Cancel
                      </button>
                    )}
                    {order.status === 'delivered' && !order.return_requested_at && (
                      <button
                        onClick={() => openRequestModal('return', order.id)}
                        className="px-4 py-2 rounded-xl border border-orange-200 text-orange-600 text-[10px] font-black uppercase tracking-widest hover:bg-orange-50 transition-colors"
                      >
                        Request Return
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {requestModal.open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border shadow-2xl p-6">
            <h3 className="text-lg font-black text-surface-900 mb-1">
              {requestModal.type === 'cancel' ? 'Cancel Order Request' : 'Return Order Request'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Please tell us why you want to {requestModal.type} this order.
            </p>
            <textarea
              value={requestReason}
              onChange={(e) => setRequestReason(e.target.value)}
              rows={4}
              className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-primary-600"
              placeholder="Write your reason..."
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={closeRequestModal}
                disabled={requesting}
                className="px-4 py-2 rounded-xl border text-gray-600 text-sm font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitRequest}
                disabled={requesting}
                className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 disabled:opacity-50"
              >
                {requesting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
