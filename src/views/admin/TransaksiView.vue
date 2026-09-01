<template>
  <div>
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <h1 class="text-3xl font-bold text-gray-800">Data Transaksi</h1>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
      <div class="flex-1 w-full relative">
        <SearchIcon class="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Cari No. Order atau Nama Pelanggan..." 
          class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
      </div>
      <div class="flex gap-2 w-full md:w-auto">
        <select v-model="filterStatus" class="flex-1 md:w-40 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="semua">Semua Status</option>
          <option value="menunggu">Menunggu</option>
          <option value="diproses">Diproses</option>
          <option value="siap">Siap (Pickup)</option>
          <option value="diantar">Diantar</option>
          <option value="selesai">Selesai</option>
          <option value="batal">Batal</option>
        </select>
        
        <select v-model="filterType" class="flex-1 md:w-40 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="semua">Semua Tipe</option>
          <option value="antar">Delivery (Antar)</option>
          <option value="pickup">Pickup (Ambil)</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
      <p class="mt-4 text-gray-500">Memuat transaksi...</p>
    </div>

    <!-- Data Table -->
    <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-max">
          <thead>
            <tr class="bg-gray-50 border-b">
              <th class="p-4 font-bold text-gray-600 text-sm">Waktu & No Order</th>
              <th class="p-4 font-bold text-gray-600 text-sm">Pelanggan</th>
              <th class="p-4 font-bold text-gray-600 text-sm">Tipe & Total</th>
              <th class="p-4 font-bold text-gray-600 text-sm">Status</th>
              <th class="p-4 font-bold text-gray-600 text-sm text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id" class="border-b hover:bg-gray-50 transition">
              <td class="p-4">
                <div class="font-bold text-gray-800">#{{ order.order_number }}</div>
                <div class="text-xs text-gray-500">{{ formatDate(order.created_at) }}</div>
              </td>
              <td class="p-4">
                <div class="font-semibold">{{ order.users?.name || 'Pelanggan Terhapus' }}</div>
                <div class="text-xs text-gray-500">{{ order.users?.phone || '-' }}</div>
              </td>
              <td class="p-4">
                <div class="text-sm">
                  <span class="inline-block px-2 py-0.5 rounded text-xs font-bold" :class="order.delivery_type === 'antar' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'">
                    {{ order.delivery_type === 'antar' ? 'Delivery' : 'Pickup' }}
                  </span>
                </div>
                <div class="font-bold text-green-700 mt-1">Rp {{ order.total_price?.toLocaleString('id-ID') }}</div>
              </td>
              <td class="p-4">
                <span class="px-3 py-1 rounded-full text-xs font-bold" :class="getStatusClass(order.status)">
                  {{ order.status.toUpperCase() }}
                </span>
              </td>
              <td class="p-4 text-center">
                <div class="flex justify-center gap-2">
                  <button @click="openViewModal(order)" class="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200" title="Detail">
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button @click="openEditModal(order)" class="p-2 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200" title="Edit">
                    <EditIcon class="w-4 h-4" />
                  </button>
                  <button @click="deleteOrder(order.id)" class="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Hapus">
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredOrders.length === 0">
              <td colspan="5" class="p-8 text-center text-gray-500">
                Tidak ada transaksi yang sesuai dengan pencarian/filter.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL DETAIL TRANSAKSI -->
    <div v-if="showViewModal" class="fixed inset-0 bg-black/50 z-[1050] flex items-center justify-center p-4" @click.self="showViewModal = false">
      <div class="bg-white rounded-xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 class="font-bold text-lg">Detail Order #{{ selectedOrder?.order_number }}</h2>
          <button @click="showViewModal = false" class="text-gray-400 hover:text-red-500"><XIcon class="w-6 h-6"/></button>
        </div>
        <div class="p-4 overflow-y-auto flex-1">
          <div class="mb-4">
            <p class="text-xs text-gray-500 font-bold mb-1">Status</p>
            <span class="px-2 py-1 rounded text-xs font-bold" :class="getStatusClass(selectedOrder.status)">{{ selectedOrder.status.toUpperCase() }}</span>
          </div>

          <div class="mb-4">
            <p class="text-xs text-gray-500 font-bold mb-1">Item Pesanan:</p>
            <div class="space-y-2">
              <div v-for="item in selectedOrder?.order_items" :key="item.id" class="flex justify-between text-sm bg-gray-50 p-2 rounded border">
                <span>{{ item.qty }}x {{ item.products?.name }}</span>
                <span class="font-bold">Rp {{ item.subtotal?.toLocaleString('id-ID') }}</span>
              </div>
            </div>
          </div>
          
          <div class="mb-4 pt-4 border-t text-sm">
            <div class="flex justify-between mb-1" v-if="selectedOrder?.delivery_type === 'antar'">
              <span class="text-gray-600">Ongkir:</span>
              <span class="font-bold">Rp {{ selectedOrder?.ongkir?.toLocaleString('id-ID') }}</span>
            </div>
            <div class="flex justify-between text-lg mt-2">
              <span class="font-bold">Total Akhir:</span>
              <span class="font-bold text-green-600">Rp {{ selectedOrder?.total_price?.toLocaleString('id-ID') }}</span>
            </div>
          </div>

          <div v-if="selectedOrder?.delivery_type === 'antar'" class="mb-4 p-3 bg-blue-50 rounded-lg text-sm border border-blue-100">
            <p class="font-bold text-blue-800 mb-1">Alamat Pengiriman:</p>
            <p class="text-blue-900">{{ selectedOrder.delivery_address }}</p>
          </div>

          <div class="mb-2 p-3 bg-gray-50 rounded-lg text-sm border">
            <p class="text-gray-500 mb-1">Metode Pembayaran:</p>
            <p class="font-bold uppercase">{{ selectedOrder?.payment_method || 'COD' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL EDIT TRANSAKSI -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 z-[1050] flex items-center justify-center p-4" @click.self="showEditModal = false">
      <div class="bg-white rounded-xl w-full max-w-sm shadow-xl overflow-hidden">
        <div class="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 class="font-bold text-lg">Edit Order #{{ editForm.order_number }}</h2>
          <button @click="showEditModal = false" class="text-gray-400 hover:text-red-500"><XIcon class="w-6 h-6"/></button>
        </div>
        <form @submit.prevent="saveEdit" class="p-4">
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Status Pesanan</label>
            <select v-model="editForm.status" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500">
              <option value="menunggu">Menunggu</option>
              <option value="diproses">Diproses</option>
              <option value="siap">Siap (Pickup)</option>
              <option value="diantar">Diantar</option>
              <option value="selesai">Selesai</option>
              <option value="batal">Batal</option>
            </select>
          </div>
          <div class="mb-6">
            <label class="block text-sm font-bold text-gray-700 mb-1">Ongkos Kirim (Rp)</label>
            <input v-model="editForm.ongkir" type="number" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" :disabled="selectedOrder?.delivery_type !== 'antar'">
            <p class="text-xs text-gray-500 mt-1" v-if="selectedOrder?.delivery_type !== 'antar'">Hanya berlaku untuk pesanan Delivery.</p>
          </div>
          
          <div class="flex gap-2">
            <button type="button" @click="showEditModal = false" class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200">Batal</button>
            <button type="submit" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700" :disabled="isSavingEdit">
              {{ isSavingEdit ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../../services/supabase'
import { SearchIcon, EyeIcon, EditIcon, TrashIcon, XIcon } from 'lucide-vue-next'

const orders = ref([])
const isLoading = ref(true)

const searchQuery = ref('')
const filterStatus = ref('semua')
const filterType = ref('semua')

const showViewModal = ref(false)
const showEditModal = ref(false)
const selectedOrder = ref(null)
const isSavingEdit = ref(false)

const editForm = ref({
  id: null,
  order_number: '',
  status: '',
  ongkir: 0
})

async function fetchOrders() {
  isLoading.value = true
  const { data, error } = await supabase.from('orders')
    .select('*, order_items(id, qty, subtotal, products(name)), users(name, phone)')
    .order('created_at', { ascending: false })
  
  if (data) {
    orders.value = data
  }
  if (error) console.error(error)
  isLoading.value = false
}

const filteredOrders = computed(() => {
  let result = orders.value

  if (filterStatus.value !== 'semua') {
    result = result.filter(o => o.status === filterStatus.value)
  }

  if (filterType.value !== 'semua') {
    result = result.filter(o => o.delivery_type === filterType.value)
  }

  if (searchQuery.value.trim() !== '') {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(o => {
      const orderNo = String(o.order_number).toLowerCase()
      const userName = (o.users?.name || '').toLowerCase()
      return orderNo.includes(q) || userName.includes(q)
    })
  }

  return result
})

function getStatusClass(status) {
  switch(status) {
    case 'menunggu': return 'bg-yellow-100 text-yellow-700'
    case 'diproses': return 'bg-blue-100 text-blue-700'
    case 'siap':
    case 'diantar': return 'bg-indigo-100 text-indigo-700'
    case 'selesai': return 'bg-green-100 text-green-700'
    case 'batal': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function openViewModal(order) {
  selectedOrder.value = order
  showViewModal.value = true
}

function openEditModal(order) {
  selectedOrder.value = order
  editForm.value = {
    id: order.id,
    order_number: order.order_number,
    status: order.status,
    ongkir: order.ongkir || 0
  }
  showEditModal.value = true
}

async function saveEdit() {
  isSavingEdit.value = true
  try {
    // If delivery cost changed, we need to recalculate total_price
    let newTotal = selectedOrder.value.total_price
    
    if (selectedOrder.value.delivery_type === 'antar' && editForm.value.ongkir !== selectedOrder.value.ongkir) {
      const oldCost = selectedOrder.value.ongkir || 0
      const newCost = Number(editForm.value.ongkir)
      newTotal = newTotal - oldCost + newCost
    }

    const updates = {
      status: editForm.value.status,
      ongkir: Number(editForm.value.ongkir),
      total_price: newTotal
    }

    const { error } = await supabase.from('orders').update(updates).eq('id', editForm.value.id)
    if (error) throw error

    // Update local state
    const idx = orders.value.findIndex(o => o.id === editForm.value.id)
    if (idx !== -1) {
      orders.value[idx].status = editForm.value.status
      orders.value[idx].ongkir = updates.ongkir
      orders.value[idx].total_price = updates.total_price
    }
    
    showEditModal.value = false
  } catch (err) {
    alert('Gagal mengupdate transaksi: ' + err.message)
  } finally {
    isSavingEdit.value = false
  }
}

async function deleteOrder(orderId) {
  if (confirm('Yakin ingin menghapus transaksi ini? Data akan hilang permanen!')) {
    try {
      // First delete from order_items manually to be safe (if CASCADE isn't enabled)
      await supabase.from('order_items').delete().eq('order_id', orderId)
      
      const { error } = await supabase.from('orders').delete().eq('id', orderId)
      if (error) throw error
      
      orders.value = orders.value.filter(o => o.id !== orderId)
    } catch (err) {
      alert('Gagal menghapus transaksi: ' + err.message)
    }
  }
}

onMounted(() => {
  fetchOrders()
})
</script>
