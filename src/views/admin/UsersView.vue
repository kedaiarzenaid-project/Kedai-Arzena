<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Kelola Pengguna & Hak Akses</h1>
      <p class="text-sm text-gray-500 bg-yellow-100 p-2 rounded">
        Info: Pembuatan & penghapusan akun utama dilakukan lewat menu Authentication di Supabase. Di sini Anda bisa mengatur Profil & Jabatan (Role).
      </p>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama / Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. HP</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jabatan (Role)</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="loading">
            <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">Memuat data...</td>
          </tr>
          <tr v-else-if="users.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">Belum ada pengguna.</td>
          </tr>
          <tr v-for="user in users" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ user.name || 'Belum diatur' }}</div>
              <div class="text-sm text-gray-500 font-mono text-xs">{{ user.id }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ user.phone || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full uppercase"
                :class="{
                  'bg-red-100 text-red-800': user.role === 'admin',
                  'bg-blue-100 text-blue-800': user.role === 'kasir',
                  'bg-green-100 text-green-800': user.role === 'user' || user.role === 'pembeli'
                }">
                {{ user.role }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="openEditModal(user)" class="text-indigo-600 hover:text-indigo-900">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-4">Edit Pengguna</h2>
        
        <form @submit.prevent="saveUser">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input v-model="form.name" type="text" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 border p-2">
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nomor HP</label>
            <input v-model="form.phone" type="text" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 border p-2">
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
            <textarea v-model="form.address" rows="2" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"></textarea>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Jabatan (Hak Akses)</label>
            <select v-model="form.role" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 border p-2 uppercase bg-gray-50">
              <option value="user">USER (Pelanggan Biasa)</option>
              <option value="kasir">KASIR (Staff Kedai)</option>
              <option value="admin">ADMIN (Pemilik / Manajer)</option>
            </select>
            <p class="text-xs text-red-500 mt-1" v-if="form.id === authStore.user.id && form.role !== 'admin'">
              Peringatan: Jika Anda mengubah role Anda sendiri, Anda bisa kehilangan akses Admin!
            </p>
          </div>

          <div class="flex justify-end gap-3">
            <button type="button" @click="showModal = false" class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
            <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium" :disabled="isSaving">
              {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../services/supabase'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const users = ref([])
const loading = ref(true)
const showModal = ref(false)
const isSaving = ref(false)

const form = ref({
  id: '',
  name: '',
  phone: '',
  address: '',
  role: ''
})

async function fetchUsers() {
  loading.value = true
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    alert('Gagal mengambil data pengguna: ' + error.message)
  } else {
    users.value = data
  }
  loading.value = false
}

function openEditModal(user) {
  form.value = { ...user }
  showModal.value = true
}

async function saveUser() {
  isSaving.value = true
  
  const { error } = await supabase
    .from('users')
    .update({
      name: form.value.name,
      phone: form.value.phone,
      address: form.value.address,
      role: form.value.role
    })
    .eq('id', form.value.id)

  isSaving.value = false
  
  if (error) {
    alert('Gagal menyimpan: ' + error.message)
  } else {
    showModal.value = false
    await fetchUsers()
    
    // If they changed their own profile, update local auth store
    if (form.value.id === authStore.user.id) {
      authStore.role = form.value.role
      authStore.user.name = form.value.name
    }
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
