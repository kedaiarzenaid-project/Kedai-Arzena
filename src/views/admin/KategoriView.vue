<template>
  <div>
    <div class='flex justify-between items-center mb-6'>
      <h1 class='text-3xl font-bold text-gray-800'>Manajemen Kategori</h1>
      <button @click='openAddModal' class='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2'>
        <PlusIcon class='w-5 h-5' /> Tambah Kategori
      </button>
    </div>

    <!-- Table -->
    <div class='bg-white rounded-lg shadow overflow-hidden'>
      <table class='min-w-full divide-y divide-gray-200'>
        <thead class='bg-gray-50'>
          <tr>
            <th class='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Nama Kategori</th>
            <th class='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>Aksi</th>
          </tr>
        </thead>
        <tbody class='bg-white divide-y divide-gray-200'>
          <tr v-for='cat in categories' :key='cat.id'>
            <td class='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{{ cat.name }}</td>
            <td class='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
              <button @click='openEditModal(cat)' class='text-blue-600 hover:text-blue-900 mr-4'><EditIcon class='w-5 h-5 inline' /></button>
              <button @click='deleteCategory(cat.id)' class='text-red-600 hover:text-red-900'><TrashIcon class='w-5 h-5 inline' /></button>
            </td>
          </tr>
          <tr v-if='categories.length === 0'>
            <td colspan='2' class='px-6 py-4 text-center text-sm text-gray-500'>Belum ada data kategori.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form -->
    <div v-if='showModal' class='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div class='bg-white rounded-lg p-6 w-full max-w-md'>
        <h2 class='text-xl font-bold mb-4'>{{ isEditing ? 'Edit Kategori' : 'Tambah Kategori' }}</h2>
        <form @submit.prevent='saveCategory'>
          <div class='mb-4'>
            <label class='block text-gray-700 text-sm font-bold mb-2'>Nama Kategori</label>
            <input v-model='form.name' type='text' required class='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'>
          </div>
          <div class='flex justify-end gap-2'>
            <button type='button' @click='showModal = false' class='px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200'>Batal</button>
            <button type='submit' class='px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700'>Simpan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../services/supabase'
import { PlusIcon, EditIcon, TrashIcon } from 'lucide-vue-next'

const categories = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const form = ref({ id: null, name: '' })

async function fetchCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false })
  if (data) categories.value = data
}

function openAddModal() {
  isEditing.value = false
  form.value = { id: null, name: '' }
  showModal.value = true
}

function openEditModal(cat) {
  isEditing.value = true
  form.value = { ...cat }
  showModal.value = true
}

async function saveCategory() {
  if (isEditing.value) {
    await supabase.from('categories').update({ name: form.value.name }).eq('id', form.value.id)
  } else {
    await supabase.from('categories').insert([{ name: form.value.name }])
  }
  showModal.value = false
  await fetchCategories()
}

async function deleteCategory(id) {
  if (confirm('Yakin ingin menghapus kategori ini?')) {
    await supabase.from('categories').delete().eq('id', id)
    await fetchCategories()
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

