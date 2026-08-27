ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS wa_template_pickup TEXT DEFAULT 'Halo Kak {nama}, pesanan Anda #{order_no} di Kedai Arzena sudah SIAP DIAMBIL. Silakan datang ke kedai ya! Pantau pesanan: {link}';

