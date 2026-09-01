<template>
  <div class='min-h-screen bg-gray-50 flex flex-col relative pb-20'>
    
    <!-- Top Filter -->
    <div class='bg-white shadow-sm z-40 sticky top-0 border-b border-gray-100 p-4'>
      <div class="flex items-center gap-2">
        <label class="text-sm font-bold text-gray-700 flex-none">Tanggal:</label>
        <input v-model="selectedDate" @change="fetchReport" type="date" class="w-full bg-gray-100 border-none rounded-lg text-sm px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500">
      </div>
    </div>

    <!-- Main Report -->
    <div class='flex-1 p-4 overflow-y-auto'>
      <div v-if='isLoading' class='text-center py-10 text-gray-500'>Menghitung data...</div>
      
      <div v-else>
        <!-- Summary Cards -->
        <div class="grid grid-cols-2 gap-3 mb-6">
          <div class="bg-blue-600 text-white p-4 rounded-xl shadow-md">
            <p class="text-xs text-blue-100 mb-1 font-semibold uppercase tracking-wider">Total Transaksi</p>
            <p class="text-2xl font-bold">{{ totalTransactions }} <span class="text-sm font-normal">Order</span></p>
          </div>
          <div class="bg-green-600 text-white p-4 rounded-xl shadow-md">
            <p class="text-xs text-green-100 mb-1 font-semibold uppercase tracking-wider">Uang Masuk</p>
            <p class="text-lg md:text-2xl font-bold">Rp {{ totalRevenue.toLocaleString('id-ID') }}</p>
          </div>
        </div>

        <!-- Sold Products List -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
            <ShoppingBagIcon class="w-4 h-4 text-gray-500" />
            <h2 class="font-bold text-sm text-gray-700">Detail Produk Terjual</h2>
          </div>
          
          <div v-if="soldProducts.length === 0" class="p-8 text-center text-gray-400 text-sm">
            Belum ada penjualan di tanggal ini.
          </div>
          
          <div v-else class="divide-y divide-gray-100">
            <div v-for="item in soldProducts" :key="item.name" class="p-3 flex justify-between items-center hover:bg-gray-50">
              <div>
                <p class="font-bold text-sm text-gray-800">{{ item.name }}</p>
                <p class="text-xs text-gray-500">{{ item.qty }}x Terjual</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-bold text-blue-700">Rp {{ item.subtotal.toLocaleString('id-ID') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
      
    <!-- MODAL SETTINGS KASIR -->
    <div v-if='showSettings' class='fixed inset-0 bg-black bg-opacity-50 z-[1050] flex items-end md:items-center justify-center p-0 md:p-4' @click.self='showSettings = false'>
      <div class='bg-white w-full md:rounded-xl md:max-w-md shadow-xl overflow-hidden flex flex-col rounded-t-xl'>
        <div class='p-4 border-b flex justify-between items-center bg-gray-50'>
          <h2 class='font-bold text-lg flex items-center gap-2'><SettingsIcon class='w-5 h-5'/> Pengaturan Kasir</h2>
          <button @click='showSettings = false' class='text-gray-400 hover:text-red-500 bg-gray-200 rounded-full p-1'><XIcon class='w-5 h-5'/></button>
        </div>
        
        <div class='p-4 overflow-y-auto max-h-[70vh]'>
          <h3 class='font-bold text-sm text-gray-700 mb-3 border-b pb-1'>Informasi Struk / Nota</h3>
          <div class='mb-3'>
            <label class='block text-xs font-bold text-gray-600 mb-1'>Nama Kedai</label>
            <input v-model='shopName' type='text' class='w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50'>
          </div>
          <div class='mb-3'>
            <label class='block text-xs font-bold text-gray-600 mb-1'>Alamat Kedai</label>
            <textarea v-model='shopAddress' rows='2' class='w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50'></textarea>
          </div>

          <h3 class='font-bold text-sm text-gray-700 mb-3 border-b pb-1 mt-6'>Pengaturan Lainnya</h3>
          <button @click='router.push("/admin/pengaturan")' class='w-full bg-gray-100 text-gray-600 font-bold py-2 rounded-lg text-sm hover:bg-gray-200 mb-2'>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../services/supabase'
import { useAuthStore } from '../../stores/auth'
import { HomeIcon, ShoppingCartIcon, SettingsIcon, ShoppingBagIcon, XIcon } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(true)
const showSettings = ref(false)

const shopName = ref('Kedai Arzena')
const shopAddress = ref('Jl. Kebon Kacang Raya No. 1, Jakarta')

// Default to today in YYYY-MM-DD
const today = new Date()
const offset = today.getTimezoneOffset() * 60000
const localISOTime = (new Date(today - offset)).toISOString().split('T')[0]
const selectedDate = ref(localISOTime)

const totalTransactions = ref(0)
const totalRevenue = ref(0)
const soldProducts = ref([])

function goToAdminSettings() {
  showSettings.value = true
}

async function fetchReport() {
  isLoading.value = true
  
  // Create Date objects for local midnight
  const startDate = new Date(`${selectedDate.value}T00:00:00`)
  const endDate = new Date(`${selectedDate.value}T23:59:59`)

  // Convert to UTC ISO string for Supabase query
  const startOfDay = startDate.toISOString()
  const endOfDay = endDate.toISOString()

  // 1. Fetch completed orders for the date (status 'selesai')
  const { data: ordersData, error: ordersError } = await supabase.from('orders')
    .select('id, total_price, order_items(qty, subtotal, products(name))')
    .eq('status', 'selesai')
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay)
  
  if (ordersError) {
    console.error(ordersError)
    isLoading.value = false
    return
  }

  // 2. Aggregate Data
  let count = 0
  let revenue = 0
  const productMap = {}

  ordersData.forEach(order => {
    count++
    revenue += Number(order.total_price || 0)
    
    // Process items
    if (order.order_items) {
      order.order_items.forEach(item => {
        const pName = item.products?.name || 'Produk Dihapus'
        if (!productMap[pName]) {
          productMap[pName] = { name: pName, qty: 0, subtotal: 0 }
        }
        productMap[pName].qty += Number(item.qty || 0)
        productMap[pName].subtotal += Number(item.subtotal || 0)
      })
    }
  })

  totalTransactions.value = count
  totalRevenue.value = revenue
  
  // Convert object map to array and sort by qty descending
  soldProducts.value = Object.values(productMap).sort((a, b) => b.qty - a.qty)
  
  isLoading.value = false
}

onMounted(() => {
  fetchReport()
})
</script>
