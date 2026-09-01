<template>
  <div class='min-h-screen bg-gray-50 pb-24'>
    <header class='bg-white p-4 shadow-sm flex items-center justify-center sticky top-0 z-[1000] relative h-16'>
      <button @click='router.push("/")' class='absolute left-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-200 active:scale-90 transition-transform shadow-sm'>
        <ArrowLeftIcon class='w-5 h-5' />
      </button>
      <h1 class='text-lg font-bold tracking-widest'>CHECKOUT</h1>
    </header>

    <div class='p-4 max-w-2xl mx-auto'>
      <!-- Ringkasan Keranjang -->
      <div class='bg-white p-4 rounded-xl shadow-sm mb-4'>
        <h2 class='font-bold text-gray-800 border-b pb-2 mb-3'>Daftar Pesanan</h2>
        <div v-for='item in cartStore.items' :key='item.cart_id' class='flex justify-between items-center mb-3'>
          <div class='flex-1'>
            <h3 class='font-bold text-sm'>{{ item.name }}</h3>
            <p v-if="item.rasa" class='text-xs text-blue-600 font-semibold'>Rasa: {{ item.rasa }}</p>
            <p v-if="item.catatan" class='text-[10px] text-gray-400 italic'>Catatan: {{ item.catatan }}</p>
            <p class='text-xs text-gray-500'>Rp {{ item.price.toLocaleString('id-ID') }} x {{ item.qty }}</p>
          </div>
          <div class='flex items-center gap-2'>
            <button @click='cartStore.updateQty(item.cart_id, item.qty - 1)' class='w-7 h-7 bg-gray-200 rounded-full font-bold'>-</button>
            <span class='text-sm font-bold w-4 text-center'>{{ item.qty }}</span>
            <button @click='cartStore.updateQty(item.cart_id, item.qty + 1)' class='w-7 h-7 bg-green-200 text-green-700 rounded-full font-bold'>+</button>
            <button @click='cartStore.removeFromCart(item.cart_id)' class='ml-3 text-red-500 hover:text-red-700'><TrashIcon class='w-5 h-5'/></button>
          </div>
        </div>
        <div v-if='cartStore.items.length === 0' class='text-center text-sm text-gray-500 py-2'>Keranjang kosong.</div>
      </div>

      <!-- Tipe Pengambilan -->
      <div class='bg-white p-4 rounded-xl shadow-sm mb-4' v-if='cartStore.items.length > 0'>
        <h2 class='font-bold text-gray-800 mb-3'>Metode Penerimaan</h2>
        <div class='flex gap-3'>
          <label class='flex-1 border rounded-lg p-3 flex items-center gap-2 cursor-pointer' :class='deliveryType === "pickup" ? "border-green-500 bg-green-50" : ""'>
            <input type='radio' v-model='deliveryType' value='pickup' class='text-green-600 focus:ring-green-500'>
            <span class='font-bold text-sm'>Ambil Sendiri</span>
          </label>
          <label class='flex-1 border rounded-lg p-3 flex items-center gap-2 cursor-pointer' :class='deliveryType === "antar" ? "border-green-500 bg-green-50" : ""'>
            <input type='radio' v-model='deliveryType' value='antar' class='text-green-600 focus:ring-green-500'>
            <span class='font-bold text-sm'>Diantar (Delivery)</span>
          </label>
        </div>
      </div>

      <!-- Delivery Map Section -->
      <div v-if='deliveryType === "antar"' class='bg-white p-4 rounded-xl shadow-sm mb-4'>
        <h2 class='font-bold text-gray-800 mb-2'>Lokasi Pengantaran</h2>
        <p class='text-xs text-gray-500 mb-3'>Geser marker merah ke lokasi tepat Anda, atau tekan tombol GPS.</p>
        
        <div class='relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden mb-3'>
          <div id='map' class='w-full h-full'></div>
          <button @click.prevent='detectGPS' type='button' class='absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-md z-[400] text-blue-600'>
            📍 GPS
          </button>
        </div>

        <div class='mb-3'>
          <label class='block text-xs font-bold text-gray-700 mb-1'>Alamat Lengkap / Patokan</label>
          <textarea v-model='deliveryAddress' rows='2' class='w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500' placeholder='Cth: Rumah cat biru depan masjid...'></textarea>
        </div>

        <div v-if='calcError' class='bg-red-100 text-red-600 p-2 rounded text-xs font-bold mb-2'>
          {{ calcError }}
        </div>
        <div v-if='ongkir > 0' class='bg-blue-50 text-blue-700 p-2 rounded text-sm font-bold flex justify-between'>
          <span>Jarak: {{ (distance / 1000).toFixed(1) }} KM</span>
          <span>Ongkir: Rp {{ ongkir.toLocaleString('id-ID') }}</span>
        </div>
      </div>

      <!-- Catatan -->
      <div class='bg-white p-4 rounded-xl shadow-sm mb-4' v-if='cartStore.items.length > 0'>
        <label class='block text-sm font-bold text-gray-700 mb-2'>Catatan Pesanan (Opsional)</label>
        <input v-model='notes' type='text' placeholder='Cth: Pedas, tanpa saos...' class='w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500'>
      </div>

      <!-- Ringkasan Biaya -->
      <div class='bg-white p-4 rounded-xl shadow-sm mb-24' v-if='cartStore.items.length > 0'>
        <div class='flex justify-between text-sm mb-1 text-gray-600'>
          <span>Subtotal Menu</span>
          <span>Rp {{ cartStore.totalPrice.toLocaleString('id-ID') }}</span>
        </div>
        <div v-if='deliveryType === "antar"' class='flex justify-between text-sm mb-3 text-gray-600'>
          <span>Ongkos Kirim</span>
          <span>Rp {{ ongkir.toLocaleString('id-ID') }}</span>
        </div>
        
      </div>
    </div>

    <!-- Bottom Bar Checkout -->
    <div v-if='cartStore.items.length > 0' class='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pointer-events-auto' style='z-index: 9999; box-shadow: 0 -4px 12px rgba(0,0,0,0.05);'>
      <div class='w-full max-w-2xl mx-auto p-3 px-4 flex justify-between items-center'>
        <div class='flex flex-col'>
          <span class='text-xs text-gray-500 font-bold'>Total Bayar</span>
          <span class='text-lg font-bold text-green-700 leading-tight'>Rp {{ finalPrice.toLocaleString('id-ID') }}</span>
        </div>
        <button @click='processCheckout' :disabled='isProcessing || (deliveryType === "antar" && ongkir === 0 && distance > 0)' class='bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 shadow-sm'>
          {{ isProcessing ? 'Tunggu...' : 'Buat Pesanan' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { TrashIcon, ArrowLeftIcon } from 'lucide-vue-next'
import { useCartStore } from '../../stores/cart'
import { useAuthStore } from '../../stores/auth'
import { supabase } from '../../services/supabase'
import L from 'leaflet'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const deliveryType = ref('pickup')
const notes = ref('')
const deliveryAddress = ref('')
const ongkir = ref(0)
const distance = ref(0) // in meters
const calcError = ref('')
const isProcessing = ref(false)

const settings = ref(null)
let map = null
let marker = null
const userLat = ref(0)
const userLng = ref(0)

const finalPrice = computed(() => {
  return cartStore.totalPrice + (deliveryType.value === 'antar' ? ongkir.value : 0)
})

async function fetchSettings() {
  const { data } = await supabase.from('settings').select('*').eq('id', 1).single()
  if (data) settings.value = data
}

// Haversine formula for distance
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2-lat1);
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
}
function deg2rad(deg) { return deg * (Math.PI/180) }

function calculateOngkir() {
  if (!settings.value || deliveryType.value !== 'antar') return;
  
  const shopLat = parseFloat(settings.value.shop_lat)
  const shopLng = parseFloat(settings.value.shop_lng)
  const distKm = getDistanceFromLatLonInKm(shopLat, shopLng, userLat.value, userLng.value)
  distance.value = distKm * 1000

  if (distKm > settings.value.max_delivery_radius_km) {
    calcError.value = `${distKm.toFixed(1)} KM: Melebihi batas maksimal pengantaran (${settings.value.max_delivery_radius_km} KM).`
    ongkir.value = 0
    return;
  }

  calcError.value = ''
  let foundPrice = 0
  let sortedZones = [...settings.value.ongkir_zones].sort((a,b) => a.max_km - b.max_km)
  
  for (let z of sortedZones) {
    if (distKm <= z.max_km) {
      foundPrice = z.price
      break;
    }
  }

  // If it's within max_radius but no zone matched, fallback to highest zone
  if (foundPrice === 0 && sortedZones.length > 0) {
    foundPrice = sortedZones[sortedZones.length - 1].price
  }

  ongkir.value = foundPrice
}

function initMap() {
  if (map) return;
  // Default to shop location
  const initLat = settings.value ? parseFloat(settings.value.shop_lat) : -6.200000
  const initLng = settings.value ? parseFloat(settings.value.shop_lng) : 106.816666
  
  userLat.value = initLat
  userLng.value = initLng

  map = L.map('map').setView([initLat, initLng], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '� OpenStreetMap contributors'
  }).addTo(map);

  // Fix Leaflet missing icon bug
  const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });

  marker = L.marker([initLat, initLng], { draggable: true, icon }).addTo(map);
  
  marker.on('dragend', function (e) {
    const pos = marker.getLatLng();
    userLat.value = pos.lat;
    userLng.value = pos.lng;
    calculateOngkir();
  });

  setTimeout(() => map.invalidateSize(), 500)
}

function detectGPS() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        userLat.value = lat;
        userLng.value = lng;
        if (map && marker) {
          map.setView([lat, lng], 16);
          marker.setLatLng([lat, lng]);
          calculateOngkir();
        }
      },
      (error) => {
        alert('Gagal mendeteksi lokasi otomatis. Silakan geser pin merah secara manual.');
      }
    );
  } else {
    alert('Browser tidak mendukung GPS');
  }
}

watch(deliveryType, async (newVal) => {
  if (newVal === 'antar') {
    await nextTick()
    initMap()
    calculateOngkir()
  }
})

async function processCheckout() {
  if (deliveryType.value === 'antar' && (!deliveryAddress.value || ongkir.value === 0)) {
    if (calcError.value) return alert(calcError.value)
    return alert('Mohon lengkapi alamat dan pastikan jangkauan ongkir valid.')
  }

  try {
    isProcessing.value = true
    // Generate Order Number
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,'')
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    const orderNumber = `ORZ-${dateStr}-${randomNum}`

    // Gabungkan catatan per-item ke catatan utama
    let compiledNotes = notes.value ? `${notes.value}\n` : ''
    cartStore.items.forEach(item => {
      if (item.rasa || item.catatan) {
        compiledNotes += `- ${item.name} (${item.qty}x): `
        if (item.rasa) compiledNotes += `Rasa ${item.rasa}. `
        if (item.catatan) compiledNotes += `Catatan: ${item.catatan}. `
        compiledNotes += '\n'
      }
    })

    // Insert Order
    const { data: orderData, error: orderError } = await supabase.from('orders').insert([{
      order_number: orderNumber,
      user_id: authStore.user.id,
      status: 'menunggu',
      delivery_type: deliveryType.value,
      delivery_lat: deliveryType.value === 'antar' ? userLat.value : null,
      delivery_lng: deliveryType.value === 'antar' ? userLng.value : null,
      delivery_address: deliveryType.value === 'antar' ? deliveryAddress.value : null,
      ongkir: deliveryType.value === 'antar' ? ongkir.value : 0,
      total_price: finalPrice.value,
      notes: compiledNotes.trim()
    }]).select().single()

    if (orderError) throw orderError

    // Insert Order Items
    const orderItems = cartStore.items.map(item => ({
      order_id: orderData.id,
      product_id: item.id,
      qty: item.qty,
      price_each: item.price,
      subtotal: item.price * item.qty
    }))
    
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) throw itemsError

    // Update Stock
    for (let item of cartStore.items) {
      const newStock = item.stock - item.qty
      await supabase.from('products').update({ stock: newStock }).eq('id', item.id)
    }

    alert('Pesanan berhasil dibuat! Menunggu konfirmasi kasir.')
    cartStore.clearCart()
    router.push('/pesanan')
  } catch (error) {
    alert('Terjadi kesalahan saat membuat pesanan: ' + error.message)
  } finally {
    isProcessing.value = false
  }
}

onMounted(async () => {
  // allowed empty cart
  await fetchSettings()
})
</script>

