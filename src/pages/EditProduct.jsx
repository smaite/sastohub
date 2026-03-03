import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, ArrowLeft, Save } from 'lucide-react';

export default function EditProduct() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: '',
    is_published: true,
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFile, setNewImageFile] = useState(null);
  const [newPreview, setNewPreview] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // 1. Fetch categories
      const { data: cData } = await supabase.from('categories').select('*').order('name');
      setCategories(cData || []);

      // 2. Fetch product details
      const { data: pData, error: pError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (pError || !pData) {
        alert('Product not found');
        navigate('/vendor/dashboard');
        return;
      }

      // Verify ownership
      const { data: vData } = await supabase
        .from('vendors')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!vData || pData.vendor_id !== vData.id) {
        alert('Unauthorized access');
        navigate('/vendor/dashboard');
        return;
      }

      setFormData({
        name: pData.name,
        description: pData.description,
        price: pData.price,
        stock_quantity: pData.stock_quantity,
        category_id: pData.category_id || '',
        is_published: pData.is_published,
      });
      setExistingImages(pData.images || []);
      setLoading(false);
    }

    if (user) fetchData();
  }, [id, user, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      setNewPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let updatedImages = [...existingImages];

      // 1. Upload new image if provided
      if (newImageFile) {
        const fileExt = newImageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `product-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, newImageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        // For now, we replace the first image or add to array
        // In a more complex app, we'd manage multiple specific slots
        updatedImages = [publicUrl];
      }

      // 2. Update product
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name: formData.name,
          slug: formData.name.toLowerCase().replace(/ /g, '-'),
          description: formData.description,
          price: parseFloat(formData.price),
          stock_quantity: parseInt(formData.stock_quantity),
          category_id: formData.category_id || null,
          images: updatedImages,
          is_published: formData.is_published,
          updated_at: new Date()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      alert('Product updated successfully!');
      navigate('/vendor/dashboard');
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-gray-500 font-medium">Loading product data...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/vendor/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-secondary" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tight">Edit Product</h1>
          <p className="text-gray-500 text-sm">Update your listing details for "{formData.name}"</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-black text-secondary uppercase tracking-widest mb-2">Product Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-secondary uppercase tracking-widest mb-2">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all h-40 resize-none font-medium text-sm leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-black text-secondary uppercase tracking-widest mb-2">Price (Rs.)</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-black text-lg italic text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-secondary uppercase tracking-widest mb-2">Stock Quantity</label>
                <input
                  type="number"
                  required
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-secondary uppercase tracking-widest mb-2">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-sm cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <input
                type="checkbox"
                id="published"
                checked={formData.is_published}
                onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer accent-primary"
              />
              <label htmlFor="published" className="text-sm font-bold text-secondary cursor-pointer select-none">
                Make this product visible to customers
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Media */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border shadow-sm">
            <label className="block text-sm font-black text-secondary uppercase tracking-widest mb-4">Product Image</label>

            {/* Current Image */}
            {!newPreview && existingImages[0] && (
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 border">
                <img src={existingImages[0]} alt="Current" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                   <p className="text-white text-xs font-bold uppercase tracking-widest">Replace Below</p>
                </div>
              </div>
            )}

            {/* New Preview */}
            {newPreview && (
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 border-2 border-primary shadow-lg">
                <img src={newPreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {setNewImageFile(null); setNewPreview(null);}}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <label className="cursor-pointer group">
              <div className="border-2 border-dashed border-gray-200 group-hover:border-primary group-hover:bg-red-50 transition-all rounded-2xl p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 group-hover:text-primary mb-2 transition-colors" />
                <p className="text-xs font-bold text-gray-500 group-hover:text-primary transition-colors">UPLOAD NEW IMAGE</p>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
            </label>
            <p className="text-[10px] text-gray-400 mt-4 text-center">Replaces existing main product image.</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            onClick={handleSubmit}
            className="w-full bg-primary text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-primary/30 hover:bg-orange-600 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3"
          >
            {saving ? (
               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <><Save className="h-6 w-6" /> SAVE CHANGES</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
