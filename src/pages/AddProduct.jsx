import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';

export default function AddProduct() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: '',
    is_published: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    async function init() {
      // Get vendor info
      const { data: vData } = await supabase.from('vendors').select('id').eq('owner_id', user.id).single();
      setVendor(vData);

      // Get categories
      const { data: cData } = await supabase.from('categories').select('*');
      setCategories(cData || []);
    }
    if (user) init();
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vendor) return;
    setLoading(true);

    try {
      let imageUrl = null;

      // 1. Upload image if exists
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `product-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // 2. Insert product
      const { error: insertError } = await supabase
        .from('products')
        .insert({
          vendor_id: vendor.id,
          name: formData.name,
          slug: formData.name.toLowerCase().replace(/ /g, '-'),
          description: formData.description,
          price: parseFloat(formData.price),
          stock_quantity: parseInt(formData.stock_quantity),
          category_id: formData.category_id || null,
          images: imageUrl ? [imageUrl] : [],
          is_published: formData.is_published,
          approval_status: 'pending',
        });

      if (insertError) throw insertError;

      alert('Product submitted! It will appear on the store once an admin approves it.');
      navigate('/vendor/dashboard');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Add New Product</h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none h-32"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price (Rs.)</label>
          <input
            type="number"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Stock Quantity</label>
          <input
            type="number"
            required
            value={formData.stock_quantity}
            onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
            className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 pt-8">
          <input
            type="checkbox"
            id="published"
            checked={formData.is_published}
            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
            className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="published" className="text-sm font-medium">Publish immediately</label>
        </div>

        <div className="md:col-span-2 border-2 border-dashed rounded-xl p-6 text-center">
          {preview ? (
            <div className="relative inline-block">
              <img src={preview} alt="Preview" className="max-h-48 rounded" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setPreview(null); }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Click to upload product image</p>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          )}
        </div>

        <div className="md:col-span-2 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
