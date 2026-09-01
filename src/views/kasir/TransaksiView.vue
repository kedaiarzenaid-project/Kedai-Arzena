<template>
  <div class='min-h-screen bg-gray-50 flex flex-col relative pb-20'>
    <!-- Top Filter & Search -->
    <div class='bg-white shadow-sm z-40 sticky top-0 border-b border-gray-100'>
      <div class="p-4 flex gap-2">
        <div class="flex-1 relative">
          <SearchIcon class="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input v-model="searchQuery" type="text" placeholder="Cari order..." class="w-full pl-9 pr-3 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
        </div>
        <select v-model="filterStatus" class="w-28 bg-gray-100 border-none rounded-lg text-sm px-2 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500">
          <option value="semua">Semua</option>
          <option value="menunggu">Menunggu</option>
          <option value="diproses">Diproses</option>
          <option value="siap">Siap</option>
          <option value="diantar">Diantar</option>
        </select>
      </div>
    </div>

    <!-- Main Board -->
    <div class='flex-1 p-4 overflow-y-auto'>
      <div v-if='isLoading' class='text-center py-10 text-gray-500'>Memuat data pesanan...</div>
      
      <!-- Audio element for notification -->
      <audio id='notifSound' src='https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' preload='auto'></audio>

      <div v-if='!isLoading && filteredOrders.length === 0' class='text-center py-20'>
        <h2 class='text-lg font-bold text-gray-400'>Kosong</h2>
        <p class='text-gray-500 mt-1 text-sm'>Tidak ada pesanan.</p>
      </div>

      <!-- Grid Pesanan Simple & Kecil -->
      <div class='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3'>
        <div v-for='order in filteredOrders' :key='order.id' @click='openOrderDetails(order)' 
             class='bg-white rounded-lg shadow-sm border-l-4 p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors'
             :class='getBorderClass(order.status)'>
          <div>
            <p class='font-bold text-sm text-gray-800 mb-0.5'>#{{ order.order_number }}</p>
            <div class='flex items-center gap-1.5 text-[10px] text-gray-500'>
              <span>{{ formatTimeOnly(order.created_at) }}</span>
              <span>&bull;</span>
              <span class='uppercase'>{{ order.delivery_type === "antar" ? "Antar" : "Ambil" }}</span>
            </div>
          </div>
          <div class='text-right flex flex-col items-end'>
            <span :class='getStatusBgClass(order.status)' class='px-1.5 py-0.5 rounded text-[9px] font-bold uppercase text-white mb-1 inline-block'>
              {{ order.status }}
            </span>
            <p class='text-sm font-bold text-blue-700'>Rp {{ order.total_price.toLocaleString('id-ID') }}</p>
          </div>
        </div>
      </div>
    </div>

  <!-- Floating Plus Button -->
    <button @click='router.push("/kasir/pos")' class='fixed bottom-20 right-6 w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all z-40' title='Tambah Pesanan Offline'>
      <PlusIcon class='w-8 h-8' />
    </button>

    <!-- Bottom Navigation Menu -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center px-2 py-1 pb-safe z-[1000] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <router-link to="/kasir" exact class="flex flex-col items-center p-2 text-gray-400 w-16" active-class="!text-blue-600 font-bold">
        <HomeIcon class="w-5 h-5 mb-0.5" />
        <span class="text-[10px]">Dashboard</span>
      </router-link>
      
      <router-link to="/kasir/transaksi" class="flex flex-col items-center p-2 text-gray-400 hover:text-blue-600 transition w-16" active-class="!text-blue-600 font-bold">
        <ShoppingCartIcon class="w-5 h-5 mb-0.5" />
        <span class="text-[10px]">Transaksi</span>
      </router-link>
      
      <button @click="showSettings = true" class="flex flex-col items-center p-2 text-gray-400 hover:text-blue-600 transition w-16">
        <SettingsIcon class="w-5 h-5 mb-0.5" />
        <span class="text-[10px]">Pengaturan</span>
      </button>
    </div>

    <!-- MODAL ORDER DETAILS -->
    <div v-if='selectedOrder' class='fixed inset-0 bg-black bg-opacity-50 z-[1050] flex items-end md:items-center justify-center p-0 md:p-4' @click.self='selectedOrder = null'>
      <div class='bg-white w-full md:rounded-xl md:max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh] rounded-t-xl'>
        <div class='p-4 border-b flex justify-between items-center bg-gray-50'>
          <div class='flex items-center gap-2'>
            <h2 class='font-bold text-lg'>#{{ selectedOrder.order_number }}</h2>
            <span :class='getStatusBgClass(selectedOrder.status)' class='px-2 py-0.5 rounded-md text-xs font-bold uppercase text-white shadow-sm'>
              {{ selectedOrder.status }}
            </span>
          </div>
          <button @click='selectedOrder = null' class='text-gray-400 hover:text-red-500 bg-gray-200 rounded-full p-1'><XIcon class='w-5 h-5'/></button>
        </div>
        
        <div class='p-4 overflow-y-auto flex-1'>
          <div class='mb-4 text-sm'>
            <p class='mb-1'><span class='text-gray-500 w-20 inline-block'>Waktu</span>: <b>{{ formatDate(selectedOrder.created_at) }}</b></p>
            <p class='mb-1'><span class='text-gray-500 w-20 inline-block'>Pelanggan</span>: <b>{{ selectedOrder.users?.name || 'Walk-in' }} ({{ selectedOrder.users?.phone || '-' }})</b></p>
            <p class='mb-1'><span class='text-gray-500 w-20 inline-block'>Metode</span>: <b>{{ selectedOrder.delivery_type === "antar" ? "Diantar" : "Ambil Sendiri" }}</b></p>
            <p v-if='selectedOrder.delivery_type === "antar"' class='mt-2 bg-blue-50 p-2 rounded text-xs'>📌 {{ selectedOrder.delivery_address }}</p>
          </div>

          <div class='mb-4'>
            <h4 class='text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b pb-1'>Daftar Menu</h4>
            <div v-for='item in selectedOrder.order_items' :key='item.id' class='flex justify-between text-sm mb-1.5'>
              <span><b class='text-blue-700'>{{ item.qty }}x</b> {{ item.products?.name }}</span>
              <span class='text-gray-700 font-medium'>Rp {{ item.subtotal.toLocaleString('id-ID') }}</span>
            </div>
            <div v-if='selectedOrder.delivery_cost > 0' class='flex justify-between text-sm border-t pt-1.5 mt-1.5'>
              <span class='text-gray-500'>Ongkos Kirim</span>
              <span class='text-gray-700 font-medium'>Rp {{ selectedOrder.delivery_cost.toLocaleString('id-ID') }}</span>
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

        <div class='p-3 border-t bg-gray-50'>
          <div class='flex gap-2 mb-2'>
            <button v-if='selectedOrder.status === "menunggu"' @click='updateStatus(selectedOrder.id, "diproses")' class='flex-1 bg-blue-500 text-white font-bold py-2.5 rounded-lg hover:bg-blue-600 text-sm'>Terima (Proses)</button>
            <button v-if='selectedOrder.status === "diproses" && selectedOrder.delivery_type === "pickup"' @click='updateStatus(selectedOrder.id, "siap")' class='flex-1 bg-indigo-500 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-600 text-sm'>Siap Diambil</button>
            <button v-if='selectedOrder.status === "diproses" && selectedOrder.delivery_type === "antar"' @click='updateStatus(selectedOrder.id, "diantar")' class='flex-1 bg-indigo-500 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-600 text-sm'>Kirim (Diantar)</button>
            <button v-if='selectedOrder.status === "menunggu"' @click='updateStatus(selectedOrder.id, "batal")' class='flex-none bg-red-100 text-red-600 px-4 font-bold rounded-lg hover:bg-red-200 text-sm'>Tolak</button>
          </div>
          <div class='flex gap-2' v-if='["siap", "diantar"].includes(selectedOrder.status)'>
            <button @click='sendWA(selectedOrder)' class='flex-1 bg-green-500 text-white font-bold py-2.5 rounded-lg hover:bg-green-600 text-sm flex items-center justify-center gap-1'>
              Kirim WA
            </button>
            <button @click='updateStatus(selectedOrder.id, "selesai")' class='flex-1 bg-gray-800 text-white font-bold py-2.5 rounded-lg hover:bg-gray-900 text-sm'>
              Selesai ✔
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL SETTINGS KASIR -->
    <div v-if='showSettings' class='fixed inset-0 bg-black bg-opacity-50 z-[1050] flex items-end md:items-center justify-center p-0 md:p-4' @click.self='showSettings = false'>
      <div class='bg-white w-full md:rounded-xl md:max-w-md shadow-xl overflow-hidden flex flex-col rounded-t-xl'>
        <div class='p-4 border-b flex justify-between items-center bg-gray-50'>
          <h2 class='font-bold text-lg flex items-center gap-2'><SettingsIcon class='w-5 h-5'/> Pengaturan Kasir</h2>
          <button @click='showSettings = false' class='text-gray-400 hover:text-red-500 bg-gray-200 rounded-full p-1'><XIcon class='w-5 h-5'/></button>
        </div>
        
        <div class='p-4 overflow-y-auto max-h-[70vh]'>
          <!-- Form Cetak Nota -->
          <h3 class='font-bold text-sm text-gray-700 mb-3 border-b pb-1'>Informasi Struk / Nota</h3>
          <div class='mb-3'>
            <label class='block text-xs font-bold text-gray-600 mb-1'>Nama Kedai</label>
            <input v-model='shopName' type='text' class='w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50'>
          </div>
          <div class='mb-3'>
            <label class='block text-xs font-bold text-gray-600 mb-1'>Alamat Kedai</label>
            <textarea v-model='shopAddress' rows='2' class='w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50'></textarea>
          </div>

          <!-- Printer Bluetooth -->
          <h3 class='font-bold text-sm text-gray-700 mb-3 border-b pb-1 mt-6'>Koneksi Printer Bluetooth</h3>
          <button class='w-full bg-blue-50 text-blue-700 font-bold py-2 rounded-lg text-sm border border-blue-200 flex items-center justify-center gap-2 mb-2'>
            <BluetoothIcon class='w-4 h-4'/> Cari & Konek Printer
          </button>
          <p class='text-[10px] text-center text-gray-500'>Status: Belum terkoneksi</p>

          <h3 class='font-bold text-sm text-gray-700 mb-3 border-b pb-1 mt-6'>Pengaturan Lainnya</h3>
          <button @click='goToAdminSettings' class='w-full bg-gray-100 text-gray-600 font-bold py-2 rounded-lg text-sm hover:bg-gray-200 mb-2'>
            Atur GPS di Admin
          </button>
        </div>

        <div class='p-4 border-t bg-gray-50 flex gap-2'>
          <button @click='showSettings = false' class='flex-1 bg-green-600 text-white font-bold py-2.5 rounded-lg hover:bg-green-700 text-sm'>
            Tutup
          </button>
          <button @click='authStore.logout()' class='flex-none bg-red-100 text-red-600 px-4 rounded-lg font-bold hover:bg-red-200 text-sm'>
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { supabase } from '../../services/supabase'
import { SettingsIcon, ShoppingCartIcon, HomeIcon, XIcon, BluetoothIcon, SearchIcon, PlusIcon } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const activeOrders = ref([])
const isLoading = ref(true)
const settings = ref(null)
let realtimeChannel = null

const selectedOrder = ref(null)
const showSettings = ref(false)
const searchQuery = ref('')
const filterStatus = ref('semua')

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
    .order('created_at', { ascending: false })
  
  if (data) activeOrders.value = data
  if (error) console.error(error)
  isLoading.value = false
}

const filteredOrders = computed(() => {
  let res = activeOrders.value
  if (filterStatus.value !== 'semua') {
    res = res.filter(o => o.status === filterStatus.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    res = res.filter(o => String(o.order_number).toLowerCase().includes(q))
  }
  return res
})

function openOrderDetails(order) {
  selectedOrder.value = order
}

async function updateStatus(orderId, newStatus) {
  const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
  if (!error) {
    const order = activeOrders.value.find(o => o.id === orderId)
    if (order) order.status = newStatus
    if (newStatus === 'selesai' || newStatus === 'batal') {
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
