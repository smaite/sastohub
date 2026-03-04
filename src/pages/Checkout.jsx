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
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          total_amount: total,
          payment_method: paymentMethod,
          shipping_address: { address, phone },
          status: 'pending',
          payment_status: 'pending',
          payment_reference: paymentRef || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items and update stock
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

      // 3. Update stock quantities for each product
      for (const item of items) {
        const { error: stockError } = await supabase.rpc('decrement_stock', {
          row_id: item.id,
          count: item.quantity
        });

        // If RPC doesn't exist, fallback to manual update (less safe but works for now)
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
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Delivery Address</label>
                <textarea
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Street name, Area, City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-primary outline-none"
                  placeholder="98XXXXXXXX"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-primary focus:ring-primary"
                />
                <div>
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-sm text-gray-500">Pay when you receive your order.</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="esewa"
                  checked={paymentMethod === 'esewa'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-primary focus:ring-primary"
                />
                <div>
                  <p className="font-medium">eSewa Scan & Pay</p>
                  <p className="text-sm text-gray-500">Scan QR and pay manually.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-3 mb-6">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} x {item.quantity}</span>
                <span>Rs. {item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total Payable</span>
              <span className="text-primary">Rs. {total}</span>
            </div>
            {paymentMethod === 'esewa' && (
              <div className="mb-6 p-4 bg-green-50 rounded border border-green-200 text-center">
                <p className="text-sm font-bold text-green-800 mb-2 font-mono">SCAN TO PAY (eSewa)</p>
                {paymentQrUrl ? (
                  <>
                    <div className="bg-white p-2 inline-block rounded mb-2 border">
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
                        ⬇ Download QR Image
                      </a>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-500 italic mb-2">QR code not available yet. Contact admin.</p>
                )}
                <p className="text-xs text-green-700 mb-3">Scan this QR code with your eSewa app, then enter the reference below.</p>
                <input
                  type="text"
                  placeholder="Payment Reference / Transaction ID"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full p-2 border rounded text-sm focus:ring-1 focus:ring-green-500 outline-none"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
