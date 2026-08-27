<template>
  <div class='min-h-screen bg-gray-50 pb-10'>
    <!-- Header -->
    <header class='bg-green-700 text-white p-4 shadow-md sticky top-0 z-40 flex justify-between items-center'>
      <h1 class='text-xl font-bold'>Kedai Arzena</h1>
      <div class='flex items-center gap-4'>
        <!-- Cart Icon -->
        <div class='relative cursor-pointer mr-2' id='cart-icon' @click='goToCheckout'>
          <ShoppingCartIcon class='w-7 h-7 text-white' />
          <span v-if='cartStore.totalItems > 0' class='absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white'>
            {{ cartStore.totalItems }}
          </span>
        </div>
        
        <div class='flex gap-2' v-if='authStore.user'>
          <router-link to='/pesanan' class='w-8 h-8 bg-green-800 rounded-full flex items-center justify-center hover:bg-green-900 transition-colors shadow-sm'>
            <ClipboardListIcon class='w-4 h-4 text-white' />
          </router-link>
          <router-link to='/profil' class='w-8 h-8 bg-green-800 rounded-full flex items-center justify-center hover:bg-green-900 transition-colors shadow-sm'>
            <UserIcon class='w-4 h-4 text-white' />
          </router-link>
        </div>
        <router-link v-else to='/login' class='text-sm font-bold bg-white text-green-700 px-3 py-1 rounded'>Login</router-link>
      </div>
    </header>

    <!-- Kategori Filter & Search -->
    <div class='px-4 py-3 bg-white shadow-sm mb-4 sticky top-14 z-30 flex items-center relative h-[56px] overflow-hidden'>
      
      <!-- Category Buttons Container -->
      <div 
        class='flex gap-2 overflow-x-auto whitespace-nowrap flex-1 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] w-full no-scrollbar'
        :class='isSearching ? "-translate-x-full opacity-0 pointer-events-none absolute" : "translate-x-0 opacity-100"'
        style='padding-right: 50px;'
      >
        <button 
          @click='activeCategory = null' 
          :class='activeCategory === null ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"'
          class='px-3 py-1 rounded-full text-sm font-bold border transition-colors flex-shrink-0'>
          Semua
        </button>
        <button 
          v-for='cat in categories' :key='cat.id'
          @click='activeCategory = cat.id'
          :class='activeCategory === cat.id ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"'
          class='px-3 py-1 rounded-full text-sm font-bold border transition-colors flex-shrink-0'>
          {{ cat.name }}
        </button>
      </div>

      <!-- Search Input & Icon -->
      <div 
        class='absolute right-4 flex items-center justify-end transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]'
        :class='isSearching ? "w-[calc(100%-32px)]" : "w-8"'
      >
        <div 
          class='flex items-center bg-gray-50 rounded-full overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] w-full border'
          :class='isSearching ? "border-green-400 shadow-inner" : "border-gray-200"'
        >
          <input 
            ref='searchInputRef'
            v-model='searchQuery'
            type='text' 
            placeholder='Cari nama menu...' 
            class='bg-transparent outline-none text-sm py-1.5 w-full transition-all duration-700 ease-in-out'
            :class='isSearching ? "opacity-100 px-4" : "opacity-0 px-0 w-0"'
          >
          <button @click='toggleSearch' class='p-1.5 flex-shrink-0 text-gray-500 hover:text-green-600 focus:outline-none bg-gray-50 rounded-full transition-colors'>
            <SearchIcon v-if='!isSearching' class='w-5 h-5' />
            <XIcon v-else class='w-5 h-5 text-red-500' />
          </button>
        </div>
      </div>
    </div>

    <!-- Skeleton Loading -->
    <div v-if='isLoading' class='px-4 grid grid-cols-2 md:grid-cols-4 gap-4'>
      <div v-for='i in 8' :key='i' class='bg-white rounded-xl shadow-sm overflow-hidden flex flex-col'>
        <div class='relative aspect-[4/3] w-full animate-shimmer'></div>
        <div class='p-3 flex-1 flex flex-col gap-2'>
          <div class='h-4 animate-shimmer rounded w-3/4'></div>
          <div class='h-4 animate-shimmer rounded w-1/2 mb-2'></div>
          <div class='mt-auto h-8 animate-shimmer rounded-lg w-full'></div>
        </div>
      </div>
    </div>

    <!-- Grid Produk (Beneran) -->
    <div v-else class='px-4 grid grid-cols-2 md:grid-cols-4 gap-4 relative'>
      <div :id="'prod-card-' + prod.id" v-for='prod in filteredProducts' :key='prod.id' class='bg-white transition-all duration-300 rounded-xl shadow-sm overflow-hidden flex flex-col'>
        <div class='relative aspect-[4/3] w-full bg-gray-50 overflow-hidden'>
          <img :id='"prod-img-" + prod.id' v-if='prod.image_url' :src='prod.image_url' :class='prod.stock === 0 ? "grayscale" : ""' class='w-full h-full object-cover'>
          <div v-else :id='"prod-img-" + prod.id' class='w-full h-full flex items-center justify-center text-gray-400 bg-gray-200'>No Image</div>
          <div v-if='prod.stock === 0' class='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
            <span class='text-white font-bold bg-red-600 px-3 py-1 rounded-lg transform -rotate-12'>HABIS</span>
          </div>
        </div>
        <div class='p-3 flex-1 flex flex-col'>
          <h3 class='text-sm font-bold text-gray-800 leading-tight mb-1'>{{ prod.name }}</h3>
          <p class='text-green-600 font-bold mb-2'>Rp {{ prod.price.toLocaleString('id-ID') }}</p>
          <div class='mt-auto'>
            <button 
              v-if='prod.stock > 0'
              @click='(e) => addToCartWithAnim(prod, e)'
              class='w-full bg-green-100 text-green-700 hover:bg-green-600 hover:text-white font-bold py-1.5 rounded-lg text-sm transition-colors'>
              + Keranjang
            </button>
            <button v-else disabled class='w-full bg-gray-100 text-gray-400 font-bold py-1.5 rounded-lg text-sm cursor-not-allowed'>
              Kosong
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if='!isLoading && filteredProducts.length === 0' class='text-center text-gray-500 mt-10'>
      Tidak ada produk di kategori ini.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../services/supabase'
import { useAuthStore } from '../../stores/auth'
import { useCartStore } from '../../stores/cart'
import { ShoppingCartIcon, UserIcon, SearchIcon, XIcon, ClipboardListIcon } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const categories = ref([])
const products = ref([])
const activeCategory = ref(null)
const isLoading = ref(true)
const isSearching = ref(false)
const searchQuery = ref('')
const searchInputRef = ref(null)

function toggleSearch() {
  isSearching.value = !isSearching.value
  if (!isSearching.value) {
    searchQuery.value = ''
  } else {
    setTimeout(() => { if (searchInputRef.value) searchInputRef.value.focus() }, 100)
  }
}

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

async function fetchData() {
  isLoading.value = true
  const { data: catData } = await supabase.from('categories').select('*').order('created_at', { ascending: true })
  if (catData) categories.value = catData

  const { data: prodData } = await supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false })
  if (prodData) products.value = prodData
  isLoading.value = false
}

function goToCheckout() {
  
  if (!authStore.user) {
    alert('Silakan login terlebih dahulu untuk checkout pesanan.')
    router.push('/login')
  } else {
    router.push('/checkout')
  }
}

function addToCartWithAnim(prod, event) {
  // Cari elemen gambar produk
  const imgEl = document.getElementById('prod-img-' + prod.id)
  const cartIconEl = document.getElementById('cart-icon')
  
  const cardEl = document.getElementById('prod-card-' + prod.id)
  if (cardEl) {
    cardEl.style.transform = 'scale(0.95)'
    setTimeout(() => cardEl.style.transform = 'scale(1)', 200)
  }

  if (imgEl && cartIconEl) {
    // Dapatkan posisi koordinat gambar dan ikon keranjang
    const imgRect = imgEl.getBoundingClientRect()
    const cartRect = cartIconEl.getBoundingClientRect()

    // Buat elemen clone untuk animasi
    const clone = imgEl.cloneNode(true)
    clone.style.position = 'fixed'
    clone.style.top = imgRect.top + 'px'
    clone.style.left = imgRect.left + 'px'
    clone.style.width = imgRect.width + 'px'
    clone.style.height = imgRect.height + 'px'
    clone.style.borderRadius = '8px'
    clone.style.zIndex = '9999'
    clone.style.transition = 'all 0.9s cubic-bezier(0.25, 1, 0.5, 1)'
    clone.style.pointerEvents = 'none'
    document.body.appendChild(clone)

    // Memicu reflow
    void clone.offsetWidth

    // Set tujuan animasi ke ikon keranjang
    clone.style.top = (cartRect.top + 10) + 'px'
    clone.style.left = (cartRect.left + 10) + 'px'
    clone.style.width = '20px'
    clone.style.height = '20px'
    clone.style.opacity = '0'
    clone.style.borderRadius = '50%'
    clone.style.transform = 'scale(0.1)'

    // Setelah animasi selesai, hapus clone dan tambahkan ke Pinia
    setTimeout(() => {
      clone.remove()
      cartStore.addToCart(prod)
      
      // Efek denyut pada ikon keranjang
      cartIconEl.classList.add('scale-125')
      setTimeout(() => cartIconEl.classList.remove('scale-125'), 200)
    }, 900)
  } else {
    // Fallback jika gambar tidak ditemukan
    cartStore.addToCart(prod)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style>
/* Transisi tambahan untuk ikon keranjang berdenyut */
#cart-icon {
  transition: transform 0.2s ease-in-out;
}
</style>


<style>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>