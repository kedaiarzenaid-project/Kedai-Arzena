<template>
  <div class='min-h-screen bg-gray-50 pb-24'>
    <header class='bg-white p-4 shadow-sm flex items-center justify-center sticky top-0 z-40 relative h-16'>
      <button @click='router.push("/")' class='absolute left-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-200 active:scale-90 transition-transform shadow-sm'>
        <ArrowLeftIcon class='w-5 h-5' />
      </button>
      <h1 class='text-lg font-bold tracking-widest'>PROFIL SAYA</h1>
    </header>

    <div class='p-4 max-w-2xl mx-auto'>
      <form @submit.prevent='saveProfile' class='bg-white p-5 rounded-xl shadow-sm mb-6'>
        <h2 class='font-bold text-gray-800 mb-4 border-b pb-2'>Data Diri & Alamat Utama</h2>
        
        <div class='mb-4'>
          <label class='block text-xs font-bold text-gray-700 mb-1'>Nama Lengkap</label>
          <input v-model='form.name' type='text' required class='w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500'>
        </div>

        <div class='mb-4'>
          <label class='block text-xs font-bold text-gray-700 mb-1'>Nomor HP (WhatsApp)</label>
          <input v-model='form.phone' type='tel' required placeholder='Contoh: 08123456789' class='w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500'>
        </div>

        <div class='mb-4'>
          <label class='block text-xs font-bold text-gray-700 mb-1'>Ganti Password (Opsional)</label>
          <input v-model='newPassword' type='password' minlength="6" placeholder='Kosongkan jika tidak ingin diganti' class='w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-yellow-50'>
        </div>

        <div class='mb-4'>
          <label class='block text-xs font-bold text-gray-700 mb-1'>Alamat Lengkap</label>
          <textarea v-model='form.address' rows='2' required placeholder='Cth: Jl. Sudirman No 12, RT 01...' class='w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500'></textarea>
        </div>

        <div class='mb-4'>
          <label class='block text-xs font-bold text-gray-700 mb-1'>Titik Peta Lokasi (GPS)</label>
          <p class='text-xs text-gray-500 mb-2'>Tekan tombol GPS untuk melacak, atau geser pin merah manual.</p>
          <div class='relative w-full h-48 bg-gray-200 rounded-lg overflow-hidden border mb-2'>
            <div id='profileMap' class='w-full h-full'></div>
            <button @click.prevent='detectGPS' type='button' class='absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-md z-[400] text-blue-600 flex items-center gap-1 font-bold text-sm'>
              <MapPinIcon class="w-4 h-4"/> GPS Otomatis
            </button>
          </div>
          <p class='text-xs text-gray-400'>Titik saat ini: {{ form.lat || '-' }}, {{ form.lng || '-' }}</p>
        </div>

        <button type='submit' class='w-full bg-green-600 text-white font-bold py-2.5 rounded-lg hover:bg-green-700 shadow-md' :disabled='isSaving'>
          {{ isSaving ? 'Menyimpan...' : 'Simpan Profil & Pengaturan' }}
        </button>
      </form>

      <!-- Khusus Admin / Kasir -->
      <button v-if="authStore.role === 'admin' || authStore.role === 'kasir'" @click="router.push('/kasir')" class='w-full mb-4 bg-yellow-50 text-yellow-700 font-bold py-3 rounded-xl hover:bg-yellow-100 shadow-sm border border-yellow-200'>
        Masuk Panel {{ authStore.role === 'admin' ? 'Admin' : 'Kasir' }}
      </button>

      <!-- Logout Button -->
      <button @click='doLogout' class='w-full bg-red-100 text-red-600 font-bold py-3 rounded-xl hover:bg-red-200 shadow-sm border border-red-200'>
        Keluar (Logout)
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { supabase } from '../../services/supabase'
import { ArrowLeftIcon, MapPinIcon } from 'lucide-vue-next'
import L from 'leaflet'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  name: '',
  phone: '',
  address: '',
  lat: '',
  lng: ''
})
const isSaving = ref(false)
const newPassword = ref('')

let map = null
let marker = null

async function fetchProfile() {
  const { data } = await supabase.from('users').select('*').eq('id', authStore.user.id).single()
  if (data) {
    form.value.name = data.name || ''
    form.value.phone = data.phone || ''
    form.value.address = data.address || ''
    form.value.lat = data.lat || ''
    form.value.lng = data.lng || ''
  }
}

function initMap() {
  if (map) return;
  // Default fallback if no saved lat/lng
  const initLat = form.value.lat ? parseFloat(form.value.lat) : -6.200000
  const initLng = form.value.lng ? parseFloat(form.value.lng) : 106.816666
  
  map = L.map('profileMap').setView([initLat, initLng], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Ac OpenStreetMap'
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
    form.value.lat = pos.lat;
    form.value.lng = pos.lng;
  });

  setTimeout(() => map.invalidateSize(), 500)
}

function detectGPS() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        form.value.lat = lat;
        form.value.lng = lng;
        if (map && marker) {
          map.setView([lat, lng], 16);
          marker.setLatLng([lat, lng]);
        }
      },
      (error) => {
        alert('Gagal mendeteksi lokasi. Silakan geser pin merah manual.');
      }
    );
  } else {
    alert('Browser tidak mendukung GPS');
  }
}

async function saveProfile() {
  try {
    isSaving.value = true
    const { error } = await supabase.from('users').update({
      name: form.value.name,
      phone: form.value.phone,
      address: form.value.address,
      lat: form.value.lat,
      lng: form.value.lng
    }).eq('id', authStore.user.id)
    
    if (error) throw error

    // Jika user mengisi password baru, update passwordnya
    if (newPassword.value && newPassword.value.trim().length > 0) {
      if (newPassword.value.length < 6) {
        throw new Error("Password baru minimal 6 karakter");
      }
      const { error: passError } = await supabase.auth.updateUser({
        password: newPassword.value
      });
      if (passError) throw passError;
    }

    alert('Profil dan pengaturan berhasil disimpan!')
    newPassword.value = ''; // Reset input password setelah sukses
    // Update authStore name memory if needed
    authStore.user.name = form.value.name
  } catch (err) {
    alert('Gagal menyimpan: ' + err.message)
  } finally {
    isSaving.value = false
  }
}

function doLogout() {
  authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  if (!authStore.user) {
    router.push('/login')
    return;
  }
  await fetchProfile()
  await nextTick()
  initMap()
})
</script>
