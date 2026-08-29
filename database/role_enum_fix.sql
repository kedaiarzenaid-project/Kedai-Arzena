-- 1. Hapus sementara semua aturan keamanan (RLS) yang bergantung pada kolom role
DROP POLICY IF EXISTS "Admin/Kasir can read all users" ON public.users;
DROP POLICY IF EXISTS "Admin can update users" ON public.users;

DROP POLICY IF EXISTS "Anyone can read active products" ON public.products;
DROP POLICY IF EXISTS "Admin/Kasir can insert products" ON public.products;
DROP POLICY IF EXISTS "Admin/Kasir can update products" ON public.products;

DROP POLICY IF EXISTS "Admin can manage categories" ON public.categories;

DROP POLICY IF EXISTS "Admin/Kasir can read all orders" ON public.orders;
DROP POLICY IF EXISTS "Admin/Kasir can update orders" ON public.orders;

DROP POLICY IF EXISTS "Admin/Kasir can read all order items" ON public.order_items;

DROP POLICY IF EXISTS "Admin/Kasir can read all payments" ON public.payments;
DROP POLICY IF EXISTS "Admin/Kasir can update payments" ON public.payments;

DROP POLICY IF EXISTS "Admin can update settings" ON public.settings;

DROP FUNCTION IF EXISTS public.get_my_role();

-- 2. Ubah kolom menjadi tipe ENUM
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
UPDATE users SET role = 'user' WHERE role = 'pembeli' OR role IS NULL;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'kasir', 'user');
    END IF;
END $$;

ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role;
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user'::user_role;

-- 3. Pasang kembali fungsi dan aturan keamanan (RLS) dengan tipe data yang baru
CREATE OR REPLACE FUNCTION public.get_my_role() RETURNS text LANGUAGE sql SECURITY DEFINER AS $$ SELECT role::text FROM public.users WHERE id = auth.uid(); $$;

CREATE POLICY "Admin/Kasir can read all users" ON public.users FOR SELECT USING (public.get_my_role() IN ('admin', 'kasir'));
CREATE POLICY "Admin can update users" ON public.users FOR UPDATE USING (public.get_my_role() = 'admin');

CREATE POLICY "Anyone can read active products" ON public.products FOR SELECT USING (is_active = true OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin'::user_role, 'kasir'::user_role)));
CREATE POLICY "Admin/Kasir can insert products" ON public.products FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin'::user_role, 'kasir'::user_role)));
CREATE POLICY "Admin/Kasir can update products" ON public.products FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin'::user_role, 'kasir'::user_role)));

CREATE POLICY "Admin can manage categories" ON public.categories FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'::user_role));

CREATE POLICY "Admin/Kasir can read all orders" ON public.orders FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin'::user_role, 'kasir'::user_role)));
CREATE POLICY "Admin/Kasir can update orders" ON public.orders FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin'::user_role, 'kasir'::user_role)));

CREATE POLICY "Admin/Kasir can read all order items" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin'::user_role, 'kasir'::user_role)));

CREATE POLICY "Admin/Kasir can read all payments" ON public.payments FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin'::user_role, 'kasir'::user_role)));
CREATE POLICY "Admin/Kasir can update payments" ON public.payments FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin'::user_role, 'kasir'::user_role)));

CREATE POLICY "Admin can update settings" ON public.settings FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'::user_role));
