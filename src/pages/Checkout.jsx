import React, { useState, useEffect } from 'react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentQrUrl, setPaymentQrUrl] = useState('');
  const navigate = useNavigate();
  const total = getTotal();

  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key', 'payment_qr_url').maybeSingle()
      .then(({ data }) => { if (data?.value) setPaymentQrUrl(data.value); });
  }, []);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(true);

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          total_amount: total,
          payment_method: paymentMethod,
          shipping_address: { address, phone },
          status: 'pending',
          payment_status: paymentMethod === 'cod' ? 'paid' : 'pending',
          payment_reference: paymentRef || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        vendor_id: item.vendor_id,
        quantity: item.quantity,
        unit_price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      for (const item of items) {
        const { error: stockError } = await supabase.rpc('decrement_stock', {
          row_id: item.id,
          count: item.quantity
        });

        if (stockError) {
          const { data: p } = await supabase.from('products').select('stock_quantity').eq('id', item.id).single();
          if (p) {
            await supabase.from('products')
              .update({ stock_quantity: Math.max(0, p.stock_quantity - item.quantity) })
              .eq('id', item.id);
          }
        }
      }

      clearCart();
      navigate('/order-success', { state: { order } });
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-surface-900 mb-8">Checkout</h1>
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 className="text-xl font-bold text-surface-900 mb-5">Shipping Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Delivery Address</label>
                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none transition"
                    placeholder="Street name, Area, City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none transition"
                    placeholder="98XXXXXXXX"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 className="text-xl font-bold text-surface-900 mb-5">Payment Method</h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary-600 bg-primary-600/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-primary-600 focus:ring-primary-600"
                  />
                  <div>
                    <p className="font-semibold text-surface-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">Pay when you receive your order.</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentMethod === 'esewa' ? 'border-primary-600 bg-primary-600/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="esewa"
                    checked={paymentMethod === 'esewa'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-primary-600 focus:ring-primary-600"
                  />
                  <div>
                    <p className="font-semibold text-surface-900">eSewa Scan &amp; Pay</p>
                    <p className="text-sm text-gray-500">Scan QR and pay manually.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border shadow-sm h-fit sticky top-28">
            <h2 className="text-xl font-bold text-surface-900 mb-5">Order Summary</h2>
            <div className="space-y-3 mb-5">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm text-gray-600">
                  <span className="truncate max-w-[200px]">{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                  <span className="font-medium">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-black text-lg">
                <span>Total Payable</span>
                <span className="text-primary-600">Rs. {total.toLocaleString()}</span>
              </div>
            </div>
            {paymentMethod === 'esewa' && (
              <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200 text-center">
                <p className="text-sm font-bold text-green-800 mb-3 tracking-wide">SCAN TO PAY (eSewa)</p>
                {paymentQrUrl ? (
                  <>
                    <div className="bg-white p-2 inline-block rounded-lg mb-3 border shadow-sm">
                      <img src={paymentQrUrl} alt="QR Code" className="w-40 h-40 object-contain" />
                    </div>
                    <div className="mb-3">
                      <a
                        href={paymentQrUrl}
                        download="payment-qr.png"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-green-700 hover:text-green-900 underline"
                      >
                        Download QR Image
                      </a>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-500 italic mb-2">QR code not available yet. Contact admin.</p>
                )}
                <p className="text-xs text-green-700 mb-3">Scan with your eSewa app, then enter the transaction ID below.</p>
                <input
                  type="text"
                  placeholder="Payment Reference / Transaction ID"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
