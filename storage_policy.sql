-- Kebijakan Storage untuk Bucket product-images

-- Izinkan semua orang (publik) melihat foto produk
CREATE POLICY "Publik bisa melihat foto" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

-- Izinkan pengguna yang login (Admin) mengupload foto
CREATE POLICY "Admin bisa upload foto" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Izinkan pengguna yang login (Admin) mengedit foto
CREATE POLICY "Admin bisa edit foto" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Izinkan pengguna yang login (Admin) menghapus foto
CREATE POLICY "Admin bisa hapus foto" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

