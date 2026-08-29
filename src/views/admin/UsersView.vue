<template>
  <div class="p-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold">Kelola Pengguna</h1>
        <p class="text-sm text-gray-500 mt-1">
          Atur profil, hak akses (jabatan), atau tambahkan pengguna baru.
        </p>
      </div>
      <button @click="openAddModal" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-sm font-medium transition-colors whitespace-nowrap">
        + Tambah Pengguna
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg shadow overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama / ID</th>
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
              <div class="text-xs text-gray-400 font-mono mt-1">{{ user.id }}</div>
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
              <button v-if="user.role !== 'admin' && user.role !== 'kasir'" @click="deleteUser(user)" class="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md transition-colors mr-2">Hapus</button>
              <button @click="openEditModal(user)" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md transition-colors">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
      <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <h2 class="text-xl font-bold mb-4">Edit Pengguna</h2>
        
        <form @submit.prevent="saveUser">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input v-model="editForm.name" type="text" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 border p-2">
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nomor HP</label>
            <input v-model="editForm.phone" type="text" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 border p-2">
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
            <textarea v-model="editForm.address" rows="2" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"></textarea>
          </div>

          <hr class="my-4 border-gray-200">
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Ganti Password (Opsional)</label>
            <input v-model="editForm.newPassword" type="password" placeholder="Kosongkan jika tidak ingin diganti" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 border p-2">
            <p class="text-xs text-gray-500 mt-1">Hanya isi jika ingin mengganti sandi pengguna ini.</p>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Jabatan (Hak Akses)</label>
            <select v-model="editForm.role" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 border p-2 uppercase bg-gray-50">
              <option value="user">USER (Pelanggan Biasa)</option>
              <option value="kasir">KASIR (Staff Kedai)</option>
              <option value="admin">ADMIN (Pemilik / Manajer)</option>
            </select>
            <p class="text-xs text-red-500 mt-1" v-if="editForm.id === authStore.user.id && editForm.role !== 'admin'">
              Peringatan: Jika Anda mengubah role Anda sendiri, Anda bisa kehilangan akses Admin!
            </p>
          </div>

          <div class="flex justify-end gap-3">
            <button type="button" @click="showEditModal = false" class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
            <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium" :disabled="isSaving">
              {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
      <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <h2 class="text-xl font-bold mb-4">Tambah Pengguna Baru</h2>
        
        <div class="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg mb-4 border border-blue-100">
          <strong>Perhatian:</strong> Karena sistem keamanan enkripsi password Supabase, menambahkan user baru dari sini akan otomatis me-logout akun Admin Anda saat ini.
        </div>

        <form @submit.prevent="createUser">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap <span class="text-red-500">*</span></label>
            <input v-model="addForm.name" type="text" required class="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 border p-2">
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nomor HP (WhatsApp) <span class="text-red-500">*</span></label>
            <input v-model="addForm.phone" type="text" required placeholder="Contoh: 08123456789" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 border p-2">
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Password Login <span class="text-red-500">*</span></label>
            <input v-model="addForm.password" type="password" required minlength="6" placeholder="Minimal 6 karakter" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 border p-2">
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Jabatan Awal</label>
            <select v-model="addForm.role" class="w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 border p-2 uppercase bg-gray-50">
              <option value="user">USER</option>
              <option value="kasir">KASIR</option>
              <option value="admin">ADMIN</option>
            </select>
          </div>

          <div class="flex justify-end gap-3">
            <button type="button" @click="showAddModal = false" class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
            <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium" :disabled="isSaving">
              {{ isSaving ? 'Membuat...' : 'Buat Pengguna' }}
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
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const users = ref([])
const loading = ref(true)

const showEditModal = ref(false)
const showAddModal = ref(false)
const isSaving = ref(false)

const editForm = ref({
  id: '',
  name: '',
  phone: '',
  address: '',
  role: '',
  newPassword: ''
})

const addForm = ref({
  name: '',
  phone: '',
  password: '',
  role: 'user'
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
  editForm.value = { ...user, newPassword: '' }
  showEditModal.value = true
}

function openAddModal() {
  addForm.value = { name: '', phone: '', password: '', role: 'user' }
  showAddModal.value = true
}

async function saveUser() {
  isSaving.value = true
  
  // Update data profil
  const { error } = await supabase
    .from('users')
    .update({
      name: editForm.value.name,
      phone: editForm.value.phone,
      address: editForm.value.address,
      role: editForm.value.role
    })
    .eq('id', editForm.value.id)

  if (error) {
    isSaving.value = false
    alert('Gagal menyimpan profil: ' + error.message)
    return
  }

  // Update password jika diisi
  if (editForm.value.newPassword && editForm.value.newPassword.trim().length > 0) {
    if (editForm.value.newPassword.length < 6) {
      isSaving.value = false
      alert('Password baru harus minimal 6 karakter');
      return;
    }

    // Panggil RPC function khusus admin
    const { error: rpcError } = await supabase.rpc('admin_change_user_password', {
      target_user_id: editForm.value.id,
      new_password: editForm.value.newPassword
    })

    if (rpcError) {
      isSaving.value = false
      console.error(rpcError)
      alert('Gagal mengubah password! Pastikan Anda sudah menjalankan script SQL RPC di Supabase: ' + rpcError.message)
      return
    }
  }

  isSaving.value = false
  showEditModal.value = false
  alert('Data pengguna berhasil diperbarui!')
  await fetchUsers()
  
  // If they changed their own profile, update local auth store
  if (editForm.value.id === authStore.user.id) {
    authStore.role = editForm.value.role
    authStore.user.name = editForm.value.name
  }
}

async function createUser() {
  isSaving.value = true
  
  const phoneClean = addForm.value.phone.trim().replace(/\D/g, '')
  const email = phoneClean + '@kedaiarzena.com'
  
  // 1. Mendaftarkan user ke sistem Auth Supabase
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: addForm.value.password
  })

  if (error) {
    isSaving.value = false
    alert('Gagal membuat akun: ' + error.message)
    return
  }

  // 2. Memasukkan data profil ke tabel public.users
  if (data.user) {
    const { error: insertError } = await supabase.from('users').insert([{
      id: data.user.id,
      name: addForm.value.name,
      phone: phoneClean,
      role: addForm.value.role
    }])

    if (insertError) {
      console.error(insertError)
      alert('Gagal menyimpan profil (tetapi akun berhasil dibuat).')
    }
  }

  isSaving.value = false
  alert('Pengguna berhasil dibuat!')
  showAddModal.value = false
  await fetchUsers()

  // Periksa apakah admin ter-logout secara otomatis karena signUp client-side
  const { data: sessionData } = await supabase.auth.getSession()
  const session = sessionData?.session
  
  // Jika session berubah menjadi user baru, kita harus logout dan arahkan ke halaman login
  if (session && session.user.email === email) {
    alert('Sistem keamanan aktif: Sesi Anda telah digantikan oleh pengguna baru. Anda akan diarahkan ke halaman Login.')
    authStore.logout()
    router.push('/login')
  }
}

async function deleteUser(user) {
  if (!confirm(`Yakin ingin menghapus pengguna ${user.name || user.phone}? Profil ini akan dihapus permanen.`)) return
  
  isSaving.value = true
  
  // Hapus dari public.users (Hanya profilnya saja)
  const { error } = await supabase.from('users').delete().eq('id', user.id)
  
  isSaving.value = false
  
  if (error) {
    if (error.code === '23503') { // Foreign key violation (punya pesanan)
      alert(`Gagal menghapus: Pengguna ini tidak bisa dihapus karena sudah memiliki riwayat pesanan di database.`)
    } else {
      alert('Gagal menghapus pengguna: ' + error.message)
    }
  } else {
    alert('Profil pengguna berhasil dihapus.')
    await fetchUsers()
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
