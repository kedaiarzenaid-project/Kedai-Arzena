<template>
  <div class='min-h-screen bg-gray-50 pb-24'>
    <header class='bg-white p-4 shadow-sm flex items-center justify-center sticky top-0 z-[1000] relative h-16'>
      <button @click='router.push("/")' class='absolute left-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-200 active:scale-90 transition-transform shadow-sm'>
        <ArrowLeftIcon class='w-5 h-5' />
      </button>
      <h1 class='text-lg font-bold tracking-widest'>DAFTAR PESANAN</h1>
    </header>

    <div class='p-4 max-w-2xl mx-auto'>
      <div v-if='isLoading' class='text-center py-10 text-gray-400'>
        Memuat data pesanan...
      </div>
      
      <div v-else-if='orders.length === 0' class='text-center py-20'>
        <div class='bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4'>
          <ClipboardListIcon class='w-10 h-10 text-gray-400' />
        </div>
        <h2 class='text-lg font-bold text-gray-800'>Belum ada pesanan</h2>
        <p class='text-sm text-gray-500 mb-6'>Yuk, mulai pesan menu favoritmu sekarang!</p>
        <router-link to='/' class='bg-green-600 text-white font-bold px-6 py-2.5 rounded-full hover:bg-green-700 shadow-md'>
          Lihat Menu
        </router-link>
      </div>

      <div v-else class='flex flex-col gap-4'>
        <div v-for='order in orders' :key='order.id' class='bg-white rounded-xl shadow-sm border overflow-hidden'>
          <div class='p-3 border-b bg-gray-50 flex justify-between items-center'>
            <div>
              <p class='text-xs text-gray-500 font-bold'>{{ formatDate(order.created_at) }}</p>
              <p class='text-sm font-bold text-green-700'>#{{ order.order_number }}</p>
            </div>
            <span :class='getStatusClass(order.status)' class='text-xs font-bold px-3 py-1 rounded-full'>
              {{ order.status.toUpperCase() }}
            </span>
          </div>
          
          <div class='p-4'>
            <!-- Daftar Item -->
            <div class='mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100'>
              <h4 class='text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-wider'>Ringkasan Pesanan</h4>
              <div v-for='(item, idx) in order.order_items' :key='idx' class='flex justify-between text-xs text-gray-700 mb-1.5'>
                <span><b class='text-green-700'>{{ item.qty }}x</b> {{ item.products?.name || 'Produk' }}</span>
                <span>Rp {{ item.subtotal.toLocaleString('id-ID') }}</span>
              </div>
              <div v-if='order.ongkir > 0' class='flex justify-between text-xs text-gray-700 border-t border-gray-200 pt-1.5 mt-1.5'>
                <span>Ongkos Kirim</span>
                <span>Rp {{ order.ongkir.toLocaleString('id-ID') }}</span>
              </div>
              <div v-if='order.notes' class='mt-2 text-[11px] text-gray-500 italic bg-yellow-50 p-1.5 rounded border border-yellow-100'>
                Catatan: {{ order.notes }}
              </div>
            </div>

            <!-- Metode & Total -->
            <div class='flex justify-between items-end mb-2'>
              <div class='flex-1 pr-4'>
                <p class='text-sm font-bold text-gray-800'>Metode: {{ order.delivery_type === "antar" ? "Diantar (Delivery)" : "Ambil Sendiri" }}</p>
                <p v-if='order.delivery_type === "antar"' class='text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed'>{{ order.delivery_address }}</p>
              </div>
              <div class='text-right'>
                <p class='text-xs text-gray-500'>Total Bayar</p>
                <p class='text-lg font-bold text-green-700 leading-tight'>Rp {{ order.total_price.toLocaleString('id-ID') }}</p>
              </div>
            </div>

            <!-- Progress Tracking -->
            <div v-if='order.status !== "selesai" && order.status !== "dibatalkan"' class='mt-4 pt-4 border-t'>
              <div class='flex justify-between items-center mb-1 relative'>
                <div class='absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded'></div>
                <div :class='getProgressClass(order.status, "menunggu")' class='w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10'>1</div>
                <div :class='getProgressClass(order.status, "diproses")' class='w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10'>2</div>
                <div :class='getProgressClass(order.status, order.delivery_type === "antar" ? "diantar" : "siap")' class='w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10'>3</div>
              </div>
              <div class='flex justify-between text-[10px] font-bold text-gray-400 px-1'>
                <span :class='order.status === "menunggu" ? "text-yellow-600" : ""'>Masuk</span>
                <span :class='order.status === "diproses" ? "text-blue-600" : ""'>Diproses</span>
                <span :class='(order.status === "diantar" || order.status === "siap") ? "text-green-600" : ""'>{{ order.delivery_type === "antar" ? "Diantar" : "Siap Ambil" }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { supabase } from '../../services/supabase'
import { ArrowLeftIcon, ClipboardListIcon } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const orders = ref([])
const isLoading = ref(true)

async function fetchOrders() {
  isLoading.value = true
  const { data } = await supabase.from('orders')
    .select('*, order_items(qty, subtotal, products(name))')
    .eq('user_id', authStore.user.id)
    .order('created_at', { ascending: false })
  
  if (data) {
    orders.value = data
  }
  isLoading.value = false
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function getStatusClass(status) {
  switch(status) {
    case 'menunggu': return 'bg-yellow-100 text-yellow-700'
    case 'diproses': return 'bg-blue-100 text-blue-700'
    case 'siap': return 'bg-green-100 text-green-700'
    case 'diantar': return 'bg-purple-100 text-purple-700'
    case 'selesai': return 'bg-gray-200 text-gray-700'
    case 'dibatalkan': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

function getProgressClass(currentStatus, targetStep) {
  const states = ['menunggu', 'diproses', 'diantar', 'siap', 'selesai']
  const currentIdx = states.indexOf(currentStatus)
  
  // normalize step
  let targetIdx = states.indexOf(targetStep)
  if (targetStep === 'diantar' || targetStep === 'siap') {
    targetIdx = 2 // treat step 3 as index 2 for progress logic
  }
  
  let activeIdx = currentIdx;
  if (currentStatus === 'diantar' || currentStatus === 'siap') activeIdx = 2;
  if (currentStatus === 'selesai') activeIdx = 99;

  if (activeIdx > targetIdx) return 'bg-green-500 text-white'
  if (activeIdx === targetIdx) {
    if (currentStatus === 'menunggu') return 'bg-yellow-500 text-white'
    if (currentStatus === 'diproses') return 'bg-blue-500 text-white'
    return 'bg-green-500 text-white'
  }
  return 'bg-gray-200 text-gray-500'
}

onMounted(() => {
  if (!authStore.user) return router.push('/login')
  fetchOrders()
})
</script>

