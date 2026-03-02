import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Plus, Package, ShoppingBag, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VendorDashboard() {
  const { user, profile } = useAuthStore();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchVendorData();
    }
  }, [user]);

  async function fetchVendorData() {
    setLoading(true);
    // Fetch vendor profile
    const { data: vendorData, error: vError } = await supabase
      .from('vendors')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (vendorData) {
      setVendor(vendorData);
      // Fetch vendor products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendorData.id);
      setProducts(productsData || []);
    }
    setLoading(false);
  }

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  if (!vendor) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-xl shadow-sm border text-center">
        <h2 className="text-2xl font-bold mb-4">Become a Seller</h2>
        <p className="text-gray-600 mb-8">You haven't set up your vendor profile yet. Start selling on SastoHub today!</p>
        <Link
          to="/vendor/onboarding"
          className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-dark transition-colors"
        >
          Set Up Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{vendor.business_name}</h1>
          <p className="text-gray-500">Vendor Dashboard</p>
        </div>
        <Link
          to="/vendor/add-product"
          className="bg-primary text-white flex items-center gap-2 px-4 py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors"
        >
          <Plus className="h-5 w-5" /> Add Product
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4 text-primary mb-2">
            <Package className="h-6 w-6" />
            <h3 className="font-bold text-gray-700">Total Products</h3>
          </div>
          <p className="text-3xl font-black">{products.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4 text-green-600 mb-2">
            <ShoppingBag className="h-6 w-6" />
            <h3 className="font-bold text-gray-700">Recent Orders</h3>
          </div>
          <p className="text-3xl font-black">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4 text-blue-600 mb-2">
            <Settings className="h-6 w-6" />
            <h3 className="font-bold text-gray-700">Status</h3>
          </div>
          <p className="text-xl font-bold capitalize text-green-600">{vendor.status}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Your Products</h2>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-700">Product</th>
              <th className="px-6 py-4 font-bold text-gray-700">Price</th>
              <th className="px-6 py-4 font-bold text-gray-700">Stock</th>
              <th className="px-6 py-4 font-bold text-gray-700">Status</th>
              <th className="px-6 py-4 font-bold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                    {product.images?.[0] && <img src={product.images[0]} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <span className="font-medium">{product.name}</span>
                </td>
                <td className="px-6 py-4 text-primary font-bold">Rs. {product.price}</td>
                <td className="px-6 py-4">{product.stock_quantity}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {product.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:underline font-medium">Edit</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">No products listed yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
