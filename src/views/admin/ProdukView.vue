<template>
  <div>
    <div class='flex justify-between items-center mb-6'>
      <h1 class='text-3xl font-bold text-gray-800'>Manajemen Produk</h1>
      <button @click='openAddModal' class='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2'>
        <PlusIcon class='w-5 h-5' /> Tambah Produk
      </button>
    </div>

    <!-- Table -->
    <div class='bg-white rounded-lg shadow overflow-x-auto'>
      <table class='min-w-full divide-y divide-gray-200'>
        <thead class='bg-gray-50'>
          <tr>
            <th class='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Foto</th>
            <th class='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Nama Produk</th>
            <th class='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Kategori</th>
            <th class='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Harga</th>
            <th class='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Stok</th>
            <th class='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
            <th class='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>Aksi</th>
          </tr>
        </thead>
        <tbody class='bg-white divide-y divide-gray-200'>
          <tr v-for='prod in products' :key='prod.id'>
            <td class='px-6 py-4 whitespace-nowrap'>
              <img v-if='prod.image_url' :src='prod.image_url' class='w-12 h-12 object-cover rounded-md border'>
              <div v-else class='w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500'>No Img</div>
            </td>
            <td class='px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium'>{{ prod.name }}</td>
            <td class='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{{ getCategoryName(prod.category_id) }}</td>
            <td class='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>Rp {{ prod.price.toLocaleString('id-ID') }}</td>
            <td class='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{{ prod.stock }}</td>
            <td class='px-6 py-4 whitespace-nowrap text-sm'>
              <span :class='prod.is_active ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"' class='px-2 py-1 rounded-full text-xs font-bold'>
                {{ prod.is_active ? 'Aktif' : 'Habis/Nonaktif' }}
              </span>
            </td>
            <td class='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
              <button @click='openEditModal(prod)' class='text-blue-600 hover:text-blue-900 mr-4'><EditIcon class='w-5 h-5 inline' /></button>
              <button @click='deleteProduct(prod.id, prod.image_url)' class='text-red-600 hover:text-red-900'><TrashIcon class='w-5 h-5 inline' /></button>
            </td>
          </tr>
          <tr v-if='products.length === 0'>
            <td colspan='7' class='px-6 py-4 text-center text-sm text-gray-500'>Belum ada data produk.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form -->
    <div v-if='showModal' class='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto'>
      <div class='bg-white rounded-lg p-6 w-full max-w-lg my-8'>
        <h2 class='text-xl font-bold mb-4'>{{ isEditing ? 'Edit Produk' : 'Tambah Produk' }}</h2>
        <form @submit.prevent='saveProduct'>
          <div class='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <div class='md:col-span-2'>
              <label class='block text-gray-700 text-sm font-bold mb-2'>Nama Produk</label>
              <input v-model='form.name' type='text' required class='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'>
            </div>
            <div>
              <label class='block text-gray-700 text-sm font-bold mb-2'>Kategori</label>
              <select v-model='form.category_id' required class='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'>
                <option value='' disabled>Pilih Kategori</option>
                <option v-for='cat in categories' :key='cat.id' :value='cat.id'>{{ cat.name }}</option>
              </select>
            </div>
            <div>
              <label class='block text-gray-700 text-sm font-bold mb-2'>Harga (Rp)</label>
              <input v-model='form.price' type='number' required class='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'>
            </div>
            <div>
              <label class='block text-gray-700 text-sm font-bold mb-2'>Stok</label>
              <input v-model='form.stock' type='number' required class='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'>
            </div>
            <div>
              <label class='block text-gray-700 text-sm font-bold mb-2'>Barcode (Opsional)</label>
              <input v-model='form.barcode' type='text' class='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'>
            </div>
            <div class='md:col-span-2 flex items-center'>
              <input v-model='form.is_active' type='checkbox' id='isActive' class='mr-2 w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded'>
              <label for='isActive' class='text-gray-700 text-sm font-bold'>Produk Aktif (Tersedia)</label>
            </div>
            <div class='md:col-span-2'>
              <label class='block text-gray-700 text-sm font-bold mb-2'>Foto Produk</label>
              <input type='file' accept='image/*' @change='handleFileUpload' class='w-full px-3 py-2 border rounded-lg focus:outline-none'>
              <p class='text-xs text-gray-500 mt-1'>Maksimal 2MB. Biarkan kosong jika tidak ingin mengubah foto.</p>
            </div>
          </div>
          <div class='flex justify-end gap-2 mt-6'>
            <button type='button' @click='showModal = false' class='px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200' :disabled='isUploading'>Batal</button>
            <button type='submit' class='px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center' :disabled='isUploading'>
              {{ isUploading ? 'Menyimpan...' : 'Simpan' }}
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
import { PlusIcon, EditIcon, TrashIcon } from 'lucide-vue-next'

const products = ref([])
const categories = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const isUploading = ref(false)
const imageFile = ref(null)

const form = ref({ 
  id: null, 
  name: '', 
  category_id: '', 
  price: 0, 
  stock: 0, 
  barcode: '', 
  is_active: true,
  image_url: ''
})

async function fetchData() {
  // Fetch categories
  const { data: catData } = await supabase.from('categories').select('*')
  if (catData) categories.value = catData

  // Fetch products
  const { data: prodData } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  if (prodData) products.value = prodData
}

function getCategoryName(id) {
  const cat = categories.value.find(c => c.id === id)
  return cat ? cat.name : 'Tidak Ada'
}

function openAddModal() {
  isEditing.value = false
  imageFile.value = null
  form.value = { id: null, name: '', category_id: categories.value.length > 0 ? categories.value[0].id : '', price: 0, stock: 0, barcode: '', is_active: true, image_url: '' }
  showModal.value = true
}

function openEditModal(prod) {
  isEditing.value = true
  imageFile.value = null
  form.value = { ...prod }
  showModal.value = true
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (file) {
    imageFile.value = file
  }
}

async function uploadImage() {
  if (!imageFile.value) return form.value.image_url
  
  const fileExt = imageFile.value.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, imageFile.value)

  if (uploadError) {
    alert('Gagal upload gambar: ' + uploadError.message)
    throw uploadError
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(filePath)
  return data.publicUrl
}

async function saveProduct() {
  try {
    isUploading.value = true
    let finalImageUrl = form.value.image_url
    
    if (imageFile.value) {
      finalImageUrl = await uploadImage()
    }

    const productData = {
      name: form.value.name,
      category_id: form.value.category_id,
      price: form.value.price,
      stock: form.value.stock,
      barcode: form.value.barcode,
      is_active: form.value.is_active,
      image_url: finalImageUrl
    }

    if (isEditing.value) {
      await supabase.from('products').update(productData).eq('id', form.value.id)
    } else {
      await supabase.from('products').insert([productData])
    }
    
    showModal.value = false
    await fetchData()
  } catch (error) {
    console.error('Error saving product:', error)
  } finally {
    isUploading.value = false
  }
}

async function deleteProduct(id, imageUrl) {
  if (confirm('Yakin ingin menghapus produk ini?')) {
    // Delete image from storage if exists
    if (imageUrl) {
      const fileName = imageUrl.split('/').pop()
      await supabase.storage.from('product-images').remove([fileName])
    }
    // Delete from DB
    await supabase.from('products').delete().eq('id', id)
    await fetchData()
  }
}

onMounted(() => {
  fetchData()
})
</script>

