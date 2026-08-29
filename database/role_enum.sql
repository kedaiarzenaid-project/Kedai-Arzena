-- 1. Pertama, ubah dulu semua data 'pembeli' lama menjadi 'user' agar tidak error
UPDATE users SET role = 'user' WHERE role = 'pembeli';

-- 2. Buat tipe data ENUM (pilihan baku)
CREATE TYPE user_role AS ENUM ('admin', 'kasir', 'user');

-- 3. Ubah tipe kolom role pada tabel users menjadi tipe ENUM yang baru dibuat
ALTER TABLE users 
  ALTER COLUMN role TYPE user_role 
  USING role::user_role;

-- 4. Ubah default value menjadi 'user' (agar otomatis jika tidak diisi)
ALTER TABLE users 
  ALTER COLUMN role SET DEFAULT 'user'::user_role;
