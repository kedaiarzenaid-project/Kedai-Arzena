<template>
  <div class='min-h-screen bg-gray-100 flex flex-col relative'>
    <!-- Header -->
    <header class='bg-blue-800 text-white p-4 shadow-md sticky top-0 z-40 flex justify-between items-center'>
      <h1 class='text-xl font-bold flex items-center gap-2'>
        Kasir Arzena
      </h1>
      <div class='flex items-center'>
        <button @click='showSettings = true' class='p-2 hover:bg-blue-700 rounded-full transition-colors'>
          <SettingsIcon class='w-6 h-6' />
        </button>
      </div>
    </header>

    <!-- Main Board -->
    <div class='flex-1 p-4 overflow-y-auto'>
      <div v-if='isLoading' class='text-center py-10 text-gray-500'>Memuat data pesanan...</div>
      
      <!-- Audio element for notification -->
      <audio id='notifSound' src='https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' preload='auto'></audio>

      <div v-if='!isLoading && activeOrders.length === 0' class='text-center py-20'>
        <h2 class='text-2xl font-bold text-gray-400'>Kosong</h2>
        <p class='text-gray-500 mt-2'>Menunggu pesanan masuk...</p>
      </div>

      <!-- Grid Pesanan Simple -->
      <div class='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        <div v-for='order in activeOrders' :key='order.id' @click='openOrderDetails(order)' 
             class='bg-white rounded-xl shadow-sm border-l-4 overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow'
             :class='getBorderClass(order.status)'>
          <div class='p-4 flex justify-between items-start'>
            <div>
              <p class='font-bold text-lg text-gray-800 mb-1'>#{{ order.order_number }}</p>
              <p class='text-xs text-gray-500'>{{ formatTimeOnly(order.created_at) }}</p>
            </div>
            <span :class='getStatusBgClass(order.status)' class='px-2 py-1 rounded text-[10px] font-bold uppercase text-white'>
              {{ order.status }}
            </span>
          </div>
          <div class='px-4 pb-4 flex justify-between items-end mt-auto'>
            <div>
              <p class='text-[10px] text-gray-400 uppercase'>Metode</p>
              <p class='text-xs font-bold text-gray-700'>{{ order.delivery_type === "antar" ? "Antar" : "Ambil" }}</p>
            </div>
            <div class='text-right'>
              <p class='text-lg font-bold text-blue-700'>Rp {{ order.total_price.toLocaleString('id-ID') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Plus Button -->
    <button @click='router.push("/kasir/pos")' class='fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all z-40' title='Tambah Pesanan Offline'>
      <PlusIcon class='w-8 h-8' />
    </button>

    <!-- MODAL ORDER DETAILS -->
    <div v-if='selectedOrder' class='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4' @click.self='selectedOrder = null'>
      <div class='bg-white rounded-xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]'>
        <div class='p-4 border-b flex justify-between items-center bg-gray-50'>
          <div class='flex items-center gap-2'>
            <h2 class='font-bold text-lg'>Detail #{{ selectedOrder.order_number }}</h2>
            <span :class='getStatusBgClass(selectedOrder.status)' class='px-2 py-1 rounded-md text-xs font-bold uppercase text-white shadow-sm'>
              {{ selectedOrder.status }}
            </span>
          </div>
          <button @click='selectedOrder = null' class='text-gray-400 hover:text-red-500'><XIcon class='w-6 h-6'/></button>
        </div>
        
        <div class='p-4 overflow-y-auto flex-1'>
          <div class='mb-4 text-sm'>
            <p class='mb-1'><span class='text-gray-500 w-20 inline-block'>Waktu</span>: <b>{{ formatDate(selectedOrder.created_at) }}</b></p>
            <p class='mb-1'><span class='text-gray-500 w-20 inline-block'>Pelanggan</span>: <b>{{ selectedOrder.users?.name || 'Walk-in' }} ({{ selectedOrder.users?.phone || '-' }})</b></p>
            <p class='mb-1'><span class='text-gray-500 w-20 inline-block'>Metode</span>: <b>{{ selectedOrder.delivery_type === "antar" ? "Diantar" : "Ambil Sendiri" }}</b></p>
            <p v-if='selectedOrder.delivery_type === "antar"' class='mt-2 bg-blue-50 p-2 rounded text-xs'>?? {{ selectedOrder.delivery_address }}</p>
          </div>

          <div class='mb-4'>
            <h4 class='text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b pb-1'>Daftar Menu</h4>
            <div v-for='item in selectedOrder.order_items' :key='item.id' class='flex justify-between text-sm mb-1.5'>
              <span><b class='text-blue-700'>{{ item.qty }}x</b> {{ item.products?.name }}</span>
              <span class='text-gray-700 font-medium'>Rp {{ item.subtotal.toLocaleString('id-ID') }}</span>
            </div>
            <div v-if='selectedOrder.ongkir > 0' class='flex justify-between text-sm border-t pt-1.5 mt-1.5'>
              <span class='text-gray-500'>Ongkos Kirim</span>
              <span class='text-gray-700 font-medium'>Rp {{ selectedOrder.ongkir.toLocaleString('id-ID') }}</span>
            </div>
            <div class='flex justify-between font-bold text-lg border-t pt-2 mt-2 text-green-700'>
              <span>Total</span>
              <span>Rp {{ selectedOrder.total_price.toLocaleString('id-ID') }}</span>
            </div>
          </div>

          <div v-if='selectedOrder.notes' class='bg-yellow-50 text-yellow-800 p-2 rounded text-xs italic border border-yellow-100 mb-4'>
            Catatan: {{ selectedOrder.notes }}
          </div>
        </div>

        <div class='p-4 border-t bg-gray-50 flex flex-col gap-2'>
          <!-- Action Buttons based on status -->
          <button v-if='selectedOrder.status === "menunggu"' @click='updateStatus(selectedOrder.id, "diproses")' class='w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 shadow-sm'>
            Mulai Proses
          </button>
          
          <button v-if='selectedOrder.status === "diproses"' @click='updateStatus(selectedOrder.id, selectedOrder.delivery_type === "antar" ? "diantar" : "siap")' class='w-full bg-yellow-500 text-white font-bold py-3 rounded-lg hover:bg-yellow-600 shadow-sm'>
            {{ selectedOrder.delivery_type === "antar" ? 'Kirim Pesanan' : 'Pesanan Siap' }}
          </button>

          <div v-if='selectedOrder.status === "diantar" || selectedOrder.status === "siap"' class='flex gap-2'>
            <button @click='sendWA(selectedOrder)' class='flex-1 bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 shadow-sm flex items-center justify-center gap-1'>
              ?? Kirim WA
            </button>
            <button @click='updateStatus(selectedOrder.id, "selesai")' class='flex-1 bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-gray-900 shadow-sm'>
              Selesai ?
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL SETTINGS KASIR -->
    <div v-if='showSettings' class='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4' @click.self='showSettings = false'>
      <div class='bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden flex flex-col'>
        <div class='p-4 border-b flex justify-between items-center bg-gray-50'>
          <h2 class='font-bold text-lg flex items-center gap-2'><SettingsIcon class='w-5 h-5'/> Pengaturan Kasir</h2>
          <button @click='showSettings = false' class='text-gray-400 hover:text-red-500'><XIcon class='w-6 h-6'/></button>
        </div>
        
        <div class='p-4 overflow-y-auto max-h-[70vh]'>
          <!-- Form Cetak Nota -->
          <h3 class='font-bold text-sm text-gray-700 mb-3 border-b pb-1'>Informasi Struk / Nota</h3>
          <div class='mb-3'>
            <label class='block text-xs font-bold text-gray-600 mb-1'>Nama Kedai</label>
            <input v-model='shopName' type='text' class='w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500'>
          </div>
          <div class='mb-3'>
            <label class='block text-xs font-bold text-gray-600 mb-1'>Alamat Kedai (Untuk Nota & Map)</label>
            <textarea v-model='shopAddress' rows='2' class='w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500'></textarea>
          </div>
          <div class='mb-4'>
            <label class='block text-xs font-bold text-gray-600 mb-1'>Upload Logo Nota (URL/Gambar)</label>
            <input type='file' accept='image/*' class='text-xs w-full'>
            <p class='text-[10px] text-gray-400 mt-1'>*Opsional, akan dicetak di header nota bluetooth.</p>
          </div>

          <!-- Printer Bluetooth -->
          <h3 class='font-bold text-sm text-gray-700 mb-3 border-b pb-1 mt-6'>Koneksi Printer Bluetooth</h3>
          <button class='w-full bg-blue-100 text-blue-700 font-bold py-2 rounded-lg text-sm border border-blue-200 flex items-center justify-center gap-2 mb-2'>
            <BluetoothIcon class='w-4 h-4'/> Cari & Konek Printer
          </button>
          <p class='text-[10px] text-center text-gray-500'>Status: Belum terkoneksi</p>

          <!-- Map Pengiriman -->
          <h3 class='font-bold text-sm text-gray-700 mb-3 border-b pb-1 mt-6'>Titik GPS Kedai (Untuk Ongkir)</h3>
          <button @click='goToAdminSettings' class='w-full bg-gray-100 text-gray-600 font-bold py-2 rounded-lg text-sm border hover:bg-gray-200'>
            Atur GPS di Dashboard Admin
          </button>
        </div>

        <div class='p-4 border-t bg-gray-50 flex gap-2'>
          <button @click='showSettings = false' class='flex-1 bg-green-600 text-white font-bold py-2.5 rounded-lg hover:bg-green-700'>
            Simpan
          </button>
          <button @click='authStore.logout()' class='flex-none bg-red-100 text-red-600 px-4 rounded-lg font-bold hover:bg-red-200 border border-red-200'>
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { supabase } from '../../services/supabase'
import { SettingsIcon, PlusIcon, XIcon, BluetoothIcon } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const activeOrders = ref([])
const isLoading = ref(true)
const settings = ref(null)
let realtimeChannel = null

const selectedOrder = ref(null)
const showSettings = ref(false)

// Mock local state for settings form
const shopName = ref('Kedai Arzena')
const shopAddress = ref('Jl. Kebon Kacang Raya No. 1, Jakarta')

async function fetchSettings() {
  const { data } = await supabase.from('settings').select('*').eq('id', 1).single()
  if (data) settings.value = data
}

async function fetchActiveOrders() {
  isLoading.value = true
  const { data, error } = await supabase.from('orders')
    .select('*, order_items(id, qty, subtotal, products(name)), users(name, phone)')
    .in('status', ['menunggu', 'diproses', 'diantar', 'siap'])
    .order('created_at', { ascending: false }) // NEWEST FIRST
  
  if (data) activeOrders.value = data
  if (error) console.error(error)
  isLoading.value = false
}

function openOrderDetails(order) {
  selectedOrder.value = order
}

async function updateStatus(orderId, newStatus) {
  const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
  if (!error) {
    const order = activeOrders.value.find(o => o.id === orderId)
    if (order) order.status = newStatus
    if (newStatus === 'selesai') {
      activeOrders.value = activeOrders.value.filter(o => o.id !== orderId)
      selectedOrder.value = null
    }
  } else {
    alert('Gagal update status: ' + error.message)
  }
}

function sendWA(order) {
  if (!settings.value) return alert('Pengaturan WA belum dimuat')
  
  let template = order.delivery_type === 'antar' ? settings.value.wa_template_delivery : settings.value.wa_template_pickup
  if (!template) template = 'Halo {nama}, pesanan {order_no} Anda sudah siap!'

  const customerName = order.users?.name || 'Kak'
  const customerPhone = order.users?.phone || ''
  const trackingLink = window.location.origin + '/pesanan'

  let msg = template
    .replace('{nama}', customerName)
    .replace('{order_no}', '#' + order.order_number)
    .replace('{link}', trackingLink)

  if (!customerPhone) return alert('Nomor HP pelanggan tidak ditemukan.')
  
  let phoneStr = customerPhone.replace(/[^0-9]/g, '')
  if (phoneStr.startsWith('0')) phoneStr = '62' + phoneStr.substring(1)

  const waUrl = `https://wa.me/${phoneStr}?text=${encodeURIComponent(msg)}`
  window.open(waUrl, '_blank')
}

function getBorderClass(status) {
  switch(status) {
    case 'menunggu': return 'border-l-yellow-500'
    case 'diproses': return 'border-l-blue-500'
    case 'siap':
    case 'diantar': return 'border-l-green-500'
    default: return 'border-l-gray-300'
  }
}

function getStatusBgClass(status) {
  switch(status) {
    case 'menunggu': return 'bg-yellow-500'
    case 'diproses': return 'bg-blue-500'
    case 'siap':
    case 'diantar': return 'bg-green-500'
    default: return 'bg-gray-500'
  }
}

function formatTimeOnly(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function goToAdminSettings() {
  showSettings.value = false;
  router.push('/admin/pengaturan');
}

function playNotifSound() {
  const audio = document.getElementById('notifSound')
  if (audio) {
    audio.currentTime = 0
    audio.play().catch(e => console.log('Autoplay blocked by browser'))
  }
}

function setupRealtime() {
  realtimeChannel = supabase.channel('public:orders')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders' },
      (payload) => {
        playNotifSound()
        fetchActiveOrders()
      }
    )
    .subscribe()
}

onMounted(async () => {
  await fetchSettings()
  await fetchActiveOrders()
  setupRealtime()
})

onUnmounted(() => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
})
</script>

