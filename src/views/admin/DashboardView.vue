<template>
  <div>
    <h1 class='text-3xl font-bold text-gray-800 mb-6'>Dashboard Admin</h1>
    
    <!-- Baris 1: Stat Produk & Kategori -->
    <div class='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
      <div class='bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-500'>
        <h3 class='text-gray-500 text-sm font-bold uppercase tracking-wider mb-2'>Total Produk</h3>
        <p class='text-3xl font-bold text-gray-800'>{{ totalProducts }}</p>
      </div>
      <div class='bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-300'>
        <h3 class='text-gray-500 text-sm font-bold uppercase tracking-wider mb-2'>Total Kategori</h3>
        <p class='text-3xl font-bold text-gray-800'>{{ totalCategories }}</p>
      </div>
    </div>

    <!-- Baris 2: Stat Pesanan (4 Fase) -->
    <h2 class='text-xl font-bold text-gray-700 mb-4'>Status Pesanan</h2>
    <div class='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
      <div class='bg-white p-4 rounded-lg shadow-sm border-t-4 border-yellow-500'>
        <h3 class='text-gray-500 text-xs font-bold uppercase mb-1'>1. Masuk</h3>
        <p class='text-2xl font-bold text-gray-800'>{{ statsOrders.masuk }}</p>
      </div>
      <div class='bg-white p-4 rounded-lg shadow-sm border-t-4 border-blue-500'>
        <h3 class='text-gray-500 text-xs font-bold uppercase mb-1'>2. Proses</h3>
        <p class='text-2xl font-bold text-gray-800'>{{ statsOrders.proses }}</p>
      </div>
      <div class='bg-white p-4 rounded-lg shadow-sm border-t-4 border-purple-500'>
        <h3 class='text-gray-500 text-xs font-bold uppercase mb-1'>3. Antar (Delivery)</h3>
        <p class='text-2xl font-bold text-gray-800'>{{ statsOrders.antar }}</p>
      </div>
      <div class='bg-white p-4 rounded-lg shadow-sm border-t-4 border-green-500'>
        <h3 class='text-gray-500 text-xs font-bold uppercase mb-1'>4. Selesai / Siap Ambil</h3>
        <p class='text-2xl font-bold text-gray-800'>{{ statsOrders.selesai }}</p>
      </div>
    </div>

    <!-- Baris 3: Pendapatan -->
    <div class='grid grid-cols-1 md:grid-cols-2 gap-6'>
      <div class='bg-green-600 p-6 rounded-lg shadow-sm text-white'>
        <h3 class='text-green-100 text-sm font-bold uppercase tracking-wider mb-2'>Total Seluruh Pesanan</h3>
        <p class='text-3xl font-bold'>{{ totalOrders }}</p>
      </div>
      <div class='bg-blue-600 p-6 rounded-lg shadow-sm text-white'>
        <h3 class='text-blue-100 text-sm font-bold uppercase tracking-wider mb-2'>Total Pendapatan (Pesanan Selesai)</h3>
        <p class='text-3xl font-bold'>Rp {{ totalRevenue.toLocaleString('id-ID') }}</p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../services/supabase'

const totalProducts = ref(0)
const totalCategories = ref(0)
const totalOrders = ref(0)
const totalRevenue = ref(0)

const statsOrders = ref({
  masuk: 0,
  proses: 0,
  antar: 0,
  selesai: 0
})

async function fetchStats() {
  // Produk & Kategori
  const { count: countProd } = await supabase.from('products').select('*', { count: 'exact', head: true })
  const { count: countCat } = await supabase.from('categories').select('*', { count: 'exact', head: true })
  totalProducts.value = countProd || 0
  totalCategories.value = countCat || 0

  // Pesanan & Pendapatan
  const { data: orders } = await supabase.from('orders').select('status, total_price')
  if (orders) {
    totalOrders.value = orders.length
    
    orders.forEach(order => {
      if (order.status === 'menunggu') statsOrders.value.masuk++
      else if (order.status === 'diproses') statsOrders.value.proses++
      else if (order.status === 'diantar') statsOrders.value.antar++
      else if (order.status === 'siap' || order.status === 'selesai') {
        statsOrders.value.selesai++
        // Hitung pendapatan hanya untuk yang selesai/siap
        totalRevenue.value += Number(order.total_price || 0)
      }
    })
  }
}

onMounted(() => {
  fetchStats()
})
</script>

