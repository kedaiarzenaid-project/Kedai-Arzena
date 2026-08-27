# 📋 Product Requirements Document (PRD)
## Kedai Arzena — Web POS System

**Versi:** 1.3  
**Tanggal:** 26 Agustus 2026  
**Status:** Draft  
**Email Kontak:** kedaiarzena.id@gmail.com  

---

## 1. Ringkasan Proyek

Kedai Arzena Web POS adalah sistem kasir berbasis web & mobile (via Capacitor) yang dirancang untuk mendukung operasional penjualan makanan secara **dine-in**, **ambil sendiri (pickup)**, dan **antar (delivery)**. Sistem ini memiliki fitur lengkap mulai dari manajemen produk dengan foto, cetak struk via printer thermal Bluetooth, scan barcode/QR pesanan, pemrosesan pembayaran (payment gateway), hingga peta navigasi pengantaran berbasis GPS real-time.

> **Catatan Operasional:** Peran **Kurir pengantaran dirangkap oleh Kasir / Pemilik Usaha** itu sendiri — tidak ada kurir pihak ketiga di v1.0.

---

## 2. Tech Stack & Libraries

| Layer | Teknologi / Library | Fungsi / Kegunaan | Biaya |
| :--- | :--- | :--- | :--- |
| **Frontend** | Vue.js (Vite + Pinia + Vue Router) | Framework UI utama | Gratis (Open-Source) |
| **Backend / Database** | Supabase (PostgreSQL + Realtime + Auth + Storage) | Auth, Database, Storage Foto, & Realtime Event | Gratis (Free Tier) |
| **Source Control** | GitHub | Manajemen kode sumber | Gratis |
| **Peta & Navigasi** | Leaflet.js + OpenStreetMap (OSM) | Tampilan peta & penentuan titik antar | Gratis |
| **Mobile App (Kasir & Admin)** | Capacitor (Android) | Wrapper Vue.js → App Native untuk Kasir & Admin | Gratis |
| **Notifikasi In-Page (Web)** | Supabase Realtime + Web Audio API | Update status live & suara notifikasi (*"Ting!"*) saat web dibuka | Gratis |
| **Notifikasi Direct (WA)** | Direct WhatsApp Link (`wa.me`) | 1-Click kirim update status ke WA pembeli via template otomatis | Gratis (100%) |
| **Bluetooth Printer** | `esc-pos-encoder` + `@capacitor-community/bluetooth-le` | Format & cetak struk ke Printer Thermal Bluetooth 58mm/80mm | Gratis |
| **Barcode / QR Scanner** | `@capacitor-community/barcode-scanner` / `html5-qrcode` | Scan QR Code pesanan / Barcode produk via kamera HP | Gratis |
| **Foto & Media** | `@capacitor/camera` + Supabase Storage | Ambil & upload foto produk / bukti pembayaran | Gratis |
| **Payment Gateway** | Midtrans / Xendit *(TBD)* | Pembayaran otomatis: QRIS, VA, Transfer Bank | Pay-as-you-go per transaksi |
| **Deployment (Web)** | Vercel (HTTPS otomatis) | Hosting Web POS (Pembeli) dengan SSL gratis | Gratis |
| **PWA** | Vite PWA Plugin | Pembeli bisa "install" web ke Home Screen HP tanpa Play Store | Gratis |

---

## 3. Platform Per Role

| Role | Platform | Catatan |
| :--- | :--- | :--- |
| **Admin** | ✅ Web Browser + ✅ Capacitor Android App | Akses full management, laporan, & pengaturan sistem |
| **Kasir** | ✅ Web Browser + ✅ Capacitor Android App | Utama via App Android (Bluetooth Printer, Maps, Scan QR, & merangkap Kurir) |
| **Pembeli** | ✅ Web App (PWA) | Mengakses web via browser HP (bisa pasang ke Home Screen) |

---

## 4. Fitur Per Role

### 4.1 👑 Admin

> **Akun Awal Default:** `user: admin` | `pass: admin`

| No | Fitur | Deskripsi |
| :--: | :--- | :--- |
| 1 | **Manajemen Produk & Foto** | Input/edit/hapus produk: nama, harga, kategori, stok, barcode/SKU, dan **upload foto produk**. |
| 2 | **Manajemen Kategori** | Buat, edit, hapus kategori menu (misal: Makanan, Minuman, Snack, Paket). |
| 3 | **Manajemen Stok** | Update stok produk. Jika stok = 0, foto produk otomatis tampil **grayscale & tidak bisa dipilih** oleh pembeli. |
| 4 | **Manajemen User** | Tambah, edit, nonaktifkan akun Kasir. |
| 5 | **Laporan & Analytics** | Laporan harian/bulanan/per-item + **grafik dashboard**: produk terlaris, omzet, jam puncak penjualan. |
| 6 | **Pengaturan Ongkir** | Tentukan tarif ongkos kirim berdasarkan rentang jarak (misal: 0–2km = Rp5.000, dst). |
| 7 | **Pengaturan Radius Delivery** | Tentukan **jarak maksimum pengiriman** (km). Pesanan antar di luar radius otomatis ditolak sistem. |
| 8 | **Pengaturan Jam Operasional** | Atur jam buka & tutup kedai. Di luar jam operasional, halaman pembeli menampilkan status "Kedai Sedang Tutup" & tombol pesan dinonaktifkan. |
| 9 | **Pengaturan Titik Kedai** | Tentukan Latitude & Longitude lokasi Kedai Arzena di peta sebagai titik asal perhitungan ongkir. |
| 10 | **Pengaturan Template Pesan WA** | Kustomisasi template teks WhatsApp untuk update status pesanan. |

---

### 4.2 🧾 Kasir (merangkap Kurir)

> **Akun Awal Default:** `user: kasir` | `pass: kasir`  
> **Platform Utama:** Capacitor Android App

| No | Fitur | Deskripsi |
| :--: | :--- | :--- |
| 1 | **Scan QR Code Pesanan** | Scan QR Code dari layar HP pembeli untuk membuka detail pesanan dengan cepat. |
| 2 | **Cetak Struk Bluetooth** | Cetak nota belanja ke Printer Thermal Bluetooth (58mm/80mm) dengan format yang sudah dikonfigurasi. |
| 3 | **Lihat Pesanan Masuk** | Melihat semua pesanan baru dari pembeli secara real-time. |
| 4 | **Update Status Pesanan** | Ubah status: *Diterima → Diproses → Siap → Dalam Pengiriman → Selesai*. Status otomatis ter-update di web pembeli. |
| 5 | **1-Click Kirim WhatsApp** | Tombol cepat untuk membuka aplikasi WhatsApp dengan pesan status & link tracking yang sudah terisi rapi otomatis, siap kirim ke No. WA pembeli. |
| 6 | **Update Stok Produk** | Kasir bisa menambah/mengurangi stok langsung dari dashboard tanpa harus ke halaman admin. |
| 7 | **Verifikasi Pembayaran** | Konfirmasi bayar Cash atau cek status Payment Gateway. Bisa upload foto bukti transfer jika perlu. |
| 8 | **Navigasi Pengantaran (Maps)** | Buka peta Leaflet.js / link Google Maps tujuan pembeli untuk panduan jalan saat mengantar pesanan. |

---

### 4.3 🛒 Pembeli

> **Registrasi:** Cukup dengan **Nama & Nomor WhatsApp** (tanpa email/password kompleks).  
> **Platform:** Web App (PWA)

| No | Fitur | Deskripsi |
| :--: | :--- | :--- |
| 1 | **Lihat Menu dengan Foto** | Browse menu dengan foto produk estetik, harga, kategori, dan status stok. Produk stok habis tampil **abu-abu & tidak bisa dipilih**. |
| 2 | **Buat Pesanan** | Tambah produk ke keranjang dan lakukan checkout. |
| 3 | **Pilih Metode Pengambilan** | **Antar ke Lokasi** atau **Ambil Sendiri (Pickup)**. |
| 4 | **Deteksi Lokasi GPS Otomatis** | Saat pilih *Antar*, browser otomatis membaca posisi HP → pin tancap di peta Leaflet.js. Pembeli bisa geser pin jika perlu. |
| 5 | **Validasi Radius Delivery** | Jika lokasi pembeli melebihi radius maksimum yang diatur admin, sistem menampilkan pesan informatif & opsi antar dinonaktifkan. |
| 6 | **Hitung Ongkir Otomatis** | Ongkir tampil otomatis berdasarkan jarak dari kedai ke titik HP pembeli. |
| 7 | **Pilih Metode Bayar** | **Cash** (bayar saat terima) atau **Payment Gateway** (QRIS/VA/Transfer Bank). |
| 8 | **Lacak Status Pesanan (Live)** | Live tracking status pesanan via Supabase Realtime dengan indikator visual & suara notifikasi saat status berubah. QR Code nota tersedia untuk di-scan kasir. |
| 9 | **Riwayat & Repeat Order** | Lihat semua history pembelian sebelumnya dan bisa langsung **repeat order** dengan satu klik. |
| 10 | **Chat Tanya Pesanan** | Chat langsung ke WhatsApp Kedai Arzena untuk bertanya terkait menu atau pesanan. |

---

## 5. Fitur Sistem & Modul Integrasi

### 5.1 📡 Sistem Notifikasi (100% Gratis & Tanpa Ribet)

```
Kasir Update Status Pesanan ("Siap Diantar")
        │
        ├───────────────────────────────────────────────┐
        ▼ (Otomatis & Instan)                           ▼ (Opsi 1-Click Kasir)
┌───────────────────────────────────────┐       ┌───────────────────────────────────────┐
│ 1. Supabase Realtime + Audio Alert    │       │ 2. WhatsApp Direct Link (wa.me)       │
│ • Layar web pembeli update seketika   │       │ • Kasir klik "Kirim Update WA"        │
│ • Efek suara notifikasi ("Ting! 🔔")   │       │ • WhatsApp HP Kasir langsung terbuka  │
│ • 0 Biaya, 0 Setup Tambahan           │       │ • Teks & Link Tracking terisi lengkap │
│                                       │       │ • 0 Biaya API, 100% Pasti Masuk       │
└───────────────────────────────────────┘       └───────────────────────────────────────┘
```

**Template Pesan WhatsApp Otomatis (Contoh):**
> *"Halo Kak [Nama Pembeli], pesanan Anda #[No. Order] di Kedai Arzena saat ini: **Dalam Pengiriman 🛵**. Pantau pesanan: https://pos.kedaiarzena.id/track/[No. Order]"*

---

### 5.2 📦 Manajemen Stok

- Stok diupdate oleh **Admin dan Kasir**.
- Saat stok produk = 0:
  - Foto produk di halaman menu berubah menjadi **grayscale (hitam-putih)**.
  - Tombol "Tambah" pada produk tersebut **dinonaktifkan (disabled)**.
  - Label **"Habis"** muncul di atas foto produk.
- Stok otomatis berkurang saat pesanan berhasil dikonfirmasi.

---

### 5.3 🕐 Jam Operasional

- Admin mengatur jam buka & tutup kedai di halaman **Pengaturan**.
- Di luar jam operasional:
  - Banner "**Kedai Sedang Tutup**" muncul di halaman pembeli.
  - Tombol Pesan & Checkout dinonaktifkan.
  - Menampilkan jam buka berikutnya.

---

### 5.4 🗺️ Peta, Delivery & Radius

- **Titik Kedai** dikonfigurasi Admin di halaman Pengaturan.
- **Radius Maksimum** delivery ditentukan Admin (misal: 5 km atau 10 km).
- Jarak dihitung menggunakan **Haversine Formula** / **OSRM API** (gratis).
- Jika jarak pembeli > radius: opsi Antar dinonaktifkan + pesan informatif tampil.
- Kasir (sebagai kurir) menggunakan peta Leaflet.js atau tombol "Buka di Google Maps" untuk navigasi pengantaran.

---

### 5.5 🖨️ Format Struk Thermal Printer

```
================================
        KEDAI ARZENA
   [Alamat] | [No. WA]
================================
No. Order  : #ORZ-20260826-001
Kasir      : [Nama Kasir]
Tanggal    : 26 Agt 2026 - 20:00
--------------------------------
Nama Item        Qty   Harga
--------------------------------
Nasi Goreng      2x    Rp20.000
Es Teh Manis     2x    Rp 6.000
--------------------------------
Subtotal          :    Rp26.000
Ongkir (2.5 km)  :    Rp 5.000
TOTAL             :    Rp31.000
--------------------------------
Bayar : QRIS (Lunas ✓)
Metode: Antar ke Lokasi
--------------------------------
[QR CODE]
--------------------------------
     Terima Kasih! 🙏
  Pesanan bisa dilacak di:
  pos.kedaiarzena.id
================================
```

---

### 5.6 🔒 Keamanan & HTTPS

- HTTPS otomatis via **Vercel** — wajib agar GPS & Kamera bisa diakses browser.
- Autentikasi menggunakan **Supabase Auth** dengan proteksi route per-role.
- Row-Level Security (RLS) di Supabase untuk proteksi akses data antar user.

---

### 5.7 📲 PWA (Progressive Web App)

- Pembeli bisa **"Install"** web ke Home Screen HP langsung dari browser (Chrome/Safari) tanpa perlu ke Play Store.
- Icon app, splash screen, dan nama app dikonfigurasi via `vite-plugin-pwa`.

---

## 6. Skema Database (ERD Dasar)

```
users              products           categories
──────────         ──────────         ──────────
id (PK)            id (PK)            id (PK)
name               name               name
phone (WA)         category_id (FK)   created_at
role               price
created_at         stock
                   image_url
                   barcode
                   is_active

orders             order_items        payments
──────────         ──────────         ──────────
id (PK)            id (PK)            id (PK)
user_id (FK)       order_id (FK)      order_id (FK)
status             product_id (FK)    method (cash/gateway)
delivery_type      qty                status
delivery_lat       price_each         gateway_ref
delivery_lng       subtotal           proof_url
delivery_address                      paid_at
ongkir
total_price
notes
created_at

settings
──────────
id (PK)
shop_lat
shop_lng
max_delivery_radius_km
open_time
close_time
ongkir_zones (JSON)
wa_template_delivery (Text)
```

---

## 7. Alur Pesanan Delivery & Cetak Struk (Happy Path)

```
[1] Pembeli buka web / PWA → Daftar / Login via No. WA & Nama
        ↓
[2] Cek jam operasional → Jika tutup, tampil banner "Kedai Tutup"
        ↓
[3] Browse menu (produk stok habis tampil abu-abu & disabled)
        ↓
[4] Tambah ke Keranjang → Checkout → Pilih "Antar ke Lokasi"
        ↓
[5] GPS otomatis baca posisi HP → Pin tancap di peta Leaflet.js
    → Validasi radius → Ongkir otomatis terhitung
        ↓
[6] Pilih Metode Bayar → Konfirmasi Pesanan
        ↓
[7] Pesanan masuk ke Dashboard Kasir (Supabase Realtime)
    Kasir bisa klik "Kirim WA Konfirmasi" ke Pembeli
        ↓
[8] Kasir scan QR pesanan → Cetak Struk via Bluetooth Printer
    → Update status: "Diproses" (Layar pembeli update live + bunyi bell)
        ↓
[9] Status: "Siap" → "Dalam Pengiriman"
    → Kasir klik tombol "Kirim WA: Sedang Diantar"
    → Peta navigasi rute terbuka di HP Kasir untuk mengantar
        ↓
[10] Pesanan diterima → Kasir update "Selesai"
     → Layar pembeli update "Selesai" 🎉
     → Stok produk otomatis berkurang di database ✅
```

---

## 8. Non-Functional Requirements

| Kategori | Kebutuhan |
| :--- | :--- |
| **Performa** | Halaman menu load < 3 detik pada koneksi 4G; Scan QR < 1 detik. |
| **Tampilan** | Desain estetik, rapi, profesional, dan responsif (mobile-first UI). |
| **Keamanan** | HTTPS wajib, validasi input, RLS Supabase, proteksi route per-role. |
| **Konektivitas Printer** | Auto-reconnect ke printer Bluetooth yang pernah dipasangkan. |
| **Biaya Operasional** | 0 Rupiah untuk notifikasi (Realtime + wa.me). |

---

## 9. Out of Scope (v1.0)

- Fitur loyalty points / membership / poin reward.
- Kurir pihak ketiga (GoSend, Shopee Express, dll).
- Multi-outlet / multi-cabang.
- Rating & review pesanan *(kandidat v1.1)*.
- Kupon / kode diskon *(kandidat v1.1)*.

---

## 10. Open Questions

> [!IMPORTANT]
> Pertanyaan berikut perlu dikonfirmasi sebelum mulai coding:

1. **Payment Gateway:** Midtrans atau Xendit? *(Rekomendasi: Midtrans — sandbox Indonesia paling mudah, QRIS sudah support).*
2. **Ongkir:** Sistem zona harga (0–2km = Rp5.000, 2–5km = Rp10.000) atau tarif per-km murni?
3. **Domain:** Sudah punya domain sendiri atau sementara pakai subdomain Vercel?
4. **Printer Kasir:** Ukuran 58mm atau 80mm? Merk apa? *(untuk test format struk).*
5. **Radius Delivery:** Berapa km maksimum yang ingin diizinkan untuk pengantaran?

---

*Dokumen ini akan diperbarui seiring perkembangan proyek. Versi 1.3 — 26 Agustus 2026.*
