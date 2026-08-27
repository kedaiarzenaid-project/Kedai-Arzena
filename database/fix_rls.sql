-- 1. Buat fungsi aman (bypass RLS) untuk mengecek role
CREATE OR REPLACE FUNCTION public.get_my_role() RETURNS text AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Hapus policy yang menyebabkan infinite loop (Error 500)
DROP POLICY IF EXISTS "Admin/Kasir can read all users" ON public.users;
DROP POLICY IF EXISTS "Admin can update users" ON public.users;

-- 3. Ganti dengan policy baru menggunakan fungsi get_my_role()
CREATE POLICY "Admin/Kasir can read all users" ON public.users FOR SELECT USING (public.get_my_role() IN ('admin', 'kasir'));
CREATE POLICY "Admin can update users" ON public.users FOR UPDATE USING (public.get_my_role() = 'admin');

