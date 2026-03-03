import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Clock, Store, MapPin, CreditCard, FileText, Upload, CheckCircle, X, Globe, Phone, Building } from 'lucide-react';

function SectionHeader({ icon: Icon, number, title, subtitle }) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-black text-sm">
        {number}
      </div>
      <div>
        <h2 className="text-lg font-black text-secondary flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" /> {title}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function TextInput({ name, value, onChange, placeholder, type = 'text', required, maxLength }) {
  return (
    <input
      name={name}
      type={type}
      required={required}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-primary outline-none transition text-sm"
    />
  );
}

function FileUploadField({ label, name, required, accept, onChange, file }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <label className="flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary hover:bg-red-50 transition group">
        <Upload className="h-5 w-5 text-gray-400 group-hover:text-primary flex-shrink-0" />
        {file ? (
          <span className="text-sm text-green-600 font-medium flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4" /> {file.name}
          </span>
        ) : (
          <span className="text-sm text-gray-400">Click to upload (JPG, PNG, PDF)</span>
        )}
        <input
          type="file"
          name={name}
          accept={accept || 'image/*,.pdf'}
          required={required}
          className="hidden"
          onChange={onChange}
        />
      </label>
    </div>
  );
}

const initialForm = {
  shop_name: '', description: '', website: '',
  address: '', city: '', state: '', postal_code: '', phone: '',
  account_holder: '', account_number: '',
};

const initialFiles = {
  nid_front: null, nid_back: null, pan_card: null, business_reg: null,
};

export default function VendorOnboarding() {
  const { user, profile, loading: authLoading } = useAuthStore();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState(initialFiles);
  const [agree, setAgree] = useState({ terms: false, privacy: false, legitimate: false });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (profile?.role === 'seller') {
        navigate('/vendor/dashboard');
      } else if (profile?.role === 'admin') {
        navigate('/admin/dashboard');
      }
    }
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      const checkExisting = async () => {
        const { data } = await supabase.from('vendors').select('status').eq('owner_id', user.id).single();
        if (data) setSubmitted(true);
      };
      checkExisting();
    }
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFile = (e) => setFiles({ ...files, [e.target.name]: e.target.files[0] || null });
  const handleAgree = (e) => setAgree({ ...agree, [e.target.name]: e.target.checked });

  const allAgreed = agree.terms && agree.privacy && agree.legitimate;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { setError('Please log in first.'); return; }
    if (!allAgreed) { setError('Please agree to all terms before submitting.'); return; }

    // Validate files
    const requiredFiles = ['nid_front', 'nid_back', 'pan_card', 'business_reg'];
    for (const key of requiredFiles) {
      if (!files[key]) {
        setError(`Please upload your ${key.replace('_', ' ')}.`);
        return;
      }
    }

    setLoading(true); setError('');

    try {
      // 1. Check for existing application
      const { data: existing } = await supabase.from('vendors').select('id').eq('owner_id', user.id).single();
      if (existing) {
        setError('You have already submitted an application.');
        setLoading(false);
        return;
      }

      // 2. Upload files
      const uploadPromises = Object.entries(files).map(async ([key, file]) => {
        if (!file) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${key}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { data, error: uploadError } = await supabase.storage
          .from('vendor-docs')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('vendor-docs')
          .getPublicUrl(fileName);

        return { key, url: publicUrl };
      });

      const uploadedFilesResults = await Promise.all(uploadPromises);
      const fileUrls = {};
      uploadedFilesResults.forEach(res => {
        if (res) fileUrls[`${res.key}_url`] = res.url;
      });

      // 3. Insert vendor details
      const { error: insertError } = await supabase.from('vendors').insert({
        owner_id: user.id,
        business_name: form.shop_name,
        description: form.description,
        website: form.website,
        address: form.address,
        city: form.city,
        state: form.state,
        postal_code: form.postal_code,
        phone: form.phone,
        account_holder: form.account_holder,
        account_number: form.account_number,
        ...fileUrls,
        status: 'pending',
      });

      if (insertError) throw insertError;

      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-black text-secondary mb-3">Application Submitted!</h2>
        <p className="text-gray-500 mb-6">
          Your vendor application is under review. Our team will verify your details and notify you within <strong>24–48 hours</strong>.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-left text-sm text-yellow-800">
          <p className="font-bold mb-2">What happens next?</p>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>Admin reviews your application and documents</li>
            <li>Once approved, you will receive seller access</li>
            <li>You can then log in and start adding products</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-secondary text-white py-10 px-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <Store className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Vendor Registration</h1>
            <p className="text-gray-400 text-sm mt-0.5">Complete all sections to apply as a seller on SastoHub.</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 flex items-center gap-3 text-sm font-medium">
            <X className="h-5 w-5 flex-shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── 1. Shop Information ──────────────────────────────── */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 md:p-8">
            <SectionHeader icon={Store} number="1" title="Shop Information" subtitle="Establish your brand identity on the marketplace." />
            <div className="space-y-5">
              <Field label="Shop Name" required hint="This is the name customers will see on your storefront.">
                <TextInput name="shop_name" required value={form.shop_name} onChange={handleChange} placeholder="e.g. Kathmandu Electronics" />
              </Field>
              <Field label="Shop Description" required hint={`${form.description.length}/500 characters`}>
                <textarea
                  name="description"
                  required
                  value={form.description}
                  onChange={handleChange}
                  maxLength={500}
                  rows={4}
                  placeholder="Describe what you sell and what makes your shop unique..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-primary outline-none transition text-sm resize-none"
                />
              </Field>
              <Field label="Business Website" hint="Optional — link to your existing website.">
                <div className="relative">
                  <Globe className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    name="website"
                    type="url"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-primary outline-none transition text-sm"
                  />
                </div>
              </Field>
            </div>
          </div>

          {/* ── 2. Business Location ─────────────────────────────── */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 md:p-8">
            <SectionHeader icon={MapPin} number="2" title="Business Location" subtitle="Physical location for legal and shipping purposes." />
            <div className="space-y-5">
              <Field label="Full Address" required hint="Street address, building name, house number, etc.">
                <TextInput name="address" required value={form.address} onChange={handleChange} placeholder="e.g. 45 New Road, Sundhara" />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="City" required>
                  <TextInput name="city" required value={form.city} onChange={handleChange} placeholder="Kathmandu" />
                </Field>
                <Field label="State / Province" required>
                  <TextInput name="state" required value={form.state} onChange={handleChange} placeholder="Bagmati" />
                </Field>
                <Field label="Postal Code" required>
                  <TextInput name="postal_code" required value={form.postal_code} onChange={handleChange} placeholder="44600" />
                </Field>
              </div>
              <Field label="Phone Number" required hint="A valid contact number for business inquiries.">
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    name="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="98XXXXXXXX"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-primary outline-none transition text-sm"
                  />
                </div>
              </Field>
            </div>
          </div>

          {/* ── 3. Bank Account Details ──────────────────────────── */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 md:p-8">
            <SectionHeader icon={CreditCard} number="3" title="Bank Account Details" subtitle="Required to process payments and transfer your earnings." />
            <div className="space-y-5">
              <Field label="Account Holder Name" required hint="The exact name as it appears on your bank account.">
                <TextInput name="account_holder" required value={form.account_holder} onChange={handleChange} placeholder="Full Name on Bank Account" />
              </Field>
              <Field label="Account Number" required hint="Your full bank account number.">
                <div className="relative">
                  <Building className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    name="account_number"
                    type="text"
                    required
                    value={form.account_number}
                    onChange={handleChange}
                    placeholder="e.g. 01234567890123"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-primary outline-none transition text-sm"
                  />
                </div>
              </Field>
            </div>
          </div>

          {/* ── 4. Required Documents ────────────────────────────── */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 md:p-8">
            <SectionHeader icon={FileText} number="4" title="Required Documents" subtitle="Upload clear digital copies of your identification and business documents." />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FileUploadField
                label="National ID Card — Front"
                name="nid_front"
                required
                file={files.nid_front}
                onChange={handleFile}
              />
              <FileUploadField
                label="National ID Card — Back"
                name="nid_back"
                required
                file={files.nid_back}
                onChange={handleFile}
              />
              <FileUploadField
                label="PAN / VAT Card Scan"
                name="pan_card"
                required
                file={files.pan_card}
                onChange={handleFile}
              />
              <FileUploadField
                label="Business Registration Certificate"
                name="business_reg"
                required
                file={files.business_reg}
                onChange={handleFile}
              />
            </div>
          </div>

          {/* ── Final Steps / Agreements ─────────────────────────── */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 md:p-8">
            <h2 className="text-lg font-black text-secondary mb-2">Final Steps</h2>
            <p className="text-sm text-gray-500 mb-5">Please read and agree to the following before submitting your application.</p>

            <div className="space-y-4">
              {[
                { name: 'terms', label: 'I agree to the', link: 'Terms of Use', text: ' of SastoHub marketplace.' },
                { name: 'privacy', label: 'I have read and accept the', link: 'Privacy Policy', text: ' and consent to data processing.' },
                { name: 'legitimate', label: 'I declare that I am a legitimate business entity and all information provided is accurate and truthful.', link: null },
              ].map(({ name, label, link, text }) => (
                <label key={name} className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name={name}
                    checked={agree[name]}
                    onChange={handleAgree}
                    className="mt-0.5 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary accent-primary flex-shrink-0"
                  />
                  <span className="text-sm text-gray-600 leading-relaxed">
                    {label}{' '}
                    {link && <span className="text-primary font-semibold underline cursor-pointer">{link}</span>}
                    {text}
                  </span>
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !allAgreed}
              className="mt-8 w-full bg-primary text-white py-4 rounded-xl font-bold text-base hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Submitting Application...
                </>
              ) : 'Submit Application'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
