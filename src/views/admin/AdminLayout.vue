<template>
  <div class='flex h-screen bg-gray-100'>
    <!-- Sidebar -->
    <aside class='w-64 bg-green-800 text-white flex flex-col'>
      <div class='p-4 text-2xl font-bold border-b border-green-700'>Arzena Admin</div>
      <nav class='flex-1 p-4 space-y-2'>
        <router-link to='/admin' class='block p-2 rounded hover:bg-green-700' active-class='bg-green-700'>Dashboard</router-link>
        <router-link to='/admin/kategori' class='block p-2 rounded hover:bg-green-700' active-class='bg-green-700'>Kategori</router-link>
        <router-link to='/admin/produk' class='block p-2 rounded hover:bg-green-700' active-class='bg-green-700'>Produk</router-link>
        <router-link to='/admin/pengguna' class='block p-2 rounded hover:bg-green-700' active-class='bg-green-700'>Kelola Pengguna</router-link>
        <router-link to='/admin/pengaturan' class='block p-2 rounded hover:bg-green-700' active-class='bg-green-700'>Pengaturan</router-link>
      </nav>
      <div class='p-4 border-t border-green-700'>
        <button @click='logout' class='w-full text-left p-2 rounded hover:bg-red-600'>Logout</button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class='flex-1 overflow-y-auto p-8'>
      <router-view></router-view>
    </main>
  </div>
</template>
<script setup>
import { useAuthStore } from '../../stores/auth'
const authStore = useAuthStore()
function logout() { authStore.logout() }
</script>

