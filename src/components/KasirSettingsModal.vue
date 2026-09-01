<template>
  <div class='fixed inset-0 bg-black/20 backdrop-blur-md z-[1050] flex items-center justify-center p-4' @click.self='emit("close")'>
    <div class='bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]'>
      <div class='p-4 border-b flex justify-between items-center bg-gray-50 flex-none'>
        <h2 class='font-bold text-lg flex items-center gap-2'><SettingsIcon class='w-5 h-5'/> Pengaturan Kasir</h2>
        <button @click='emit("close")' class='text-gray-400 hover:text-red-500 bg-gray-200 rounded-full p-1'><XIcon class='w-5 h-5'/></button>
      </div>
      
      <div class='p-4 overflow-y-auto flex-1' v-if="settings">
        <!-- Form Cetak Nota -->
        <h3 class='font-bold text-sm text-gray-700 mb-3 border-b pb-1'>Informasi Toko</h3>
        <div class='mb-3'>
          <label class='block text-xs font-bold text-gray-600 mb-1'>Nama Kedai (Bisa tampil di nota)</label>
          <input v-model='shopName' type='text' class='w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white'>
        </div>
        <div class='mb-3'>
          <label class='block text-xs font-bold text-gray-600 mb-1'>Alamat Kedai Lengkap</label>
          <textarea v-model='settings.shop_address' rows='2' class='w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white'></textarea>
        </div>

        <h3 class='font-bold text-sm text-gray-700 mb-3 border-b pb-1 mt-6'>Titik GPS Toko (Penting Untuk Ongkir)</h3>
        
        <!-- Peta Interaktif -->
        <div class="mb-4">
          <div class="flex gap-2 mb-2">
            <div class="flex-1">
              <label class="block text-xs font-bold text-gray-700">Latitude</label>
              <input v-model="settings.shop_lat" @change="updateMapFromInput" type="text" class="w-full px-3 py-1.5 border rounded-lg text-sm">
            </div>
            <div class="flex-1">
              <label class="block text-xs font-bold text-gray-700">Longitude</label>
              <input v-model="settings.shop_lng" @change="updateMapFromInput" type="text" class="w-full px-3 py-1.5 border rounded-lg text-sm">
            </div>
            <button @click="autoDetectGPS" class="mt-4 px-3 bg-blue-100 text-blue-700 font-bold rounded-lg text-xs hover:bg-blue-200 border border-blue-200" title="Gunakan GPS Saat Ini">
              <MapPinIcon class="w-4 h-4 mx-auto"/>
            </button>
          </div>
          <div id="kasirMap" class="w-full h-48 rounded-lg border shadow-inner z-0"></div>
          <p class="text-[10px] text-gray-500 mt-1">*Geser pin merah di peta untuk menentukan posisi toko yang presisi.</p>
        </div>

        <h3 class='font-bold text-sm text-gray-700 mb-3 border-b pb-1 mt-6'>Printer Bluetooth</h3>
        <button class='w-full bg-blue-50 text-blue-700 font-bold py-2 rounded-lg text-sm border border-blue-200 flex items-center justify-center gap-2 mb-2'>
          <BluetoothIcon class='w-4 h-4'/> Cari & Konek Printer (Segera)
        </button>
        <p class='text-[10px] text-center text-gray-500'>Status: Belum terkoneksi</p>
      </div>

      <div class='p-4 text-center text-gray-500 text-sm' v-else>
        Memuat data...
      </div>

      <div class='p-4 border-t bg-gray-50 flex gap-2 flex-none'>
        <button @click='saveSettings' class='flex-1 bg-green-600 text-white font-bold py-2.5 rounded-lg hover:bg-green-700 text-sm' :disabled="isSaving">
          {{ isSaving ? 'Menyimpan...' : 'Simpan Pengaturan' }}
        </button>
        <button @click='authStore.logout()' class='flex-none bg-red-100 text-red-600 px-4 rounded-lg font-bold hover:bg-red-200 text-sm border border-red-200'>
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../stores/auth'
import { SettingsIcon, XIcon, BluetoothIcon, MapPinIcon } from 'lucide-vue-next'
import L from 'leaflet'

const emit = defineEmits(['close'])
const authStore = useAuthStore()

const settings = ref(null)
const isSaving = ref(false)
const shopName = ref('Kedai Arzena')

let map = null
let marker = null

async function loadSettings() {
  const { data } = await supabase.from('settings').select('*').eq('id', 1).single()
  if (data) {
    settings.value = data
    // Fallback if null
    if (!settings.value.shop_lat) settings.value.shop_lat = -6.200000
    if (!settings.value.shop_lng) settings.value.shop_lng = 106.816666
    
    // Asumsikan shop_address sudah ada, tapi jika user mau simpan shopName secara lokal di kasir (di localStorage)
    shopName.value = localStorage.getItem('kasir_shop_name') || 'Kedai Arzena'
    
    await nextTick()
    initMap()
  }
}

function initMap() {
  if (map) return;
  const initLat = parseFloat(settings.value.shop_lat)
  const initLng = parseFloat(settings.value.shop_lng)
  
  map = L.map('kasirMap').setView([initLat, initLng], 14);
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

  // Supaya map render full di dalam modal
  setTimeout(() => map.invalidateSize(), 500)
}

function autoDetectGPS() {
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
        alert("Gagal mendapatkan lokasi GPS. Pastikan izin lokasi aktif.");
      }
    );
  } else {
    alert("Browser tidak mendukung GPS.");
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

async function saveSettings() {
  isSaving.value = true
  localStorage.setItem('kasir_shop_name', shopName.value)
  
  try {
    const { error } = await supabase.from('settings').update({
      shop_address: settings.value.shop_address,
      shop_lat: settings.value.shop_lat,
      shop_lng: settings.value.shop_lng
    }).eq('id', 1)
    
    if (error) throw error
    alert('Pengaturan kasir berhasil disimpan!')
    emit('close')
  } catch (err) {
    alert('Gagal menyimpan: ' + err.message)
  }
  isSaving.value = false
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
/* Untuk memastikan Leaflet control di atas layer modal z-index tapi di bawah elemen modal utama jika dibutuhkan, 
namun karena ini z-[1050], leaflet akan otomatis berada di dalamnya. */
</style>
