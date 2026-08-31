<template>
  <div class='flex h-screen bg-gray-50 overflow-hidden'>
    <!-- Mobile Header with Hamburger -->
    <div class="md:hidden fixed top-0 left-0 right-0 h-16 bg-green-800 text-white flex items-center px-4 z-[1000] shadow-md">
      <button @click="isSidebarOpen = true" class="p-2 hover:bg-green-700 rounded-lg transition-colors">
        <MenuIcon class="w-6 h-6" />
      </button>
      <h1 class="ml-4 font-bold text-lg">Arzena Admin</h1>
    </div>

    <!-- Sidebar Overlay (Mobile Only) -->
    <div 
      v-if="isSidebarOpen" 
      @click="isSidebarOpen = false"
      class="fixed inset-0 bg-black/50 z-[1010] md:hidden transition-opacity"
    ></div>

    <!-- Sidebar -->
    <aside 
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      class='fixed md:relative top-0 left-0 w-64 h-full bg-green-900/95 backdrop-blur-sm text-white flex flex-col z-[1020] transform md:translate-x-0 transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none'
    >
      <div class='p-5 text-2xl font-bold border-b border-green-800/50 flex justify-between items-center'>
        Arzena Admin
        <button @click="isSidebarOpen = false" class="md:hidden p-1 hover:bg-green-700 rounded-lg">
          <XIcon class="w-6 h-6" />
        </button>
      </div>
      <nav class='flex-1 p-4 space-y-2 overflow-y-auto'>
        <router-link @click="isSidebarOpen = false" to='/admin' class='flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors' active-class='bg-green-700 font-bold'>
          Dashboard
        </router-link>
        <router-link @click="isSidebarOpen = false" to='/admin/kategori' class='flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors' active-class='bg-green-700 font-bold'>
          Kategori
        </router-link>
        <router-link @click="isSidebarOpen = false" to='/admin/produk' class='flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors' active-class='bg-green-700 font-bold'>
          Produk
        </router-link>
        <router-link @click="isSidebarOpen = false" to='/admin/pengguna' class='flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors' active-class='bg-green-700 font-bold'>
          Kelola Pengguna
        </router-link>
        <router-link @click="isSidebarOpen = false" to='/admin/pengaturan' class='flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors' active-class='bg-green-700 font-bold'>
          Pengaturan
        </router-link>
      </nav>
      <div class='p-4 border-t border-green-800/50'>
        <button @click='logout' class='w-full font-bold text-left p-3 rounded-lg bg-red-600/80 hover:bg-red-600 transition-colors flex items-center gap-3'>
          Logout
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class='flex-1 h-full overflow-y-auto pt-16 md:pt-0'>
      <div class="p-4 md:p-8">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { MenuIcon, XIcon } from 'lucide-vue-next'

const authStore = useAuthStore()
const isSidebarOpen = ref(false)

function logout() { 
  authStore.logout() 
}
</script>
