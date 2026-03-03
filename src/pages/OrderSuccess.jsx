import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, ShoppingBag } from 'lucide-react';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Order not found</h2>
        <Link to="/" className="text-primary hover:underline">Go back home</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border shadow-xl overflow-hidden">
          {/* Success Header */}
          <div className="bg-green-500 p-10 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-black mb-2 uppercase tracking-tight">Order Placed!</h1>
            <p className="opacity-90 font-medium italic">Thank you for shopping with SastoHub.</p>
          </div>

          <div className="p-8 md:p-12 space-y-10">
            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-2">Order Tracking ID</p>
                <p className="text-xl font-black text-secondary font-mono">#{order.id.slice(0, 12).toUpperCase()}</p>
              </div>
              <div className="md:text-right">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-2">Payment Method</p>
                <p className="text-lg font-black text-secondary uppercase italic bg-gray-100 px-3 py-1 rounded-lg inline-block">
                  {order.payment_method === 'cod' ? 'Cash on Delivery' : 'eSewa Pay'}
                </p>
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-black text-secondary uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" /> Delivery Details
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-bold text-secondary">{order.shipping_address?.address}</p>
                <p>Phone: <span className="font-bold text-secondary">{order.shipping_address?.phone}</span></p>
                <p className="pt-2 text-xs italic text-gray-400">Estimated delivery: 2-4 business days</p>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between py-6 border-y border-dashed border-gray-200">
              <span className="text-lg font-bold text-gray-400">Amount to Pay</span>
              <span className="text-3xl font-black text-primary italic font-mono">Rs. {order.total_amount}</span>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/orders')}
                className="flex items-center justify-center gap-2 py-4 px-6 bg-secondary text-white rounded-2xl font-black text-sm hover:bg-gray-800 transition-all shadow-lg shadow-secondary/20"
              >
                TRACK MY ORDER <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex items-center justify-center gap-2 py-4 px-6 bg-white border-2 border-gray-100 text-secondary rounded-2xl font-black text-sm hover:bg-gray-50 transition-all"
              >
                CONTINUE SHOPPING <ShoppingBag className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
            <p className="text-xs text-gray-400 font-medium">
              A confirmation email has been sent to your registered address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
