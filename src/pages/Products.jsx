import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, ChevronDown, LayoutGrid, List } from 'lucide-react';

export default function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [view, setView] = useState('grid');

  const categoryQuery = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Fetch categories for the sidebar
      const { data: catData } = await supabase.from('categories').select('*');
      setCategories(catData || []);

      // Build product query
      let query = supabase
        .from('products')
        .select('*, vendors(business_name)')
        .eq('is_published', true);

      if (categoryQuery) {
        // If it's a UUID, use eq, otherwise use ILIKE on name through a join or just handle name mapping
        // For simplicity now, we'll assume it's the category name and filter accordingly
        const { data: cat } = await supabase.from('categories').select('id').ilike('name', categoryQuery).single();
        if (cat) query = query.eq('category_id', cat.id);
      }

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error) setProducts(data || []);
      setLoading(false);
    }
    fetchData();
  }, [categoryQuery, searchQuery]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumbs / Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-secondary">
            {searchQuery ? `Search results for "${searchQuery}"` : categoryQuery ? categoryQuery : 'All Products'}
            <span className="ml-2 text-sm font-medium text-gray-400">({products.length} items)</span>
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
            <div className="bg-white rounded-2xl border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <h2 className="font-bold text-secondary flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" /> Filters
                </h2>
                <button className="text-xs text-primary font-bold">Clear All</button>
              </div>

              {/* Category Filter */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900">Categories</h3>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                      <span className="text-sm text-gray-600 group-hover:text-primary transition-colors">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mt-8 space-y-3">
                <h3 className="text-sm font-bold text-gray-900">Price Range</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Min" className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-primary" />
                  <input type="number" placeholder="Max" className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-primary" />
                </div>
              </div>
            </div>

            {/* Promo box in sidebar */}
            <div className="bg-primary rounded-2xl p-6 text-white overflow-hidden relative">
              <h3 className="text-xl font-black mb-2 relative z-10">Flash Deals</h3>
              <p className="text-sm opacity-90 mb-4 relative z-10">Up to 40% OFF</p>
              <button className="bg-white text-primary px-4 py-2 rounded-xl text-xs font-bold relative z-10 shadow-lg">View Deals</button>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl border p-4 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors lg:hidden">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </button>
                <div className="hidden sm:flex items-center gap-1 border rounded-xl overflow-hidden p-1 bg-gray-50">
                  <button
                    onClick={() => setView('grid')}
                    className={`p-1.5 rounded-lg ${view === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`p-1.5 rounded-lg ${view === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-auto">
                <span className="text-sm text-gray-400 hidden sm:inline">Sort by:</span>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                  Newest Arrivals <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse space-y-3">
                    <div className="bg-gray-200 aspect-square rounded-xl" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className={view === 'grid'
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  : "flex flex-col gap-4"
                }>
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} layout={view} />
                  ))}
                </div>

                {products.length === 0 && (
                  <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400 text-3xl">
                      🔍
                    </div>
                    <p className="text-gray-500 font-bold">No products found matching your criteria.</p>
                    <p className="text-gray-400 text-sm mt-1 text-center max-w-xs">
                      Try adjusting your filters or search keywords to find what you're looking for.
                    </p>
                    <button className="mt-6 bg-primary text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:shadow-primary/20 transition-all">
                      Clear All Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
