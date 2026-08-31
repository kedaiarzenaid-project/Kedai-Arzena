<template>
  <div class="pb-24">
    <h1 class='text-3xl font-bold text-gray-800 mb-6'>Pengaturan Kedai</h1>

    <div class='bg-white p-6 rounded-lg shadow-sm max-w-4xl'>
      <form @submit.prevent='saveSettings' v-if='settings'>
        <div class='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <!-- Jam Operasional -->
          <div class='col-span-1 md:col-span-2'>
            <h3 class='text-lg font-bold text-gray-700 border-b pb-2 mb-4'>Jam Operasional</h3>
            <div class='flex gap-4'>
              <div class='flex-1'>
                <label class='block text-gray-700 text-sm font-bold mb-2'>Jam Buka (24 Jam)</label>
                <input v-model='settings.open_time' type='time' lang='en-GB' required class='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'>
              </div>
              <div class='flex-1'>
                <label class='block text-gray-700 text-sm font-bold mb-2'>Jam Tutup (24 Jam)</label>
                <input v-model='settings.close_time' type='time' lang='en-GB' required class='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'>
              </div>
            </div>
          </div>

          <!-- Lokasi & Delivery -->
          <div class='col-span-1 md:col-span-2 mt-4'>
            <h3 class='text-lg font-bold text-gray-700 border-b pb-2 mb-4'>Lokasi & Pengantaran (Delivery)</h3>
            
            <div class='mb-4'>
              <label class='block text-gray-700 text-sm font-bold mb-2'>Titik Peta Lokasi Toko (GPS)</label>
              <p class='text-xs text-gray-500 mb-2'>Tekan tombol GPS atau geser pin biru untuk menentukan lokasi toko Anda.</p>
              <div class='relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden border mb-2'>
                <div id='shopMap' class='w-full h-full'></div>
                <button @click.prevent='detectGPS' type='button' class='absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-md z-[400] text-blue-600 flex items-center gap-1 font-bold text-sm'>
                  <MapPinIcon class="w-4 h-4"/> GPS Otomatis
                </button>
              </div>
            </div>

            <div class='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label class='block text-gray-700 text-sm font-bold mb-2'>Garis Lintang (Latitude)</label>
                <input v-model='settings.shop_lat' type='text' required class='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50' @input="updateMapFromInput">
              </div>
              <div>
                <label class='block text-gray-700 text-sm font-bold mb-2'>Garis Bujur (Longitude)</label>
                <input v-model='settings.shop_lng' type='text' required class='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50' @input="updateMapFromInput">
              </div>
              <div>
                <label class='block text-gray-700 text-sm font-bold mb-2'>Maksimal Radius (KM)</label>
                <input v-model='settings.max_delivery_radius_km' type='number' step='0.1' required class='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'>
              </div>
            </div>
          </div>

          <!-- Ongkir Zones -->
          <div class='col-span-1 md:col-span-2 mt-4'>
            <div class='flex justify-between items-center border-b pb-2 mb-4'>
              <h3 class='text-lg font-bold text-gray-700'>Zona Ongkos Kirim</h3>
              <button type='button' @click='addOngkirZone' class='text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200'>+ Tambah Zona</button>
            </div>
            
            <div v-for='(zone, index) in settings.ongkir_zones' :key='index' class='flex gap-4 mb-3 items-end'>
              <div class='flex-1'>
                <label class='block text-gray-700 text-xs font-bold mb-1'>Maksimal Jarak (KM)</label>
                <input v-model='zone.max_km' type='number' required class='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'>
              </div>
              <div class='flex-1'>
                <label class='block text-gray-700 text-xs font-bold mb-1'>Tarif Ongkir (Rp)</label>
                <input v-model='zone.price' type='number' required class='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'>
              </div>
              <button type='button' @click='removeOngkirZone(index)' class='px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200'>Hapus</button>
            </div>
            <p class='text-xs text-gray-500 mt-2'>*Jika jarak pembeli melebihi zona terakhir atau Maksimal Radius, pesanan (Delivery) tidak dapat dilakukan.</p>
          </div>

          <!-- Template WhatsApp -->
          <div class='col-span-1 md:col-span-2 mt-4'>
            <h3 class='text-lg font-bold text-gray-700 border-b pb-2 mb-4'>Template WhatsApp Kasir</h3>
            
            <div class='mb-4'>
              <label class='block text-gray-700 text-sm font-bold mb-2'>Format Pesan (Diantar / Delivery)</label>
              <textarea v-model='settings.wa_template_delivery' rows='2' class='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'></textarea>
            </div>
            
            <div>
              <label class='block text-gray-700 text-sm font-bold mb-2'>Format Pesan (Ambil Sendiri / Pickup)</label>
              <textarea v-model='settings.wa_template_pickup' rows='2' class='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'></textarea>
            </div>
            
            <p class='text-xs text-gray-500 mt-2'>Gunakan <b>{nama}</b>, <b>{order_no}</b>, dan <b>{link}</b> sebagai penanda agar sistem menggantinya otomatis.</p>
          </div>
        </div>

        <div class='mt-8 pt-4 border-t flex justify-end'>
          <button type='submit' class='bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition' :disabled='isSaving'>
            {{ isSaving ? 'Menyimpan...' : 'Simpan Pengaturan' }}
          </button>
        </div>
      </form>
      <div v-else class='text-center py-8 text-gray-500'>
        Memuat pengaturan...
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { supabase } from '../../services/supabase'
import { MapPinIcon } from 'lucide-vue-next'
import L from 'leaflet'

const settings = ref(null)
const isSaving = ref(false)

let map = null
let marker = null

async function fetchSettings() {
  const { data } = await supabase.from('settings').select('*').eq('id', 1).single()
  if (data) {
    settings.value = data
  }
}

function initMap() {
  if (map) return;
  // Default fallback if no saved lat/lng
  const initLat = settings.value.shop_lat ? parseFloat(settings.value.shop_lat) : -6.200000
  const initLng = settings.value.shop_lng ? parseFloat(settings.value.shop_lng) : 106.816666
  
  map = L.map('shopMap').setView([initLat, initLng], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });

  marker = L.marker([initLat, initLng], { draggable: true, icon }).addTo(map);
  
  marker.on('dragend', function (e) {
    const pos = marker.getLatLng();
    settings.value.shop_lat = pos.lat;
    settings.value.shop_lng = pos.lng;
  });

  setTimeout(() => map.invalidateSize(), 500)
}

function detectGPS() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        settings.value.shop_lat = lat;
        settings.value.shop_lng = lng;
        if (map && marker) {
          map.setView([lat, lng], 16);
          marker.setLatLng([lat, lng]);
        }
      },
      (error) => {
        alert('Gagal mendeteksi lokasi. Silakan geser pin manual.');
      }
    );
  } else {
    alert('Browser tidak mendukung GPS');
  }
}

function updateMapFromInput() {
  if (map && marker) {
    const lat = parseFloat(settings.value.shop_lat)
    const lng = parseFloat(settings.value.shop_lng)
    if (!isNaN(lat) && !isNaN(lng)) {
      map.setView([lat, lng], 16);
      marker.setLatLng([lat, lng]);
    }
  }
}

function addOngkirZone() {
  settings.value.ongkir_zones.push({ max_km: 0, price: 0 })
}

function removeOngkirZone(index) {
  settings.value.ongkir_zones.splice(index, 1)
}

async function saveSettings() {
  try {
    isSaving.value = true
    const { error } = await supabase.from('settings').update(settings.value).eq('id', 1)
    if (error) throw error
    alert('Pengaturan berhasil disimpan!')
  } catch (error) {
    alert('Gagal menyimpan pengaturan: ' + error.message)
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  await fetchSettings()
  await nextTick()
  initMap()
})
</script>
