import React from 'react';
import { Link } from 'react-router-dom';
import { Store, TrendingUp, ShieldCheck, Zap, ChevronRight } from 'lucide-react';

const perks = [
  {
    icon: Store,
    title: 'Your Own Storefront',
    desc: 'Get a dedicated page to showcase your business and products to thousands of buyers.',
  },
  {
    icon: TrendingUp,
    title: 'Grow Your Sales',
    desc: 'Reach a wide audience across Nepal without worrying about marketing or infrastructure.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Trusted',
    desc: 'We verify every vendor so buyers trust your store from day one.',
  },
  {
    icon: Zap,
    title: 'Easy Management',
    desc: 'Add products, track orders, and manage your shop from a simple dashboard.',
  },
];

const steps = [
  { step: '01', title: 'Sign Up', desc: 'Create a buyer account or use your existing one.' },
  { step: '02', title: 'Apply as Seller', desc: 'Fill in your shop details and submit for review.' },
  { step: '03', title: 'Get Approved', desc: 'Our team reviews your application (usually within 24 hrs).' },
  { step: '04', title: 'Start Selling', desc: 'List your products and start receiving orders.' },
];

export default function Vendors() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-secondary to-gray-900 text-white py-24 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
          Sell on <span className="text-primary">SastoHub</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
          Join hundreds of sellers across Nepal and grow your business with zero setup hassle.
        </p>
        <Link
          to="/vendor/onboarding"
          className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-600 transition-colors shadow-lg"
        >
          Start Selling Today <ChevronRight className="h-5 w-5" />
        </Link>
      </div>

      {/* Perks */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-black text-center text-secondary mb-12">Why sell with us?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {perks.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center p-6 bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">
                <Icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-secondary mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gray-100 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center text-secondary mb-12">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="bg-white p-6 rounded-2xl border">
                <p className="text-4xl font-black text-primary/20 mb-3">{step}</p>
                <h3 className="font-bold text-secondary mb-1">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-20 px-4">
        <h2 className="text-3xl font-black text-secondary mb-4">Ready to get started?</h2>
        <p className="text-gray-500 mb-8">It only takes a few minutes to set up your shop.</p>
        <Link
          to="/vendor/onboarding"
          className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-600 transition-colors"
        >
          Apply Now <ChevronRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
