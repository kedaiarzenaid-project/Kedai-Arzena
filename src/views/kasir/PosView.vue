<template>
  <div class='min-h-screen bg-gray-100 flex flex-col md:flex-row'>
    <!-- Left Side: Menu Grid -->
    <div class='flex-1 flex flex-col h-screen'>
      <header class='bg-blue-800 text-white py-2 px-4 shadow-sm flex justify-between items-center z-10'>
        <div class='flex items-center gap-3'>
          <button @click='router.push("/kasir")' class='p-2 bg-blue-700 rounded-full hover:bg-blue-600'><ArrowLeftIcon class='w-5 h-5'/></button>
          <h1 class='text-lg font-bold'>Menu Kasir</h1>
        </div>
        <div class='w-1/3'>
          <input v-model='searchQuery' type='text' placeholder='Cari menu...' class='w-full px-3 py-1.5 rounded-full text-sm text-white bg-white/20 placeholder-white/70 focus:bg-white/30 focus:outline-none border border-white/10 shadow-inner'>
        </div>
      </header>

      <!-- Kategori -->
      <div class='py-2 px-4 bg-white shadow-sm flex gap-2 overflow-x-auto whitespace-nowrap z-10 no-scrollbar'>
        <button @click='activeCategory = null' :class='activeCategory === null ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"' class='px-4 py-1.5 rounded-full text-sm font-bold border transition-colors'>Semua</button>
        <button v-for='cat in categories' :key='cat.id' @click='activeCategory = cat.id' :class='activeCategory === cat.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"' class='px-4 py-1.5 rounded-full text-sm font-bold border transition-colors'>{{ cat.name }}</button>
      </div>

      <!-- Grid Produk -->
      <div class='flex-1 p-4 overflow-y-auto'>
        <div class='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>
          <div v-for='prod in filteredProducts' :key='prod.id' @click='prod.stock > 0 ? addToCart(prod) : null' 
               class='bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-all active:scale-95 select-none relative'
               :class='prod.stock === 0 ? "opacity-60 cursor-not-allowed" : ""'>
            <div class='aspect-[4/3] w-full bg-gray-200 overflow-hidden relative'>
              <img v-if='prod.image_url' :src='prod.image_url' class='w-full h-full object-cover'>
              <div v-if='prod.stock === 0' class='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center'><span class='text-white font-bold bg-red-600 px-2 py-1 rounded text-xs'>HABIS</span></div>
            </div>
            <div class='p-2 flex-1 flex flex-col justify-between'>
              <h3 class='text-xs font-bold text-gray-800 leading-tight mb-1 line-clamp-2'>{{ prod.name }}</h3>
              <p class='text-blue-600 font-bold text-xs'>Rp {{ prod.price.toLocaleString('id-ID') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side: Cart & Checkout -->
    <div class='w-full md:w-96 bg-white shadow-xl flex flex-col h-screen z-20 border-l'>
      <div class='p-3 px-4 bg-gray-50 border-b flex justify-between items-center'>
        <h2 class='font-bold text-lg text-gray-800'>Keranjang</h2>
        <button @click='clearCart' class='text-red-500 text-xs font-bold hover:bg-red-50 px-2 py-1 rounded'>Kosongkan</button>
      </div>

      <!-- Items -->
      <div class='flex-1 overflow-y-auto p-4'>
        <div v-if='cart.length === 0' class='h-full flex flex-col items-center justify-center text-gray-400'>
          <ShoppingCartIcon class='w-12 h-12 mb-2 opacity-50' />
          <p>Keranjang kosong</p>
        </div>
        <div v-else class='flex flex-col gap-3'>
          <div v-for='item in cart' :key='item.id' class='flex justify-between items-center border-b pb-2'>
            <div class='flex-1 pr-2'>
              <p class='text-sm font-bold text-gray-800 leading-tight'>{{ item.name }}</p>
              <p class='text-xs text-gray-500'>Rp {{ item.price.toLocaleString('id-ID') }}</p>
            </div>
            <div class='flex items-center gap-2'>
              <button @click='updateQty(item.id, item.qty - 1)' class='w-6 h-6 bg-gray-200 rounded-full font-bold flex items-center justify-center'>-</button>
              <span class='text-sm font-bold w-4 text-center'>{{ item.qty }}</span>
              <button @click='updateQty(item.id, item.qty + 1)' class='w-6 h-6 bg-blue-200 text-blue-700 rounded-full font-bold flex items-center justify-center'>+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Checkout Panel -->
      <div class='p-3 px-4 bg-gray-50 border-t'>
        <div class='mb-3'>
          <label class='block text-xs font-bold text-gray-500 mb-1'>Metode Pembayaran</label>
          <div class='flex gap-2'>
            <button @click='paymentMethod = "Tunai"' :class='paymentMethod === "Tunai" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border"' class='flex-1 py-1.5 rounded font-bold text-sm'>Tunai</button>
            <button @click='paymentMethod = "QRIS"' :class='paymentMethod === "QRIS" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border"' class='flex-1 py-1.5 rounded font-bold text-sm'>QRIS</button>
            <button @click='paymentMethod = "Transfer"' :class='paymentMethod === "Transfer" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border"' class='flex-1 py-1.5 rounded font-bold text-sm'>Transfer</button>
          </div>
        </div>

        <div v-if='paymentMethod === "Tunai"' class='mb-3 flex gap-2'>
          <div class='flex-1'>
            <label class='block text-xs font-bold text-gray-500 mb-1'>Uang Diterima (Rp)</label>
            <input v-model.number='cashTendered' type='number' class='w-full px-3 py-1.5 border rounded text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500'>
          </div>
          <div class='flex-1'>
            <label class='block text-xs font-bold text-gray-500 mb-1'>Kembalian</label>
            <div class='w-full px-3 py-1.5 bg-gray-200 border border-transparent rounded text-sm font-bold text-gray-700'>
              Rp {{ changeAmount >= 0 ? changeAmount.toLocaleString('id-ID') : 0 }}
            </div>
          </div>
        </div>

        <div class='flex justify-between items-end mb-4 pt-2 border-t'>
          <span class='text-gray-500 font-bold'>Total Bayar</span>
          <span class='text-2xl font-bold text-blue-700'>Rp {{ totalPrice.toLocaleString('id-ID') }}</span>
        </div>

        <button @click='processOrder' :disabled='cart.length === 0 || isProcessing || (paymentMethod === "Tunai" && cashTendered < totalPrice)' class='w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2 shadow-lg'>
          {{ isProcessing ? 'Memproses...' : 'Simpan & Cetak' }}
          <PrinterIcon class='w-5 h-5' v-if='!isProcessing' />
        </button>
      </div>
    </div>

    <!-- NOTA PREVIEW MODAL -->
    <div v-if='showReceipt' class='fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4'>
      <div class='bg-white w-full max-w-sm rounded-xl overflow-hidden flex flex-col'>
        <div class='p-4 bg-gray-100 border-b flex justify-between items-center'>
          <h3 class='font-bold text-gray-700'>Preview Struk</h3>
          <button @click='closeReceipt' class='text-gray-500 hover:text-red-500'><XIcon class='w-5 h-5'/></button>
        </div>
        
        <!-- Area Kertas Struk -->
        <div id='print-area' class='p-6 bg-white font-mono text-sm flex-1 overflow-y-auto text-gray-800' style='font-family: monospace;'>
          <div class='text-center mb-4'>
            <h2 class='font-bold text-lg'>{{ shopSettings?.shop_name || 'Kedai Arzena' }}</h2>
            <p class='text-xs text-gray-600'>{{ shopSettings?.shop_address || 'Alamat Kedai' }}</p>
          </div>
          <div class='border-t border-b border-dashed border-gray-400 py-2 mb-2 text-xs'>
            <p>No   : #{{ receiptData?.order_number }}</p>
            <p>Tgl  : {{ new Date().toLocaleString('id-ID') }}</p>
            <p>Kasir: {{ authStore.user?.name || 'Kasir' }}</p>
          </div>
          <div class='mb-2'>
            <div v-for='item in receiptData?.items' :key='item.id' class='mb-1'>
              <p class='font-bold'>{{ item.name }}</p>
              <div class='flex justify-between text-xs'>
                <span>{{ item.qty }} x {{ item.price.toLocaleString('id-ID') }}</span>
                <span>{{ (item.qty * item.price).toLocaleString('id-ID') }}</span>
              </div>
            </div>
          </div>
          <div class='border-t border-dashed border-gray-400 pt-2 mb-4'>
            <div class='flex justify-between font-bold text-base'>
              <span>TOTAL</span>
              <span>Rp {{ receiptData?.total.toLocaleString('id-ID') }}</span>
            </div>
            <div class='flex justify-between text-xs mt-1'>
              <span>Pembayaran ({{ receiptData?.method }})</span>
              <span>{{ receiptData?.cash ? receiptData.cash.toLocaleString('id-ID') : receiptData?.total.toLocaleString('id-ID') }}</span>
            </div>
            <div v-if='receiptData?.method === "Tunai"' class='flex justify-between text-xs mt-1'>
              <span>Kembali</span>
              <span>{{ receiptData?.change ? receiptData.change.toLocaleString('id-ID') : 0 }}</span>
            </div>
          </div>
          <div class='text-center text-xs mt-6'>
            <p>Terima Kasih</p>
            <p>Selamat Menikmati</p>
          </div>
        </div>

        <div class='p-4 border-t bg-gray-50 flex gap-2'>
          <button @click='closeReceipt' class='flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-300'>Tutup</button>
          <button class='flex-1 bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1'>
            <BluetoothIcon class='w-4 h-4' /> Cetak Bluetooth
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { supabase } from '../../services/supabase'
import { ArrowLeftIcon, ShoppingCartIcon, PrinterIcon, XIcon, BluetoothIcon } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const categories = ref([])
const products = ref([])
const activeCategory = ref(null)
const searchQuery = ref('')

const cart = ref([])
const paymentMethod = ref('Tunai')
const cashTendered = ref(0)
const isProcessing = ref(false)

const showReceipt = ref(false)
const receiptData = ref(null)
const shopSettings = ref(null)

const filteredProducts = computed(() => {
  let result = products.value
  if (activeCategory.value !== null) {
    result = result.filter(p => p.category_id === activeCategory.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(q))
  }
  return result
})

const totalPrice = computed(() => cart.value.reduce((sum, item) => sum + (item.price * item.qty), 0))
const changeAmount = computed(() => cashTendered.value - totalPrice.value)

async function fetchData() {
  const { data: catData } = await supabase.from('categories').select('*').order('created_at', { ascending: true })
  if (catData) categories.value = catData

  const { data: prodData } = await supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false })
  if (prodData) products.value = prodData

  // Mock fetch settings for receipt
  shopSettings.value = { shop_name: 'Kedai Arzena', shop_address: 'Jl. Utama No 1' }
}

function addToCart(prod) {
  const existing = cart.value.find(i => i.id === prod.id)
  if (existing) {
    if (existing.qty < prod.stock) existing.qty++
  } else {
    if (prod.stock > 0) cart.value.push({ ...prod, qty: 1 })
  }
}

function updateQty(id, qty) {
  const item = cart.value.find(i => i.id === id)
  if (item) {
    if (qty > 0 && qty <= item.stock) item.qty = qty
    else if (qty === 0) cart.value = cart.value.filter(i => i.id !== id)
  }
}

function clearCart() {
  cart.value = []
  cashTendered.value = 0
}

async function processOrder() {
  try {
    isProcessing.value = true
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,'')
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    const orderNumber = `POS-${dateStr}-${randomNum}`

    // Insert Order (Status selesai because it's direct POS)
    const { data: orderData, error: orderError } = await supabase.from('orders').insert([{
      order_number: orderNumber,
      user_id: authStore.user.id, // logged as kasir
      status: 'selesai',
      delivery_type: 'ambil_sendiri',
      total_price: totalPrice.value,
      notes: 'POS: ' + paymentMethod.value
    }]).select().single()

    if (orderError) throw orderError

    // Insert Items
    const orderItems = cart.value.map(item => ({
      order_id: orderData.id,
      product_id: item.id,
      qty: item.qty,
      price_each: item.price,
      subtotal: item.price * item.qty
    }))
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) throw itemsError

    // Deduct stock
    for (let item of cart.value) {
      const newStock = item.stock - item.qty
      await supabase.from('products').update({ stock: newStock }).eq('id', item.id)
    }

    // Prep Receipt Data
    receiptData.value = {
      order_number: orderNumber,
      items: [...cart.value],
      total: totalPrice.value,
      method: paymentMethod.value,
      cash: paymentMethod.value === 'Tunai' ? cashTendered.value : null,
      change: paymentMethod.value === 'Tunai' ? changeAmount.value : null
    }

    showReceipt.value = true
  } catch (error) {
    alert('Gagal memproses transaksi: ' + error.message)
  } finally {
    isProcessing.value = false
  }
}

function closeReceipt() {
  showReceipt.value = false
  clearCart()
  fetchData() // refresh stocks
}

onMounted(() => {
  fetchData()
})
</script>

<style>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>

