-- Skema Database Kedai Arzena POS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabel users (Extended profile dari auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'pembeli' CHECK (role IN ('admin', 'kasir', 'pembeli')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel categories
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel products
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    barcode TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabel orders
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL, -- e.g. ORZ-20260826-001
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'diproses', 'siap', 'diantar', 'selesai', 'dibatalkan')),
    delivery_type TEXT NOT NULL DEFAULT 'pickup' CHECK (delivery_type IN ('pickup', 'antar')),
    delivery_lat NUMERIC,
    delivery_lng NUMERIC,
    delivery_address TEXT,
    ongkir NUMERIC DEFAULT 0,
    total_price NUMERIC NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabel order_items
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
    qty INTEGER NOT NULL,
    price_each NUMERIC NOT NULL,
    subtotal NUMERIC NOT NULL
);

-- 6. Tabel payments
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    method TEXT NOT NULL CHECK (method IN ('cash', 'transfer', 'qris')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'lunas', 'gagal')),
    gateway_ref TEXT,
    proof_url TEXT,
    paid_at TIMESTAMP WITH TIME ZONE
);

-- 7. Tabel settings (Konfigurasi Admin)
CREATE TABLE public.settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Single row table
    shop_lat NUMERIC NOT NULL DEFAULT -6.200000,
    shop_lng NUMERIC NOT NULL DEFAULT 106.816666,
    max_delivery_radius_km NUMERIC NOT NULL DEFAULT 5.0,
    open_time TIME NOT NULL DEFAULT '08:00:00',
    close_time TIME NOT NULL DEFAULT '22:00:00',
    ongkir_zones JSONB DEFAULT '[{"max_km": 2, "price": 5000}, {"max_km": 5, "price": 10000}]'::jsonb,
    wa_template_delivery TEXT DEFAULT 'Halo Kak {nama}, pesanan Anda #{order_no} di Kedai Arzena saat ini sedang Dalam Pengiriman 🛵. Pantau pesanan: {link}'
);

-- Insert Default Settings
INSERT INTO public.settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- RLS (Row Level Security) Policies Setup
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Policies for users
CREATE POLICY "Users can read their own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin/Kasir can read all users" ON public.users FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'kasir')));
CREATE POLICY "Admin can update users" ON public.users FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Policies for products and categories (Public can read, Admin/Kasir can manage)
CREATE POLICY "Anyone can read active products" ON public.products FOR SELECT USING (is_active = true OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'kasir')));
CREATE POLICY "Admin/Kasir can insert products" ON public.products FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'kasir')));
CREATE POLICY "Admin/Kasir can update products" ON public.products FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'kasir')));

CREATE POLICY "Anyone can read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin can manage categories" ON public.categories FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Policies for orders (Users can read their own, Admin/Kasir can read all)
CREATE POLICY "Users can read own orders" ON public.orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admin/Kasir can read all orders" ON public.orders FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'kasir')));
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin/Kasir can update orders" ON public.orders FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'kasir')));

-- Policies for order_items (Inherit from orders)
CREATE POLICY "Users can read own order items" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid()));
CREATE POLICY "Admin/Kasir can read all order items" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'kasir')));
CREATE POLICY "Users can insert own order items" ON public.order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid()));

-- Policies for payments
CREATE POLICY "Users can read own payments" ON public.payments FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE id = payments.order_id AND user_id = auth.uid()));
CREATE POLICY "Admin/Kasir can read all payments" ON public.payments FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'kasir')));
CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = payments.order_id AND user_id = auth.uid()));
CREATE POLICY "Admin/Kasir can update payments" ON public.payments FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'kasir')));

-- Policies for settings (Anyone can read, Admin can update)
CREATE POLICY "Anyone can read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admin can update settings" ON public.settings FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
