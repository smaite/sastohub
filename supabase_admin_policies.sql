-- ==========================================
-- SASTOHUB COMPREHENSIVE SECURITY POLICIES
-- ==========================================
-- This file provides a robust, professional, and secure Row Level Security (RLS)
-- setup for the SastoHub e-commerce database tables in Supabase.
-- It ensures strict access control separating Admins, Vendors, and Customers.
--
-- Apply this file in the Supabase Dashboard > SQL Editor.

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Clean up any existing conflicting policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile except role" ON public.profiles;

DROP POLICY IF EXISTS "Admins can view all vendors" ON public.vendors;
DROP POLICY IF EXISTS "Admins can update any vendor" ON public.vendors;
DROP POLICY IF EXISTS "Users can apply as vendor" ON public.vendors;
DROP POLICY IF EXISTS "Anyone can view active vendors" ON public.vendors;
DROP POLICY IF EXISTS "Owners can view own vendor record" ON public.vendors;
DROP POLICY IF EXISTS "Owners can update own vendor details" ON public.vendors;

DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Vendors can view own products" ON public.products;
DROP POLICY IF EXISTS "Vendors can insert own products" ON public.products;
DROP POLICY IF EXISTS "Vendors can update own products" ON public.products;
DROP POLICY IF EXISTS "Vendors can delete own products" ON public.products;

DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Vendors can view orders containing their products" ON public.orders;
DROP POLICY IF EXISTS "Buyers can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers can update/cancel own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update order status" ON public.orders;
DROP POLICY IF EXISTS "Buyers can request cancel or return on own orders" ON public.orders;

DROP POLICY IF EXISTS "Buyers can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Vendors can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Buyers can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Vendors can update own order items status" ON public.order_items;

DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can delete any review" ON public.reviews;

DROP POLICY IF EXISTS "Users can view own wishlist" ON public.wishlists;
DROP POLICY IF EXISTS "Users can add to own wishlist" ON public.wishlists;
DROP POLICY IF EXISTS "Users can remove from own wishlist" ON public.wishlists;

DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;


-- ============================================================================
-- 1. PROFILES POLICIES
-- ============================================================================

-- SELECT: Admins can view all, users can view own profile
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- INSERT: Handled by triggers or authenticated signup
CREATE POLICY "Users can create own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- UPDATE: Admins can update any profile (e.g. change roles). Users can update own profile,
-- but NOT escalate their role column (role stays unchanged).
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Users can update own profile except role" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );


-- ============================================================================
-- 2. VENDORS POLICIES
-- ============================================================================

-- SELECT: Admins can see all. Public can see approved active vendors. Owners can see own record.
CREATE POLICY "Admins can view all vendors" ON public.vendors
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Anyone can view active vendors" ON public.vendors
  FOR SELECT USING (status = 'active');

CREATE POLICY "Owners can view own vendor record" ON public.vendors
  FOR SELECT USING (auth.uid() = owner_id);

-- INSERT: Users can apply as a vendor.
CREATE POLICY "Users can apply as vendor" ON public.vendors
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- UPDATE: Admins can update status/details. Owners can update details but NOT status/owner.
CREATE POLICY "Admins can update any vendor" ON public.vendors
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Owners can update own vendor details" ON public.vendors
  FOR UPDATE USING (auth.uid() = owner_id)
  WITH CHECK (
    auth.uid() = owner_id
    AND status = (SELECT status FROM public.vendors WHERE owner_id = auth.uid())
  );


-- ============================================================================
-- 3. PRODUCTS POLICIES
-- ============================================================================

-- SELECT: Anyone can view active/published products. Vendors can view own draft/pending products. Admins can see all.
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_published = true AND approval_status = 'approved');

CREATE POLICY "Vendors can view own products" ON public.products
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = products.vendor_id AND v.owner_id = auth.uid())
  );

CREATE POLICY "Admins can view all products" ON public.products
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- INSERT: Active vendors can insert products. Admins can too.
CREATE POLICY "Vendors can insert own products" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE v.id = products.vendor_id
        AND v.owner_id = auth.uid()
        AND v.status = 'active'
    )
  );

CREATE POLICY "Admins can insert any product" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- UPDATE: Active vendors can edit their products (forces/keeps approval_status to 'pending' to prevent bypass). Admins can edit anything.
CREATE POLICY "Vendors can update own products" ON public.products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE v.id = products.vendor_id
        AND v.owner_id = auth.uid()
        AND v.status = 'active'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE v.id = products.vendor_id
        AND v.owner_id = auth.uid()
        AND v.status = 'active'
    )
    AND (
      approval_status = 'pending'
      OR approval_status = (SELECT approval_status FROM public.products WHERE id = products.id)
    )
  );

CREATE POLICY "Admins can update any product" ON public.products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- DELETE: Active vendors can delete own products. Admins can delete any.
CREATE POLICY "Vendors can delete own products" ON public.products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE v.id = products.vendor_id
        AND v.owner_id = auth.uid()
        AND v.status = 'active'
    )
  );

CREATE POLICY "Admins can delete any product" ON public.products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );


-- ============================================================================
-- 4. CATEGORIES POLICIES
-- ============================================================================

-- SELECT: Anyone can view product categories.
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

-- ALL: Only admins can manage categories.
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );


-- ============================================================================
-- 5. ORDERS POLICIES
-- ============================================================================

-- SELECT: Admins see all. Customers see own. Vendors see orders containing their products.
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Buyers can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Vendors can view orders containing their products" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.vendors v ON oi.vendor_id = v.id
      WHERE oi.order_id = orders.id
        AND v.owner_id = auth.uid()
    )
  );

-- INSERT: Authenticated customers can place orders.
CREATE POLICY "Buyers can create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- UPDATE: Admins can update. Customers can update to request cancels/returns (triggers perform core fields lockdown).
CREATE POLICY "Admins can update any order" ON public.orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Buyers can update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = buyer_id);


-- ============================================================================
-- 6. ORDER ITEMS POLICIES
-- ============================================================================

-- SELECT: Admins see all. Customers see own order items. Vendors see own products' order items.
CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Buyers can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND o.buyer_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE v.id = order_items.vendor_id
        AND v.owner_id = auth.uid()
    )
  );

-- INSERT: Customers can add items to their orders.
CREATE POLICY "Buyers can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND o.buyer_id = auth.uid()
    )
  );

-- UPDATE: Admins can update. Active vendors can update delivery/shipping status of their items.
CREATE POLICY "Admins can update any order item" ON public.order_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Vendors can update own order items status" ON public.order_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE v.id = order_items.vendor_id
        AND v.owner_id = auth.uid()
        AND v.status = 'active'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE v.id = order_items.vendor_id
        AND v.owner_id = auth.uid()
        AND v.status = 'active'
    )
  );


-- ============================================================================
-- 7. REVIEWS POLICIES
-- ============================================================================

-- SELECT: Anyone can view reviews.
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

-- INSERT: Authenticated users can write a review.
CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE/DELETE: Review authors can edit/delete their review. Admins can delete any review.
CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any review" ON public.reviews
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );


-- ============================================================================
-- 8. WISHLISTS POLICIES
-- ============================================================================

-- SELECT / INSERT / DELETE: Users have absolute control over their own wishlist.
CREATE POLICY "Users can view own wishlist" ON public.wishlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own wishlist" ON public.wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own wishlist" ON public.wishlists
  FOR DELETE USING (auth.uid() = user_id);


-- ============================================================================
-- 9. SITE SETTINGS POLICIES
-- ============================================================================

-- SELECT: Public read access
CREATE POLICY "Anyone can view site settings" ON public.site_settings
  FOR SELECT USING (true);

-- ALL: Admins can modify settings
CREATE POLICY "Admins can manage site settings" ON public.site_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
